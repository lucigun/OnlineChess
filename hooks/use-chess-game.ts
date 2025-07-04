"use client"

import { useState, useCallback } from "react"
import type { GameState, Position, Move } from "../lib/types"
import { createInitialBoard, getValidMoves, isInCheck, isCheckmate } from "../lib/chess-logic"

export function useChessGame() {
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: "white",
    status: "waiting",
    players: {
      white: null,
      black: null,
    },
    selectedSquare: null,
    validMoves: [],
    moveHistory: [],
    isInCheck: false,
  })

  // 플레이어 참가
  const joinGame = useCallback((playerName: string) => {
    setGameState((prev) => {
      const newState = { ...prev }

      if (!newState.players.white) {
        newState.players.white = playerName
      } else if (!newState.players.black) {
        newState.players.black = playerName
      }

      // 두 플레이어가 모두 참가하면 게임 시작
      if (newState.players.white && newState.players.black && newState.status === "waiting") {
        newState.status = "playing"
      }

      return newState
    })
  }, [])

  // 말 선택
  const selectSquare = useCallback((position: Position) => {
    setGameState((prev) => {
      if (prev.status !== "playing") return prev

      const piece = prev.board[position.row][position.col]

      // 이미 선택된 말을 다시 클릭한 경우
      if (prev.selectedSquare && prev.selectedSquare.row === position.row && prev.selectedSquare.col === position.col) {
        return {
          ...prev,
          selectedSquare: null,
          validMoves: [],
        }
      }

      // 유효한 이동 위치를 클릭한 경우
      if (
        prev.selectedSquare &&
        prev.validMoves.some((move) => move.row === position.row && move.col === position.col)
      ) {
        return makeMove(prev, prev.selectedSquare, position)
      }

      // 현재 플레이어의 말을 선택한 경우
      if (piece && piece.color === prev.currentPlayer) {
        const validMoves = getValidMoves(prev.board, position, piece)
        return {
          ...prev,
          selectedSquare: position,
          validMoves,
        }
      }

      // 그 외의 경우 선택 해제
      return {
        ...prev,
        selectedSquare: null,
        validMoves: [],
      }
    })
  }, [])

  // 말 이동
  const makeMove = useCallback((state: GameState, from: Position, to: Position): GameState => {
    const newBoard = state.board.map((row) => [...row])
    const piece = newBoard[from.row][from.col]
    const capturedPiece = newBoard[to.row][to.col]

    if (!piece) return state

    // 말 이동
    newBoard[to.row][to.col] = { ...piece, hasMoved: true }
    newBoard[from.row][from.col] = null

    const nextPlayer = state.currentPlayer === "white" ? "black" : "white"
    const isCheck = isInCheck(newBoard, nextPlayer)
    const isCheckmateResult = isCheckmate(newBoard, nextPlayer)

    const move: Move = {
      from,
      to,
      piece,
      capturedPiece: capturedPiece || undefined,
      isCheck,
      isCheckmate: isCheckmateResult,
    }

    return {
      ...state,
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedSquare: null,
      validMoves: [],
      moveHistory: [...state.moveHistory, move],
      isInCheck: isCheck,
      status: isCheckmateResult ? "checkmate" : "playing",
    }
  }, [])

  // 게임 리셋
  const resetGame = useCallback(() => {
    setGameState({
      board: createInitialBoard(),
      currentPlayer: "white",
      status: "waiting",
      players: {
        white: null,
        black: null,
      },
      selectedSquare: null,
      validMoves: [],
      moveHistory: [],
      isInCheck: false,
    })
  }, [])

  return {
    gameState,
    joinGame,
    selectSquare,
    resetGame,
  }
}
