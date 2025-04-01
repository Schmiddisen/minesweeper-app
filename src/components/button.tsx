import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
  fontSize?: number;
}

export default function Button({
  title,
  onPress,
  style,
  textStyle,
  color,
  fontSize,
}: ButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle, { color: color || "#fff", fontSize }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    alignSelf: "center",
    fontFamily: "RajdhaniBold",
    justifyContent: "center",
  },
});
