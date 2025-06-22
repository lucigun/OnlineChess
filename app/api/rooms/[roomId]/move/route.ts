import { NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId
    const { from, to, playerName } = await request.json()

    if (!from || !to || !playerName) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다" }, { status: 400 })
    }

    const result = gameStore.makeMove(roomId, from, to, playerName)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("이동 처리 오류:", error)
    return NextResponse.json({ error: "이동 처리에 실패했습니다" }, { status: 500 })
  }
}
