import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Board from "../components/board";
import Button from "../components/button";
import { generateBoard, revealEmptyCells, checkWin } from "../game/logic";
import { Cell } from "../game/models";
import { useFonts } from 'expo-font';
import { ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from "expo-router";

// Define game modes
const GAME_MODES = {
  EASY: { rows: 9, cols: 9, mines: 10 },
  MEDIUM: { rows: 16, cols: 16, mines: 40 },
  EXPERT: { rows: 16, cols: 30, mines: 99 },
};

export default function MinesweeperScreen() {
  const [fontsLoaded] = useFonts({
    RajdhaniRegular: require("../assets/fonts/Rajdhani-Regular.ttf"),
  });

  // State to hold the game mode
  const [gameMode, setGameMode] = useState<'EASY' | 'MEDIUM' | 'EXPERT'>('EASY');
  
  // Track if it's the first click
  const [firstClick, setFirstClick] = useState(true);
  
  const [board, setBoard] = useState(generateBoard(GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols, GAME_MODES[gameMode].mines));
  const [gameOver, setGameOver] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  // To track initial translation before the pan gesture starts
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(scale.value) },
      { translateX: withSpring(translateX.value) },
      { translateY: withSpring(translateY.value) },
    ],
  }));

  // Function to change the game mode
  const changeGameMode = (mode: 'EASY' | 'MEDIUM' | 'EXPERT') => {
    setGameMode(mode);
    const { rows, cols, mines } = GAME_MODES[mode];
    setBoard(generateBoard(rows, cols, mines));
    setGameOver(false);
    setFirstClick(true); // Reset first click for the new game mode
    // Reset the board's position and size
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1; // Reset the scale to original size
  };

  const handlePressCell = (row: number, col: number) => {
    if (gameOver) return;

    let newBoard = board.map((r) => r.map((cell) => ({ ...cell })));

    // On first click, regenerate the board and ensure the clicked cell isn't a mine
    if (firstClick) {
      setFirstClick(false);
      // Generate the board after the first click and avoid placing a mine on the clicked tile
      newBoard = generateBoard(GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols, GAME_MODES[gameMode].mines, row, col);
      setBoard(newBoard);
    }

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
        Alert.alert("Game Over", "You hit a mine!");
      } else {
        newBoard = revealEmptyCells(newBoard, row, col, Number(rows), Number(cols));
      }
    }

    if (newBoard[row][col].mine) {
      newBoard = newBoard.map((r) =>
        r.map((cell) => ({ ...cell, revealed: true })))
      ;
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
    setFirstClick(true); // Reset first click
    // Reset the board's position and size
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1; // Reset the scale to original size
  };

  const pinchGesture = Gesture.Pinch().onUpdate((event) => {
    scale.value = event.scale;
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Track the starting position when pan starts
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Accumulate the translation values as the pan gesture updates
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    });

  const gestureHandler = Gesture.Race(pinchGesture, panGesture);

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
      <GestureDetector gesture={gestureHandler}>
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
  image: {
  width: "100%",
  },
});
