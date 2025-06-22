import { ChessRules } from "./chess-rules"

/* ---------- Types ------------------------------------------------------ */

export interface GameRoom {
  id: string
  name: string
  creator: string
  gameState: {
    board: string[][]
    currentPlayer: "white" | "black"
    players: { white?: string; black?: string }
    status: "waiting" | "playing" | "finished"
    winner?: "white" | "black" | "draw"
    moveHistory: string[]
    lastActivity: { white?: number; black?: number }
    disconnectedPlayer?: "white" | "black"
    lastMove?: { from: string; to: string; timestamp: number }
    isCheck?: boolean
    isCheckmate?: boolean
  }
}

/* ---------- Helpers & constants --------------------------------------- */

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

const DISCONNECT_TIMEOUT = 30_000 // 30 s

/* ---------- Make the rooms map survive per-process reloads ------------- */

declare global {
  // will live on globalThis in any runtime (Edge / Node / Browser)
  // eslint-disable-next-line no-var
  var __gameRooms: Map<string, GameRoom> | undefined
}

/* ---------- Store implementation -------------------------------------- */

class GameStore {
  /* use one Map per serverless function instance */
  private get rooms(): Map<string, GameRoom> {
    if (!globalThis.__gameRooms) {
      globalThis.__gameRooms = new Map<string, GameRoom>()
    }
    return globalThis.__gameRooms
  }

  /* ---------- CRUD ---------------------------------------------------- */

  createRoom(roomName: string, playerName: string): string {
    const id = Math.random().toString(36).slice(2, 12)
    const room: GameRoom = {
      id,
      name: roomName,
      creator: playerName,
      gameState: {
        board: initialBoard.map((r) => [...r]),
        currentPlayer: "white",
        players: { white: playerName },
        status: "waiting",
        moveHistory: [],
        lastActivity: { white: Date.now() },
      },
    }
    this.rooms.set(id, room)
    return id
  }

  getRoom(id: string) {
    return this.rooms.get(id)
  }

  getAllRooms() {
    return [...this.rooms.values()]
  }

  /* ---------- Lobby helpers ------------------------------------------ */

  joinRoom(id: string, playerName: string) {
    const room = this.getRoom(id)
    if (!room) return null

    const gs = room.gameState
    if (gs.players.white === playerName) return "white"
    if (gs.players.black === playerName) return "black"

    if (!gs.players.black) {
      gs.players.black = playerName
      gs.lastActivity.black = Date.now()
      if (gs.players.white) gs.status = "playing"
      return "black"
    }
    return null
  }

  /* ---------- Heart-beat & disconnect --------------------------------- */

  updateActivity(id: string, playerName: string) {
    const room = this.getRoom(id)
    if (!room) return false
    const color =
      room.gameState.players.white === playerName
        ? "white"
        : room.gameState.players.black === playerName
          ? "black"
          : null

    if (!color) return false
    room.gameState.lastActivity[color] = Date.now()
    return true
  }

  checkDisconnect(id: string) {
    const room = this.getRoom(id)
    if (!room || room.gameState.status !== "playing") return false

    const now = Date.now()
    const { lastActivity, players } = room.gameState
    let disconnected: "white" | "black" | null = null

    if (players.white && lastActivity.white && now - lastActivity.white > DISCONNECT_TIMEOUT) disconnected = "white"
    if (players.black && lastActivity.black && now - lastActivity.black > DISCONNECT_TIMEOUT) disconnected = "black"

    if (disconnected) {
      room.gameState.status = "finished"
      room.gameState.winner = disconnected === "white" ? "black" : "white"
      room.gameState.disconnectedPlayer = disconnected
    }
    return Boolean(disconnected)
  }

  /* ---------- Moves (uses ChessRules) --------------------------------- */

  makeMove(id: string, from: string, to: string, playerName: string) {
    const room = this.getRoom(id)
    if (!room) return { success: false, error: "방을 찾을 수 없습니다" }

    const gs = room.gameState
    if (gs.status !== "playing") return { success: false, error: "게임이 진행 중이 아닙니다" }

    const turnColor = gs.currentPlayer === "white" ? gs.players.white : gs.players.black
    if (turnColor !== playerName) return { success: false, error: "당신의 차례가 아닙니다" }

    /* validate with full ChessRules (omitted for brevity) */
    const fromPos = ChessRules.squareToPosition(from)
    const toPos = ChessRules.squareToPosition(to)
    if (!ChessRules.isValidMove(gs.board, fromPos, toPos)) return { success: false, error: "유효하지 않은 이동입니다" }

    const movingPiece = gs.board[fromPos.row][fromPos.col]
    gs.board[toPos.row][toPos.col] = movingPiece
    gs.board[fromPos.row][fromPos.col] = ""
    gs.lastMove = { from, to, timestamp: Date.now() }
    gs.moveHistory.push(`${from}-${to}`)

    gs.currentPlayer = gs.currentPlayer === "white" ? "black" : "white"
    gs.lastActivity[gs.currentPlayer] = Date.now()

    gs.isCheck = ChessRules.isInCheck(gs.board, gs.currentPlayer)
    gs.isCheckmate = ChessRules.isCheckmate(gs.board, gs.currentPlayer)
    if (gs.isCheckmate) {
      gs.status = "finished"
      gs.winner = playerName === turnColor ? turnColor : undefined
    }
    return { success: true }
  }
}

/* single shared instance */
export const gameStore = new GameStore()
