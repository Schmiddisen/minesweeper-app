import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Board from "../components/board";
import Button from "../components/button";
import { generateBoard, revealEmptyCells, checkWin } from "../game/logic";
import { Cell } from "../game/models";
import { useFonts } from 'expo-font';
import { ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from "expo-router";

export default function MinesweeperScreen() {
  const { rows, cols, mines } = useLocalSearchParams();
  const [fontsLoaded] = useFonts({
    RajdhaniRegular: require("../assets/fonts/Rajdhani-Regular.ttf"),
  });

  // Alle Hooks werden unconditionally aufgerufen.
  const [board, setBoard] = useState(generateBoard(Number(rows), Number(cols), Number(mines)));
  const [gameOver, setGameOver] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressCell = (row: number, col: number) => {
    if (
      gameOver ||
      board[row][col].revealed ||
      (board[row][col].flagged && !flagMode)
    )
      return;
    let newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
    if (flagMode) {
      newBoard[row][col].flagged = !newBoard[row][col].flagged;
    } else {
      if (newBoard[row][col].mine) {
        newBoard = newBoard.map((r) =>
          r.map((cell) => ({ ...cell, revealed: true }))
        );
        setGameOver(true);
        Alert.alert("Game Over", "You hit a mine!");
      } else {
        newBoard = revealEmptyCells(newBoard, row, col, Number(rows), Number(cols));
      }
    }
    setBoard(newBoard);
    if (checkWin(newBoard, Number(mines))) {
      Alert.alert("Congratulations", "You won!");
      setGameOver(true);
    }
  };

  const restartGame = () => {
    setBoard(generateBoard(Number(rows), Number(cols), Number(mines)));
    setGameOver(false);
  };

  const pinchGesture = Gesture.Pinch().onUpdate((event) => {
    scale.value = event.scale;
  });

  const content = !fontsLoaded ? (
    <ActivityIndicator size="large" color="#0000ff" />
  ) : (
    <GestureHandlerRootView style={styles.container}>
      <Image
                source={require("../assets/images/logo.png")}
                style={styles.image}
                resizeMode="contain"
              />
      <View style={styles.buttonContainer}>
        <Button
          title={flagMode ? "Select Mode" : "Flag Mode"}
          onPress={() => setFlagMode(!flagMode)}
        />
        <Button title="Restart Game" onPress={restartGame} />
      </View>
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.boardContainer, animatedStyle]}>
          <Board board={board} onPressCell={handlePressCell} />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  boardContainer: {
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    alignSelf: "center",
  },
  image: {
  width: "100%",
  },
});
