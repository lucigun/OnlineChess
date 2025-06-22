"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { ChessBoard } from "@/components/chess-board"
import { GameInfo } from "@/components/game-info"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export interface GameState {
  board: string[][]
  currentPlayer: "white" | "black"
  players: {
    white?: string
    black?: string
  }
  status: "waiting" | "playing" | "finished"
  winner?: "white" | "black" | "draw"
  moveHistory: string[]
  lastActivity?: {
    white?: number
    black?: number
  }
  disconnectedPlayer?: "white" | "black"
  lastMove?: {
    from: string
    to: string
    timestamp: number
  }
  isCheck?: boolean
  isCheckmate?: boolean
}

export default function GamePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.roomId as string
  const playerName = searchParams.get("player") || ""

  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDisconnectAlert, setShowDisconnectAlert] = useState(false)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!roomId || !playerName) return

    let mounted = true

    const initializeGame = async () => {
      try {
        // 게임 참가
        const joinResponse = await fetch(`/api/rooms/${roomId}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerName }),
        })

        if (joinResponse.ok && mounted) {
          const joinData = await joinResponse.json()
          setPlayerColor(joinData.color)
          console.log("플레이어 색상 설정:", joinData.color)
        }

        // 초기 게임 상태 로드
        const stateResponse = await fetch(`/api/rooms/${roomId}`)
        if (stateResponse.ok && mounted) {
          const stateData = await stateResponse.json()
          setGameState(stateData.gameState)
          setLoading(false)
          console.log("게임 상태 로드:", stateData.gameState)
        }
      } catch (error) {
        console.error("게임 초기화 실패:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Heartbeat 전송 (10초마다)
    const startHeartbeat = () => {
      heartbeatIntervalRef.current = setInterval(async () => {
        if (!mounted) return

        try {
          await fetch(`/api/rooms/${roomId}/heartbeat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerName }),
          })
        } catch (error) {
          console.error("Heartbeat 전송 실패:", error)
        }
      }, 10000)
    }

    // 게임 상태 폴링 (3초 간격)
    const startPolling = () => {
      pollIntervalRef.current = setInterval(async () => {
        if (!mounted) return

        try {
          const response = await fetch(`/api/rooms/${roomId}`)
          if (response.ok && mounted) {
            const data = await response.json()
            const newGameState = data.gameState

            // 연결 끊김 감지
            if (
              newGameState.status === "finished" &&
              newGameState.disconnectedPlayer &&
              (!gameState || gameState.status === "playing")
            ) {
              const disconnectedPlayerName =
                newGameState.disconnectedPlayer === "white" ? newGameState.players.white : newGameState.players.black

              if (disconnectedPlayerName !== playerName) {
                setShowDisconnectAlert(true)
              }
            }

            setGameState(newGameState)
          }
        } catch (error) {
          console.error("게임 상태 업데이트 실패:", error)
        }
      }, 3000)
    }

    initializeGame()
    startHeartbeat()
    startPolling()

    return () => {
      mounted = false
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [roomId, playerName])

  // 연결 끊김 알림 처리
  useEffect(() => {
    if (showDisconnectAlert) {
      const disconnectedPlayerName =
        gameState?.disconnectedPlayer === "white" ? gameState.players.white : gameState?.players.black

      alert(`상대방 ${disconnectedPlayerName}님이 게임을 나갔습니다.\n게임이 종료되었습니다.`)
      setShowDisconnectAlert(false)
    }
  }, [showDisconnectAlert, gameState])

  const makeMove = async (from: string, to: string) => {
    if (!gameState || gameState.currentPlayer !== playerColor) {
      console.log("이동 불가:", {
        gameState: !!gameState,
        currentPlayer: gameState?.currentPlayer,
        playerColor,
      })
      return
    }

    console.log("이동 요청:", { from, to, playerName, playerColor })

    try {
      const response = await fetch(`/api/rooms/${roomId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, playerName }),
      })

      if (response.ok) {
        console.log("이동 성공")
        // 즉시 게임 상태 업데이트
        const stateResponse = await fetch(`/api/rooms/${roomId}`)
        if (stateResponse.ok) {
          const data = await stateResponse.json()
          setGameState(data.gameState)
        }
      } else {
        const error = await response.json()
        console.error("이동 실패:", error.error)
        alert(`이동 실패: ${error.error}`)
      }
    } catch (error) {
      console.error("이동 실패:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">게임을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-lg mb-4">게임을 찾을 수 없습니다.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                메인으로 돌아가기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              메인으로
            </Button>
          </Link>
        </div>

        {/* 게임 종료 알림 */}
        {gameState.status === "finished" && gameState.disconnectedPlayer && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            <div className="text-red-800 font-medium">
              {gameState.disconnectedPlayer === "white" ? gameState.players.white : gameState.players.black}님이 게임을
              나갔습니다.
            </div>
            <div className="text-red-600 text-sm mt-1">
              {gameState.winner === playerColor ? "당신이 승리했습니다!" : "상대방이 승리했습니다."}
            </div>
          </div>
        )}

        {/* 체크메이트 승리 알림 */}
        {gameState.status === "finished" && gameState.isCheckmate && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg">
            <div className="text-green-800 font-medium">
              체크메이트! {gameState.winner === playerColor ? "당신이 승리했습니다!" : "상대방이 승리했습니다!"}
            </div>
          </div>
        )}

        {/* 모바일 우선 레이아웃 */}
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
          {/* 체스보드 - 모바일에서 전체 너비 사용 */}
          <div className="lg:col-span-3 w-full">
            <ChessBoard
              gameState={gameState}
              playerColor={playerColor}
              onMove={makeMove}
              disabled={gameState.status !== "playing" || gameState.currentPlayer !== playerColor}
            />
          </div>

          {/* 게임 정보 - 모바일에서 아래쪽 배치 */}
          <div className="w-full">
            <GameInfo gameState={gameState} playerColor={playerColor} playerName={playerName} />
          </div>
        </div>
      </div>
    </div>
  )
}
