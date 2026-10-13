import {
  CalendarDays,
  Car,
  CarFront,
  History,
  Home,
  LayoutDashboard,
  Menu,
  Receipt,
  User,
  Users,
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
  panel: LayoutDashboard,
  users: Users,
  payments: Receipt,
  audit: History,
} satisfies Record<string, LucideIcon>
