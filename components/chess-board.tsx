"use client"

import { useState } from "react"
import type { GameState } from "@/app/game/[roomId]/page"

interface ChessBoardProps {
  gameState: GameState
  playerColor: "white" | "black" | null
  onMove: (from: string, to: string) => void
  disabled: boolean
}

const PIECES = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
}

export function ChessBoard({ gameState, playerColor, onMove, disabled }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<string[]>([])

  const handleSquareClick = (row: number, col: number) => {
    if (disabled) return

    const square = `${String.fromCharCode(97 + col)}${8 - row}`
    const piece = gameState.board[row][col]

    console.log("클릭된 칸:", square, "말:", piece, "플레이어 색상:", playerColor)

    if (selectedSquare) {
      if (selectedSquare === square) {
        // 같은 칸 클릭 - 선택 해제
        setSelectedSquare(null)
        setPossibleMoves([])
      } else if (possibleMoves.includes(square)) {
        // 유효한 이동
        console.log("이동 시도:", selectedSquare, "->", square)
        onMove(selectedSquare, square)
        setSelectedSquare(null)
        setPossibleMoves([])
      } else if (piece && isPlayerPiece(piece, playerColor)) {
        // 다른 자신의 말 선택
        setSelectedSquare(square)
        setPossibleMoves(getPossibleMoves(row, col, piece, gameState.board))
      } else {
        // 선택 해제
        setSelectedSquare(null)
        setPossibleMoves([])
      }
    } else {
      if (piece && isPlayerPiece(piece, playerColor)) {
        console.log("말 선택:", piece, "위치:", square)
        setSelectedSquare(square)
        setPossibleMoves(getPossibleMoves(row, col, piece, gameState.board))
      }
    }
  }

  const isPlayerPiece = (piece: string, color: "white" | "black" | null) => {
    if (!color) return false
    const isWhitePiece = piece === piece.toUpperCase()
    return color === "white" ? isWhitePiece : !isWhitePiece
  }

  const getPossibleMoves = (row: number, col: number, piece: string, board: string[][]): string[] => {
    const moves: string[] = []
    const pieceType = piece.toLowerCase()

    // 기본적인 이동 패턴 (모든 말에 대해 최소한의 이동 허용)
    const directions = getPieceDirections(pieceType)

    for (const [dr, dc] of directions) {
      let newRow = row + dr
      let newCol = col + dc

      // 폰의 경우 색상에 따른 방향 조정
      if (pieceType === "p") {
        const isWhitePiece = piece === piece.toUpperCase()
        if (isWhitePiece) {
          newRow = row - Math.abs(dr) // 백은 위로
        } else {
          newRow = row + Math.abs(dr) // 흑은 아래로
        }
      }

      while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const targetPiece = board[newRow][newCol]

        if (!targetPiece) {
          moves.push(`${String.fromCharCode(97 + newCol)}${8 - newRow}`)
        } else {
          if (isOpponentPiece(piece, targetPiece)) {
            moves.push(`${String.fromCharCode(97 + newCol)}${8 - newRow}`)
          }
          break
        }

        // 폰, 킹, 나이트는 한 칸만
        if (["p", "k", "n"].includes(pieceType)) break

        newRow += dr
        newCol += dc
      }
    }

    console.log("가능한 이동:", moves)
    return moves
  }

  const getPieceDirections = (piece: string): number[][] => {
    switch (piece) {
      case "r":
        return [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ]
      case "b":
        return [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]
      case "q":
        return [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]
      case "k":
        return [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]
      case "n":
        return [
          [2, 1],
          [2, -1],
          [-2, 1],
          [-2, -1],
          [1, 2],
          [1, -2],
          [-1, 2],
          [-1, -2],
        ]
      case "p":
        return [
          [1, 0], // 한 칸 전진
          [2, 0], // 두 칸 전진 (첫 이동)
          [1, 1], // 대각선 공격
          [1, -1], // 대각선 공격
        ]
      default:
        return []
    }
  }

  const isOpponentPiece = (piece1: string, piece2: string): boolean => {
    return (piece1 === piece1.toUpperCase()) !== (piece2 === piece2.toUpperCase())
  }

  const getSquareColor = (row: number, col: number): string => {
    const isLight = (row + col) % 2 === 0
    const square = `${String.fromCharCode(97 + col)}${8 - row}`

    if (selectedSquare === square) {
      return "bg-blue-400"
    } else if (possibleMoves.includes(square)) {
      return isLight ? "bg-green-200" : "bg-green-300"
    } else {
      return isLight ? "bg-amber-100" : "bg-amber-800"
    }
  }

  // 플레이어 색상에 따라 보드 회전
  const boardRows = playerColor === "black" ? [...Array(8)].map((_, i) => 7 - i) : [...Array(8)].map((_, i) => i)

  return (
    <div className="flex flex-col items-center w-full">
      {/* 모바일에서 체스판 크기 조정 */}
      <div className="grid grid-cols-8 border-4 border-amber-900 shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        {boardRows.map((row) =>
          [...Array(8)].map((_, colIndex) => {
            const col = playerColor === "black" ? 7 - colIndex : colIndex
            const piece = gameState.board[row][col]

            return (
              <div
                key={`${row}-${col}`}
                className={`aspect-square flex items-center justify-center cursor-pointer text-2xl sm:text-3xl md:text-4xl select-none ${getSquareColor(row, col)} hover:opacity-80 transition-opacity`}
                onClick={() => handleSquareClick(row, col)}
              >
                {piece && PIECES[piece as keyof typeof PIECES]}
              </div>
            )
          }),
        )}
      </div>

      <div className="mt-4 flex items-center space-x-4 text-center">
        <div className="text-xs sm:text-sm text-gray-600">
          {playerColor === "white" ? "당신은 백(♔)입니다" : playerColor === "black" ? "당신은 흑(♚)입니다" : "관전 중"}
        </div>
      </div>

      {/* 현재 차례 표시 */}
      <div className="mt-2 text-center">
        <div
          className={`text-sm font-medium ${gameState.currentPlayer === playerColor ? "text-green-600" : "text-gray-500"}`}
        >
          {gameState.currentPlayer === "white" ? "백의 차례" : "흑의 차례"}
          {gameState.currentPlayer === playerColor && " (당신의 차례)"}
        </div>
      </div>
    </div>
  )
}
