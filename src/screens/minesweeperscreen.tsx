import React, { useState, useEffect} from "react";
import { View, Text, StyleSheet, Alert, Modal, TextInput, TouchableOpacity } from "react-native";
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
  const changeGameMode = (mode: "EASY" | "MEDIUM" | "EXPERT" | "CUSTOM") => {
    if (mode === "CUSTOM") {
      setModalVisible(true); // Öffne das Modal für benutzerdefinierten Modus
    } else {
      applyGameModeChanges(mode)
    }
  };


  //Custom Modal handler
  const [modalVisible, setModalVisible] = useState(false);
  const [customRows, setCustomRows] = useState("10");
  const [customCols, setCustomCols] = useState("10");
  const [customMines, setCustomMines] = useState("10");
  
  const handleCustomGameStart = () => {
    const rows = parseInt(customRows);
    const cols = parseInt(customCols);
    const mines = parseInt(customMines);

    const amountFields = rows * cols;
  
    if (isNaN(rows) || isNaN(cols) || isNaN(mines) || rows <= 0 || cols <= 0 || mines <= 0) {
      alert("Bitte gültige Werte eingeben!");
      return;
    }
    if (mines >= amountFields) {
      alert("Es gibt mehr oder genau so viele Minen und Felder!");
      return;
    }
    GAME_MODES['CUSTOM'].cols = cols;
    GAME_MODES['CUSTOM'].rows = rows;
    GAME_MODES['CUSTOM'].mines = mines;

    applyGameModeChanges('CUSTOM')
    setModalVisible(false); // Modal schließen
  };

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
              <Ionicons name="time-outline" size={20} color={color} />
              <Text style={[styles.infoValue, { color: color }]}>
                {seconds} Sekunden
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
        {/* Custom Game Modal */}
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={[styles.title, { color: color }]}>Custom Game</Text>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: color }]}>Rows:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Zeilen"
                  value={customRows}
                  onChangeText={setCustomRows}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: color }]}>Cols:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Spalten"
                  value={customCols}
                  onChangeText={setCustomCols}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: color }]}>
                  Mines:
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Minen"
                  value={customMines}
                  onChangeText={setCustomMines}
                />
              </View>
              <View style={styles.buttonRow}>
                <Button
                  title="Abbrechen"
                  color="red"
                  onPress={() => setModalVisible(false)}
                />
                <Button
                  title="Starten"
                  color={color}
                  onPress={handleCustomGameStart}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.flagModeWrapper}>
          <TouchableOpacity
            onPress={() => setFlagMode(!flagMode)}
            style={[styles.flagButton, flagMode && styles.flagButtonActive]}
          >
            <Ionicons name="flag" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
    padding: 10,
    backgroundColor: "#242930",
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
    zIndex: 2,
  },
  modeButtonWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 8,
    zIndex: 2,
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
    zIndex: 2,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  flagModeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  flagButton: {
    backgroundColor: "#444",
    padding: 8,
    borderRadius: 8,
  },
  flagButtonActive: {
    backgroundColor: "#FF6666",
  },
  flagModeText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "RajdhaniBold",
  },
  image: {
    width: "100%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  modalContent: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5,
  },
});
