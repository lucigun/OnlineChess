import type { ChessPiece } from "../lib/types"

interface ChessPieceProps {
  piece: ChessPiece
  size?: number
}

export function ChessPieceComponent({ piece, size = 40 }: ChessPieceProps) {
  const getPieceSymbol = (piece: ChessPiece): string => {
    const symbols = {
      white: {
        king: "♔",
        queen: "♕",
        rook: "♖",
        bishop: "♗",
        knight: "♘",
        pawn: "♙",
      },
      black: {
        king: "♚",
        queen: "♛",
        rook: "♜",
        bishop: "♝",
        knight: "♞",
        pawn: "♟",
      },
    }

    return symbols[piece.color][piece.type]
  }

  return (
    <div className="flex items-center justify-center select-none" style={{ fontSize: `${size}px` }}>
      {getPieceSymbol(piece)}
    </div>
  )
}
