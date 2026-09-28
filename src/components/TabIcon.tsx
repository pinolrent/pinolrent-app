import { NAV_ICONS } from '@/components/nav-icons'

export function TabIcon({
  Icon,
  color,
}: {
  Icon: (typeof NAV_ICONS)[keyof typeof NAV_ICONS]
  color: string
}) {
  return <Icon size={22} color={color} />
}
