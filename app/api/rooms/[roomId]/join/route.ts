import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId

    if (!roomId) {
      return NextResponse.json({ error: "방 ID가 필요합니다" }, { status: 400 })
    }

    const { playerName } = await request.json()

    if (!playerName?.trim()) {
      return NextResponse.json({ error: "플레이어 이름을 입력해주세요" }, { status: 400 })
    }

    console.log(`Player ${playerName} trying to join room ${roomId}`)

    const color = gameStore.joinRoom(roomId, playerName)

    if (!color) {
      return NextResponse.json({ error: "방에 참가할 수 없습니다" }, { status: 400 })
    }

    console.log(`Player ${playerName} joined as ${color}`)

    return NextResponse.json({ color })
  } catch (error) {
    console.error("방 참가 오류:", error)
    return NextResponse.json({ error: "방 참가에 실패했습니다" }, { status: 500 })
  }
}
