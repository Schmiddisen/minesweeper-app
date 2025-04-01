import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Cell as CellType } from "../game/models";
import { invertColor } from "../utils/helper";
import BombIcon from "./startpage_mine";

function getNumberColor(count: number): string {
  switch (count) {
    case 1: return "#0000FF"; // Blau
    case 2: return "#008200"; // Grün
    case 3: return "#Fe0000"; // Rot
    case 4: return "#000084"; // Dunkelblau
    case 5: return "#840000"; // Dunkelrot
    case 6: return "#008284"; // Türkis
    case 7: return "#000000"; // Schwarz
    case 8: return "#808080"; // Grau
    default: return "blue";
  }
}

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
  let display: string | JSX.Element = "";
  if (cell.flagged) {
    display = <BombIcon size={25} color="#FF6666" />;
  } else if (cell.revealed) {
    display = cell.mine
      ? <BombIcon size={25} color="black" />
      : cell.adjacent > 0
      ? cell.adjacent.toString()
      : "";
  }

  let backgroundColor = cell.revealed
    ? revealedCellsColor
    : unrevealedCellsColor;

  if (cell.revealed && cell.mine && bombCellColor) {
    backgroundColor = bombCellColor;
  } else if (cell.flagged && flaggedCellColor) {
    backgroundColor = flaggedCellColor;
  }

  return (
    <TouchableOpacity
      style={[styles.cell, { backgroundColor: backgroundColor }]}
      onPress={() => onPressCell(row, col)}
    >
      <View style={styles.topLine} />
      <View style={styles.leftLine} />
      {typeof display === "string" ? (
        <Text style={[styles.text, { color: getNumberColor(Number(display)) }]}>{display}</Text>
      ) : (
        <View style={styles.iconWrapper}>{display}</View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  text: {
    fontSize: 25,
    fontFamily: "RajdhaniBold",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  topLine: {
    position: "absolute",
    top: 0,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: "black",
  },
  leftLine: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 0,
    width: 2,
    backgroundColor: "black",
  },
});
