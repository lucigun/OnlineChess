import type { GameState } from "@/app/game/[roomId]/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Trophy } from "lucide-react"

interface GameInfoProps {
  gameState: GameState
  playerColor: "white" | "black" | null
  playerName: string
}

export function GameInfo({ gameState, playerColor, playerName }: GameInfoProps) {
  const getStatusText = () => {
    switch (gameState.status) {
      case "waiting":
        return "플레이어 대기 중"
      case "playing":
        return gameState.currentPlayer === "white" ? "백의 차례" : "흑의 차례"
      case "finished":
        if (gameState.disconnectedPlayer) {
          const disconnectedName =
            gameState.disconnectedPlayer === "white" ? gameState.players.white : gameState.players.black
          return `${disconnectedName}님이 나감`
        }
        if (gameState.winner === "draw") return "무승부"
        return `${gameState.winner === "white" ? "백" : "흑"} 승리!`
      default:
        return "알 수 없음"
    }
  }

  const getStatusColor = () => {
    switch (gameState.status) {
      case "waiting":
        return "secondary"
      case "playing":
        return gameState.currentPlayer === playerColor ? "default" : "outline"
      case "finished":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            게임 상태
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Badge variant={getStatusColor() as any} className="mb-2 sm:mb-3">
            {getStatusText()}
          </Badge>

          {gameState.status === "playing" && (
            <div className="text-xs sm:text-sm text-gray-600">
              {gameState.currentPlayer === playerColor ? "당신의 차례입니다!" : "상대방의 차례입니다."}
            </div>
          )}

          {gameState.status === "finished" && gameState.disconnectedPlayer && (
            <div className="text-xs sm:text-sm text-red-600 mt-2">상대방이 연결을 끊었습니다</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            플레이어
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">♔ 백</span>
            <span className="font-medium truncate ml-2">
              {gameState.players.white || "대기 중..."}
              {gameState.players.white === playerName && " (나)"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">♚ 흑</span>
            <span className="font-medium truncate ml-2">
              {gameState.players.black || "대기 중..."}
              {gameState.players.black === playerName && " (나)"}
            </span>
          </div>
        </CardContent>
      </Card>

      {gameState.moveHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              이동 기록
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-1">
              {gameState.moveHistory.slice(-10).map((move, index) => (
                <div key={index} className="text-xs sm:text-sm text-gray-600">
                  {gameState.moveHistory.length - 10 + index + 1}. {move}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
