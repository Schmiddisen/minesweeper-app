import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Alert, Button, Animated } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { GestureHandlerRootView, PinchGestureHandler, PanGestureHandler } from 'react-native-gesture-handler';



const generateBoard = (rows, cols, mines) => {
  let board = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill({ mine: false, revealed: false, flagged: false, adjacent: 0 }));

  let minesPlaced = 0;
  while (minesPlaced < mines) {
    let row = Math.floor(Math.random() * rows);
    let col = Math.floor(Math.random() * cols);
    if (!board[row][col].mine) {
      board[row][col] = { ...board[row][col], mine: true };
      minesPlaced++;
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].mine) {
        let count = 0;
        for (let dr of [-1, 0, 1]) {
          for (let dc of [-1, 0, 1]) {
            let nr = r + dr;
            let nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) {
              count++;
            }
          }
        }
        board[r][c] = { ...board[r][c], adjacent: count };
      }
    }
  }
  return board;
};

const checkWin = (board, mines) => {
  let flaggedMines = 0;
  let correctlyFlagged = 0;
  for (let row of board) {
    for (let cell of row) {
      if (cell.flagged) flaggedMines++;
      if (cell.flagged && cell.mine) correctlyFlagged++;
    }
  }
  return flaggedMines === mines && correctlyFlagged === mines;
};

const revealEmptyCells = (board, row, col, rows, cols) => {
  let newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const stack = [[row, col]];
  while (stack.length > 0) {
    const [r, c] = stack.pop();
    if (newBoard[r][c].revealed || newBoard[r][c].flagged) continue;
    newBoard[r][c].revealed = true;
    if (newBoard[r][c].adjacent === 0) {
      for (let dr of [-1, 0, 1]) {
        for (let dc of [-1, 0, 1]) {
          let nr = r + dr;
          let nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !newBoard[nr][nc].revealed) {
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return newBoard;
};

export default function MainTab() {
  const route = useRoute();
  const { rows = 8, cols = 8, mines = 10 } = route.params || {};

  const [board, setBoard] = useState(generateBoard(rows, cols, mines));
  const [gameOver, setGameOver] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const scale = useState(new Animated.Value(1))[0]; // Für das Zoomen

  const handlePress = (row, col) => {
    if (gameOver || board[row][col].revealed || (board[row][col].flagged && !flagMode)) return;

    let newBoard = board.map(row => row.map(cell => ({ ...cell })));
    if (flagMode) {
      newBoard[row][col] = { ...newBoard[row][col], flagged: !newBoard[row][col].flagged };
    } else {
      if (newBoard[row][col].mine) {
        setGameOver(true);
        newBoard = newBoard.map(row => row.map(cell => ({ ...cell, revealed: true })));
        Alert.alert('Game Over', 'You hit a mine!');
      } else {
        newBoard = revealEmptyCells(newBoard, row, col, rows, cols);
      }
    }
    setBoard(newBoard);

    if (checkWin(newBoard, mines)) {
      setGameWon(true);
      Alert.alert('Congratulations!', 'You flagged all the mines correctly!');
    }
  };

  const restartGame = () => {
    setBoard(generateBoard(rows, cols, mines));
    setGameOver(false);
    setGameWon(false);
  };

  // Zoom-Handler
  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale } }],
    { useNativeDriver: true }
  );


  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Minesweeper</Text>
      <View style={styles.buttonContainer}>
        <Button title={flagMode ? "Switch to Select Mode" : "Switch to Flag Mode"} onPress={() => setFlagMode(!flagMode)} />
        <Button title="Restart Game" onPress={restartGame} />
      </View>

      <PinchGestureHandler onGestureEvent={onPinchEvent}>
        <Animated.View style={{ transform: [{ scale }] }}>
          {board.map((row, rIdx) => (
            <View key={rIdx} style={styles.row}>
              {row.map((cell, cIdx) => (
                <TouchableOpacity
                  key={cIdx}
                  style={[styles.cell, cell.revealed ? styles.revealed : styles.hidden]}
                  onPress={() => handlePress(rIdx, cIdx)}
                >
                  <Text>{cell.flagged ? '🚩' : cell.revealed ? (cell.mine ? '💣' : cell.adjacent || '') : ''}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </Animated.View>
      </PinchGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 30,
    height: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hidden: {
    backgroundColor: '#ccc',
  },
  revealed: {
    backgroundColor: '#eee',
  },
});