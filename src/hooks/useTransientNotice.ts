import { useEffect, useState } from 'react'

const NOTICE_MS = 6000

export function useTransientNotice() {
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), NOTICE_MS)
    return () => clearTimeout(timer)
  }, [notice])

  return [notice, setNotice] as const
}
