# Release Action

This action will help Gitea users to publish release and attachments.

## Example

```yaml
name: release

on: 
  push:
    tags:
      - '*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Use Go Action  
        id: use-go-action
        uses: https://gitea.com/actions/release-action@main
        with:
          files: |-
            bin/**
          api_key: '${{secrets.RELEASE_TOKEN}}'
```
