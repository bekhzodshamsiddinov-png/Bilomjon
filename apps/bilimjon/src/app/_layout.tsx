import { Baloo2_600SemiBold, Baloo2_700Bold } from '@expo-google-fonts/baloo-2';
import { Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../state';
import { C, F } from '../theme';

export default function RootLayout() {
  const [loaded, error] = useFonts({ Baloo2_600SemiBold, Baloo2_700Bold, Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold });
  // Shrift yuklanmasa ham ilova ochiladi (sekin internet) — tizim shrifti bilan.
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: C.page }} />;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: C.page },
            headerShadowVisible: false,
            headerTitleStyle: { fontFamily: F.display, color: C.ink, fontSize: 22 },
            headerTintColor: C.pen,
            contentStyle: { backgroundColor: C.page },
            headerBackTitle: 'Orqaga',
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Bilimjon' }} />
          <Stack.Screen name="lesson/[id]" options={{ title: 'Dars' }} />
          <Stack.Screen name="ask" options={{ title: 'Bilimjondan so‘ra' }} />
          <Stack.Screen name="parent/index" options={{ title: 'Ota-ona bo‘limi' }} />
          <Stack.Screen name="parent/guide/[id]" options={{ title: 'Qanday tushuntiraman?' }} />
          <Stack.Screen name="about" options={{ title: 'Loyiha haqida' }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
