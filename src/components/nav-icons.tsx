import {
  CalendarDays,
  Car,
  CarFront,
  Home,
  Menu,
  User,
  X,
  type LucideIcon,
} from 'lucide-react-native'

export const NAV_ICONS = {
  home: Home,
  catalog: Car,
  reservations: CalendarDays,
  cars: CarFront,
  profile: User,
  menu: Menu,
  close: X,
} satisfies Record<string, LucideIcon>
