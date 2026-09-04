import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { SafeAreaListener } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Uniwind } from 'uniwind';

import { Home } from './src/screens/Home';

export default function App() {
  return (

    <SafeAreaListener
      onChange={({ insets }) => {
        Uniwind.updateInsets(insets);
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GluestackUIProvider mode="dark">
          <StatusBar style="auto" />
          <View style={styles.container}>
            <Home></Home>
          </View>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaListener>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
