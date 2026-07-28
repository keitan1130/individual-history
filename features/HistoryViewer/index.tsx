import { useEffect, useState } from "react"

import { HistoryList } from "./HistoryList"
import styles from "./index.module.css"
import { UrlBreadcrumbs } from "./UrlBreadcrumbs"
import { useHistory } from "./useHistory"

export const HistoryViewer = () => {
  const [currentUrl, setCurrentUrl] = useState<string>("")
  const [displayQuery, setDisplayQuery] = useState<string>("")

  const { items, hasMore, loading, loadMore } = useHistory(displayQuery)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        setCurrentUrl(tabs[0].url)
      }
    })
  }, [])

  if (!currentUrl) {
    return <div className={styles.loading}>Loading URL...</div>
  }

  return (
    <div className={styles.container}>
      <UrlBreadcrumbs
        originalUrl={currentUrl}
        onChangeQuery={setDisplayQuery}
      />
      <HistoryList
        items={items}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
      />
    </div>
  )
}
