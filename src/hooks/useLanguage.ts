"use client";

import { useState, useEffect } from "react";

export function useLanguage() {
  const [lang, setLang] = useState<"en" | "vi">("vi");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as "en" | "vi";
    if (saved) {
      setLang(saved);
    }
  }, []);

  const changeLanguage = (newLang: "en" | "vi") => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    window.dispatchEvent(new Event("languageChange"));
  };

  useEffect(() => {
    const handleLanguageChange = () => {
      const saved = localStorage.getItem("lang") as "en" | "vi";
      if (saved) {
        setLang(saved);
      }
    };
    window.addEventListener("languageChange", handleLanguageChange);
    return () => window.removeEventListener("languageChange", handleLanguageChange);
  }, []);

  return { lang, changeLanguage };
}
export default useLanguage;
