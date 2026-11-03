import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Btn, Paper, Txt } from './ui';
import { useApp } from '../state';
import { C, F, S } from '../theme';

/**
 * Ota-ona darvozasi: bola tasodifan kattalar bo'limiga kirmasligi uchun.
 * Bu xavfsizlik (autentifikatsiya) EMAS — App Store/Google Play bolalar toifasi talab qiladigan
 * "parental gate". Haqiqiy himoya — kelajakdagi ota-ona hisobi (telefon + OTP), rozilikdan keyin.
 */
export function ParentGate() {
  const { unlockParent } = useApp();
  const { a, b } = useMemo(() => ({ a: 13 + Math.floor(Math.random() * 27), b: 3 + Math.floor(Math.random() * 7) }), []);
  const [v, setV] = useState('');
  const [wrong, setWrong] = useState(false);
  const check = () => {
    if (Number(v.trim()) === a * b) unlockParent();
    else {
      setWrong(true);
      setV('');
    }
  };
  return (
    <Paper style={{ gap: S.md }} testID="parent-gate">
      <Txt variant="h2" accessibilityRole="header">Bu bo‘lim kattalar uchun</Txt>
      <Txt>Davom etish uchun misolni yeching:</Txt>
      <Txt variant="numeral" testID="gate-question">
        {a} × {b} = ?
      </Txt>
      <View style={styles.row}>
        <TextInput value={v} onChangeText={setV} onSubmitEditing={check} keyboardType="number-pad" accessibilityLabel="Javob" style={styles.input} testID="gate-input" maxLength={4} />
        <Btn label="Kirish" onPress={check} testID="gate-submit" />
      </View>
      {wrong && <Txt variant="small">Javob noto‘g‘ri. Yangi urinish — natijani raqam bilan yozing.</Txt>}
    </Paper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: S.sm },
  input: { flex: 1, maxWidth: 200, minHeight: 56, borderRadius: 14, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: S.md, fontFamily: F.display, fontSize: 24, color: C.ink },
});
