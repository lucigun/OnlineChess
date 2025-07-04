export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn"
export type PieceColor = "white" | "black"
export type GameStatus = "waiting" | "playing" | "checkmate" | "stalemate" | "draw"

export interface ChessPiece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  piece: ChessPiece
  capturedPiece?: ChessPiece
  isCheck?: boolean
  isCheckmate?: boolean
}

export interface GameState {
  board: (ChessPiece | null)[][]
  currentPlayer: PieceColor
  status: GameStatus
  players: {
    white: string | null
    black: string | null
  }
  selectedSquare: Position | null
  validMoves: Position[]
  moveHistory: Move[]
  isInCheck: boolean
}
