import type { User } from '@/types/auth'

// El área por defecto de una cuenta: admin primero, después vendedor. El
// cambio de modo es solo un router.replace, la API no guarda un modo activo.
export function homeHref(user: Pick<User, 'roles'> | null | undefined): string {
  if (user?.roles?.includes('admin')) return '/(authenticated)/admin'
  if (user?.roles?.includes('seller')) return '/(authenticated)/seller'
  return '/(authenticated)/(buyer)'
}
