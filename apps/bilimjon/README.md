# Bilimjon ilovasi (web + iOS + Android)

Expo (React Native) + Expo Router — bitta kod bazasidan web sayt, iOS va Android ilova.

```bash
pnpm --filter bilimjon web        # brauzerda
pnpm --filter bilimjon start      # Expo Go / dev build (telefon)
pnpm --filter bilimjon build:web  # statik web → dist/
pnpm --filter bilimjon e2e        # Playwright + axe (avval build:web)
npx eas-cli build -p android --profile preview   # Android APK (EAS hisobi kerak)
npx eas-cli build -p ios --profile preview       # iOS (Apple Developer hisobi kerak)
```

Ekranlar: `src/app/` — bosh sahifa (sinf → fan → chorak → mavzu), `lesson/[id]` (Bilimjon darsi),
`ask` (Bilimjondan so‘ra), `parent` (ota-ona paneli, darvoza ortida), `parent/guide/[id]`, `about`.
Eski v0.1 demo: `public/demo/v0.1.html` → `/demo/v0.1.html`.
