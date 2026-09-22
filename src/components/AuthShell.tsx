import type { ReactNode } from 'react'
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native'
import { Brand } from '@/components/Brand'
import { AppCard } from '@/components/ui-kit'

const AUTH_BG = require('../assets/login-background.jpeg')

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 bg-background">
      <ImageBackground
        source={AUTH_BG}
        resizeMode="cover"
        accessible={false}
        className="flex-1"
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 16,
            }}
          >
            <View className="w-full max-w-md">
              <AppCard padding="xl">
                <Brand />
                <View className="h-px bg-border" />
                {children}
              </AppCard>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  )
}
