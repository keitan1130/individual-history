import type { MouseEvent } from "react"
import { useEffect, useState } from "react"

import { HistoryViewerHeader } from "./Header"
import { HistoryList } from "./HistoryList"
import styles from "./index.module.css"
import { UrlBreadcrumbs } from "./UrlBreadcrumbs"
import { useHistory } from "./useHistory"
import { useViewerState } from "./useViewerState"

const HistoryResults = ({ searchQuery }: { searchQuery: string }) => {
  const { items, hasMore, loading, loadMore } = useHistory(searchQuery)

  const handleOpenItem = async (
    url: string,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    if (typeof chrome === "undefined" || !url) {
      return
    }

    if (event.shiftKey && chrome.windows?.create) {
      await chrome.windows.create({ url, focused: true })
      return
    }

    if ((event.ctrlKey || event.metaKey) && chrome.tabs?.create) {
      await chrome.tabs.create({ url, active: false })
      return
    }

    if (!chrome.tabs?.query || !chrome.tabs?.update) {
      return
    }

    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    if (activeTab?.id === undefined) {
      return
    }

    await chrome.tabs.update(activeTab.id, { url })
  }

  return (
    <HistoryList
      items={items}
      hasMore={hasMore}
      loading={loading}
      onLoadMore={loadMore}
      onOpenItem={handleOpenItem}
    />
  )
}

export const HistoryViewer = () => {
  const sidePanelPath = "sidepanel.html"
  const {
    currentUrl,
    keepEnabled,
    setCurrentUrl,
    theme,
    toggleKeep,
    toggleTheme
  } = useViewerState()
  const [displayQuery, setDisplayQuery] = useState<string>("")

  const isSidePanelPage =
    typeof window !== "undefined" &&
    window.location.pathname.includes("sidepanel")

  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    document.body.dataset.surface = isSidePanelPage ? "sidepanel" : "popup"

    return () => {
      delete document.body.dataset.surface
    }
  }, [isSidePanelPage])
  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    document.documentElement.dataset.theme = theme
    document.body.dataset.theme = theme

    return () => {
      delete document.documentElement.dataset.theme
      delete document.body.dataset.theme
    }
  }, [theme])

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.tabs?.query) {
      return
    }

    if (keepEnabled) {
      return
    }

    const refreshCurrentUrl = () => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs[0]?.url) {
          setCurrentUrl(tabs[0].url)
        }
      })
    }

    refreshCurrentUrl()

    const handleActivated = () => {
      refreshCurrentUrl()
    }

    const handleUpdated = (
      tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab
    ) => {
      if (!tab.active) return

      chrome.windows.getCurrent((currentWindow) => {
        if (tab.windowId === currentWindow.id) {
          if (changeInfo.url) {
            setCurrentUrl(changeInfo.url)
            return
          }
          if (changeInfo.status === "complete" && tab.url) {
            setCurrentUrl(tab.url)
          }
        }
      })
    }

    chrome.tabs.onActivated.addListener(handleActivated)
    chrome.tabs.onUpdated.addListener(handleUpdated)

    return () => {
      chrome.tabs.onActivated.removeListener(handleActivated)
      chrome.tabs.onUpdated.removeListener(handleUpdated)
    }
  }, [keepEnabled, setCurrentUrl])

  const handleSidePanelToggle = async () => {
    try {
      if (typeof chrome === "undefined" || !chrome.sidePanel?.setOptions) return
      if (!chrome.tabs?.query) return

      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (activeTab?.id !== undefined) {
        if (isSidePanelPage) {
          await chrome.sidePanel.setOptions({
            tabId: activeTab.id,
            enabled: false
          })
          return
        }

        await chrome.sidePanel.setOptions({
          tabId: activeTab.id,
          path: sidePanelPath,
          enabled: true
        })

        if (activeTab.windowId !== undefined) {
          await chrome.sidePanel.open({ windowId: activeTab.windowId })
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleOpenCurrentUrl = async (event: MouseEvent<HTMLButtonElement>) => {
    const url = displayQuery || currentUrl

    if (typeof chrome === "undefined" || !url) {
      return
    }

    if (event.shiftKey && chrome.windows?.create) {
      await chrome.windows.create({ url, focused: true })
      return
    }

    if ((event.ctrlKey || event.metaKey) && chrome.tabs?.create) {
      await chrome.tabs.create({ url, active: false })
      return
    }

    if (!chrome.tabs?.query || !chrome.tabs?.update) {
      return
    }

    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    if (activeTab?.id === undefined) {
      return
    }

    await chrome.tabs.update(activeTab.id, { url })
  }

  return (
    <main className={styles.page} data-theme={theme}>
      <HistoryViewerHeader
        isSidePanelPage={isSidePanelPage}
        keepEnabled={keepEnabled}
        theme={theme}
        onOpenCurrentUrl={handleOpenCurrentUrl}
        onSidePanelToggle={handleSidePanelToggle}
        onThemeToggle={toggleTheme}
        onKeepToggle={toggleKeep}
      />

      <div className={styles.container}>
        {currentUrl ? (
          <>
            <UrlBreadcrumbs
              key={currentUrl}
              originalUrl={currentUrl}
              onChangeQuery={setDisplayQuery}
            />
            <HistoryResults
              key={`${currentUrl}::${displayQuery}`}
              searchQuery={displayQuery}
            />
          </>
        ) : (
          <div className={styles.loading}>Loading URL...</div>
        )}
      </div>
    </main>
  )
}
