import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {})
  }, [])
  return reduce
}
