import React from "react";
import { View, StyleSheet } from "react-native";
import AnimatedCell from "./animatedCell";
import { Cell as CellType } from "../game/models";

interface BoardProps {
  board: CellType[][];
  onPressCell: (row: number, col: number) => void;
  cellcolor?: string;
}

export default function Board({ board, onPressCell, cellcolor }: BoardProps) {
  // Calculate delay based on distance from the center for chain reactions
  const getDelay = (row: number, col: number) => {
    const centerRow = Math.floor(board.length / 2);
    const centerCol = Math.floor(board[0].length / 2);
    const distance = Math.sqrt(
      Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
    );
    return Math.min(distance * 50, 500); // Max delay of 500ms
  };

  return (
    <View style={styles.board}>
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <AnimatedCell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              row={rowIndex}
              col={colIndex}
              onPressCell={onPressCell}
              unrevealedCellsColor={cellcolor}
              revealedCellsColor="lightgray"
              bombCellColor="#FF6666"
              delay={getDelay(rowIndex, colIndex)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderWidth: 2,
    borderColor: "lightgray",
    padding: 5,
  },
  row: {
    flexDirection: "row",
  },
});
