export interface Cell {
  revealed: boolean;
  flagged: boolean;
  mine: boolean;
  adjacent: number;
}
