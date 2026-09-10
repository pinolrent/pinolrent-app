export function tabBarOptions(dark: boolean) {
  return {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: dark ? '#111C33' : '#FFFFFF',
      borderTopColor: dark ? '#243352' : '#E2E8F0',
    },
    tabBarActiveTintColor: dark ? '#60A5FA' : '#1D4ED8',
    tabBarInactiveTintColor: dark ? '#94A3B8' : '#64748B',
  }
}
