import { Cell } from "./models";

export type Board = Cell[][];

export const generateBoard = (
  rows: number,
  cols: number,
  mines: number,
  firstClickRow?: number,
  firstClickCol?: number
): Board => {
  let board: Board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );

  let minesPlaced = 0;

  while (minesPlaced < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);

    // Ensure the first clicked cell doesn't have a mine
    if (
      (firstClickRow !== undefined && firstClickCol !== undefined) &&
      (row === firstClickRow && col === firstClickCol)
    ) {
      continue; // Skip placing a mine here
    }

    if (!board[row][col].mine) {
      board[row][col].mine = true;
      minesPlaced++;
    }
  }

  // Count how many mines are next to each cell
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].mine) {
        let count = 0;
        // Check all 8 cells around this one
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue; // Skip the current cell
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              board[nr][nc].mine
            ) {
              count++;
            }
          }
        }
        board[r][c].adjacent = count;
      }
    }
  }

  return board;
};

export const revealEmptyCells = (
  board: Board,
  row: number,
  col: number,
  rows: number,
  cols: number
): Board => {
  let newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const stack: [number, number][] = [[row, col]];
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (newBoard[r][c].revealed || newBoard[r][c].flagged) continue;
    newBoard[r][c].revealed = true;
    if (newBoard[r][c].adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            !newBoard[nr][nc].revealed
          ) {
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return newBoard;
};

export const checkWin = (board: Board, mines: number): boolean => {
  let revealedCount = 0;
  const totalCells = board.length * board[0].length;
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.revealed) revealedCount++;
    });
  });
  return totalCells - revealedCount === mines;
};

// Helper function to flood fill adjacent empty cells
const floodFillMark = (
  board: Board,
  row: number,
  col: number,
  rows: number,
  cols: number,
  marked: boolean[][]
) => {
  const stack: [number, number][] = [[row, col]];
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (marked[r][c]) continue;

    marked[r][c] = true;

    // Check all 8 directions around the current cell
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !marked[nr][nc]) {
          if (board[nr][nc].adjacent === 0) {
            stack.push([nr, nc]); // Continue flood fill if adjacent is 0
          } else {
            marked[nr][nc] = true; // Mark non-empty adjacent cells
          }
        }
      }
    }
  }
};

// 3BV Calculation
export const calculate3BV = (board: Board, rows: number, cols: number): number => {
  const marked: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  let count = 0;

  // Count 3BV for empty cells (0 cells) by flood-filling them
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].adjacent === 0 && !marked[r][c] && !board[r][c].mine) {
        // If it's an empty cell and hasn't been marked yet, perform flood fill
        floodFillMark(board, r, c, rows, cols, marked);
        count++; // One flood fill adds one to the 3BV
      }
    }
  }

  // After flood filling, count remaining non-mine non-marked cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!marked[r][c] && !board[r][c].mine) {
        count++; // Each remaining non-mine non-marked cell adds 1 to the 3BV
      }
    }
  }

  return count;
};

// Counts flagged neighbors around a given cell
export const countFlaggedNeighbors = (board: Board, row: number, col: number): number => {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (
        nr >= 0 &&
        nr < board.length &&
        nc >= 0 &&
        nc < board[0].length &&
        board[nr][nc].flagged
      ) {
        count++;
      }
    }
  }
  return count;
};

// Reveals all non-flagged neighbors of a cell
export const revealNeighboringCells = (board: Board, row: number, col: number, rows: number, cols: number): Board => {
  let newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        !newBoard[nr][nc].revealed &&
        !newBoard[nr][nc].flagged
      ) {
        if (newBoard[nr][nc].mine) {
          newBoard = newBoard.map((r) =>
            r.map((cell) => ({ ...cell, revealed: true }))
          );
        } else {
          newBoard = revealEmptyCells(newBoard, nr, nc, rows, cols);
        }
      }
    }
  }
  return newBoard;
};
