import { ITEMS, type ItemKey, type Visual } from '@bilim/core';
import { StyleSheet, Text, View } from 'react-native';
import { C, F, S } from '../theme';

/**
 * Aniq (konkret) model: teng guruhlar, qatorlar, tarqatish.
 * Pedagogik tamoyil: avval narsa, keyin raqam (konkret → tasviriy → mavhum).
 * "share" turida javob ATAYLAB ko'rsatilmaydi — faqat hammasi va bo'sh guruhlar.
 */
const MAX_ITEMS = 60;

function Item({ item, size = 22 }: { item: ItemKey; size?: number }) {
  return (
    <Text style={{ fontSize: size, lineHeight: size * 1.25 }} accessible={false}>
      {ITEMS[item]?.emoji ?? '●'}
    </Text>
  );
}

export function VisualModel({ visual, label }: { visual: Visual; label?: string }) {
  const desc = describe(visual);
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label ?? desc} style={styles.wrap} testID="visual-model">
      {render(visual)}
    </View>
  );
}

function describe(v: Visual): string {
  const n = ITEMS[v.item]?.name ?? 'buyum';
  switch (v.type) {
    case 'groups':
      return `${v.groups} ta guruh, har birida ${v.perGroup} tadan ${n}`;
    case 'array':
      return `${v.rows} qator, har qatorda ${v.cols} tadan ${n}`;
    case 'share':
      return `${v.total} ta ${n} va ${v.parts} ta bo‘sh guruh`;
    case 'times':
      return v.direction === 'more' ? `${v.base} ta ${n}, uni ${v.times} marta takrorlaymiz` : `${v.base} ta ${n}ni ${v.times} ta teng qismga bo‘lamiz`;
  }
}

function render(v: Visual) {
  switch (v.type) {
    case 'groups':
      return (
        <View style={styles.row}>
          {Array.from({ length: Math.min(v.groups, 10) }, (_, g) => (
            <View key={g} style={styles.group}>
              {Array.from({ length: Math.min(v.perGroup, 10) }, (_, i) => (
                <Item key={i} item={v.item} size={18} />
              ))}
            </View>
          ))}
        </View>
      );
    case 'array': {
      const rows = Math.min(v.rows, 10);
      const cols = Math.min(v.cols, 10);
      return (
        <View style={{ gap: 2 }}>
          {Array.from({ length: rows }, (_, r) => (
            <View key={r} style={{ flexDirection: 'row', gap: 2 }}>
              {Array.from({ length: cols }, (_, c) => (
                <Item key={c} item={v.item} size={rows > 6 || cols > 6 ? 15 : 20} />
              ))}
            </View>
          ))}
        </View>
      );
    }
    case 'share':
      return (
        <View style={{ gap: S.md }}>
          <View style={[styles.row, styles.pile]}>
            {Array.from({ length: Math.min(v.total, MAX_ITEMS) }, (_, i) => (
              <Item key={i} item={v.item} size={v.total > 30 ? 14 : 18} />
            ))}
          </View>
          <View style={styles.row}>
            {Array.from({ length: Math.min(v.parts, 10) }, (_, p) => (
              <View key={p} style={[styles.group, styles.emptyGroup]}>
                <Text style={styles.q}>?</Text>
              </View>
            ))}
          </View>
        </View>
      );
    case 'times':
      return v.direction === 'more' ? (
        <View style={{ gap: S.sm }}>
          <View style={styles.row}>
            {Array.from({ length: Math.min(v.base, 10) }, (_, i) => (
              <Item key={i} item={v.item} size={18} />
            ))}
          </View>
          <Text style={styles.times}>× {v.times} marta</Text>
        </View>
      ) : (
        <View style={{ gap: S.sm }}>
          <View style={[styles.row, styles.pile]}>
            {Array.from({ length: Math.min(v.base, MAX_ITEMS) }, (_, i) => (
              <Item key={i} item={v.item} size={v.base > 30 ? 14 : 18} />
            ))}
          </View>
          <Text style={styles.times}>{v.times} marta kam</Text>
        </View>
      );
  }
}

/** Dars faylidagi soddalashtirilgan vizual (a, b) → Visual. */
export function lessonVisual(x: { type: 'groups' | 'array' | 'share' | 'times'; a: number; b: number; item: string }): Visual {
  const item = (x.item in ITEMS ? x.item : 'olma') as ItemKey;
  switch (x.type) {
    case 'groups':
      return { type: 'groups', groups: x.a, perGroup: x.b, item };
    case 'array':
      return { type: 'array', rows: x.a, cols: x.b, item };
    case 'share':
      return { type: 'share', total: x.a, parts: x.b, item };
    case 'times':
      return { type: 'times', base: x.a, times: x.b, item, direction: x.a > x.b * 3 ? 'less' : 'more' };
  }
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: S.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, alignItems: 'center' },
  group: { flexDirection: 'row', flexWrap: 'wrap', maxWidth: 120, minWidth: 44, minHeight: 44, padding: 6, borderRadius: 22, borderWidth: 2, borderColor: C.pen, backgroundColor: 'rgba(47,91,234,0.06)', alignItems: 'center', justifyContent: 'center' },
  emptyGroup: { borderStyle: 'dashed', width: 52, height: 52 },
  pile: { gap: 2 },
  q: { fontFamily: F.display, fontSize: 22, color: C.pen },
  times: { fontFamily: F.display, fontSize: 22, color: C.pen },
});
