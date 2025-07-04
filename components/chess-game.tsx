"use client"

import { useChessGame } from "../hooks/use-chess-game"
import { ChessBoard } from "./chess-board"
import { GameInfo } from "./game-info"

export default function ChessGame() {
  const { gameState, joinGame, selectSquare, resetGame } = useChessGame()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-amber-900">체스 게임</h1>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
          <ChessBoard
            board={gameState.board}
            selectedSquare={gameState.selectedSquare}
            validMoves={gameState.validMoves}
            onSquareClick={selectSquare}
          />

          <GameInfo gameState={gameState} onReset={resetGame} onJoinGame={joinGame} />
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>두 플레이어가 모두 참가하면 게임이 시작됩니다.</p>
          <p>말을 클릭하여 선택하고, 이동할 위치를 클릭하세요.</p>
        </div>
      </div>
    </div>
  )
}
