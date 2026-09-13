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
import { THEME_COLORS } from '@/constants/theme-colors'
import { useThemeStore } from '@/stores/theme.store'

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

export function AppBackButton() {
  const router = useRouter()
  const theme = useThemeStore((s) => s.theme)
  const Icon = NAV_ICONS.back
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Regresar"
      onPress={() => router.back()}
      className="h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
    >
      <Icon size={20} color={THEME_COLORS[theme].primary} />
    </Pressable>
  )
}
