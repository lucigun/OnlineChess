import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId

    if (!roomId) {
      return NextResponse.json({ error: "방 ID가 필요합니다" }, { status: 400 })
    }

    const body = await request.json()
    const { playerName } = body

    if (!playerName?.trim()) {
      return NextResponse.json({ error: "플레이어 이름을 입력해주세요" }, { status: 400 })
    }

    console.log(`Heartbeat received for room ${roomId}, player ${playerName}`)

    const success = gameStore.updatePlayerActivity(roomId, playerName)

    if (!success) {
      console.log(`Player ${playerName} not found in room ${roomId}`)
      return NextResponse.json({ error: "플레이어를 찾을 수 없습니다" }, { status: 404 })
    }

    // 연결 끊김 확인
    const disconnectionDetected = gameStore.checkForDisconnections(roomId)

    return NextResponse.json({
      success: true,
      disconnectionDetected,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Heartbeat 처리 오류:", error)
    return NextResponse.json({ error: "Heartbeat 처리에 실패했습니다" }, { status: 500 })
  }
}

// GET 메서드도 추가 (디버깅용)
export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId
    const room = gameStore.getRoom(roomId)

    if (!room) {
      return NextResponse.json({ error: "방을 찾을 수 없습니다" }, { status: 404 })
    }

    return NextResponse.json({
      roomId,
      players: room.gameState.players,
      lastActivity: room.gameState.lastActivity,
      status: room.gameState.status,
    })
  } catch (error) {
    console.error("Heartbeat GET 처리 오류:", error)
    return NextResponse.json({ error: "처리에 실패했습니다" }, { status: 500 })
  }
}
