import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useAuthStore } from "@/stores/authStore";


export const unstable_settings = {
	initialRouteName: "(auth)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		...FontAwesome.font,
	});

	useEffect(() => {
		if (error) {
			console.error(error);
			throw error;
		}
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ErrorBoundary>
				<RootLayoutNav />
			</ErrorBoundary>
		</GestureHandlerRootView>
	);
}

function RootLayoutNav() {
	const segments = useSegments();
	const router = useRouter();
	const { user, isInitialized } = useAuthStore();

	useEffect(() => {
		if (!isInitialized) return;

		const inAuthGroup = segments[0] === "(auth)";

		if (!user && !inAuthGroup) {
			// Redirect to the login page if not logged in
			router.replace("/(auth)/login");
		} else if (user && inAuthGroup) {
			// Redirect to the main app if logged in
			router.replace("/(tabs)");
		}
	}, [user, segments, isInitialized]);

	return (
		<Stack>
			<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen
				name="property/[id]"
				options={{
					title: "Property Details",
					headerBackTitle: "Back",
					animation: "slide_from_right",
				}}
			/>
			<Stack.Screen
				name="add-property"
				options={{
					title: "Add Property",
					presentation: "modal",
					headerBackTitle: "Cancel",
				}}
			/>
			<Stack.Screen
				name="edit-property/[id]"
				options={{
					title: "Edit Property",
					presentation: "modal",
					headerBackTitle: "Cancel",
				}}
			/>
		</Stack>
	);
}
