# House Hunter App

A React Native app for property listings with Firebase backend integration.

## Features

- User authentication with Firebase Auth
- Property listings with Cloudinary image uploads
- Multiple images per property with image carousel
- Favorites system
- Location selection with maps integration
- Property search and filtering

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Firebase and Cloudinary:
   - Firebase configuration is in `firebaseConfig.ts`
   - Cloudinary configuration is in `add-property.tsx`

3. Run the app:

   ```bash
   npx expo start
   ```

## Technologies

- React Native with Expo
- Firebase Authentication
- Firestore for data storage
- Cloudinary for image uploads
- React Native Reanimated Carousel for image galleries

## Image Upload Configuration

The app uses Cloudinary for image uploads instead of Firebase Storage:

```typescript
// Cloudinary configuration (app/add-property.tsx)
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/di7j2lvnu/upload";
const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // Set to your unsigned upload preset
```

Ensure you have set up an unsigned upload preset in your Cloudinary dashboard named "ml_default" or update this value accordingly.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

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
# tulet
