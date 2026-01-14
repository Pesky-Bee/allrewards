import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../src/constants/theme';
import * as SplashScreen from 'expo-splash-screen';

// Prevent auto-hide until app is ready
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a brief delay to ensure app is mounted
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: Colors.backgroundSecondary,
          },
          animation: 'slide_from_right',
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'All Rewards',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="cards"
          options={{
            title: 'My Cards',
          }}
        />
        <Stack.Screen
          name="add"
          options={{
            title: 'Add Card',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="edit/[id]"
          options={{
            title: 'Edit Card',
          }}
        />
        <Stack.Screen
          name="view/[id]"
          options={{
            title: 'View Card',
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
