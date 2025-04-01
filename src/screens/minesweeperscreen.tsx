import React, { useState, useEffect} from "react";
import { View, Text, StyleSheet, Alert, Modal, TextInput, TouchableOpacity, ScrollView } from "react-native";
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
import BombIcon from "../components/startpage_mine";
import HelpModal from "../components/helpModal";

// Define game modes
let GAME_MODES = {
  EASY: { rows: 9, cols: 9, mines: 10 },
  MEDIUM: { rows: 16, cols: 16, mines: 40 },
  EXPERT: { rows: 16, cols: 30, mines: 99 },
  CUSTOM: {rows: 0, cols: 0, mines: 0}
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
  const [gameMode, setGameMode] = useState<'EASY' | 'MEDIUM' | 'EXPERT' | 'CUSTOM'>('EASY');

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
  
  // Function to count flagged cells
  const getFlaggedCount = () => {
    return board.reduce((count, row) => {
      return count + row.filter(cell => cell.flagged).length;
    }, 0);
  };
  
  // Animation values for board movement and zoom
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  // Remember where we started dragging
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Don't let players zoom too far in or out
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;

  // Add zoom step for buttons
  const ZOOM_STEP = 0.2;

  // Add zoom center point
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: focalX.value },
        { translateY: focalY.value },
        { scale: withSpring(scale.value) },
        { translateX: -focalX.value },
        { translateY: -focalY.value },
        { translateX: withSpring(translateX.value) },
        { translateY: withSpring(translateY.value) },
      ],
    };
  });

  // Function to change the game mode
  const changeGameMode = (mode: "EASY" | "MEDIUM" | "EXPERT" | "CUSTOM") => {
    if (mode === "CUSTOM") {
      setModalVisible(true); // Open the modal for the custom mode
    } else {
      applyGameModeChanges(mode)
    }
  };

  // Custom Modal handler
  const [modalVisible, setModalVisible] = useState(false);
  const [customRows, setCustomRows] = useState("10");
  const [customCols, setCustomCols] = useState("10");
  const [customMines, setCustomMines] = useState("10");
  
  // Handle starting a custom game with user settings
  const handleCustomGameStart = () => {
    const rows = parseInt(customRows);
    const cols = parseInt(customCols);
    const mines = parseInt(customMines);

    const amountFields = rows * cols;
  
    if (isNaN(rows) || isNaN(cols) || isNaN(mines) || rows <= 0 || cols <= 0 || mines <= 0) {
      alert("Please enter valid values!");
      return;
    }
    if (mines >= amountFields) {
      alert("There are more or exactly as many mines and fields!");
      return;
    }
    GAME_MODES['CUSTOM'].cols = cols;
    GAME_MODES['CUSTOM'].rows = rows;
    GAME_MODES['CUSTOM'].mines = mines;

    applyGameModeChanges('CUSTOM')
    setModalVisible(false); // Close the modal
  };

  // Apply changes when switching game modes
  const applyGameModeChanges = (mode: "EASY" | "MEDIUM" | "EXPERT" | "CUSTOM") => {
    setGameMode(mode);
    handleTimerReset();
    const { rows, cols, mines } = GAME_MODES[mode];
    setBoard(generateBoard(rows, cols, mines));
    setGameOver(false);
    setFirstClick(true);
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
  }

  const handlePressCell = (row: number, col: number) => {
    if (gameOver) return;

    let newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
    setIsTimerRunning(true);

    // Make sure the first click is always safe
    if (firstClick) {
      setFirstClick(false);
      // Generate the board after the first click and avoid placing a mine on the clicked tile
      newBoard = generateBoard(GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols, GAME_MODES[gameMode].mines, row, col);
      setBoard(newBoard);
    }

    // Handle flag placement
    if (flagMode) {
      if (!newBoard[row][col].revealed) {
        newBoard[row][col].flagged = !newBoard[row][col].flagged;
        setBoard(newBoard);
      }
      return;
    }

    // Don't reveal flagged cells
    if (board[row][col].flagged) return;

    if (board[row][col].revealed && board[row][col].adjacent > 0) {
      // Chain reveal logic
      const flaggedCount = countFlaggedNeighbors(board, row, col);
      if (flaggedCount === board[row][col].adjacent) {
        newBoard = revealNeighboringCells(board, row, col, GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols);
      }
      setBoard(newBoard);
      if (checkWin(newBoard, GAME_MODES[gameMode].mines)) {
        setGameOver(true);
        setIsTimerRunning(false);
        setGameOverMessage("Congratulations! You won!");
        setGameOverModalVisible(true);
      } else {
        newBoard = revealEmptyCells(newBoard, row, col, GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols);
      }
    }

    // Handle hitting a mine
    if (newBoard[row][col].mine) {
      newBoard = newBoard.map((r) =>
        r.map((cell) => ({ ...cell, revealed: true })))
      ;
      setGameOver(true);
      setIsTimerRunning(false);
      setGameOverMessage("You hit a mine!");
      setGameOverModalVisible(true);
    } else {
      newBoard = revealEmptyCells(newBoard, row, col, GAME_MODES[gameMode].rows, GAME_MODES[gameMode].cols);
    }

    setBoard(newBoard);
    if (checkWin(newBoard, GAME_MODES[gameMode].mines)) {
      setGameOver(true);
      setIsTimerRunning(false);
      setGameOverMessage("Congratulations! You won!");
      setGameOverModalVisible(true);
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

  // Handle zooming in
  const zoomIn = () => {
    scale.value = Math.min(scale.value + ZOOM_STEP, MAX_SCALE);
  };

  // Handle zooming out
  const zoomOut = () => {
    scale.value = Math.max(scale.value - ZOOM_STEP, MIN_SCALE);
  };

  // Set up gesture handling for zooming and panning
  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      scale.value = Math.min(Math.max(event.scale, MIN_SCALE), MAX_SCALE);
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    });

  const gestureHandler = Gesture.Simultaneous(pinchGesture, panGesture);

  // Add new state for game over modal
  const [gameOverModalVisible, setGameOverModalVisible] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");

  const [helpModalVisible, setHelpModalVisible] = useState(false);

  const content = !fontsLoaded ? (
    <ActivityIndicator size="large" color={color} />
  ) : (
    <View style={styles.rootContainer}>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.container_header}>
          <View style={styles.headerLeftButtons}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setHelpModalVisible(true)}>
              <Ionicons name="help-circle-outline" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.title, { color: color }]}>Minesweeper</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={color} />
                <Text style={[styles.infoValue, { color: color }]}>
                  {seconds} Seconds
                </Text>
              </View>
              <View style={styles.infoRow}>
                <BombIcon size={25} color={color} />
                <Text style={[styles.infoValue, { color: color }]}>
                  {getFlaggedCount()}/{GAME_MODES[gameMode].mines}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={restartGame}>
            <Ionicons name="refresh" size={28} color="#fff" />
          </TouchableOpacity>
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
            title="Custom"
            onPress={() => changeGameMode("CUSTOM")}
            color={color}
          />
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
        <View style={styles.bottomControls}>
          <View style={styles.controlsContainer}>
            <View style={styles.flagModeWrapper}>
              <TouchableOpacity
                onPress={() => setFlagMode(!flagMode)}
                style={[styles.flagButton, flagMode && styles.flagButtonActive]}
              >
                <Ionicons name="flag" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.zoomButtons}>
              <TouchableOpacity
                onPress={zoomOut}
                style={styles.zoomButton}
              >
                <Ionicons name="remove" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={zoomIn}
                style={styles.zoomButton}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
      {helpModalVisible && (
        <HelpModal
          visible={helpModalVisible}
          onClose={() => setHelpModalVisible(false)}
          color={color || "#FFCC00"}
        />
      )}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.title, { color: color }]}>Custom Game</Text>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: color }]}>Rows:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Rows"
                value={customRows}
                onChangeText={setCustomRows}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: color }]}>Cols:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Columns"
                value={customCols}
                onChangeText={setCustomCols}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: color }]}>Mines:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Mines"
                value={customMines}
                onChangeText={setCustomMines}
              />
            </View>
            <View style={styles.buttonRow}>
              <Button
                title="Cancel"
                color="red"
                onPress={() => setModalVisible(false)}
              />
              <Button
                title="Start"
                color={color}
                onPress={handleCustomGameStart}
              />
            </View>
          </View>
        </View>
      )}
      {gameOverModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.title, { color: color }]}>Game Over</Text>
            <Text style={[styles.modalText, { color: color }]}>{gameOverMessage}</Text>
            <View style={styles.buttonRow}>
              <Button
                title="OK"
                color={color}
                onPress={() => setGameOverModalVisible(false)}
              />
              <Button
                title="Retry"
                color={color}
                onPress={() => {
                  setGameOverModalVisible(false);
                  restartGame();
                }}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );

  return content;
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#242930",
  },
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
    fontFamily: "RajdhaniBold",
    alignSelf: "center",
  },
  infoContainer: {
    width: "75%",
    backgroundColor: "#333",
    padding: 5,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  infoValue: {
    fontSize: 18,
  },
  gameModeContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 8,
    zIndex: 3,
  },
  boardContainer: {
    alignSelf: "center",
    zIndex: 1,
  },
  container_header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 8,
    zIndex: 3,
  },
  headerLeftButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  flagModeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  flagButton: {
    backgroundColor: "#444",
    padding: 12,
    borderRadius: 8,
  },
  flagButtonActive: {
    backgroundColor: "#FF6666",
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 300,
    alignItems: "center",
  },
  modalText: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: "RajdhaniMedium",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5,
  },
  zoomButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  zoomButton: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 8,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'transparent',
    zIndex: 3,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 2,
    borderRadius: 5,
    textAlign: "center",
    fontFamily: "RajdhaniBold",
    color: "white",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 2,
    textAlign: "left",
  },
});
