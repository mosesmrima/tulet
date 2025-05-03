import React, { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

interface PropertyFeatureProps {
  icon: ReactNode;
  value: string | number;
  label: string;
}

export function PropertyFeature({ icon, value, label }: PropertyFeatureProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  label: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 2,
  },
});