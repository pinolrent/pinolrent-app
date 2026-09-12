import {
  ArrowLeft,
  CalendarDays,
  Car,
  CarFront,
  Home,
  Menu,
  User,
  X,
  type LucideIcon,
} from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useRouter } from 'expo-router'

export const NAV_ICONS = {
  home: Home,
  catalog: Car,
  reservations: CalendarDays,
  cars: CarFront,
  profile: User,
  menu: Menu,
  close: X,
  back: ArrowLeft,
} satisfies Record<string, LucideIcon>

export function iconColor(dark: boolean): string {
  return dark ? '#E2E8F0' : '#0F172A'
}

export function AppBackButton() {
  const router = useRouter()
  const Icon = NAV_ICONS.back
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Regresar"
      onPress={() => router.back()}
      className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
    >
      <Icon size={20} color="#1D4ED8" />
    </Pressable>
  )
}
