# BottleUp User App — Clean Rebuild

This project is a ground-up rebuild of the BottleUp `user-app` using an updated React Native and Node environment. It addresses architecture issues from the legacy app and implements all critical user-side and admin flows.

Author: Quon Lee
Start Date: July 6, 2025

## Prerequisites

- **Node.js** (v18 or newer)
- **Expo CLI** for running the React Native app
  ```bash
  npm install -g expo-cli
  ```
- **Supabase CLI** (optional) if you want to run the database locally
  ```bash
  npm install -g supabase
  ```

## Environment variables

Create a `.env.local` file in the project root with your Supabase credentials:

```bash
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
```

These values are referenced in `globals.ts` when the Supabase client is created.

## Running the app

Install dependencies and start the Expo development server:

```bash
npm install
npx expo start
```

You can then run the app on different platforms:

- **iOS simulator**
  ```bash
  npm run ios
  ```
- **Android emulator**
  ```bash
  npm run android
  ```
- **Web**
  ```bash
  npm run web
  ```

## Supabase setup

If you want to work with a local Supabase instance, run:

```bash
supabase start
```

This uses the configuration in `supabase/config.toml` and will apply any SQL
from `supabase/seed.sql` on first run.

