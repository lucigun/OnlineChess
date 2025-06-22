export interface GameRoom {
  id: string
  name: string
  creator: string
  gameState: {
    board: string[][]
    currentPlayer: "white" | "black"
    players: {
      white?: string
      black?: string
    }
    status: "waiting" | "playing" | "finished"
    winner?: "white" | "black" | "draw"
    moveHistory: string[]
    lastActivity: {
      white?: number
      black?: number
    }
    disconnectedPlayer?: "white" | "black"
  }
}

const initialBoard = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
]

// 연결 끊김 판단 시간 (30초)
const DISCONNECT_TIMEOUT = 30000

class GameStore {
  private rooms = new Map<string, GameRoom>()

  createRoom(roomName: string, playerName: string): string {
    const roomId = Math.random().toString(36).substring(2, 15)

    const gameRoom: GameRoom = {
      id: roomId,
      name: roomName,
      creator: playerName,
      gameState: {
        board: initialBoard.map((row) => [...row]),
        currentPlayer: "white",
        players: {
          white: playerName,
        },
        status: "waiting",
        moveHistory: [],
        lastActivity: {
          white: Date.now(),
        },
      },
    }

    this.rooms.set(roomId, gameRoom)
    return roomId
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId)
  }

  getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values())
  }

  updateRoom(roomId: string, room: GameRoom): void {
    this.rooms.set(roomId, room)
  }

  // 플레이어 활동 업데이트 (heartbeat)
  updatePlayerActivity(roomId: string, playerName: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    const playerColor =
      room.gameState.players.white === playerName
        ? "white"
        : room.gameState.players.black === playerName
          ? "black"
          : null

    if (playerColor) {
      room.gameState.lastActivity[playerColor] = Date.now()
      this.rooms.set(roomId, room)
      return true
    }

    return false
  }

  // 연결 끊김 확인 및 게임 종료 처리
  checkForDisconnections(roomId: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room || room.gameState.status !== "playing") return false

    const now = Date.now()
    let disconnectedPlayer: "white" | "black" | null = null

    // 백 플레이어 연결 확인
    if (room.gameState.players.white && room.gameState.lastActivity.white) {
      if (now - room.gameState.lastActivity.white > DISCONNECT_TIMEOUT) {
        disconnectedPlayer = "white"
      }
    }

    // 흑 플레이어 연결 확인
    if (room.gameState.players.black && room.gameState.lastActivity.black) {
      if (now - room.gameState.lastActivity.black > DISCONNECT_TIMEOUT) {
        disconnectedPlayer = "black"
      }
    }

    // 연결 끊김 처리
    if (disconnectedPlayer) {
      room.gameState.status = "finished"
      room.gameState.winner = disconnectedPlayer === "white" ? "black" : "white"
      room.gameState.disconnectedPlayer = disconnectedPlayer
      this.rooms.set(roomId, room)
      return true
    }

    return false
  }

  joinRoom(roomId: string, playerName: string): "white" | "black" | null {
    const room = this.rooms.get(roomId)
    if (!room) return null

    if (room.gameState.players.white === playerName) {
      room.gameState.lastActivity.white = Date.now()
      this.rooms.set(roomId, room)
      return "white"
    } else if (room.gameState.players.black === playerName) {
      room.gameState.lastActivity.black = Date.now()
      this.rooms.set(roomId, room)
      return "black"
    } else if (!room.gameState.players.black) {
      room.gameState.players.black = playerName
      room.gameState.lastActivity.black = Date.now()

      // 두 플레이어가 모두 참가하면 게임 시작
      if (room.gameState.players.white && room.gameState.players.black) {
        room.gameState.status = "playing"
      }

      this.rooms.set(roomId, room)
      return "black"
    }

    return null
  }

  makeMove(roomId: string, from: string, to: string, playerName: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    const gameState = room.gameState

    // 플레이어 검증
    const playerColor =
      gameState.players.white === playerName ? "white" : gameState.players.black === playerName ? "black" : null

    if (!playerColor || gameState.currentPlayer !== playerColor) {
      return false
    }

    // 이동 처리
    const fromRow = 8 - Number.parseInt(from[1])
    const fromCol = from.charCodeAt(0) - 97
    const toRow = 8 - Number.parseInt(to[1])
    const toCol = to.charCodeAt(0) - 97

    const piece = gameState.board[fromRow][fromCol]
    if (!piece) return false

    // 말 이동
    gameState.board[toRow][toCol] = piece
    gameState.board[fromRow][fromCol] = ""

    // 차례 변경
    gameState.currentPlayer = gameState.currentPlayer === "white" ? "black" : "white"

    // 이동 기록
    gameState.moveHistory.push(`${from}-${to}`)

    // 플레이어 활동 업데이트
    gameState.lastActivity[playerColor] = Date.now()

    this.rooms.set(roomId, room)
    return true
  }
}

// 싱글톤 인스턴스
export const gameStore = new GameStore()
