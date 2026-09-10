import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

function webStorage(): Storage | null {
  try {
    return localStorage
  } catch {
    return null
  }
}

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return webStorage()?.getItem(key) ?? null
      } catch {
        return null
      }
    }
    try {
      return await SecureStore.getItemAsync(key)
    } catch {
      return null
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        webStorage()?.setItem(key, value)
      } catch {
        // private mode: keep session in memory only
      }
      return
    }
    try {
      await SecureStore.setItemAsync(key, value)
    } catch {
      // keychain locked/full: keep session in memory only
    }
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        webStorage()?.removeItem(key)
      } catch {
        // ignore
      }
      return
    }
    try {
      await SecureStore.deleteItemAsync(key)
    } catch {
      // ignore
    }
  },
}
