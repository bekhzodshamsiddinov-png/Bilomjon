import { findVisibleLesson } from '@bilim/core';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ParentGate } from '../../../components/parent-gate';
import { Card, Paper, Screen, Txt } from '../../../components/ui';
import { lessonVisual, VisualModel } from '../../../components/visual';
import { catalog, visibility } from '../../../data';
import { useApp } from '../../../state';
import { C, S } from '../../../theme';

/** “Avval menga tushuntir” + “Bolamga o‘rgat” — bola darsi bilan bir xil maqsadga bog'langan. */
export default function ParentGuide() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { parentUnlocked } = useApp();
  const found = findVisibleLesson(catalog, String(id), visibility);
  if (!parentUnlocked) return <Screen>{<ParentGate />}</Screen>;
  if (!found)
    return (
      <Screen>
        <Card>
          <Txt variant="h2">Qo‘llanma topilmadi</Txt>
        </Card>
      </Screen>
    );
  const { lesson } = found;
  const g = lesson.parent_guide;
  return (
    <Screen>
      <Stack.Screen options={{ title: lesson.title }} />
      <Txt variant="h1" accessibilityRole="header">{lesson.title}</Txt>
      <Txt variant="small">
        {lesson.grade}-sinf, {lesson.term}-chorak. Maqsad: {lesson.objective}
      </Txt>

      <Card style={{ gap: S.sm }} >
        <Txt variant="h2">Avval o‘zingiz tushunib oling</Txt>
        {g.teach_me.map((t, i) => (
          <Txt key={i}>{t}</Txt>
        ))}
        <VisualModel visual={lessonVisual(lesson.explanation.visual)} />
      </Card>

      <Paper style={{ gap: S.md }} testID="teach-child">
        <Txt variant="h2">Farzandingiz bilan 10 daqiqa</Txt>
        {g.teach_child.map((s, i) => (
          <View key={i} style={styles.step}>
            <Txt variant="bodyBold" style={styles.min}>
              {s.minutes} daq.
            </Txt>
            <Txt style={{ flex: 1 }}>{s.action}</Txt>
          </View>
        ))}
        <Txt variant="bodyBold">Kerak bo‘ladi:</Txt>
        <Txt>{g.materials.join('; ')}</Txt>
      </Paper>

      <Card style={{ gap: S.sm }}>
        <Txt variant="h3">E’tibor bering</Txt>
        {g.watch_for.map((w, i) => (
          <Txt key={i}>• {w}</Txt>
        ))}
        {lesson.misconceptions.map((m) => (
          <View key={m.code} style={styles.mis}>
            <Txt variant="bodyBold">{m.description}</Txt>
            <Txt variant="small">Nima qilish kerak: {m.remedy}</Txt>
          </View>
        ))}
      </Card>
      <Txt variant="small">Bu qo‘llanma AI metodist tomonidan tayyorlangan qoralama; o‘qituvchi hali tasdiqlamagan.</Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: S.md },
  min: { width: 72, color: C.pen },
  mis: { borderLeftWidth: 4, borderColor: C.marker, paddingLeft: S.md, gap: 2 },
});
