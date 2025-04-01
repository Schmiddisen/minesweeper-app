import React from "react";
import { View, StyleSheet } from "react-native";
import Cell from "./cell";
import { Cell as CellType } from "../game/models";

interface BoardProps {
  board: CellType[][];
  onPressCell: (row: number, col: number) => void;
  cellcolor?: string;
}

export default function Board({ board, onPressCell, cellcolor }: BoardProps) {
  return (
    <View style={styles.board}>
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <Cell
              key={colIndex}
              cell={cell}
              row={rowIndex}
              col={colIndex}
              onPressCell={onPressCell}
              unrevealedCellsColor={cellcolor}
              revealedCellsColor="#999"
              bombCellColor="#E53935"
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
    borderColor: "#000",
    padding: 5,
  },
  row: {
    flexDirection: "row",
  },
});
