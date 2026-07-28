import { useCallback, useEffect, useState } from "react"

import type { HistoryItem } from "~types"

const SEVEN_DAYS_MS = 1 * 24 * 60 * 60 * 1000

const fetchHistory = (text: string, startTime: number, endTime: number) => {
  return new Promise<chrome.history.HistoryItem[]>((resolve) => {
    chrome.history.search(
      { text, startTime, endTime, maxResults: 1000 },
      resolve
    )
  })
}

export const useHistory = (searchQuery: string) => {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [endTime, setEndTime] = useState<number>(() => Date.now())

  const [prevQuery, setPrevQuery] = useState(searchQuery)

  if (searchQuery !== prevQuery) {
    setPrevQuery(searchQuery)
    if (searchQuery) {
        setItems([])
        // eslint-disable-next-line react-hooks/purity
        setEndTime(Date.now())
        setHasMore(true)
      }
  }

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !searchQuery) return

    setLoading(true)
    let currentEndTime = endTime
    let foundItems: HistoryItem[] = []
    let keepFetching = true

    const apiSearchText = searchQuery.replace(/^https?:\/\//, "")
    const escapeRegExp = (string: string) =>
      string.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    const strictRegex = new RegExp("^" + escapeRegExp(searchQuery))

    let attempts = 0
    const MAX_ATTEMPTS = 5

    while (keepFetching && foundItems.length < 20 && attempts < MAX_ATTEMPTS) {
      const startTime = currentEndTime - SEVEN_DAYS_MS
      attempts++

      const results = await fetchHistory(
        apiSearchText,
        startTime,
        currentEndTime
      )

      if (results.length === 0) {
        setHasMore(false)
        keepFetching = false
      } else {
        const filtered = results.filter((r) => r.url && strictRegex.test(r.url))
        const mapped = filtered.map((r) => ({
          id: r.id,
          url: r.url!,
          title: r.title || "No Title",
          lastVisitTime: r.lastVisitTime || 0
        }))

        foundItems = [...foundItems, ...mapped]
        currentEndTime = startTime
      }
    }

    if (foundItems.length > 0) {
      setItems((prev) => {
        const newItems = foundItems.filter(
          (m) => !prev.some((p) => p.id === m.id)
        )
        return [...prev, ...newItems]
      })
    }

    setEndTime(currentEndTime)
    setLoading(false)
  }, [loading, hasMore, endTime, searchQuery])

  useEffect(() => {
    if (searchQuery && items.length === 0 && hasMore && !loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadMore()
    }
  }, [items, hasMore, loading, loadMore, searchQuery])

  return { items, loading, hasMore, loadMore }
}
