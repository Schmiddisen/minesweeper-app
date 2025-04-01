import React, { useState, useEffect} from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Board from "../components/board";
import Button from "../components/button";
import { generateBoard, revealEmptyCells, checkWin, countFlaggedNeighbors, revealNeighboringCells } from "../game/logic";
import { Cell } from "../game/models";
import { useFonts } from 'expo-font';
import { ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Define game modes
const GAME_MODES = {
  EASY: { rows: 9, cols: 9, mines: 10 },
  MEDIUM: { rows: 16, cols: 16, mines: 40 },
  EXPERT: { rows: 16, cols: 30, mines: 99 },
};

export default function MinesweeperScreen() {
  const router = useRouter();
  const { color } = useLocalSearchParams<{ color?: string }>();
  const [fontsLoaded] = useFonts({
    RajdhaniRegular: require("../assets/fonts/Rajdhani-Regular.ttf"),
    RajdhaniBold: require("../assets/fonts/Rajdhani-Bold.ttf"),
    RajdhaniMedium: require("../assets/fonts/Rajdhani-Medium.ttf"),
    RajdhaniLight: require("../assets/fonts/Rajdhani-Light.ttf"),
    RajdhaniSemiBold: require("../assets/fonts/Rajdhani-SemiBold.ttf")
  });

  // State to hold the game mode
  const [gameMode, setGameMode] = useState<'EASY' | 'MEDIUM' | 'EXPERT'>('EASY');

  //Timer stuff
  const [seconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval:any;    
    if (isRunning && !gameOver) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);
  
  const handleTimerReset = () => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

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
    handleTimerReset();
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
    setIsTimerRunning(true);

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
        setIsTimerRunning(false);
        Alert.alert("Game Over", "You hit a mine!");
      } else {
        newBoard = revealEmptyCells(newBoard, row, col, GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols);
      }
    }

    if (newBoard[row][col].mine) {
      newBoard = newBoard.map((r) =>
        r.map((cell) => ({ ...cell, revealed: true })))
      ;
      setGameOver(true);
      setIsTimerRunning(false);
      Alert.alert("Game Over", "You hit a mine!");
    } else {
      newBoard = revealEmptyCells(newBoard, row, col, GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols);
    }

    setBoard(newBoard);
    if (checkWin(newBoard, GAME_MODES[gameMode].mines)) {
      Alert.alert("Congratulations", "You won!");
      setGameOver(true);
      setIsTimerRunning(false);
    }
  };

  const restartGame = () => {
    setBoard(generateBoard(GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols, GAME_MODES[gameMode].mines));
    handleTimerReset();
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
    <ActivityIndicator size="large" color={color} />
  ) : (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container_header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={32} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.title, { color: color }]}>Minesweeper</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: color }]}>⏳ Zeit:</Text>
              <Text style={[styles.infoValue, { color: color }]}>{seconds} Sekunden</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: color }]}>💣 Bomben:</Text>
              <Text style={[styles.infoValue, { color: color }]}>{GAME_MODES[gameMode].mines}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.gameModeContainer}>
        <Button
          title="Easy"
          onPress={() => changeGameMode("EASY")}
          color={color}
        />
        <Button
          title="Medium"
          onPress={() => changeGameMode("MEDIUM")}
          color={color}
        />
        <Button
          title="Expert"
          onPress={() => changeGameMode("EXPERT")}
          color={color}
        />
        <Button
          title="OWn"
          onPress={() => changeGameMode("EXPERT")}
          color={color}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={flagMode ? "Select Mode" : "Flag Mode"}
          onPress={() => setFlagMode(!flagMode)}
          color={color}
        />
        <Button title="Restart Game" onPress={restartGame} color={color} />
      </View>
      <GestureDetector gesture={gestureHandler}>
        <Animated.View style={[styles.boardContainer, animatedStyle]}>
          <Board
            board={board}
            onPressCell={handlePressCell}
            cellcolor={color}
          />
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
    backgroundColor: "#242930",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    fontFamily: "RajdhaniBold",
    alignSelf: "center",
    marginLeft: -22,
  },
  infoContainer: {
    width: "75%",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  infoValue: {
    fontSize: 18,
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
  container_header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
  },
});
