import { NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId
    const { playerName } = await request.json()

    if (!playerName?.trim()) {
      return NextResponse.json({ error: "플레이어 이름을 입력해주세요" }, { status: 400 })
    }

    const success = gameStore.updatePlayerActivity(roomId, playerName)

    if (!success) {
      return NextResponse.json({ error: "플레이어를 찾을 수 없습니다" }, { status: 404 })
    }

    // 연결 끊김 확인
    const disconnectionDetected = gameStore.checkForDisconnections(roomId)

    return NextResponse.json({
      success: true,
      disconnectionDetected,
    })
  } catch (error) {
    console.error("Heartbeat 처리 오류:", error)
    return NextResponse.json({ error: "Heartbeat 처리에 실패했습니다" }, { status: 500 })
  }
}
