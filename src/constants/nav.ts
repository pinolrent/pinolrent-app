import type { NAV_ICONS } from '@/components/nav-icons'

export interface NavItem {
  label: string
  href: string
  icon: keyof typeof NAV_ICONS
}

export const buyerNav: NavItem[] = [
  { label: 'Inicio', href: '/(authenticated)/(buyer)', icon: 'home' },
  {
    label: 'Catálogo',
    href: '/(authenticated)/(buyer)/catalog',
    icon: 'catalog',
  },
  {
    label: 'Reservas',
    href: '/(authenticated)/(buyer)/reservations',
    icon: 'reservations',
  },
  { label: 'Perfil', href: '/(authenticated)/(buyer)/profile', icon: 'profile' },
]

export const sellerNav: NavItem[] = [
  { label: 'Inicio', href: '/(authenticated)/seller', icon: 'home' },
  { label: 'Mis autos', href: '/(authenticated)/seller/cars', icon: 'cars' },
  {
    label: 'Reservas',
    href: '/(authenticated)/seller/reservations',
    icon: 'reservations',
  },
  { label: 'Perfil', href: '/(authenticated)/seller/profile', icon: 'profile' },
]
