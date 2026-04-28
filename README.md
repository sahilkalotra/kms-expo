╔══════════════════════════════════════════════╗
║              📱 mini-lms-expo               ║
╚══════════════════════════════════════════════╝

A small LMS-style mobile app built with Expo (SDK 54) + Expo Router.

Includes:
• Auth flow
• Paginated courses list
• Course detail + WebView content
• Bookmarks / enrollment
• Light / dark theme
• Basic offline caching

──────────────────────────────────────────────

🚀 GETTING STARTED

▸ Prerequisites
• Node.js (20.19.4+ recommended)
• npm
• Expo Go (optional) or dev client

▸ Install
npm install

▸ Run
npm run start

Then:
→ iOS      : npm run ios
→ Android  : npm run android
→ Web      : npm run web

──────────────────────────────────────────────

🏗 BUILDS (EAS)

Use EAS for builds (dev/preview/prod):

npx eas build --profile development --platform ios
npx eas build --profile development --platform android

Check: eas.json for profiles

──────────────────────────────────────────────

⚙️ CONFIGURATION

API base URL:
src/core/config/appConfig.ts

Default:
https://api.freeapi.app/

Override via Expo config:
extra.API_BASE_URL

Optional:
• API_TIMEOUT_MS (default: 15000)
• API_LOGS (default: true)

──────────────────────────────────────────────

📁 PROJECT STRUCTURE

src/
├── features/     → business logic (auth, courses)
├── core/         → api, config, storage
├── ui/           → reusable components

app/
├── (auth)/       → login/register
├── (app)/        → main app

──────────────────────────────────────────────

🧠 HOW THINGS WORK

▸ API Layer
Returns consistent responses:

```
{ ok: true, data }
{ ok: false, error }
```

Forces proper error handling.

▸ Auth
• Managed via AuthProvider
• Token → SecureStore
• User → AsyncStorage
• Route gating at layout level

▸ Courses Data
Uses FreeAPI:
• products → courses
• users → instructors

(Data is random — not a real LMS backend)

──────────────────────────────────────────────

📡 OFFLINE SUPPORT

Basic caching:

• Course list → cached per (page + limit)
• Course detail → cached per courseId

If API fails:
→ falls back to cached data

⚠️ First load must be online.

──────────────────────────────────────────────

🔄 NAVIGATION BEHAVIOR

List → Detail:

1. Show data instantly (from params)
2. Fetch fresh data in background
3. If fetch fails → keep old data

No blank/loading-heavy screens.

──────────────────────────────────────────────

📍 USEFUL PATHS

Routing      → app/
Auth         → src/features/auth/
Courses      → src/features/courses/
API          → src/core/api/
Config       → src/core/config/appConfig.ts
Storage      → src/core/storage/

──────────────────────────────────────────────

💡 NOTE

This is intentionally a lightweight LMS-style app.
Focus is on structure, flow, and resilience—not backend accuracy.
