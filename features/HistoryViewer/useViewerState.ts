import { useCallback } from "react"

import { useStorage } from "@plasmohq/storage/hook"

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
  // @plasmohq/storage を使って同期を自動化
  const [state, setState] = useStorage<ViewerState>(STORAGE_KEY, {
    theme: getSystemTheme(),
    keepEnabled: false,
    currentUrl: ""
  })

  // stateがまだロードされていない時のためのフォールバック
  const currentState = state || {
    theme: getSystemTheme(),
    keepEnabled: false,
    currentUrl: ""
  }

  const toggleTheme = useCallback(() => {
    setState((current) => ({
      ...current,
      theme: current.theme === "dark" ? "light" : "dark"
    }))
  }, [setState])

  const toggleKeep = useCallback(() => {
    setState((current) => ({
      ...current,
      keepEnabled: !current.keepEnabled
    }))
  }, [setState])

  const setCurrentUrl = useCallback(
    (currentUrl: string) => {
      setState((current) => ({
        ...current,
        currentUrl
      }))
    },
    [setState]
  )

  return {
    currentUrl: currentState.currentUrl,
    keepEnabled: currentState.keepEnabled,
    setCurrentUrl,
    theme: currentState.theme,
    toggleKeep,
    toggleTheme
  }
}
