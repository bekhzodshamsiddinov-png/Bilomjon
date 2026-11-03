/**
 * Funksiya bayroqlari. Yurist/metodist ko'rib chiqmagan har qanday funksiya standart holatda O'CHIQ.
 * Qiymatlar build vaqtida (EXPO_PUBLIC_*) yoki serverda (process.env) beriladi.
 */
export interface Flags {
  /** Tasdiqlanmagan qoralama darslarni "Sinov namunasi" yorlig'i bilan ko'rsatish. */
  demoContent: boolean;
  /** Ota-ona rozilik oqimi (yurist ko'rib chiqmaguncha o'chiq). */
  consentFlow: boolean;
  /** Mikrofon orqali kiritish (ota-ona ruxsati + ASR benchmark'idan keyin). */
  voiceInput: boolean;
  /** To'lovlar (pilot va unit-iqtisodiyotdan keyin). */
  payments: boolean;
}

const truthy = (v: string | undefined) => v === 'true' || v === '1';

export function readFlags(env: Record<string, string | undefined>): Flags {
  return {
    demoContent: truthy(env.EXPO_PUBLIC_DEMO_CONTENT ?? env.DEMO_CONTENT),
    consentFlow: truthy(env.EXPO_PUBLIC_FEATURE_CONSENT_FLOW),
    voiceInput: truthy(env.EXPO_PUBLIC_FEATURE_VOICE_INPUT),
    // To'lovlar 1-bosqichda kod darajasida bloklangan: bayroq yoqilsa ham false.
    payments: false,
  };
}
