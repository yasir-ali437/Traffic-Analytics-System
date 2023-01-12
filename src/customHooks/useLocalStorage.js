import { useState, useEffect } from "react";

const getStorageValue = (key, defaultValue) => {

  // getting stored value
  if (typeof window !== "undefined" && window) {
    const saved = window.localStorage.getItem(key);
    let initial;
    if (saved !== null && typeof saved !== undefined && saved && saved !== "undefined") {
      console.log('savedsaved', saved);
      initial = JSON.parse(saved)
    }
    else {
      if(typeof defaultValue !== undefined && defaultValue){
        initial = defaultValue
      }
      else {
        initial = {}
      }
    }
    return initial;
  }
};

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};