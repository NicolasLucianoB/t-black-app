# Studio T Black App

Mobile app for the Studio T Black barbershop, built with React Native (Expo) and TypeScript, following clean code, scalability, and maintainability best practices.

## Main Features (Implemented ✅ / Planned 🔄)

- ✅ Splash/Pre-load
- ✅ Login/Sign Up (Supabase Auth)
- ✅ Home with calendar and available times for each barber (5 employees)
- ✅ Booking system
- ✅ Courses page (YouTube private video embed)
- ✅ Mini e-commerce for hair products (pick up at the studio)
- ✅ Real-time Community Chat (Supabase Realtime)
- 🔄 Option to pay online or in person (in progress)
- 🔄 Push notifications (planned)

## Stack

- React Native (Expo)
- TypeScript
- React Navigation
- Supabase (Auth and database)
- Expo Push Notifications
- Cloudflare Images
- YouTube embed

## Folder Structure (Suggested)

```
src/
  components/   # Reusable components
  navigation/   # Navigation logic
  screens/      # App screens
  services/     # API, Supabase, etc.
  hooks/        # Custom hooks
  contexts/     # Global contexts
  utils/        # Utility functions
  theme/        # Global styles and themes
```

## Best Practices

- Clean code
- Componentization
- Separation of concerns
- Use of hooks and contexts
- Strong typing with TypeScript

---

## How to Run and Test the App

1. **Install Expo CLI globally (if you haven't yet):**
   ```sh
   npm install -g expo-cli
   ```
2. **Navigate to the project folder:**
   ```sh
   cd studio-t-black-app
   ```
3. **Install dependencies:**
   ```sh
   npm install
   ```
4. **Start the Expo development server:**
   ```sh
   npm start
   ```
   or
   ```sh
   expo start
   ```
5. **Testing on your phone:**
   - Download the "Expo Go" app from the Play Store (Android) or App Store (iOS).
   - Scan the QR Code shown in your browser (Expo Dev Tools) with the Expo Go app.
   - The app will open instantly on your device!
6. **Testing in your browser:**
   - In the Expo Dev Tools, click on "Run in web browser" or press "w" in the terminal.

---

Developed by Nícolas for Studio T Black ✂️
