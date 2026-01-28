# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Expo Go note

For local testing with Expo Go, Google authentication is temporarily commented out in `app/login.tsx` and `app/register.tsx`. Re-enable those lines for production or when using a development build.

## Architecture overview

### `app/` (routes and UI)
- File-based routing with `expo-router` in `app/_layout.tsx`.
- Entry route in `app/index.tsx` redirects to `app/login.tsx`.
- Auth screens live in `app/login.tsx` and `app/register.tsx`.
- Tab navigation is defined in `app/tabs/_layout.tsx` with `app/tabs/home.tsx` as the main screen.
- UI components for auth live in `app/components/auth/` (e.g. Google auth button component).

### `src/` (data + shared utilities)
- `src/data/` contains API clients (`httpClient.ts`), auth flows (`authService.ts`), user fetches (`userService.ts`), and token storage (`tokenStorage.ts`).
- `src/data/model/` defines TypeScript models for auth, user, and pet data.
- `src/data/config.ts` holds API base URL resolution and request timeout config.
- `src/Theme/` includes shared colors for consistent styling.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

SH1 Android
2C:62:2C:4F:86:98:56:90:0F:06:2D:E8:26:F6:5A:F4:28:C1:D8:6A
