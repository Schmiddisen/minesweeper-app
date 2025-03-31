import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Cell as CellType } from "../game/models";

interface CellProps {
  cell: CellType;
  row: number;
  col: number;
  onPressCell: (row: number, col: number) => void;
}

export default function Cell({ cell, row, col, onPressCell }: CellProps) {
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

  return (
    <TouchableOpacity
      style={[styles.cell, cell.revealed ? styles.revealed : styles.hidden]}
      onPress={() => onPressCell(row, col)}
    >
      <Text style={styles.text}>{display}</Text>
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
    fontSize: 16,
  },
});
