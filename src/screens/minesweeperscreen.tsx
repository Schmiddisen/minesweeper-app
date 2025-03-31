import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
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

export default function MinesweeperScreen({ rows = 8, cols = 8, mines = 10 }: { rows?: number, cols?: number, mines?: number }) {
  const [fontsLoaded] = useFonts({
    RajdhaniRegular: require('../assets/fonts/Rajdhani-Regular.ttf'),
  });

  // Alle Hooks werden unconditionally aufgerufen.
  const [board, setBoard] = useState(generateBoard(rows, cols, mines));
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
        newBoard = revealEmptyCells(newBoard, row, col, rows, cols);
      }
    }
    setBoard(newBoard);
    if (checkWin(newBoard, mines)) {
      Alert.alert("Congratulations", "You won!");
      setGameOver(true);
    }
  };

  const restartGame = () => {
    setBoard(generateBoard(rows, cols, mines));
    setGameOver(false);
  };

  const pinchGesture = Gesture.Pinch().onUpdate((event) => {
    scale.value = event.scale;
  });

  const content = !fontsLoaded ? (
    <ActivityIndicator size="large" color="#0000ff" />
  ) : (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Minesweeper</Text>
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
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    fontFamily: "RajdhaniRegular",
  },
  buttonContainer: {
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
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
});
