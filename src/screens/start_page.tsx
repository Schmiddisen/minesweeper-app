import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Button from "../components/button";
import BombIcon from "../components/startpage_mine";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StartScreen() {
  const [fontsLoaded] = useFonts({
    RajdhaniRegular: require("../assets/fonts/Rajdhani-Regular.ttf"),
    RajdhaniBold: require("../assets/fonts/Rajdhani-Bold.ttf"),
    RajdhaniMedium: require("../assets/fonts/Rajdhani-Medium.ttf"),
    RajdhaniLight: require("../assets/fonts/Rajdhani-Light.ttf"),
    RajdhaniSemiBold: require("../assets/fonts/Rajdhani-SemiBold.ttf")
  });
  const router = useRouter();
  const [color, setColor] = useState("#FFCC00");


  const startGame = (color: string) => {
    router.push(`/game?color=${encodeURIComponent(color)}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.colorPicker}>
            {[
              "#FFCC00",
              "#4A90E2",
              "#F95F62",
              "#7ED321",
              "#B07CFF",
              "#FF9F1C",
            ].map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorDot,
                  { backgroundColor: c, borderWidth: c === color ? 2 : 0 },
                ]}
              />
            ))}
          </View>
          <BombIcon size={200} color={color} />
          <Text style={styles.title}>Minesweeper</Text>
        </View>
        <View style={styles.bottom}>
          <Button
            title="Start Game"
            onPress={() => startGame(color)}
            style={styles.button}
            color={color}
            fontSize={35}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#242930",
  },
  container: {
    flex: 1,
    backgroundColor: "#242930",
    padding: 20,
    justifyContent: "space-between",
  },
  content: {
    alignItems: "center",
  },
  bottom: {
    width: "100%",
    paddingBottom: 10,
  },
  colorPicker: {
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 30,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderColor: "lightgray",
    borderWidth: 2,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    color: "white",
    marginBottom: 40,
    fontFamily: "RajdhaniBold",
  },
  button: {
    width: "100%",
    height: 60,
    marginTop: 20,
    alignSelf: "flex-end",
  }
});
