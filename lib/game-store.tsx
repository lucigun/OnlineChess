declare global {
  // added to globalThis at runtime (see getter above)
  // eslint-disable-next-line no-var
  var __gameRooms: Map<string, GameRoom> | undefined
}

export type GameRoom = {
  roomId: string
  players: string[]
}

export class GameStore {
  private static instance: GameStore

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): GameStore {
    if (!GameStore.instance) {
      GameStore.instance = new GameStore()
    }
    return GameStore.instance
  }

  // --- singleton rooms map (works in any runtime) ------------------------
  private get rooms(): Map<string, GameRoom> {
    // `globalThis` is always defined (Node, Edge, Browser)
    const g = globalThis as { __gameRooms?: Map<string, GameRoom> }
    if (!g.__gameRooms) {
      g.__gameRooms = new Map<string, GameRoom>()
    }
    return g.__gameRooms
  }

  public createRoom(roomId: string, creatorId: string): GameRoom {
    if (this.rooms.has(roomId)) {
      throw new Error(`Room with id ${roomId} already exists`)
    }

    const newRoom: GameRoom = {
      roomId: roomId,
      players: [creatorId],
    }

    this.rooms.set(roomId, newRoom)
    return newRoom
  }

  public getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId)
  }

  public joinRoom(roomId: string, playerId: string): GameRoom {
    const room = this.rooms.get(roomId)

    if (!room) {
      throw new Error(`Room with id ${roomId} not found`)
    }

    if (room.players.includes(playerId)) {
      return room // Player already in the room
    }

    room.players.push(playerId)
    this.rooms.set(roomId, room)
    return room
  }

  public leaveRoom(roomId: string, playerId: string): GameRoom {
    const room = this.rooms.get(roomId)

    if (!room) {
      throw new Error(`Room with id ${roomId} not found`)
    }

    room.players = room.players.filter((id) => id !== playerId)
    this.rooms.set(roomId, room)

    if (room.players.length === 0) {
      this.deleteRoom(roomId)
    }

    return room
  }

  public deleteRoom(roomId: string): void {
    this.rooms.delete(roomId)
  }

  public getRoomsForPlayer(playerId: string): GameRoom[] {
    const playerRooms: GameRoom[] = []
    this.rooms.forEach((room) => {
      if (room.players.includes(playerId)) {
        playerRooms.push(room)
      }
    })
    return playerRooms
  }
}
