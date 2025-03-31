import { StyleSheet } from 'react-native';

export const Colors = {
  primary: '#2196F3',
  secondary: '#FFC107',
  background: '#fff',
  cellHidden: '#ccc',
  cellRevealed: '#eee',
  border: '#000',
  text: '#000'
};

export const Layout = {
  padding: 20,
  cellSize: 30
};

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.padding,
    backgroundColor: Colors.background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: Colors.text
  },
  board: {
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 5
  },
  row: {
    flexDirection: 'row'
  },
  cell: {
    width: Layout.cellSize,
    height: Layout.cellSize,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  hidden: {
    backgroundColor: Colors.cellHidden
  },
  revealed: {
    backgroundColor: Colors.cellRevealed
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16
  }
});
