import { childCatalog } from '@bilim/core';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Btn, Card, NavLink, Paper, Screen, Txt } from '../components/ui';
import { catalog, visibility } from '../data';
import { useApp } from '../state';
import { C, F, S } from '../theme';

const KIND_LABEL: Record<string, string> = { review: 'takrorlash', assessment: 'yakuniy', practice: 'mashq', game: 'o‘yin', lesson: '' };

export default function Home() {
  const { grade, setGrade } = useApp();
  const subjects = useMemo(() => childCatalog(catalog, grade, visibility), [grade]);
  const [subject, setSubject] = useState('matematika');
  const current = subjects.find((s) => s.code === subject);
  const firstWithLessons = current?.terms.find((t) => t.entries.some((e) => e.lessonId))?.term ?? 1;
  const [termChoice, setTerm] = useState<number | null>(null);
  const term = termChoice ?? firstWithLessons;
  const entries = current?.terms.find((t) => t.term === term)?.entries ?? [];
  const ready = entries.filter((e) => e.lessonId).length;

  return (
    <Screen>
      <Paper>
        <View style={styles.heroRow}>
          <Txt style={styles.robot} accessibilityRole="text">🤖</Txt>
          <View style={{ flex: 1 }}>
            <Txt variant="h1" accessibilityRole="header">Salom! Men Bilimjonman.</Txt>
            <Txt>Qaysi sinfda o‘qiysan?</Txt>
          </View>
        </View>
        <View style={styles.grades} accessibilityRole="radiogroup" accessibilityLabel="Sinfni tanlang">
          {([1, 2, 3, 4] as const).map((g) => (
            <Pressable
              key={g}
              testID={`grade-${g}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: g === grade }}
              aria-checked={g === grade}
              accessibilityLabel={`${g}-sinf`}
              onPress={() => {
                setGrade(g);
                setTerm(null);
              }}
              style={({ focused }: { pressed: boolean; focused?: boolean }) => [styles.grade, g === grade && styles.gradeOn, focused && styles.focus]}
            >
              <Txt style={[styles.gradeNum, g === grade && { color: C.white }]}>{g}</Txt>
              <Txt variant="small" style={g === grade ? { color: C.white } : undefined}>sinf</Txt>
            </Pressable>
          ))}
        </View>
      </Paper>

      <View style={{ gap: S.sm }}>
        <Txt variant="h2" accessibilityRole="header">Fanlar</Txt>
        <View style={styles.subjects}>
          {subjects.map((s) => {
            const on = s.code === subject;
            const planned = s.contentState === 'planned';
            return (
              <Pressable
                key={s.code}
                testID={`subject-${s.code}`}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={planned ? `${s.title} — tez orada` : s.title}
                onPress={() => {
                  setSubject(s.code);
                  setTerm(null);
                }}
                style={({ focused }: { pressed: boolean; focused?: boolean }) => [planned ? styles.chip : styles.subject, on && styles.subjectOn, focused && styles.focus]}
              >
                <Txt style={{ fontSize: planned ? 18 : 30 }}>{s.emoji}</Txt>
                <Txt variant={planned ? 'small' : 'h3'} style={planned ? { color: C.ink } : undefined}>{s.title}</Txt>
              </Pressable>
            );
          })}
        </View>
        <Txt variant="small">Hozircha faqat matematika tayyor. Boshqa fanlar o‘qituvchilar tekshiruvidan keyin qo‘shiladi.</Txt>
      </View>

      {current?.contentState === 'planned' ? (
        <Card>
          <Txt variant="h3">{current.title} darslari hali tayyor emas</Txt>
          <Txt>Biz bu fanni o‘qituvchilar bilan tekshirib, keyin qo‘shamiz. Hozircha matematikani sinab ko‘r.</Txt>
          <Btn kind="quiet" label="Matematikaga o‘tish" onPress={() => setSubject('matematika')} style={{ marginTop: S.md, alignSelf: 'flex-start' }} />
        </Card>
      ) : (
        <View style={{ gap: S.md }}>
          <View style={styles.terms} accessibilityRole="tablist">
            {[1, 2, 3, 4].map((t) => (
              <Pressable
                key={t}
                testID={`term-${t}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: t === term }}
                aria-selected={t === term}
                onPress={() => setTerm(t)}
                style={({ focused }: { pressed: boolean; focused?: boolean }) => [styles.term, t === term && styles.termOn, focused && styles.focus]}
              >
                <Txt variant="bodyBold" style={t === term ? { color: C.white } : undefined}>{t}-chorak</Txt>
              </Pressable>
            ))}
          </View>
          <Txt variant="small">
            {grade}-sinf, {term}-chorak: {entries.length} ta mavzu{ready ? `, ${ready} tasida dars tayyor` : ', darslar hali yozilmagan'}. Mavzular darslik mundarijasi bo‘yicha.
          </Txt>
          <View style={{ gap: S.sm }} testID="topic-list">
            {entries.map(({ entry, lessonId }) =>
              lessonId ? (
                <Pressable
                  key={entry.id}
                  testID={`lesson-${lessonId}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Darsni boshlash: ${entry.title}`}
                  onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: lessonId } })}
                  style={({ focused }: { pressed: boolean; focused?: boolean }) => [styles.topic, styles.topicReady, focused && styles.focus]}
                >
                  <Txt style={styles.topicNo}>{entry.textbook_no ?? '•'}</Txt>
                  <View style={{ flex: 1 }}>
                    <Txt variant="bodyBold">{entry.title}</Txt>
                    <Txt variant="small">Darsni boshlash</Txt>
                  </View>
                  <Txt style={styles.go}>▶</Txt>
                </Pressable>
              ) : (
                <View key={entry.id} style={styles.topic} accessible accessibilityLabel={`${entry.title}, dars hali tayyor emas`}>
                  <Txt style={[styles.topicNo, { color: C.inkSoft }]}>{entry.textbook_no ?? '•'}</Txt>
                  <View style={{ flex: 1 }}>
                    <Txt style={{ color: C.inkSoft }}>{entry.title}</Txt>
                    {KIND_LABEL[entry.kind] ? <Txt variant="small">{KIND_LABEL[entry.kind]}</Txt> : null}
                  </View>
                </View>
              ),
            )}
            {entries.length === 0 && (
              <Card>
                <Txt>Bu chorak uchun ko‘rsatiladigan mavzu yo‘q.</Txt>
              </Card>
            )}
          </View>
        </View>
      )}

      <Card style={{ gap: S.md }}>
        <Txt variant="h3">Savoling bormi?</Txt>
        <Btn label="Bilimjondan so‘rash" onPress={() => router.push('/ask')} testID="open-ask" />
      </Card>

      <View style={styles.footer}>
        <NavLink href="/parent" label="Ota-ona bo‘limi" testID="open-parent" />
        <NavLink href="/about" label="Loyiha haqida va maxfiylik" />
        <NavLink href="/demo/v0.1.html" label="Eski demo (v0.1)" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, marginBottom: S.lg },
  robot: { fontSize: 54, lineHeight: 64 },
  grades: { flexDirection: 'row', gap: S.md },
  grade: { flex: 1, aspectRatio: 1, maxWidth: 110, borderRadius: 14, borderWidth: 2, borderColor: C.ink, borderBottomWidth: 5, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  gradeOn: { backgroundColor: C.pen, borderColor: C.penDark },
  gradeNum: { fontFamily: F.display, fontSize: 40, lineHeight: 46, color: C.ink },
  focus: { borderColor: C.marker, borderWidth: 3 },
  subjects: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  subject: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: S.md, minHeight: 64, paddingHorizontal: S.lg, borderRadius: 12, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.line },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: S.md, borderRadius: 22, backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  subjectOn: { borderColor: C.pen, borderWidth: 2.5, backgroundColor: '#F1F5FF' },
  terms: { flexDirection: 'row', gap: S.sm, flexWrap: 'wrap' },
  term: { minHeight: 48, paddingHorizontal: S.lg, borderRadius: 24, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.white, justifyContent: 'center' },
  termOn: { backgroundColor: C.ink, borderColor: C.ink },
  topic: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.sm, paddingHorizontal: S.md, borderBottomWidth: 1, borderColor: C.line, minHeight: 52 },
  topicReady: { backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.pen, minHeight: 64 },
  topicNo: { fontFamily: F.display, fontSize: 18, color: C.pen, minWidth: 40 },
  go: { fontSize: 18, color: C.pen },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md, justifyContent: 'center' },
});
