# RehabX — Caregiver App

iOS & Android app for families delivering a child's rehabilitation program at home. It is part of the RehabX **investor prototype**; the project overview, architecture, API reference and investor demo script are in the **backend** repository's README and `docs/DEMO_SCRIPT.md`.

> Prototype with fictional demo data. Not for clinical use.

## Screens

- **Home**: child card with overall progress, today's exercises, next milestone, KPI summary and current program
- **Plan**: program, goals with progress, exercise schedule, milestones and assessment summary
- **Exercises**: today's program with status; each exercise opens **instructions, safety guidance and a 3D demonstration**
- **AI / 3D session**: the 3D coach demonstrates while a *simulated* AI coach counts reps and holds, times the session, gives form cues and can show pose keypoints. Camera tracking is labelled "coming soon".
- **Completion**: saved to the backend and shows today's count, overall progress before → after, and the KPI improvement
- **Progress**: overall breakdown, KPI cards with trends, weekly sessions against the plan, goals
- **Milestones**, **Profile** (child profile, care team), **Assessment summary**, **Rehabilitation journey** (timeline)

## Stack

Expo SDK 57 · React Native 0.86 · TypeScript (strict) · React Navigation 7 (bottom tabs + native stack) · **TanStack Query** (server state) · **Redux Toolkit** (session + live exercise session) · react-native-svg charts · react-three-fiber on expo-gl (3D) · expo-secure-store (token) · Plus Jakarta Sans.

```
mobile/
├── App.tsx                  providers: Redux, TanStack Query, safe area, navigation, fonts
└── src/
    ├── api/                 TanStack Query hooks, current-child hook
    ├── store/               authSlice (secure-store persisted), sessionSlice (AI coach state)
    ├── navigation/          root stack + tabs, typed params
    ├── screens/             one file per screen
    ├── components/          UI kit: text, buttons, cards, badges, progress, charts, states
    ├── exercise3d/          procedural avatar + motion keyframes (shared with the web portal)
    ├── lib/                 API client, config, formatting, types
    └── theme/               design tokens (matches the clinician portal)
```

## Run

Start the backend first (see the backend README), then:

```bash
npm install
npx expo start               # press i (iOS simulator), a (Android emulator), or scan with Expo Go
npx expo start --web         # quick browser preview at http://localhost:8081
```

**Demo login:** "Continue as demo caregiver", or `caregiver@rehabx.demo` / `demo`.

### Reaching the API

By default the app calls port **3000 on the machine running `expo start`**. It is auto-detected, so simulators and physical phones on the same Wi-Fi work without configuration. To override it (e.g. a deployed API), copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`.

## Scripts

| Command | Does |
|---|---|
| `npm start` / `ios` / `android` / `web` | Expo dev server |
| `npm run lint` | `expo lint` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run doctor` | `expo-doctor` dependency & config checks |

Add native libraries with `npx expo install <pkg>` so versions match the SDK.
