import { useCallback, useRef } from "react"

import type { HistoryItem } from "~types"

import styles from "./index.module.css"

interface Props {
  items: HistoryItem[]
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
}

const formatDate = (ms: number) => {
  const d = new Date(ms)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const HistoryList = ({ items, hasMore, loading, onLoadMore }: Props) => {
  const observer = useRef<IntersectionObserver | null>(null)

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore()
        }
      })

      if (node) observer.current.observe(node)
    },
    [loading, hasMore, onLoadMore]
  )

  return (
    <div className={styles.container}>
      {items.map((item, index) => {
        const isLast = items.length === index + 1
        const faviconUrl = `https://www.google.com/s2/favicons?sz=16&domain_url=${encodeURIComponent(item.url)}`

        return (
          <div
            key={item.id}
            ref={isLast ? lastElementRef : null}
            className={styles.item}>
            <div className={styles.header}>
              <span className={styles.date}>
                {formatDate(item.lastVisitTime)}
              </span>
              <img src={faviconUrl} alt="icon" className={styles.icon} />
              <span className={styles.title}>{item.title}</span>
            </div>
            <div className={styles.url}>{item.url}</div>
          </div>
        )
      })}
      {loading && <div className={styles.loading}>Loading...</div>}
    </div>
  )
}
