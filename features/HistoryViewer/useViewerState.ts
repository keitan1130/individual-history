import { useCallback, useEffect, useState } from "react"
import type { Theme } from "./useTheme"

const STORAGE_KEY = "viewerState"

interface ViewerState {
  theme: Theme
  keepEnabled: boolean
  currentUrl: string
}

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "dark"
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export const useViewerState = () => {
  const [state, setState] = useState<ViewerState>({
    theme: getSystemTheme(),
    keepEnabled: false,
    currentUrl: ""
  })

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.sync?.get) return

    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      const stored = result[STORAGE_KEY]
      if (stored) {
        setState((prev) => ({
          ...prev,
          theme: stored.theme === "dark" || stored.theme === "light" ? stored.theme : prev.theme,
          keepEnabled: typeof stored.keepEnabled === "boolean" ? stored.keepEnabled : prev.keepEnabled
        }))
      }
    })
  }, [])

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.onChanged) return

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName === "sync" && changes[STORAGE_KEY]?.newValue) {
        const stored = changes[STORAGE_KEY].newValue
        setState((prev) => ({
          ...prev,
          theme: stored.theme === "dark" || stored.theme === "light" ? stored.theme : prev.theme,
          keepEnabled: typeof stored.keepEnabled === "boolean" ? stored.keepEnabled : prev.keepEnabled
        }))
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  const toggleTheme = useCallback(() => {
    setState((current) => {
      const nextTheme = current.theme === "dark" ? "light" : "dark"
      if (typeof chrome !== "undefined" && chrome.storage?.sync?.set) {
        chrome.storage.sync.set({
          [STORAGE_KEY]: { theme: nextTheme, keepEnabled: current.keepEnabled }
        })
      }
      return { ...current, theme: nextTheme }
    })
  }, [])

  const toggleKeep = useCallback(() => {
    setState((current) => {
      const nextKeep = !current.keepEnabled
      if (typeof chrome !== "undefined" && chrome.storage?.sync?.set) {
        chrome.storage.sync.set({
          [STORAGE_KEY]: { theme: current.theme, keepEnabled: nextKeep }
        })
      }
      return { ...current, keepEnabled: nextKeep }
    })
  }, [])

  const setCurrentUrl = useCallback((currentUrl: string) => {
    setState((current) => ({ ...current, currentUrl }))
  }, [])

  return {
    currentUrl: state.currentUrl,
    keepEnabled: state.keepEnabled,
    setCurrentUrl,
    theme: state.theme,
    toggleKeep,
    toggleTheme
  }
}
