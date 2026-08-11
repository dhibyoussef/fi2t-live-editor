import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * On every route change, jump to the top of the page so navigation
 * never keeps the previous page's scroll position.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    // In-page anchors keep their target; plain navigations start at top.
    if (hash) {
      const id = decodeURIComponent(hash.replace(/^#/, ''))
      const el = id ? document.getElementById(id) : null
      if (el) {
        el.scrollIntoView()
        return
      }
    }

    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    // Builder / embed preview sometimes scrolls a nested container.
    const nested = document.querySelectorAll<HTMLElement>(
      '.cms-builder-embed, [data-scroll-root], main',
    )
    nested.forEach((node) => {
      node.scrollTop = 0
    })
  }, [pathname, search, hash])

  return null
}
