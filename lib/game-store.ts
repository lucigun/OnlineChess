import { ChessRules } from "./chess-rules"

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
    lastMove?: {
      from: string
      to: string
      timestamp: number
    }
    isCheck?: boolean
    isCheckmate?: boolean
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

  makeMove(roomId: string, from: string, to: string, playerName: string): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId)
    if (!room) return { success: false, error: "방을 찾을 수 없습니다" }

    const gameState = room.gameState

    // 게임 상태 확인
    if (gameState.status !== "playing") {
      return { success: false, error: "게임이 진행 중이 아닙니다" }
    }

    // 플레이어 검증
    const playerColor =
      gameState.players.white === playerName ? "white" : gameState.players.black === playerName ? "black" : null

    if (!playerColor || gameState.currentPlayer !== playerColor) {
      return { success: false, error: "당신의 차례가 아닙니다" }
    }

    // 체스 규칙 검증
    const fromPos = ChessRules.squareToPosition(from)
    const toPos = ChessRules.squareToPosition(to)

    if (!ChessRules.isValidMove(gameState.board, fromPos, toPos)) {
      return { success: false, error: "유효하지 않은 이동입니다" }
    }

    // 말 이동
    const piece = gameState.board[fromPos.row][fromPos.col]
    const capturedPiece = gameState.board[toPos.row][toPos.col]

    gameState.board[toPos.row][toPos.col] = piece
    gameState.board[fromPos.row][fromPos.col] = ""

    // 이동 기록
    gameState.moveHistory.push(`${from}-${to}`)
    gameState.lastMove = {
      from,
      to,
      timestamp: Date.now(),
    }

    // 플레이어 활동 업데이트
    gameState.lastActivity[playerColor] = Date.now()

    // 차례 변경
    const nextPlayer = gameState.currentPlayer === "white" ? "black" : "white"
    gameState.currentPlayer = nextPlayer

    // 체크/체크메이트 확인
    gameState.isCheck = ChessRules.isInCheck(gameState.board, nextPlayer)
    gameState.isCheckmate = ChessRules.isCheckmate(gameState.board, nextPlayer)

    // 게임 종료 확인
    if (gameState.isCheckmate) {
      gameState.status = "finished"
      gameState.winner = playerColor // 체크메이트를 만든 플레이어가 승리
    }

    // 킹이 잡혔는지 확인 (추가 안전장치)
    const opponentKing = nextPlayer === "white" ? "K" : "k"
    let kingExists = false
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (gameState.board[row][col] === opponentKing) {
          kingExists = true
          break
        }
      }
      if (kingExists) break
    }

    if (!kingExists) {
      gameState.status = "finished"
      gameState.winner = playerColor
    }

    this.rooms.set(roomId, room)
    return { success: true }
  }
}

// 싱글톤 인스턴스
export const gameStore = new GameStore()
