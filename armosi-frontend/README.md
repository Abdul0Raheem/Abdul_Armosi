This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Firebase Google Authentication

The app uses the same Firebase Authentication backend on web and native builds.

- Web: Firebase JS SDK Google sign-in with popup, falling back to redirect when popups are blocked.
- Android/iOS Capacitor: native Google Sign-In via `@capacitor-firebase/authentication`, then Firebase JS SDK sign-in with `GoogleAuthProvider.credential(idToken, accessToken)`.
- Firestore user documents are still stored in `users/{uid}` and existing `admin` roles are preserved during profile sync.

The reusable auth implementation lives in `src/lib/AuthService.ts`. Existing imports from `src/lib/auth.ts` are kept as wrappers so the current login/logout flow and UI continue to work.

## Capacitor Setup

Install dependencies:

```bash
npm install
```

Create/sync native projects after the web build is ready:

```bash
npx cap add android
npx cap sync android
```

After Android is generated, enable the Google native dependency in `android/variables.gradle`:

```gradle
ext {
    rgcfaIncludeGoogle = true
}
```

For iOS, also run:

```bash
npx cap add ios
npx cap sync ios
```

`capacitor.config.ts` is configured with:

- `appId`: `com.armosi.app`
- `appName`: `Armosi`
- `FirebaseAuthentication.skipNativeAuth`: `true`
- `FirebaseAuthentication.providers`: `["google.com"]`

Keep `skipNativeAuth: true`. The native layer collects the Google token, while the Firebase JS SDK owns the app auth state used by Firestore, roles, admin guards, and existing user records.

This repository is still a server-capable Next.js app with API routes. For a production Capacitor release, either point Capacitor at the deployed HTTPS app with `server.url`, or convert the storefront to a static export and move API routes to hosted endpoints before copying files into `webDir`.

## Firebase Console Setup

In Firebase Console:

1. Open Authentication > Sign-in method and enable Google.
2. Open Project settings > General and confirm the Web app contains the same values used in `.env.local`.
3. Add an Android app with package name `com.armosi.app`.
4. Add the debug and release SHA-1 fingerprints for the Android app.
5. Download the generated `google-services.json`.
6. Place `google-services.json` at `android/app/google-services.json` after running `npx cap add android`.
7. Re-download `google-services.json` every time you add or change SHA fingerprints.

For web sign-in, add each deployed domain under Authentication > Settings > Authorized domains. Keep `localhost` for local development.

## Android SHA-1

Debug SHA-1:

```bash
cd android
./gradlew signingReport
```

Use the `SHA1` value from the debug variant in Firebase Console.

Release SHA-1:

```bash
keytool -list -v -keystore path/to/your-release-key.jks -alias your-key-alias
```

Add the release SHA-1 before uploading a Play Store build. If Play App Signing is enabled, also add the Play Console app signing certificate SHA-1 from Play Console > Setup > App integrity.

## Play Store Release Checklist

- Use the final Android package name before creating the Firebase Android app.
- Add debug, upload, and Play app signing SHA-1 fingerprints in Firebase.
- Commit the native Android project, but do not commit private keystores.
- Keep `android/app/google-services.json` present for release builds.
- Keep `rgcfaIncludeGoogle = true` in `android/variables.gradle`.
- Verify Google sign-in on a physical Android device after `npx cap sync android`.
- Build the signed Android App Bundle from Android Studio or Gradle for Play Store upload.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
