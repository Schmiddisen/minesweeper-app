import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Cell as CellType } from '../game/models';
import { invertColor } from '../utils/helper';
import BombIcon from './startpage_mine';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';

interface AnimatedCellProps {
  cell: CellType;
  row: number;
  col: number;
  onPressCell: (row: number, col: number) => void;
  unrevealedCellsColor?: string;
  revealedCellsColor?: string;
  bombCellColor?: string;
  flaggedCellColor?: string;
  delay?: number;
}

function getNumberColor(count: number): string {
  switch (count) {
    case 1: return "#0000FF"; // Blue
    case 2: return "#008200"; // Green
    case 3: return "#Fe0000"; // Red
    case 4: return "#000084"; // Dark Blue
    case 5: return "#840000"; // Dark Red
    case 6: return "#008284"; // Turquoise
    case 7: return "#000000"; // Black
    case 8: return "#808080"; // Gray
    default: return "blue";
  }
}

export default function AnimatedCell({
  cell,
  row,
  col,
  onPressCell,
  unrevealedCellsColor,
  revealedCellsColor,
  bombCellColor,
  flaggedCellColor,
  delay = 0,
}: AnimatedCellProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (cell.revealed) {
      // Quick pop animation when revealing a cell
      scale.value = withSequence(
        withDelay(delay, withSpring(0.8, { damping: 10, stiffness: 100 })),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
    }
  }, [cell.revealed]);

  useEffect(() => {
    if (cell.flagged) {
      // Flag animation
      rotation.value = withSequence(
        withSpring(-5, { damping: 8, stiffness: 150 }),
        withSpring(5, { damping: 8, stiffness: 150 }),
        withSpring(0, { damping: 8, stiffness: 150 })
      );
    }
  }, [cell.flagged]);

  useEffect(() => {
    if (cell.mine && cell.revealed) {
      // Dramatic pulse effect when hitting a mine
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 8, stiffness: 100 }),
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 8, stiffness: 100 })
      );
      opacity.value = withSequence(
        withTiming(0.5, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [cell.mine, cell.revealed]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ],
      opacity: opacity.value,
    };
  });

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
      onPress={() => onPressCell(row, col)}
    >
      <Animated.View style={[styles.cell, { backgroundColor }, animatedStyle]}>
        <View style={styles.topLine} />
        <View style={styles.leftLine} />
        {typeof display === "string" ? (
          <Text style={[styles.text, { color: getNumberColor(Number(display)) }]}>{display}</Text>
        ) : (
          <View style={styles.iconWrapper}>{display}</View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 35,
    height: 35,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "RajdhaniBold",
  },
  topLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  leftLine: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
}); 