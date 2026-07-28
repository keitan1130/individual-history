import { useCallback, useEffect, useRef, useState } from "react"

import type { HistoryItem } from "~types"

const INITIAL_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
const MAX_WINDOW_MS = 5 * 365 * 24 * 60 * 60 * 1000

const fetchHistory = (text: string, startTime: number, endTime: number) => {
  if (typeof chrome === "undefined" || !chrome.history?.search) {
    return Promise.resolve<chrome.history.HistoryItem[]>([])
  }
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
  const [prevQuery, setPrevQuery] = useState(searchQuery)
  const endTimeRef = useRef<number>(0)

  if (searchQuery !== prevQuery) {
    setPrevQuery(searchQuery)
    setItems([])
    setHasMore(true)
  }

  useEffect(() => {
    endTimeRef.current = 0
  }, [searchQuery])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !searchQuery) return
    setLoading(true)

    if (endTimeRef.current === 0) {
      endTimeRef.current = Date.now()
    }

    let currentEndTime = endTimeRef.current
    let currentWindowMs = INITIAL_WINDOW_MS
    let foundItems: HistoryItem[] = []
    let keepFetching = true

    const apiSearchText = searchQuery.replace(/^https?:\/\//, "")
    const escapeRegExp = (string: string) =>
      string.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    const strictRegex = new RegExp("^" + escapeRegExp(searchQuery))

    let attempts = 0
    const MAX_ATTEMPTS = 10
    const seenKeys = new Set<string>()

    while (keepFetching && foundItems.length < 20 && attempts < MAX_ATTEMPTS) {
      const startTime = currentEndTime - currentWindowMs
      attempts++
      const results = await fetchHistory(
        apiSearchText,
        startTime,
        currentEndTime
      )

      if (results.length === 0) {
        if (currentWindowMs >= MAX_WINDOW_MS) {
          setHasMore(false)
          keepFetching = false
        } else {
          currentWindowMs = Math.min(currentWindowMs * 2, MAX_WINDOW_MS)
        }
      } else {
        const filtered = results.filter((r) => r.url && strictRegex.test(r.url))
        const mapped = filtered
          .map((r) => ({
            id: r.id,
            url: r.url!,
            title: r.title || "No Title",
            lastVisitTime: r.lastVisitTime || 0
          }))
          .filter((item) => {
            const itemKey = `${item.id}-${item.url}-${item.lastVisitTime}`
            if (seenKeys.has(itemKey)) {
              return false
            }
            seenKeys.add(itemKey)
            return true
          })
        foundItems = [...foundItems, ...mapped]
        currentEndTime = startTime
      }
    }

    if (foundItems.length > 0) {
      setItems((prev) => {
        const newItems = foundItems.filter(
          (m) =>
            !prev.some(
              (p) =>
                p.id === m.id &&
                p.url === m.url &&
                p.lastVisitTime === m.lastVisitTime
            )
        )
        return [...prev, ...newItems]
      })
    }

    endTimeRef.current = currentEndTime
    setLoading(false)
  }, [loading, hasMore, searchQuery])

  useEffect(() => {
    if (!searchQuery) return

    let isMounted = true

    const fetchInitialData = async () => {
      if (isMounted) {
        await loadMore()
      }
    }

    if (items.length === 0 && hasMore && !loading) {
      fetchInitialData()
    }

    return () => {
      isMounted = false
    }
  }, [searchQuery, items.length, hasMore, loading, loadMore])

  return { items, loading, hasMore, loadMore }
}
