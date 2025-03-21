import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SettingsTab() {
  const navigation = useNavigation();
  const [rows, setRows] = useState('8');
  const [cols, setCols] = useState('8');
  const [mines, setMines] = useState('10');

  const handleSave = () => {
    const numRows = parseInt(rows);
    const numCols = parseInt(cols);
    const numMines = parseInt(mines);

    if (isNaN(numRows) || isNaN(numCols) || isNaN(numMines) || numRows <= 0 || numCols <= 0 || numMines <= 0 || numMines >= numRows * numCols) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for rows, columns, and mines.');
      return;
    }

    navigation.navigate('index', { rows: numRows, cols: numCols, mines: numMines });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.text}>Grid Rows:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={rows}
        onChangeText={setRows}
        placeholder="Enter rows"
        placeholderTextColor="#888"
      />
      <Text style={styles.text}>Grid Columns:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={cols}
        onChangeText={setCols}
        placeholder="Enter columns"
        placeholderTextColor="#888"
      />
      <Text style={styles.text}>Number of Mines:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={mines}
        onChangeText={setMines}
        placeholder="Enter mines"
        placeholderTextColor="#888"
      />
      <Button title="Save Settings" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: 120,
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: 'white',
    color: 'black',
  },
  text: {
    color: 'gray',
  }
});