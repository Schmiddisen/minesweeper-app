import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from './button';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
  color: string;
}

export default function HelpModal({ visible, onClose, color }: HelpModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, styles.helpModalContent]}>
        <Text style={[styles.title, { color: color }]}>Game Guide</Text>
        <ScrollView style={styles.helpScrollView}>
          <Text style={[styles.helpText, { color: color }]}>
            Welcome to Minesweeper! Here you'll find all the important information about the game:
          </Text>
          <Text style={[styles.helpText, { color: color }]}>
            {"\n"}Game Modes:
            {"\n"}- Easy: 9x9 grid with 10 mines
            {"\n"}- Medium: 16x16 grid with 40 mines
            {"\n"}- Expert: 16x30 grid with 99 mines
            {"\n"}- Custom: Choose your own settings
          </Text>
          <Text style={[styles.helpText, { color: color }]}>
            {"\n"}Game Mechanics:
            {"\n"}- Tap a cell to reveal it
            {"\n"}- Numbers show how many mines are in adjacent cells
            {"\n"}- Empty cells are automatically revealed
            {"\n"}- Use the flag function (flag button at bottom) to mark suspected mines
          </Text>
          <Text style={[styles.helpText, { color: color }]}>
            {"\n"}Chaining:
            {"\n"}- When you reveal a cell with a number and have marked the correct number of mines in adjacent cells
            {"\n"}- Double-tap the revealed cell to trigger a chain reaction
            {"\n"}- All adjacent cells will be automatically revealed
            {"\n"}- This is especially useful for quickly revealing large areas
          </Text>
          <Text style={[styles.helpText, { color: color }]}>
            {"\n"}Controls:
            {"\n"}- Reset button (top right) starts a new game
            {"\n"}- Zoom buttons (bottom) enlarge or shrink the game board
            {"\n"}- Flag button (bottom) activates marking mode
          </Text>
          <Text style={[styles.helpText, { color: color }]}>
            {"\n"}Objective:
            {"\n"}- Find all mines on the game board
            {"\n"}- Mark them with flags
            {"\n"}- Reveal all safe cells
          </Text>
        </ScrollView>
        <View style={styles.buttonRow}>
          <Button
            title="Close"
            color={color}
            onPress={onClose}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
    fontFamily: "RajdhaniBold",
    alignSelf: "center",
  },
  helpModalContent: {
    maxHeight: '80%',
    width: '90%',
    maxWidth: 400,
  },
  helpScrollView: {
    width: '100%',
    marginVertical: 10,
  },
  helpText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    fontFamily: "RajdhaniMedium",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5,
  },
}); 