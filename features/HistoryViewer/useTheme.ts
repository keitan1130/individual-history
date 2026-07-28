import { useEffect, useState } from "react"

export type Theme = "dark" | "light"

const THEME_STORAGE_KEY = "theme"

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "dark"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

const normalizeTheme = (value: unknown): Theme | null => {
  if (value === "dark" || value === "light") {
    return value
  }

  return null
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => getSystemTheme())

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.sync?.get) {
      return
    }

    chrome.storage.sync.get([THEME_STORAGE_KEY], (result) => {
      const storedTheme = normalizeTheme(result[THEME_STORAGE_KEY])

      if (storedTheme) {
        setTheme(storedTheme)
      }
    })
  }, [])

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.onChanged) {
      return
    }

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName !== "sync") {
        return
      }

      const nextTheme = normalizeTheme(changes[THEME_STORAGE_KEY]?.newValue)

      if (nextTheme) {
        setTheme(nextTheme)
      }
    }

    chrome.storage.onChanged.addListener(listener)

    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark"

    setTheme(nextTheme)

    if (typeof chrome !== "undefined" && chrome.storage?.sync?.set) {
      chrome.storage.sync.set({ [THEME_STORAGE_KEY]: nextTheme })
    }
  }

  return { theme, toggleTheme }
}
