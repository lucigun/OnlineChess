"use client"

import type { Position, ChessPiece } from "../lib/types"
import { ChessPieceComponent } from "./chess-piece"

interface ChessBoardProps {
  board: (ChessPiece | null)[][]
  selectedSquare: Position | null
  validMoves: Position[]
  onSquareClick: (position: Position) => void
}

export function ChessBoard({ board, selectedSquare, validMoves, onSquareClick }: ChessBoardProps) {
  const isSquareSelected = (row: number, col: number): boolean => {
    return selectedSquare?.row === row && selectedSquare?.col === col
  }

  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some((move) => move.row === row && move.col === col)
  }

  const getSquareColor = (row: number, col: number): string => {
    const isLight = (row + col) % 2 === 0
    const baseColor = isLight ? "bg-amber-100" : "bg-amber-800"

    if (isSquareSelected(row, col)) {
      return "bg-blue-400"
    }

    if (isValidMove(row, col)) {
      return isLight ? "bg-green-300" : "bg-green-600"
    }

    return baseColor
  }

  return (
    <div className="grid grid-cols-8 gap-0 border-2 border-amber-900 w-fit">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`
              w-16 h-16 flex items-center justify-center cursor-pointer
              hover:opacity-80 transition-opacity
              ${getSquareColor(rowIndex, colIndex)}
            `}
            onClick={() => onSquareClick({ row: rowIndex, col: colIndex })}
          >
            {piece && <ChessPieceComponent piece={piece} />}
            {isValidMove(rowIndex, colIndex) && !piece && (
              <div className="w-4 h-4 bg-green-500 rounded-full opacity-60" />
            )}
          </div>
        )),
      )}
    </div>
  )
}
