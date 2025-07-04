import type { ChessPiece, Position, PieceColor, PieceType } from "./types"

export function createInitialBoard(): (ChessPiece | null)[][] {
  const board: (ChessPiece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // 백색 말 배치
  const whiteBackRow: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]
  for (let col = 0; col < 8; col++) {
    board[7][col] = { type: whiteBackRow[col], color: "white" }
    board[6][col] = { type: "pawn", color: "white" }
  }

  // 흑색 말 배치
  const blackBackRow: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: blackBackRow[col], color: "black" }
    board[1][col] = { type: "pawn", color: "black" }
  }

  return board
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8
}

export function getValidMoves(board: (ChessPiece | null)[][], from: Position, piece: ChessPiece): Position[] {
  const moves: Position[] = []

  switch (piece.type) {
    case "pawn":
      moves.push(...getPawnMoves(board, from, piece.color))
      break
    case "rook":
      moves.push(...getRookMoves(board, from, piece.color))
      break
    case "knight":
      moves.push(...getKnightMoves(board, from, piece.color))
      break
    case "bishop":
      moves.push(...getBishopMoves(board, from, piece.color))
      break
    case "queen":
      moves.push(...getQueenMoves(board, from, piece.color))
      break
    case "king":
      moves.push(...getKingMoves(board, from, piece.color))
      break
  }

  return moves.filter(isValidPosition)
}

function getPawnMoves(board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] {
  const moves: Position[] = []
  const direction = color === "white" ? -1 : 1
  const startRow = color === "white" ? 6 : 1

  // 앞으로 한 칸
  const oneStep = { row: from.row + direction, col: from.col }
  if (isValidPosition(oneStep) && !board[oneStep.row][oneStep.col]) {
    moves.push(oneStep)

    // 시작 위치에서 두 칸
    if (from.row === startRow) {
      const twoStep = { row: from.row + 2 * direction, col: from.col }
      if (isValidPosition(twoStep) && !board[twoStep.row][twoStep.col]) {
        moves.push(twoStep)
      }
    }
  }

  // 대각선 공격
  const attacks = [
    { row: from.row + direction, col: from.col - 1 },
    { row: from.row + direction, col: from.col + 1 },
  ]

  attacks.forEach((pos) => {
    if (isValidPosition(pos) && board[pos.row][pos.col] && board[pos.row][pos.col]!.color !== color) {
      moves.push(pos)
    }
  })

  return moves
}

function getRookMoves(board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] {
  const moves: Position[] = []
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]

  directions.forEach(([dRow, dCol]) => {
    for (let i = 1; i < 8; i++) {
      const pos = { row: from.row + i * dRow, col: from.col + i * dCol }
      if (!isValidPosition(pos)) break

      const piece = board[pos.row][pos.col]
      if (!piece) {
        moves.push(pos)
      } else {
        if (piece.color !== color) moves.push(pos)
        break
      }
    }
  })

  return moves
}

function getKnightMoves(board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] {
  const moves: Position[] = []
  const knightMoves = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ]

  knightMoves.forEach(([dRow, dCol]) => {
    const pos = { row: from.row + dRow, col: from.col + dCol }
    if (isValidPosition(pos)) {
      const piece = board[pos.row][pos.col]
      if (!piece || piece.color !== color) {
        moves.push(pos)
      }
    }
  })

  return moves
}

function getBishopMoves(board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] {
  const moves: Position[] = []
  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ]

  directions.forEach(([dRow, dCol]) => {
    for (let i = 1; i < 8; i++) {
      const pos = { row: from.row + i * dRow, col: from.col + i * dCol }
      if (!isValidPosition(pos)) break

      const piece = board[pos.row][pos.col]
      if (!piece) {
        moves.push(pos)
      } else {
        if (piece.color !== color) moves.push(pos)
        break
      }
    }
  })

  return moves
}

function getQueenMoves(board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] {
  return [...getRookMoves(board, from, color), ...getBishopMoves(board, from, color)]
}

function getKingMoves(board: (ChessPiece | null)[][], from: Position, color: PieceColor): Position[] {
  const moves: Position[] = []
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]

  directions.forEach(([dRow, dCol]) => {
    const pos = { row: from.row + dRow, col: from.col + dCol }
    if (isValidPosition(pos)) {
      const piece = board[pos.row][pos.col]
      if (!piece || piece.color !== color) {
        moves.push(pos)
      }
    }
  })

  return moves
}

export function isInCheck(board: (ChessPiece | null)[][], kingColor: PieceColor): boolean {
  // 킹의 위치 찾기
  let kingPos: Position | null = null
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.type === "king" && piece.color === kingColor) {
        kingPos = { row, col }
        break
      }
    }
    if (kingPos) break
  }

  if (!kingPos) return false

  // 상대방 말들이 킹을 공격할 수 있는지 확인
  const opponentColor = kingColor === "white" ? "black" : "white"
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === opponentColor) {
        const moves = getValidMoves(board, { row, col }, piece)
        if (moves.some((move) => move.row === kingPos!.row && move.col === kingPos!.col)) {
          return true
        }
      }
    }
  }

  return false
}

export function isCheckmate(board: (ChessPiece | null)[][], color: PieceColor): boolean {
  if (!isInCheck(board, color)) return false

  // 모든 가능한 수를 시도해서 체크에서 벗어날 수 있는지 확인
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col }, piece)
        for (const move of moves) {
          // 임시로 수를 둬보기
          const tempBoard = board.map((row) => [...row])
          tempBoard[move.row][move.col] = piece
          tempBoard[row][col] = null

          if (!isInCheck(tempBoard, color)) {
            return false // 체크에서 벗어날 수 있음
          }
        }
      }
    }
  }

  return true // 체크메이트
}
