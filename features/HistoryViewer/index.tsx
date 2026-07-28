import { useEffect, useState } from "react"

import { HistoryList } from "./HistoryList"
import styles from "./index.module.css"
import { UrlBreadcrumbs } from "./UrlBreadcrumbs"
import { useHistory } from "./useHistory"
import { useTheme } from "./useTheme"

const HistoryResults = ({ searchQuery }: { searchQuery: string }) => {
  const { items, hasMore, loading, loadMore } = useHistory(searchQuery)

  return (
    <HistoryList
      items={items}
      hasMore={hasMore}
      loading={loading}
      onLoadMore={loadMore}
    />
  )
}

export const HistoryViewer = () => {
  const sidePanelPath = "sidepanel.html"
  const [currentUrl, setCurrentUrl] = useState<string>(() => {
    if (typeof window === "undefined") {
      return ""
    }

    return window.location.href
  })
  const [displayQuery, setDisplayQuery] = useState<string>("")
  const { theme, toggleTheme } = useTheme()

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
    if (typeof chrome === "undefined" || !chrome.tabs?.query) {
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
      if (tab.active && changeInfo.url) {
        setCurrentUrl(changeInfo.url)
        return
      }

      if (tab.active && changeInfo.status === "complete" && tab.url) {
        setCurrentUrl(tab.url)
      }
    }

    chrome.tabs.onActivated.addListener(handleActivated)
    chrome.tabs.onUpdated.addListener(handleUpdated)

    return () => {
      chrome.tabs.onActivated.removeListener(handleActivated)
      chrome.tabs.onUpdated.removeListener(handleUpdated)
    }
  }, [])

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

  return (
    <main className={styles.page} data-theme={theme}>
      <div className={styles.controls}>
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={toggleTheme} type="button">
            {theme === "dark" ? "ライト" : "ダーク"}
          </button>
          <button
            className={styles.button}
            onClick={handleSidePanelToggle}
            type="button">
            {isSidePanelPage ? "サイドパネルを閉じる" : "サイドパネルを開く"}
          </button>
        </div>
      </div>

      <div className={styles.container}>
        {currentUrl ? (
          <>
            <UrlBreadcrumbs
              key={currentUrl}
              originalUrl={currentUrl}
              onChangeQuery={setDisplayQuery}
            />
            <HistoryResults key={`${currentUrl}::${displayQuery}`} searchQuery={displayQuery} />
          </>
        ) : (
          <div className={styles.loading}>Loading URL...</div>
        )}
      </div>
    </main>
  )
}
