import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Cell as CellType } from "../game/models";
import { invertColor } from "../utils/helper";

interface CellProps {
  cell: CellType;
  row: number;
  col: number;
  onPressCell: (row: number, col: number) => void;
  unrevealedCellsColor?: string;
  revealedCellsColor?: string;
  bombCellColor?: string;
  flaggedCellColor?: string;
}

export default function Cell({ cell, row, col, onPressCell, unrevealedCellsColor, revealedCellsColor, bombCellColor, flaggedCellColor }: CellProps) {
  let display = "";
  if (cell.flagged) {
    display = "🚩";
  } else if (cell.revealed) {
    display = cell.mine
      ? "💣"
      : cell.adjacent > 0
      ? cell.adjacent.toString()
      : "";
  }

  let backgroundColor = cell.revealed
    ? revealedCellsColor || "#eee"
    : unrevealedCellsColor || "#ccc";

  if (cell.revealed && cell.mine && bombCellColor) {
    backgroundColor = bombCellColor;
  } else if (cell.flagged && flaggedCellColor) {
    backgroundColor = flaggedCellColor;
  }

  return (
    <TouchableOpacity
      style={[styles.cell, { backgroundColor }]}
      onPress={() => onPressCell(row, col)}
    >
      <Text style={[styles.text, { color: "blue" }]}>
        {display}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 30,
    height: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hidden: {
    backgroundColor: "#ccc",
  },
  revealed: {
    backgroundColor: "#eee",
  },
  text: {
    fontSize: 25,
    fontFamily: "RajdhaniBold",
  },
});
