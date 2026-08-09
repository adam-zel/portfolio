import { useEffect, useState } from 'react'

function getInitialMatch(query: string, fallback: boolean) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return fallback
  }
  return window.matchMedia(query).matches
}

export function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(() => getInitialMatch(query, initial))

  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])

  return matches
}
