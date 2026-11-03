import { askBilimjon, type AskReply } from '@bilim/core';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SpeakButton } from '../components/speak';
import { Btn, Card, Screen, Txt } from '../components/ui';
import { catalog, flags, visibility } from '../data';
import { useApp } from '../state';
import { C, F, S } from '../theme';

const EXAMPLES = ['12 ni 3 ga bo‘lishni tushuntir', '4 × 6 qanday hisoblanadi?', '“Marta ko‘p” nima degani?'];

export default function Ask() {
  const { grade } = useApp();
  const [q, setQ] = useState('');
  const [history, setHistory] = useState<{ q: string; a: AskReply }[]>([]);

  const ask = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const a = askBilimjon(t, { catalog, grade, visibility });
    // Savol matni faqat ekranda; hech qayerga saqlanmaydi va yuborilmaydi.
    setHistory((h) => [...h.slice(-9), { q: t, a }]);
    setQ('');
  };

  return (
    <Screen>
      <Card style={{ gap: S.sm }}>
        <Txt variant="h2" accessibilityRole="header">Bilimjondan so‘ra</Txt>
        <Txt>Matematikadan savol yoz. Men javobni aytib qo‘ymayman — qanday yechishni birga o‘ylaymiz.</Txt>
        <View style={styles.examples}>
          {EXAMPLES.map((e) => (
            <Btn key={e} kind="quiet" label={e} onPress={() => ask(e)} style={styles.example} />
          ))}
        </View>
      </Card>

      {history.map((h, i) => (
        <View key={i} style={{ gap: S.sm }} testID="ask-turn">
          <View style={styles.me}>
            <Txt>{h.q}</Txt>
          </View>
          <View style={[styles.bot, h.a.intent === 'safety' && styles.botSafety]} testID={`ask-reply-${h.a.intent}`} accessibilityLiveRegion="polite">
            <Txt style={{ fontSize: 22 }}>🤖</Txt>
            <View style={{ flex: 1, gap: S.sm }}>
              <Txt>{h.a.text}</Txt>
              {h.a.suggestedLessonId && (
                <Btn label="Darsni ochish" onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: h.a.suggestedLessonId! } })} style={{ alignSelf: 'flex-start' }} />
              )}
              {i === history.length - 1 && <SpeakButton text={h.a.text} quiet />}
            </View>
          </View>
        </View>
      ))}

      <View style={styles.inputRow}>
        <TextInput
          value={q}
          onChangeText={setQ}
          onSubmitEditing={() => ask(q)}
          placeholder="Savolingni yoz…"
          placeholderTextColor={C.inkSoft}
          accessibilityLabel="Bilimjonga savol"
          maxLength={300}
          style={styles.input}
          testID="ask-input"
        />
        <Btn label="Yuborish" onPress={() => ask(q)} disabled={!q.trim()} testID="ask-send" />
      </View>
      {!flags.voiceInput && (
        <Txt variant="small">🎤 Ovoz bilan so‘rash hozircha o‘chirilgan: o‘zbek bolalari nutqini tanish sifati hali tekshirilmagan va buning uchun ota-ona ruxsati kerak.</Txt>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  examples: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  example: { minHeight: 44, paddingHorizontal: S.md },
  me: { alignSelf: 'flex-end', backgroundColor: '#DCE6FF', padding: S.md, borderRadius: 14, borderTopRightRadius: 4, maxWidth: '85%' },
  bot: { flexDirection: 'row', gap: S.sm, backgroundColor: C.white, padding: S.md, borderRadius: 14, borderTopLeftRadius: 4, borderWidth: 1, borderColor: C.line, maxWidth: '92%' },
  botSafety: { backgroundColor: '#FFF6ED', borderColor: C.stamp },
  inputRow: { flexDirection: 'row', gap: S.sm },
  input: { flex: 1, minHeight: 56, borderRadius: 14, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: S.md, fontFamily: F.body, fontSize: 18, color: C.ink },
});
