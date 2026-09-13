import { useId } from 'react'
import { View } from 'react-native'
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg'

const HORIZON = 300
const PEAK_LEFT = 176
const PEAK_RIGHT = 208

export function RouteDashes() {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-1 w-6 rounded-full bg-primary" />
      <View className="h-1 w-5 rounded-full bg-primary/60" />
      <View className="h-1 w-3 rounded-full bg-primary/30" />
    </View>
  )
}

export function RouteScene() {
  const uid = useId().replace(/:/g, '')
  const skyId = `sky-${uid}`
  const roadId = `road-${uid}`
  const groundId = `ground-${uid}`
  const glowId = `glow-${uid}`

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#04070F" />
          <Stop offset="0.5" stopColor="#0A1735" />
          <Stop offset="0.88" stopColor="#1E3A8A" />
        </LinearGradient>
        <LinearGradient id={roadId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1A2745" />
          <Stop offset="0.35" stopColor="#0E1626" />
          <Stop offset="1" stopColor="#05080F" />
        </LinearGradient>
        <LinearGradient id={groundId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#080F1F" />
          <Stop offset="1" stopColor="#02040A" />
        </LinearGradient>
        <RadialGradient id={glowId} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#93C5FD" stopOpacity="0.5" />
          <Stop offset="0.5" stopColor="#3B82F6" stopOpacity="0.16" />
          <Stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Rect x="0" y="0" width="390" height={HORIZON} fill={`url(#${skyId})`} />
      <Rect
        x="0"
        y={HORIZON}
        width="390"
        height={844 - HORIZON}
        fill={`url(#${groundId})`}
      />

      <Ellipse
        cx="196"
        cy={HORIZON - 24}
        rx="210"
        ry="150"
        fill={`url(#${glowId})`}
      />

      <Path
        d={`M 112 ${HORIZON} L 170 ${PEAK_LEFT + 16} L 186 ${PEAK_LEFT + 32} L 202 ${PEAK_RIGHT - 16} L 258 ${HORIZON} Z`}
        fill="#060B18"
      />
      <Path
        d={`M 170 ${PEAK_LEFT + 24} L 176 ${PEAK_LEFT + 2} L 184 ${PEAK_LEFT + 22} Z`}
        fill="#0A1735"
      />
      <Ellipse cx="178" cy={PEAK_LEFT - 10} rx="7" ry="6" fill="#93C5FD" opacity="0.22" />
      <Ellipse cx="188" cy={PEAK_LEFT - 22} rx="9" ry="7" fill="#93C5FD" opacity="0.16" />
      <Ellipse cx="200" cy={PEAK_LEFT - 34} rx="12" ry="9" fill="#93C5FD" opacity="0.1" />
      <Path
        d={`M 0 ${HORIZON} L 108 ${HORIZON} M 262 ${HORIZON} L 390 ${HORIZON}`}
        stroke="#1E3A8A"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        fill="none"
      />

      <Path
        d={`M 192 ${HORIZON} L 390 ${844} L 0 ${844} L 198 ${HORIZON} Z`}
        fill={`url(#${roadId})`}
      />
      <Path
        d={`M 192 ${HORIZON} L 0 ${844}`}
        stroke="#60A5FA"
        strokeOpacity="0.3"
        strokeWidth="1.5"
        fill="none"
      />
      <Path
        d={`M 198 ${HORIZON} L 390 ${844}`}
        stroke="#60A5FA"
        strokeOpacity="0.3"
        strokeWidth="1.5"
        fill="none"
      />

      <Rect x="194.5" y="330" width="1" height="6" rx="0.5" fill="#E2E8F0" opacity="0.4" />
      <Rect x="194" y="360" width="2" height="11" rx="1" fill="#E2E8F0" opacity="0.38" />
      <Rect x="193" y="404" width="3" height="18" rx="1.5" fill="#E2E8F0" opacity="0.36" />
      <Rect x="191.5" y="462" width="5" height="27" rx="2.5" fill="#E2E8F0" opacity="0.34" />
      <Rect x="189" y="538" width="8" height="42" rx="4" fill="#E2E8F0" opacity="0.32" />
      <Rect x="185.5" y="634" width="12" height="62" rx="6" fill="#E2E8F0" opacity="0.3" />
      <Rect x="181" y="756" width="17" height="88" rx="8.5" fill="#E2E8F0" opacity="0.26" />

      <Rect
        x="0"
        y={HORIZON - 1}
        width="390"
        height="1.5"
        fill="#93C5FD"
        opacity="0.4"
      />
    </Svg>
  )
}
