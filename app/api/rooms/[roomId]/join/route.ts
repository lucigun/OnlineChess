import { NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId
    const { playerName } = await request.json()

    if (!playerName?.trim()) {
      return NextResponse.json({ error: "플레이어 이름을 입력해주세요" }, { status: 400 })
    }

    const color = gameStore.joinRoom(roomId, playerName)

    if (!color) {
      return NextResponse.json({ error: "방에 참가할 수 없습니다" }, { status: 400 })
    }

    return NextResponse.json({ color })
  } catch (error) {
    console.error("방 참가 오류:", error)
    return NextResponse.json({ error: "방 참가에 실패했습니다" }, { status: 500 })
  }
}
