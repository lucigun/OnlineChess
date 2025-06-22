import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId

    if (!roomId) {
      return NextResponse.json({ error: "방 ID가 필요합니다" }, { status: 400 })
    }

    const { from, to, playerName } = await request.json()

    if (!from || !to || !playerName) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다" }, { status: 400 })
    }

    console.log(`Move attempt: ${playerName} from ${from} to ${to} in room ${roomId}`)

    const result = gameStore.makeMove(roomId, from, to, playerName)

    if (!result.success) {
      console.log(`Move failed: ${result.error}`)
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    console.log(`Move successful: ${from} to ${to}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("이동 처리 오류:", error)
    return NextResponse.json({ error: "이동 처리에 실패했습니다" }, { status: 500 })
  }
}
