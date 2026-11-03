import { findVisibleLesson, respond, startSession, type Phase, type TutorInput, type TutorMessage, type TutorResult } from '@bilim/core';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SpeakButton } from '../../components/speak';
import { Btn, Card, DemoBanner, Paper, Txt } from '../../components/ui';
import { lessonVisual, VisualModel } from '../../components/visual';
import { catalog, visibility } from '../../data';
import { C, F, MAX_W, S } from '../../theme';

const STEPS: { phase: Phase; label: string }[] = [
  { phase: 'diagnostic', label: 'Tekshiruv' },
  { phase: 'example', label: 'Misol' },
  { phase: 'guided', label: 'Birga' },
  { phase: 'independent', label: 'O‘zing' },
  { phase: 'transfer', label: 'Yangi' },
  { phase: 'summary', label: 'Xulosa' },
];

type FeedItem = { key: string; msg: TutorMessage };

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const found = findVisibleLesson(catalog, String(id), visibility);
  const [session, setSession] = useState<TutorResult | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [typed, setTyped] = useState('');
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const counter = useRef(0);

  const push = useCallback((ms: TutorMessage[]) => {
    setFeed((f) => [...f, ...ms.map((msg) => ({ key: String(counter.current++), msg }))]);
  }, []);

  const begin = useCallback(() => {
    if (!found) return;
    const seed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const r = startSession(found.lesson, seed);
    counter.current = 0;
    setFeed([]);
    setSession(r);
    push(r.messages);
  }, [found?.lesson.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    begin();
  }, [begin]);

  const send = (input: TutorInput) => {
    if (!found || !session) return;
    const r = respond(found.lesson, session.state, input);
    setSession(r);
    push(r.messages);
    setTyped('');
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60);
  };

  if (!found) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.inner}>
          <Card>
            <Txt variant="h2">Bu dars hozir mavjud emas</Txt>
            <Txt>Dars hali tasdiqlanmagan yoki olib tashlangan. Bosh sahifadan boshqa mavzuni tanla.</Txt>
            <Btn label="Bosh sahifa" onPress={() => router.replace('/')} style={{ marginTop: S.md }} />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const { lesson } = found;
  const phase = session?.state.phase ?? 'diagnostic';
  const stepIdx = STEPS.findIndex((s) => s.phase === phase);
  // Faqat oxirgi masala faol; oldingilari tarixda xira ko'rinadi.
  const lastExerciseKey = [...feed].reverse().find((f) => f.msg.kind === 'exercise')?.key;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <Stack.Screen options={{ title: lesson.title }} />
      <DemoBanner />
      <View style={styles.steps} accessibilityRole="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={stepIdx + 1} accessibilityLabel={`Bosqich ${stepIdx + 1} / ${STEPS.length}: ${STEPS[stepIdx]?.label}`}>
        {STEPS.map((s, i) => (
          <View key={s.phase} style={styles.step}>
            <View style={[styles.dot, i < stepIdx && styles.dotDone, i === stepIdx && styles.dotNow]}>
              <Txt style={[styles.dotTxt, i <= stepIdx && { color: C.white }]}>{i + 1}</Txt>
            </View>
            <Txt variant="small" style={[styles.stepLabel, i === stepIdx && { color: C.ink, fontFamily: F.bodyBold }]} numberOfLines={1}>
              {s.label}
            </Txt>
          </View>
        ))}
      </View>

      <ScrollView ref={scroll} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
        <View style={styles.inner}>
          <Txt variant="small">Maqsad: {lesson.objective}</Txt>
          {feed.map(({ key, msg }) => (
            <Message key={key} msg={msg} active={key === lastExerciseKey && phase !== 'summary' && phase !== 'example'} />
          ))}

          {phase === 'example' && <Btn label="Tushundim, davom etamiz" onPress={() => send({ type: 'next' })} testID="continue" />}

          {phase !== 'example' && phase !== 'summary' && session?.state.current && (
            <View style={{ gap: S.sm }}>
              <View style={styles.choices} accessibilityLabel="Javob variantlari">
                {session.state.current.choices.map((c) => (
                  <Btn key={c} kind="choice" big label={c} onPress={() => send({ type: 'answer', value: c })} testID={`choice-${c}`} style={styles.choice} />
                ))}
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  value={typed}
                  onChangeText={setTyped}
                  onSubmitEditing={() => typed.trim() && send({ type: 'text', text: typed.trim() })}
                  placeholder="Javobni yoki savolni yoz…"
                  placeholderTextColor={C.inkSoft}
                  accessibilityLabel="Javob yoki savol"
                  maxLength={200}
                  autoCorrect={false}
                  style={styles.input}
                  testID="answer-input"
                />
                <Btn label="Yuborish" onPress={() => typed.trim() && send({ type: 'text', text: typed.trim() })} disabled={!typed.trim()} testID="send" />
              </View>
              {phase !== 'diagnostic' && <Btn kind="marker" label="💡 Ishora" onPress={() => send({ type: 'hint' })} testID="hint" />}
            </View>
          )}

          {phase === 'summary' && (
            <View style={{ gap: S.sm }}>
              <Btn label="Yana bir bor (yangi masalalar)" onPress={begin} testID="restart" />
              <Btn kind="quiet" label="Ota-ona uchun qo‘llanma" onPress={() => router.push({ pathname: '/parent/guide/[id]', params: { id: lesson.id } })} />
              <Btn kind="quiet" label="Bosh sahifa" onPress={() => router.replace('/')} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Bubble({ text, tone }: { text: string; tone?: 'neutral' | 'positive' | 'gentle' }) {
  return (
    <View style={[styles.bubble, tone === 'positive' && styles.bubbleOk, tone === 'gentle' && styles.bubbleGentle]} accessibilityLiveRegion="polite">
      <Txt style={styles.avatar}>🤖</Txt>
      <Txt style={{ flex: 1 }}>{text}</Txt>
    </View>
  );
}

function Message({ msg, active }: { msg: TutorMessage; active: boolean }) {
  switch (msg.kind) {
    case 'say':
      return <Bubble text={msg.text} tone={msg.tone} />;
    case 'safety':
      return (
        <View style={[styles.bubble, styles.bubbleSafety]} accessibilityLiveRegion="assertive" testID={`safety-${msg.category}`}>
          <Txt style={styles.avatar}>🤖</Txt>
          <Txt style={{ flex: 1 }}>{msg.text}</Txt>
        </View>
      );
    case 'hint':
      return (
        <View style={styles.hint} testID="hint-card" accessibilityLiveRegion="polite">
          <Txt variant="bodyBold">💡 Ishora {msg.level}/{msg.of}</Txt>
          <Txt>{msg.text}</Txt>
        </View>
      );
    case 'solution':
      return (
        <Card style={{ gap: S.xs }}>
          {msg.steps.map((s, i) => (
            <Txt key={i}>
              {i + 1}) {s}
            </Txt>
          ))}
        </Card>
      );
    case 'example':
      return (
        <Paper style={{ gap: S.sm }} testID="example-card">
          <Txt variant="h3">{msg.intro}</Txt>
          <VisualModel visual={lessonVisual(msg.visual)} />
          {msg.explanationSteps.map((s, i) => (
            <Txt key={i}>{s}</Txt>
          ))}
          <View style={styles.rule} />
          <Txt variant="bodyBold">Misol: {msg.prompt}</Txt>
          {msg.steps.map((s, i) => (
            <Txt key={i}>
              {i + 1}) {s}
            </Txt>
          ))}
          <SpeakButton text={[msg.intro, ...msg.explanationSteps].join(' ')} />
        </Paper>
      );
    case 'exercise': {
      const ex = msg.exercise;
      const isEquation = /^[\d?]+ [×:] [\d?]+ = [\d?]+$/.test(ex.prompt) || /^[\d?]+ [×:] [\d?]+ = \?$/.test(ex.prompt);
      return (
        <Paper style={[{ gap: S.sm }, !active && styles.paperOld]} testID={active ? 'exercise-active' : undefined}>
          <Txt variant="small">
            {phaseName(msg.phase)}: {msg.index + 1}-masala, jami {msg.total}
          </Txt>
          <Txt variant={!active ? 'bodyBold' : isEquation ? 'numeral' : 'h2'} accessibilityRole="header" testID={active ? 'exercise-prompt' : undefined}>
            {ex.prompt}
          </Txt>
          {ex.visual && active && <VisualModel visual={ex.visual} />}
          {active && <SpeakButton text={ex.prompt} quiet />}
        </Paper>
      );
    }
    case 'summary':
      return (
        <Paper style={{ gap: S.sm }} testID="summary-card">
          <Txt variant="h2">{msg.mastery === 'mastered' ? '🌟 Mavzu o‘zlashtirildi' : msg.mastery === 'developing' ? '🌱 Yaxshi rivojlanyapti' : '🔁 Yana mashq qilamiz'}</Txt>
          <Txt>{msg.text}</Txt>
          <Txt variant="small">
            Yangi masalalar: {msg.transferCorrect}/{msg.transferTotal} to‘g‘ri.
          </Txt>
        </Paper>
      );
  }
}

const phaseName = (p: Phase) => STEPS.find((s) => s.phase === p)?.label ?? '';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.page },
  scroll: { alignItems: 'center', paddingBottom: 120 },
  inner: { width: '100%', maxWidth: MAX_W, paddingHorizontal: S.lg, paddingTop: S.md, gap: S.md },
  steps: { flexDirection: 'row', justifyContent: 'center', gap: 2, paddingVertical: S.sm, paddingHorizontal: S.sm, borderBottomWidth: 1, borderColor: C.line, backgroundColor: C.page },
  step: { alignItems: 'center', flex: 1, maxWidth: 110, gap: 2 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: C.line, alignItems: 'center', justifyContent: 'center', backgroundColor: C.white },
  dotDone: { backgroundColor: C.leaf, borderColor: C.leaf },
  dotNow: { backgroundColor: C.pen, borderColor: C.pen },
  dotTxt: { fontFamily: F.bodyHeavy, fontSize: 13, color: C.inkSoft },
  stepLabel: { fontSize: 11 },
  bubble: { flexDirection: 'row', gap: S.sm, alignItems: 'flex-start', backgroundColor: C.white, borderRadius: 14, borderTopLeftRadius: 4, padding: S.md, borderWidth: 1, borderColor: C.line, maxWidth: 600 },
  bubbleOk: { backgroundColor: C.leafSoft, borderColor: C.leaf },
  bubbleGentle: { backgroundColor: '#F4F7FC' },
  bubbleSafety: { backgroundColor: '#FFF6ED', borderColor: C.stamp },
  avatar: { fontSize: 22, lineHeight: 28 },
  hint: { backgroundColor: C.markerSoft, borderLeftWidth: 6, borderColor: C.marker, padding: S.md, borderRadius: 8, gap: 2 },
  paperOld: { paddingVertical: S.md },
  rule: { height: 1, backgroundColor: C.line, marginVertical: S.xs },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  choice: { flexGrow: 1, flexBasis: '22%' },
  inputRow: { flexDirection: 'row', gap: S.sm },
  input: { flex: 1, minHeight: 56, borderRadius: 14, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: S.md, fontFamily: F.body, fontSize: 18, color: C.ink },
});
