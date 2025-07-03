import { useState } from "react";
import { components } from "./componentRegistry";
import { CanvasWebGPU } from "./lib/CanvasWebGPU";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "react-i18next";
import Hall from "./lib/Hall"

const componentList = Object.entries(components).map(([key, value]) => ({
  id: key,
  ...value,
}));

//定义分类
const categories = ["Match", "TSL Study", "Example"];

export default function App() {
  const [selectedComponentId, setSelectedComponentId] = useState("TSL01");
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const ActiveComponentInfo = components[selectedComponentId];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <div className="bg-gray-950">
        <div className="flex flex-col md:flex-row justify-between items-start p-5 absolute z-50">
          {categories.map((category) => (
            <div key={category} className={twMerge("m-5 my-2 lg:my-0")}>
              <h4 className="text-amber-100 text-center">
                {t(`categories.${category.replace(" ", "")}`)}
              </h4>
              {componentList
                .filter((item) => item.category === category)
                .map((item) => (
                  <button
                    key={item.id}
                    className={twMerge(
                      "bg-gray-800 text-[12px] text-amber-50  mt-1 p-1 rounded hover:bg-gray-700 min-w-16",
                      selectedComponentId === item.id ? "bg-blue-700" : ""
                    )}
                    // 点击按钮时，调用 setSelectedComponentId 更新 state
                    onClick={() => setSelectedComponentId(item.id)}
                  >
                    {t(item.nameKey)}
                  </button>
                ))}
            </div>
          ))}
        </div>

        <div className="absolute top-5 right-5 z-50">
          <div className="gradient-border-wrap">
            <button
              onClick={() => {
                // 点击时，切换到与当前相反的语言
                const nextLanguage = currentLanguage === "en" ? "zh" : "en";
                changeLanguage(nextLanguage);
              }}
              className="
               w-12 h-8
               flex items-center justify-center
               bg-[#111827] 
               rounded-md 
               text-stone-300
               font-mono
               cursor-pointer
               hover:text-white
               transition-colors duration-300
             "
            >
              {currentLanguage === "en" ? "EN" : "中"}
            </button>
          </div>
        </div>

        <div className="w-dvw h-dvh -z-10">
          <CanvasWebGPU>
            <Hall >
            </Hall>
          </CanvasWebGPU>
          <a
            href="https://github.com/xiqing01/3dMathBasics"
            target="_blank"
            className="absolute bottom-5 right-5 z-50"
          >
            <svg viewBox="0 0 20 20" className="size-10  fill-amber-50">
              <path d="M10 0C4.475 0 0 4.475 0 10a9.994 9.994 0 006.838 9.488c.5.087.687-.213.687-.476 0-.237-.013-1.024-.013-1.862-2.512.463-3.162-.612-3.362-1.175-.113-.287-.6-1.175-1.025-1.412-.35-.188-.85-.65-.013-.663.788-.013 1.35.725 1.538 1.025.9 1.512 2.337 1.087 2.912.825.088-.65.35-1.088.638-1.338-2.225-.25-4.55-1.112-4.55-4.937 0-1.088.387-1.987 1.025-2.688-.1-.25-.45-1.274.1-2.65 0 0 .837-.262 2.75 1.026a9.28 9.28 0 012.5-.338c.85 0 1.7.112 2.5.337 1.912-1.3 2.75-1.024 2.75-1.024.55 1.375.2 2.4.1 2.65.637.7 1.025 1.587 1.025 2.687 0 3.838-2.337 4.688-4.562 4.938.362.312.675.912.675 1.85 0 1.337-.013 2.412-.013 2.75 0 .262.188.574.688.474A10.016 10.016 0 0020 10c0-5.525-4.475-10-10-10z"></path>
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}
