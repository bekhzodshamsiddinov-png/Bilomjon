import { catalog } from '@bilim/content';
import { readFlags } from '@bilim/core';

/**
 * 1-bosqich: ilova oflayn ishlaydi — katalog va dvigatel qurilma ichida (internet shart emas).
 * Server (apps/api) xuddi shu @bilim/core dan foydalanadi; real hisoblar paydo bo'lganda
 * tekshirish serverga o'tkaziladi (docs/adr/0003-offline-first-shared-core.md).
 */
export const flags = readFlags({
  EXPO_PUBLIC_DEMO_CONTENT: process.env.EXPO_PUBLIC_DEMO_CONTENT ?? 'true',
  EXPO_PUBLIC_FEATURE_CONSENT_FLOW: process.env.EXPO_PUBLIC_FEATURE_CONSENT_FLOW,
  EXPO_PUBLIC_FEATURE_VOICE_INPUT: process.env.EXPO_PUBLIC_FEATURE_VOICE_INPUT,
});

export const visibility = { demoContent: flags.demoContent };
export { catalog };
