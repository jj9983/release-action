package main

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"

	"code.gitea.io/sdk/gitea"
	gha "github.com/sethvargo/go-githubactions"
)

func main() {
	ctx, err := gha.Context()
	if err != nil {
		gha.Fatalf("failed to get context: %w", err)
	}

	if !strings.HasPrefix(ctx.Ref, "refs/tags/") {
		gha.Fatalf("ref %s is not a tag", ctx.Ref)
	}

	files := gha.GetInput("files")
	title := gha.GetInput("title")
	apiKey := gha.GetInput("api_key")
	preRelease, _ := strconv.ParseBool(gha.GetInput("pre_release"))
	draft, _ := strconv.ParseBool(gha.GetInput("draft"))
	if title == "" {
		title = ctx.RefName
	}
	if apiKey == "" {
		apiKey = os.Getenv("GITHUB_TOKEN")
	}
	insecure, _ := strconv.ParseBool(gha.GetInput("insecure"))

	client := http.DefaultClient
	if insecure {
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}
		client = &http.Client{Transport: tr}
	}

	c, err := gitea.NewClient(ctx.ServerURL, gitea.SetToken(apiKey), gitea.SetHTTPClient(client))
	if err != nil {
		gha.Fatalf("failed to create gitea client: %v", err)
	}

	owner := ctx.RepositoryOwner
	repo := strings.Split(ctx.Repository, "/")[1]

	rel, err := createRelease(ctx, c, owner, repo, gitea.CreateReleaseOption{
		TagName:      ctx.RefName,
		IsDraft:      draft,
		IsPrerelease: preRelease,
		Title:        title,
		Target:       ctx.SHA,
		// Note:         rc.Note,
	})
	if err != nil {
		gha.Fatalf("failed to create release: %w", err)
	}

	matchedFiles, err := getFiles(ctx.Workspace, files)
	if err != nil {
		gha.Fatalf("failed to get files: %v", err)
	}

	if err := uploadFiles(ctx, c, owner, repo, rel.ID, matchedFiles); err != nil {
		gha.Fatalf("Failed to upload files: %w", err)
	}

	gha.SetOutput("status", "success")
}

func getDirFiles(dir string) ([]string, error) {
	d, err := os.Open(dir)
	if err != nil {
		return nil, err
	}
	defer d.Close()
	info, err := d.Stat()
	if err != nil {
		return nil, err
	}
	if !info.IsDir() {
		return []string{dir}, nil
	}
	list, err := d.Readdirnames(0)
	if err != nil {
		return nil, err
	}
	res := make([]string, 0, len(list))
	for _, f := range list {
		subs, err := getDirFiles(filepath.Join(dir, f))
		if err != nil {
			return nil, err
		}
		res = append(res, subs...)
	}
	return res, nil
}

func getFiles(parentDir, files string) ([]string, error) {
	var fileList []string
	lines := strings.Split(files, "\n")
	for _, line := range lines {
		line = strings.Trim(line, "'")
		line = strings.Trim(line, `"`)
		if filepath.IsAbs(line) {
			return nil, fmt.Errorf("file path %s is absolute", line)
		}
		line = filepath.Join(parentDir, line)
		matches, err := filepath.Glob(line)
		if err != nil {
			return nil, err
		}
		for _, match := range matches {
			files, err := getDirFiles(match)
			if err != nil {
				return nil, err
			}
			fileList = append(fileList, files...)
		}
	}
	return fileList, nil
}

func createRelease(ctx *gha.GitHubContext, c *gitea.Client, owner, repo string, opts gitea.CreateReleaseOption) (*gitea.Release, error) {
	// Create the release
	release, _, err := c.CreateRelease(owner, repo, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to create release: %w", err)
	}

	return release, nil
}

func uploadFiles(ctx *gha.GitHubContext, c *gitea.Client, owner, repo string, releaseID int64, files []string) error {
	attachments, _, err := c.ListReleaseAttachments(owner, repo, releaseID, gitea.ListReleaseAttachmentsOptions{})
	if err != nil {
		return fmt.Errorf("failed to fetch existing release attachments: %w", err)
	}

	for _, file := range files {
		f, err := os.Open(file)
		if err != nil {
			return fmt.Errorf("failed to open release attachment %s: %w", file, err)
		}

		for _, attachment := range attachments {
			if attachment.Name == path.Base(file) {
				if _, err := c.DeleteReleaseAttachment(owner, repo, releaseID, attachment.ID); err != nil {
					f.Close()
					return fmt.Errorf("failed to delete release attachment %s: %w", file, err)
				}

				fmt.Printf("Successfully deleted old release attachment %s\n", attachment.Name)
			}
		}

		if _, _, err = c.CreateReleaseAttachment(owner, repo, releaseID, f, path.Base(file)); err != nil {
			f.Close()
			return fmt.Errorf("failed to upload release attachment %s: %w", file, err)
		}
		f.Close()

		fmt.Printf("Successfully uploaded release attachment %s\n", file)
	}

	return nil
}
