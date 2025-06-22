import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function GET() {
  try {
    const rooms = gameStore.getAllRooms().map((room) => ({
      id: room.id,
      name: room.name,
      creator: room.creator,
      players: Object.keys(room.gameState.players).length,
      maxPlayers: 2,
      status: room.gameState.status,
    }))

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("방 목록 조회 오류:", error)
    return NextResponse.json({ error: "방 목록을 불러올 수 없습니다" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { roomName, playerName } = await request.json()

    if (!roomName?.trim() || !playerName?.trim()) {
      return NextResponse.json({ error: "방 이름과 플레이어 이름을 입력해주세요" }, { status: 400 })
    }

    const roomId = gameStore.createRoom(roomName, playerName)
    console.log(`Room created: ${roomId} by ${playerName}`)

    return NextResponse.json({ roomId })
  } catch (error) {
    console.error("방 생성 오류:", error)
    return NextResponse.json({ error: "방 생성에 실패했습니다" }, { status: 500 })
  }
}
