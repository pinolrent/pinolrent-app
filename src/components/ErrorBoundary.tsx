import { Component, type ReactNode } from 'react'
import { View, Text } from 'react-native'
import { AppButton, EmptyState } from './ui-kit'

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    if (__DEV__) {
      console.error('[ErrorBoundary]', error)
    }
  }

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
          <Text className="text-xl font-bold text-foreground">
            Algo salió mal
          </Text>
          <EmptyState
            message="Reintenta volviendo a cargar"
            action={
              <AppButton onPress={() => this.setState({ error: null })}>
                Reintentar
              </AppButton>
            }
          />
        </View>
      )
    }
    return this.props.children
  }
}
