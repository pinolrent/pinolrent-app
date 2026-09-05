import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth.store'

type LogEntry = { label: string; ok: boolean; detail: string }

export default function TestScreen() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [running, setRunning] = useState(false)
  const { setAuth } = useAuthStore()

  const addLog = (label: string, ok: boolean, detail: string) => {
    setLogs((prev) => [...prev, { label, ok, detail }])
  }

  const runTests = async () => {
    setRunning(true)
    setLogs([])

    // 1. Health
    try {
      const health = await api.get('/health')
      addLog('GET /health', health.status === 200, JSON.stringify(health.data))
    } catch (e: any) {
      addLog('GET /health', false, e.message)
    }

    // 2. Login
    let token = ''
    try {
      const login = await api.post('/auth/login', {
        email: 'compra@example.com',
        password: 'secret123',
      })
      token = login.data.token
      addLog('POST /auth/login', true, `token: ${token.slice(0, 30)}...`)
    } catch (e: any) {
      addLog('POST /auth/login', false, e.response?.data?.error || e.message)
    }

    // 3. Me (with token)
    if (token) {
      try {
        const me = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        addLog('GET /auth/me', true, JSON.stringify(me.data))
        setAuth(token, me.data)
      } catch (e: any) {
        addLog('GET /auth/me', false, e.response?.data?.error || e.message)
      }
    }

    // 4. Cars
    try {
      const cars = await api.get('/cars?limit=2')
      addLog('GET /cars', true, `${cars.data.length} cars: ${JSON.stringify(cars.data[0])}`)
    } catch (e: any) {
      addLog('GET /cars', false, e.response?.data?.error || e.message)
    }

    setRunning(false)
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Connection Test</Text>
      <Text style={styles.subtitle}>API: {process.env.EXPO_PUBLIC_API_URL}</Text>

      <Text
        style={[styles.button, running && styles.buttonDisabled]}
        onPress={running ? undefined : runTests}
      >
        {running ? 'Running...' : 'Run Tests'}
      </Text>

      {logs.map((log, i) => (
        <View key={i} style={styles.logEntry}>
          <Text style={styles.logLabel}>
            {log.ok ? 'PASS' : 'FAIL'} {log.label}
          </Text>
          <Text style={styles.logDetail}>{log.detail}</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4, color: '#fff' },
  subtitle: { fontSize: 14, color: '#999', marginBottom: 20 },
  button: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    textAlign: 'center',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    overflow: 'hidden',
  },
  buttonDisabled: { opacity: 0.5 },
  logEntry: { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 8 },
  logLabel: { fontSize: 14, fontWeight: '600', color: '#fff' },
  logDetail: { fontSize: 12, color: '#aaa', marginTop: 2 },
})
