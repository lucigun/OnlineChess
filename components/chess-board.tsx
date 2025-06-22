"use client"

import { useState, useEffect } from "react"
import { ChessRules } from "@/lib/chess-rules"
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
  const [lastMoveHighlight, setLastMoveHighlight] = useState<{ from: string; to: string } | null>(null)

  // 마지막 이동 하이라이트 효과
  useEffect(() => {
    if (gameState.lastMove) {
      setLastMoveHighlight({
        from: gameState.lastMove.from,
        to: gameState.lastMove.to,
      })

      // 3초 후 하이라이트 제거
      const timer = setTimeout(() => {
        setLastMoveHighlight(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [gameState.lastMove])

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
        setPossibleMoves(getValidMoves(row, col))
      } else {
        // 선택 해제
        setSelectedSquare(null)
        setPossibleMoves([])
      }
    } else {
      if (piece && isPlayerPiece(piece, playerColor)) {
        console.log("말 선택:", piece, "위치:", square)
        setSelectedSquare(square)
        setPossibleMoves(getValidMoves(row, col))
      }
    }
  }

  const isPlayerPiece = (piece: string, color: "white" | "black" | null) => {
    if (!color) return false
    const isWhitePiece = piece === piece.toUpperCase()
    return color === "white" ? isWhitePiece : !isWhitePiece
  }

  const getValidMoves = (row: number, col: number): string[] => {
    const position = { row, col }
    const possiblePositions = ChessRules.getPossibleMoves(gameState.board, position)

    return possiblePositions.map((pos) => ChessRules.positionToSquare(pos))
  }

  const getSquareColor = (row: number, col: number): string => {
    const isLight = (row + col) % 2 === 0
    const square = `${String.fromCharCode(97 + col)}${8 - row}`

    // 마지막 이동 하이라이트 (spark 효과)
    if (lastMoveHighlight && (lastMoveHighlight.from === square || lastMoveHighlight.to === square)) {
      return "bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50"
    }

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
      {/* 체크/체크메이트 알림 */}
      {gameState.isCheck && gameState.status === "playing" && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <div className="text-red-800 font-medium text-center">
            {gameState.currentPlayer === "white" ? "백" : "흑"}이 체크 상태입니다!
            {gameState.currentPlayer === playerColor && " 킹을 안전한 곳으로 이동하세요."}
          </div>
        </div>
      )}

      {gameState.isCheckmate && (
        <div className="mb-4 p-3 bg-red-200 border border-red-400 rounded-lg">
          <div className="text-red-900 font-bold text-center">
            체크메이트! {gameState.winner === "white" ? "백" : "흑"}의 승리!
          </div>
        </div>
      )}

      {/* 모바일에서 체스판 크기 조정 */}
      <div className="grid grid-cols-8 border-4 border-amber-900 shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        {boardRows.map((row) =>
          [...Array(8)].map((_, colIndex) => {
            const col = playerColor === "black" ? 7 - colIndex : colIndex
            const piece = gameState.board[row][col]

            return (
              <div
                key={`${row}-${col}`}
                className={`aspect-square flex items-center justify-center cursor-pointer text-2xl sm:text-3xl md:text-4xl select-none ${getSquareColor(row, col)} hover:opacity-80 transition-all duration-300`}
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
