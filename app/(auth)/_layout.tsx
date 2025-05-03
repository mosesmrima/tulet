import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#f7f9fc", "#e6edf5"]}
        style={styles.background}
      />
      <Stack
        screenOptions={{
          headerTransparent: true,
          headerTitle: "",
          headerShadowVisible: false,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});