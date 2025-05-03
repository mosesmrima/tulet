import React, { ReactNode } from "react";
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

export function Input({
  label,
  error,
  containerStyle,
  leftElement,
  rightElement,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error && styles.inputContainerError
      ]}>
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
        
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#95a5a6"
          {...props}
        />
        
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dfe6e9",
    borderRadius: 8,
    backgroundColor: "#f5f8fa",
    paddingHorizontal: 12,
  },
  inputContainerError: {
    borderColor: "#e74c3c",
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#2c3e50",
  },
  leftElement: {
    marginRight: 8,
  },
  rightElement: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#e74c3c",
    marginTop: 4,
  },
});