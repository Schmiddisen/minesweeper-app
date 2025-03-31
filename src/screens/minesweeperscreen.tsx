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
import { generateBoard, revealEmptyCells, checkWin, countFlaggedNeighbors, revealNeighboringCells } from "../game/logic";
import { Cell } from "../game/models";
import { useFonts } from 'expo-font';
import { ActivityIndicator } from 'react-native';

// Define game modes
const GAME_MODES = {
  EASY: { rows: 8, cols: 8, mines: 10 },
  MEDIUM: { rows: 10, cols: 10, mines: 20 },
  EXPERT: { rows: 16, cols: 16, mines: 40 },
};

export default function MinesweeperScreen() {
  const [fontsLoaded] = useFonts({
    RajdhaniRegular: require('../assets/fonts/Rajdhani-Regular.ttf'),
  });

  // State to hold the game mode
  const [gameMode, setGameMode] = useState<'EASY' | 'MEDIUM' | 'EXPERT'>('EASY');
  
  // Initialize the board based on the current game mode
  const [board, setBoard] = useState(generateBoard(GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols, GAME_MODES[gameMode].mines));
  const [gameOver, setGameOver] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Function to change the game mode
  const changeGameMode = (mode: 'EASY' | 'MEDIUM' | 'EXPERT') => {
    setGameMode(mode);
    const { rows, cols, mines } = GAME_MODES[mode];
    setBoard(generateBoard(rows, cols, mines));
    setGameOver(false);
  };

  const handlePressCell = (row: number, col: number) => {
    if (gameOver) return;

    let newBoard = board.map((r) => r.map((cell) => ({ ...cell })));

    if (flagMode) {
      // Prevent flagging on revealed tiles
      if (!newBoard[row][col].revealed) {
        newBoard[row][col].flagged = !newBoard[row][col].flagged;
        setBoard(newBoard);
      }
      return;
    }

    // Prevent interacting with flagged cells (unless flagMode is enabled)
    if (board[row][col].flagged) return;

    if (board[row][col].revealed && board[row][col].adjacent > 0) {
      // Chain reveal logic
      const flaggedCount = countFlaggedNeighbors(board, row, col);
      if (flaggedCount === board[row][col].adjacent) {
        newBoard = revealNeighboringCells(board, row, col, GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols);
      }
      setBoard(newBoard);
      if (checkWin(newBoard, GAME_MODES[gameMode].mines)) {
        Alert.alert("Congratulations", "You won!");
        setGameOver(true);
      }
      return;
    }

    if (newBoard[row][col].mine) {
      newBoard = newBoard.map((r) =>
        r.map((cell) => ({ ...cell, revealed: true }))
      );
      setGameOver(true);
      Alert.alert("Game Over", "You hit a mine!");
    } else {
      newBoard = revealEmptyCells(newBoard, row, col, GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols);
    }

    setBoard(newBoard);
    if (checkWin(newBoard, GAME_MODES[gameMode].mines)) {
      Alert.alert("Congratulations", "You won!");
      setGameOver(true);
    }
  };

  const restartGame = () => {
    setBoard(generateBoard(GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols, GAME_MODES[gameMode].mines));
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
      <View style={styles.gameModeContainer}>
        <Button title="Easy" onPress={() => changeGameMode('EASY')} />
        <Button title="Medium" onPress={() => changeGameMode('MEDIUM')} />
        <Button title="Expert" onPress={() => changeGameMode('EXPERT')} />
      </View>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    fontFamily: "RajdhaniRegular",
  },
  gameModeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  boardContainer: {
    alignSelf: "center",
  },
});
