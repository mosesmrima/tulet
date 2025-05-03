import React, { ReactNode } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";

interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}: ButtonProps) {
  const getContainerStyle = () => {
    const variantStyle = {
      primary: styles.primaryContainer,
      outline: styles.outlineContainer,
      ghost: styles.ghostContainer,
    }[variant];

    const sizeStyle = {
      small: styles.smallContainer,
      medium: styles.mediumContainer,
      large: styles.largeContainer,
    }[size];

    return [
      styles.container,
      variantStyle,
      sizeStyle,
      disabled && styles.disabledContainer,
      style,
    ];
  };

  const getTextStyle = () => {
    const variantStyle = {
      primary: styles.primaryText,
      outline: styles.outlineText,
      ghost: styles.ghostText,
    }[variant];

    const sizeStyle = {
      small: styles.smallText,
      medium: styles.mediumText,
      large: styles.largeText,
    }[size];

    return [
      styles.text,
      variantStyle,
      sizeStyle,
      disabled && styles.disabledText,
      textStyle,
    ];
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#fff" : "#4a6fa5"}
          size="small"
        />
      ) : (
        <>
          {leftIcon}
          {typeof children === "string" ? (
            <Text style={getTextStyle()}>{children}</Text>
          ) : (
            children
          )}
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  primaryContainer: {
    backgroundColor: "#4a6fa5",
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4a6fa5",
  },
  ghostContainer: {
    backgroundColor: "transparent",
  },
  smallContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  disabledContainer: {
    backgroundColor: "#e0e6ed",
    borderColor: "#e0e6ed",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  primaryText: {
    color: "#fff",
  },
  outlineText: {
    color: "#4a6fa5",
  },
  ghostText: {
    color: "#4a6fa5",
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    color: "#95a5a6",
  },
});