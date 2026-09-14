import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { LoadingState } from '@/components/ui-kit'

export default function Index() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoaded = useAuthStore((s) => s.isLoaded)
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (!token) {
      router.replace('/(auth)/login')
      return
    }
    router.replace(
      user?.role === 'seller'
        ? '/(authenticated)/(seller)'
        : '/(authenticated)/(buyer)'
    )
  }, [isLoaded, token, user?.role])

  return <LoadingState />
}