import { useEffect, useMemo, useState } from "react"

import styles from "./index.module.css"

interface Props {
  originalUrl: string
  onChangeQuery: (query: string) => void
}

export const UrlBreadcrumbs = ({ originalUrl, onChangeQuery }: Props) => {
  const chunks = useMemo(() => {
    try {
      const url = new URL(originalUrl)
      const result: string[] = []
      result.push(`${url.protocol}//`)
      result.push(url.host + (url.pathname !== "" ? "/" : ""))
      if (url.pathname && url.pathname !== "/") {
        const paths = url.pathname.split("/").filter(Boolean)
        paths.forEach((p, i) => {
          result.push(p + (i < paths.length - 1 ? "/" : ""))
        })
      }
      if (url.search) {
        const params = url.search.substring(1).split("&")
        params.forEach((p, i) => {
          result.push(i === 0 ? `?${p}` : `&${p}`)
        })
      }
      if (url.hash) {
        result.push(url.hash)
      }
      return result
    } catch {
      return [originalUrl]
    }
  }, [originalUrl])

  const [activeIndex, setActiveIndex] = useState(() => {
    return chunks.length > 1 ? 1 : 0
  })

  useEffect(() => {
    const query = chunks.slice(0, activeIndex + 1).join("")
    onChangeQuery(query)
  }, [chunks, activeIndex, onChangeQuery])

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbsText}>
        {chunks.map((chunk, idx) => {
          const isActive = idx <= activeIndex
          return (
            <span
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`${styles.chunk} ${isActive ? styles.chunkActive : styles.chunkInactive}`}>
              {chunk}
            </span>
          )
        })}
      </div>
    </div>
  )
}
