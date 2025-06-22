import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId

    if (!roomId) {
      return NextResponse.json({ error: "방 ID가 필요합니다" }, { status: 400 })
    }

    const room = gameStore.getRoom(roomId)

    if (!room) {
      return NextResponse.json({ error: "방을 찾을 수 없습니다" }, { status: 404 })
    }

    // 연결 끊김 확인
    gameStore.checkForDisconnections(roomId)

    // 업데이트된 방 정보 다시 가져오기
    const updatedRoom = gameStore.getRoom(roomId)

    return NextResponse.json({ gameState: updatedRoom?.gameState })
  } catch (error) {
    console.error("게임 상태 로드 오류:", error)
    return NextResponse.json({ error: "게임 상태를 불러올 수 없습니다" }, { status: 500 })
  }
}
