import { Component, type ReactNode } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button, ButtonText } from '../../components/ui/button'

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.center}>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.subtitle}>Reintentá volviendo a cargar</Text>
          <Button
            variant="default"
            onPress={() => this.setState({ error: null })}
          >
            <ButtonText>Reintentar</ButtonText>
          </Button>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  subtitle: { color: '#aaa' },
})
