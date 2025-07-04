"use client"

import type { GameState } from "../lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GameInfoProps {
  gameState: GameState
  onReset: () => void
  onJoinGame: (playerName: string) => void
}

export function GameInfo({ gameState, onReset, onJoinGame }: GameInfoProps) {
  const getStatusMessage = (): string => {
    switch (gameState.status) {
      case "waiting":
        if (!gameState.players.white && !gameState.players.black) {
          return "플레이어를 기다리는 중..."
        } else if (!gameState.players.black) {
          return "흑색 플레이어를 기다리는 중..."
        } else if (!gameState.players.white) {
          return "백색 플레이어를 기다리는 중..."
        }
        return "게임 시작 준비 중..."
      case "playing":
        const currentPlayerName =
          gameState.currentPlayer === "white" ? gameState.players.white : gameState.players.black
        return `${currentPlayerName}의 차례 (${gameState.currentPlayer === "white" ? "백색" : "흑색"})`
      case "checkmate":
        const winner = gameState.currentPlayer === "white" ? "흑색" : "백색"
        return `체크메이트! ${winner} 승리!`
      case "stalemate":
        return "스테일메이트! 무승부!"
      case "draw":
        return "무승부!"
      default:
        return ""
    }
  }

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>체스 게임</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg font-semibold">{getStatusMessage()}</p>
          {gameState.isInCheck && gameState.status === "playing" && <p className="text-red-600 font-bold">체크!</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>백색:</span>
            <span>{gameState.players.white || "없음"}</span>
          </div>
          <div className="flex justify-between">
            <span>흑색:</span>
            <span>{gameState.players.black || "없음"}</span>
          </div>
        </div>

        {gameState.status === "waiting" && (
          <div className="space-y-2">
            {!gameState.players.white && (
              <Button onClick={() => onJoinGame("플레이어 1")} className="w-full">
                백색으로 참가
              </Button>
            )}
            {!gameState.players.black && (
              <Button onClick={() => onJoinGame("플레이어 2")} className="w-full" variant="outline">
                흑색으로 참가
              </Button>
            )}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-gray-600">이동 횟수: {gameState.moveHistory.length}</p>

          <Button onClick={onReset} variant="outline" className="w-full bg-transparent">
            게임 리셋
          </Button>
        </div>

        {gameState.moveHistory.length > 0 && (
          <div className="max-h-32 overflow-y-auto">
            <p className="text-sm font-semibold mb-2">이동 기록:</p>
            <div className="text-xs space-y-1">
              {gameState.moveHistory.slice(-5).map((move, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {move.piece.color === "white" ? "백" : "흑"} {move.piece.type}
                  </span>
                  <span>
                    ({move.from.row},{move.from.col}) → ({move.to.row},{move.to.col})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
