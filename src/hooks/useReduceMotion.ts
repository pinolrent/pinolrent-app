import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

export function useReduceMotion() {
  // Start without motion and only enable animations once the platform
  // preference resolves, so reduced motion users never see the first frame.
  const [reduce, setReduce] = useState(true)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduce)
      .catch(() => {})
  }, [])

  return reduce
}
