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

const normalizeTheme = (value: unknown): Theme | null => {
  if (value === "dark" || value === "light") {
    return value
  }
  return null
}

const normalizeViewerState = (value: unknown): Partial<ViewerState> | null => {
  if (!value || typeof value !== "object") {
    return null
  }
  const candidate = value as Partial<ViewerState>
  const theme = normalizeTheme(candidate.theme)
  return {
    theme: theme ?? undefined,
    keepEnabled:
      typeof candidate.keepEnabled === "boolean"
        ? candidate.keepEnabled
        : undefined,
    currentUrl:
      typeof candidate.currentUrl === "string"
        ? candidate.currentUrl
        : undefined
  }
}

const getInitialState = (): ViewerState => ({
  theme: getSystemTheme(),
  keepEnabled: false,
  currentUrl: ""
})

const mergeViewerState = (current: ViewerState, next: Partial<ViewerState>) => {
  const merged = {
    ...current,
    ...next,
    currentUrl: next.currentUrl ?? current.currentUrl
  }

  if (
    merged.theme === current.theme &&
    merged.keepEnabled === current.keepEnabled &&
    merged.currentUrl === current.currentUrl
  ) {
    return current
  }

  return merged
}

export const useViewerState = () => {
  const [state, setState] = useState<ViewerState>(getInitialState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.sync?.get) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(true)
      return
    }

    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      const storedState = normalizeViewerState(result[STORAGE_KEY])
      if (storedState) {
        setState((current) => mergeViewerState(current, storedState))
      }
      setHydrated(true)
    })
  }, [])

  const { theme, keepEnabled } = state

  useEffect(() => {
    if (
      typeof chrome === "undefined" ||
      !chrome.storage?.sync?.set ||
      !hydrated
    ) {
      return
    }

    chrome.storage.sync.set({ [STORAGE_KEY]: { theme, keepEnabled } })
  }, [hydrated, theme, keepEnabled])

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

      const nextState = normalizeViewerState(changes[STORAGE_KEY]?.newValue)
      if (nextState) {
        setState((current) => mergeViewerState(current, nextState))
      }
    }

    chrome.storage.onChanged.addListener(listener)

    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  const toggleTheme = useCallback(() => {
    setState((current) => ({
      ...current,
      theme: current.theme === "dark" ? "light" : "dark"
    }))
  }, [])

  const toggleKeep = useCallback(() => {
    setState((current) => ({
      ...current,
      keepEnabled: !current.keepEnabled
    }))
  }, [])

  const setCurrentUrl = useCallback((currentUrl: string) => {
    setState((current) => ({
      ...current,
      currentUrl
    }))
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
