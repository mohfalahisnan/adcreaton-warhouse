"use client";
import { useEffect, useState } from "react";

// Membuat custom hook `useLocalStorage`
export function useLocalStorage<T>(key: string, fallbackValue: T) {
  // Inisialisasi state dengan nilai fallback atau nilai yang disimpan di `localStorage`
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : fallbackValue;
    } catch {
      return fallbackValue;
    }
  });

  // Efek untuk mengambil nilai dari `localStorage` ketika `key` atau `fallbackValue` berubah
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      setValue(stored ? JSON.parse(stored) : fallbackValue);
    } catch {
      setValue(fallbackValue);
    }
  }, [fallbackValue, key]);

  // Efek untuk menyimpan nilai ke `localStorage` ketika `value` atau `key` berubah
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`Unable to store new value for key ${key}`);
    }
  }, [key, value]);

  // Mengembalikan nilai dan fungsi setter
  return [value, setValue] as const;
}
