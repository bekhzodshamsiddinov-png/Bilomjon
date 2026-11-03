import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, MAX_W, S, T, TOUCH } from '../theme';
import { flags } from '../data';

export function Txt({ children, style, variant = 'body', ...rest }: { children: ReactNode; style?: StyleProp<TextStyle>; variant?: keyof typeof textStyles; accessibilityRole?: 'header' | 'text'; numberOfLines?: number; testID?: string }) {
  return (
    <Text style={[textStyles[variant], style]} {...rest} maxFontSizeMultiplier={1.6}>
      {children}
    </Text>
  );
}

const textStyles = StyleSheet.create({
  hero: { fontFamily: F.display, fontSize: T.hero, lineHeight: T.hero * 1.1, color: C.ink },
  h1: { fontFamily: F.display, fontSize: T.h1, lineHeight: T.h1 * 1.2, color: C.ink },
  h2: { fontFamily: F.display, fontSize: T.h2, lineHeight: T.h2 * 1.25, color: C.ink },
  h3: { fontFamily: F.bodyHeavy, fontSize: T.h3, lineHeight: T.h3 * 1.3, color: C.ink },
  body: { fontFamily: F.body, fontSize: T.body, lineHeight: T.body * 1.5, color: C.ink },
  bodyBold: { fontFamily: F.bodyBold, fontSize: T.body, lineHeight: T.body * 1.5, color: C.ink },
  small: { fontFamily: F.body, fontSize: T.small, lineHeight: T.small * 1.45, color: C.inkSoft },
  numeral: { fontFamily: F.display, fontSize: T.numeral, lineHeight: T.numeral * 1.15, color: C.ink },
});

/** Har bir ekranda: tasdiqlanmagan namuna ekanini aniq aytadigan yorliq. */
export function DemoBanner() {
  if (!flags.demoContent) return null;
  return (
    <View style={styles.banner} accessibilityRole="summary" testID="demo-banner">
      <Txt variant="small" style={styles.bannerText}>
        Sinov versiyasi. Darslar o‘qituvchi tomonidan hali tasdiqlanmagan, Bilimjon — haqiqiy AI emas. Shaxsiy ma’lumot kiritmang.
      </Txt>
    </View>
  );
}

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const body = <View style={styles.inner}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <DemoBanner />
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

type BtnKind = 'primary' | 'quiet' | 'choice' | 'marker';
export function Btn({
  label,
  onPress,
  kind = 'primary',
  disabled,
  style,
  accessibilityHint,
  testID,
  big,
}: {
  label: string;
  onPress: () => void;
  kind?: BtnKind;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  testID?: string;
  big?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.btn,
        btnKinds[kind],
        big && styles.btnBig,
        pressed && { transform: [{ translateY: 2 }], opacity: 0.9 },
        focused && styles.focus,
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      <Text style={[styles.btnText, kind === 'primary' ? { color: C.white } : { color: C.ink }, big && { fontFamily: F.display, fontSize: 30 }]} maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
    </Pressable>
  );
}

const btnKinds = StyleSheet.create({
  primary: { backgroundColor: C.pen, borderColor: C.penDark, borderBottomWidth: 4 },
  quiet: { backgroundColor: C.white, borderColor: C.line, borderWidth: 1.5 },
  choice: { backgroundColor: C.white, borderColor: C.ink, borderWidth: 2, borderBottomWidth: 4 },
  marker: { backgroundColor: C.markerSoft, borderColor: C.marker, borderWidth: 2 },
});

export function NavLink({ href, label, testID }: { href: Href; label: string; testID?: string }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" testID={testID} style={({ focused }: { pressed: boolean; focused?: boolean }) => [styles.navLink, focused && styles.focus]}>
        <Text style={styles.navLinkText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

/** Katakli qog'oz varag'i — dizaynning yagona "yorqin" elementi. */
export function Paper({ children, style, testID }: { children: ReactNode; style?: StyleProp<ViewStyle>; testID?: string }) {
  return (
    <View style={[styles.paper, style]} testID={testID}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 40 }, (_, i) => (
          <View key={`h${i}`} style={[styles.gridH, { top: 22 + i * 22 }]} />
        ))}
        {Array.from({ length: 34 }, (_, i) => (
          <View key={`v${i}`} style={[styles.gridV, { left: 22 + i * 22 }]} />
        ))}
        <View style={styles.margin} />
      </View>
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.page },
  scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: S.xxl },
  inner: { width: '100%', maxWidth: MAX_W, paddingHorizontal: S.lg, paddingTop: S.lg, gap: S.lg },
  banner: { backgroundColor: C.markerSoft, borderBottomWidth: 1, borderColor: C.marker, paddingVertical: 6, paddingHorizontal: S.lg, alignItems: 'center' },
  bannerText: { color: C.ink, textAlign: 'center', maxWidth: MAX_W },
  btn: { minHeight: TOUCH, borderRadius: 14, paddingHorizontal: S.xl, alignItems: 'center', justifyContent: 'center' },
  btnBig: { minHeight: 76, minWidth: 76 },
  btnText: { fontFamily: F.bodyHeavy, fontSize: 18 },
  focus: Platform.select({ web: { outlineColor: C.marker, outlineWidth: 3, outlineStyle: 'solid', outlineOffset: 2 } as ViewStyle, default: { borderColor: C.marker } }),
  navLink: { minHeight: 44, justifyContent: 'center', paddingHorizontal: S.sm, borderRadius: 8 },
  navLinkText: { fontFamily: F.bodyBold, fontSize: 16, color: C.pen, textDecorationLine: 'underline' },
  paper: { backgroundColor: C.paper, borderRadius: 6, borderWidth: 1, borderColor: C.line, overflow: 'hidden', padding: S.xl, paddingLeft: 44 },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: C.grid },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: C.grid },
  margin: { position: 'absolute', top: 0, bottom: 0, left: 30, width: 1.5, backgroundColor: '#F2A7B4' },
  card: { backgroundColor: C.white, borderRadius: 16, padding: S.lg, borderWidth: 1, borderColor: C.line },
});
