import { buildParentReport, generateDemoFamily, type Mastery } from '@bilim/core';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ParentGate } from '../../components/parent-gate';
import { Btn, Card, Screen, Txt } from '../../components/ui';
import { catalog, flags } from '../../data';
import { useApp } from '../../state';
import { C, F, S } from '../../theme';

const MASTERY: Record<Mastery, { label: string; color: string; bg: string }> = {
  mastered: { label: 'O‘zlashtirgan', color: C.leaf, bg: C.leafSoft },
  developing: { label: 'Rivojlanmoqda', color: C.penDark, bg: '#E3EAFF' },
  needs_practice: { label: 'Mashq kerak', color: '#8A6100', bg: C.markerSoft },
};

const PLANNED_CONTROLS = [
  ['Ota-ona hisobi va rozilik', 'Faqat kattalar ro‘yxatdan o‘tadi; bola profili rozilikdan keyin.'],
  ['Bola profillari', 'Ism o‘rniga taxallus; tug‘ilgan sana, maktab, rasm so‘ralmaydi.'],
  ['Kunlik vaqt chegarasi', 'Ota-ona belgilaydi; reklama va “seriya” bosimi yo‘q.'],
  ['Mikrofon ruxsati', 'Alohida yoqiladi; audio saqlanmaydi.'],
  ['Ma’lumotni yuklab olish va o‘chirish', 'Bir tugma bilan, istalgan vaqtda.'],
] as const;

export default function Parent() {
  const { parentUnlocked, lockParent } = useApp();
  const family = useMemo(() => generateDemoFamily(catalog), []);
  const [childId, setChildId] = useState(family[0]?.id);
  const child = family.find((c) => c.id === childId) ?? family[0];
  const report = useMemo(() => (child ? buildParentReport(child, catalog) : null), [child]);

  if (!parentUnlocked) return <Screen>{<ParentGate />}</Screen>;
  if (!flags.demoContent || !child || !report)
    return (
      <Screen>
        <Card>
          <Txt variant="h2">Hisobotlar hali yo‘q</Txt>
          <Txt>Ota-ona hisobi va rozilik jarayoni yurist ko‘rib chiqqandan keyin ishga tushadi.</Txt>
        </Card>
      </Screen>
    );

  return (
    <Screen>
      <View style={styles.headRow}>
        <Txt variant="h1" accessibilityRole="header" style={{ flex: 1 }}>
          Farzandingiz qanday o‘qiyapti
        </Txt>
        <Btn kind="quiet" label="Chiqish" onPress={lockParent} />
      </View>
      <View style={styles.stamp} testID="parent-demo-note">
        <Txt variant="bodyBold" style={{ color: C.stamp }}>NAMUNA MA’LUMOT</Txt>
        <Txt variant="small">{report.dataNote}</Txt>
      </View>

      <View style={styles.tabs} accessibilityRole="tablist">
        {family.map((c) => (
          <Pressable key={c.id} accessibilityRole="tab" accessibilityState={{ selected: c.id === child.id }} aria-selected={c.id === child.id} onPress={() => setChildId(c.id)} style={[styles.tab, c.id === child.id && styles.tabOn]} testID={`child-${c.id}`}>
            <Txt style={{ fontSize: 22 }}>{c.avatar}</Txt>
            <Txt variant="bodyBold" style={c.id === child.id ? { color: C.white } : undefined}>
              {c.alias}, {c.grade}-sinf
            </Txt>
          </Pressable>
        ))}
      </View>

      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Txt style={styles.statNum}>{report.totals.sessions}</Txt>
          <Txt variant="small">o‘tilgan dars</Txt>
        </Card>
        <Card style={styles.stat}>
          <Txt style={styles.statNum}>{report.totals.minutesLast7Days}</Txt>
          <Txt variant="small">daqiqa, oxirgi 7 kunda</Txt>
        </Card>
        <Card style={styles.stat}>
          <Txt style={styles.statNum}>{report.lessons.filter((l) => l.mastery === 'mastered').length}</Txt>
          <Txt variant="small">mavzu o‘zlashtirilgan</Txt>
        </Card>
      </View>

      {report.recommendation && (
        <Card style={{ gap: S.sm, borderColor: C.pen, borderWidth: 2 }}>
          <Txt variant="h3">Bugungi 10 daqiqa: {report.recommendation.title}</Txt>
          <Txt>{report.recommendation.why}</Txt>
          {report.recommendation.plan.map((p, i) => (
            <View key={i} style={styles.planRow}>
              <Txt variant="bodyBold" style={styles.planMin}>
                {p.minutes} daq.
              </Txt>
              <Txt style={{ flex: 1 }}>{p.action}</Txt>
            </View>
          ))}
          <Btn kind="quiet" label="Avval o‘zim tushunib olay" onPress={() => router.push({ pathname: '/parent/guide/[id]', params: { id: report.recommendation!.lessonId } })} style={{ alignSelf: 'flex-start' }} />
        </Card>
      )}

      <View style={{ gap: S.sm }}>
        <Txt variant="h2">Mavzular</Txt>
        {report.lessons.map((l) => {
          const m = MASTERY[l.mastery];
          return (
            <Pressable key={l.lessonId} accessibilityRole="button" onPress={() => router.push({ pathname: '/parent/guide/[id]', params: { id: l.lessonId } })} style={styles.lessonRow}>
              <View style={{ flex: 1 }}>
                <Txt variant="bodyBold">{l.title}</Txt>
                <Txt variant="small">{l.confidence === 'low' ? 'Bitta dars asosida — xulosa taxminiy' : 'Bir necha dars asosida'}</Txt>
              </View>
              <View style={[styles.pill, { backgroundColor: m.bg }]}>
                <Txt variant="small" style={{ color: m.color, fontFamily: F.bodyBold }}>{m.label}</Txt>
              </View>
            </Pressable>
          );
        })}
      </View>

      {report.misconceptions.length > 0 && (
        <Card style={{ gap: S.sm }}>
          <Txt variant="h3">Nimaga e’tibor berish kerak</Txt>
          {report.misconceptions.map((m) => (
            <Txt key={m.code}>• {m.advice}</Txt>
          ))}
        </Card>
      )}

      <Card style={{ gap: S.sm }}>
        <Txt variant="h3">Keyingi bosqichda qo‘shiladigan ota-ona nazorati</Txt>
        <Txt variant="small">Bular yurist va xavfsizlik tekshiruvidan keyin yoqiladi. Hozir hech qanday shaxsiy ma’lumot yig‘ilmaydi.</Txt>
        {PLANNED_CONTROLS.map(([t, d]) => (
          <View key={t} style={styles.planned}>
            <Txt variant="bodyBold">{t}</Txt>
            <Txt variant="small">{d}</Txt>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  stamp: { borderWidth: 2, borderColor: C.stamp, borderStyle: 'dashed', borderRadius: 10, padding: S.md, gap: 2, backgroundColor: '#FFF9F4' },
  tabs: { flexDirection: 'row', gap: S.sm, flexWrap: 'wrap' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingHorizontal: S.md, minHeight: 52, borderRadius: 26, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.white },
  tabOn: { backgroundColor: C.ink, borderColor: C.ink },
  stats: { flexDirection: 'row', gap: S.sm },
  stat: { flex: 1, alignItems: 'flex-start' },
  statNum: { fontFamily: F.display, fontSize: 34, lineHeight: 40, color: C.ink },
  planRow: { flexDirection: 'row', gap: S.md },
  planMin: { width: 72, color: C.pen },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: C.white, padding: S.md, borderRadius: 12, borderWidth: 1, borderColor: C.line, minHeight: 64 },
  pill: { paddingHorizontal: S.md, paddingVertical: 4, borderRadius: 20 },
  planned: { borderLeftWidth: 3, borderColor: C.line, paddingLeft: S.md },
});
