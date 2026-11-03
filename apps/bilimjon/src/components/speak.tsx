import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Btn, Txt } from './ui';
import { S } from '../theme';

/**
 * Ovozli o'qish — faqat qurilmada haqiqiy o'zbekcha ovoz bo'lsa.
 * v0.1 demo muammosi: o'zbek ovozi bo'lmasa brauzer jim ravishda boshqa tildagi ovoz bilan o'qirdi.
 * Endi: o'zbek ovozi topilmasa — tugma o'rniga aniq izoh. Kelajakda: diktor yozgan audio (ADR-0006).
 */
let cached: Promise<string | null> | null = null;
function findUzVoice(): Promise<string | null> {
  cached ??= Speech.getAvailableVoicesAsync()
    .then((vs) => vs.find((v) => v.language?.toLowerCase().startsWith('uz'))?.identifier ?? null)
    .catch(() => null);
  return cached;
}

export function SpeakButton({ text, quiet }: { text: string; /** O'zbek ovozi yo'q bo'lsa hech narsa ko'rsatmaslik (izoh bir marta ko'rsatiladi). */ quiet?: boolean }) {
  const [voice, setVoice] = useState<string | null | undefined>(undefined);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    let alive = true;
    findUzVoice().then((v) => alive && setVoice(v));
    return () => {
      alive = false;
      Speech.stop();
    };
  }, []);

  if (voice === undefined) return null;
  if (voice === null && quiet) return null;
  if (voice === null)
    return (
      <View style={styles.note}>
        <Txt variant="small">🔇 Bu qurilmada o‘zbekcha ovoz yo‘q, shuning uchun ovozli o‘qish o‘chirilgan. Kattalardan o‘qib berishni so‘ra.</Txt>
      </View>
    );
  return (
    <Btn
      kind="quiet"
      label={speaking ? '⏹ To‘xtatish' : '🔊 Eshitish'}
      onPress={() => {
        if (speaking) {
          Speech.stop();
          setSpeaking(false);
          return;
        }
        setSpeaking(true);
        Speech.speak(text.replace(/×/g, ' karra ').replace(/ : /g, ' bo‘linsin '), {
          language: 'uz-UZ',
          voice,
          rate: 0.9,
          onDone: () => setSpeaking(false),
          onStopped: () => setSpeaking(false),
          onError: () => setSpeaking(false),
        });
      }}
    />
  );
}

const styles = StyleSheet.create({ note: { paddingVertical: S.xs } });
