export type PieceType = "p" | "r" | "n" | "b" | "q" | "k"
export type Color = "white" | "black"

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  piece: string
  capturedPiece?: string
}

export class ChessRules {
  static isWhitePiece(piece: string): boolean {
    return piece === piece.toUpperCase()
  }

  static getPieceColor(piece: string): Color {
    return this.isWhitePiece(piece) ? "white" : "black"
  }

  static getPieceType(piece: string): PieceType {
    return piece.toLowerCase() as PieceType
  }

  static positionToSquare(pos: Position): string {
    return `${String.fromCharCode(97 + pos.col)}${8 - pos.row}`
  }

  static squareToPosition(square: string): Position {
    return {
      row: 8 - Number.parseInt(square[1]),
      col: square.charCodeAt(0) - 97,
    }
  }

  static isValidPosition(pos: Position): boolean {
    return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8
  }

  static isPathClear(board: string[][], from: Position, to: Position): boolean {
    const rowDiff = to.row - from.row
    const colDiff = to.col - from.col

    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff)
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff)

    let currentRow = from.row + rowStep
    let currentCol = from.col + colStep

    while (currentRow !== to.row || currentCol !== to.col) {
      if (board[currentRow][currentCol] !== "") {
        return false
      }
      currentRow += rowStep
      currentCol += colStep
    }

    return true
  }

  static getPossibleMoves(board: string[][], pos: Position): Position[] {
    const piece = board[pos.row][pos.col]
    if (!piece) return []

    const pieceType = this.getPieceType(piece)
    const color = this.getPieceColor(piece)
    const moves: Position[] = []

    switch (pieceType) {
      case "p":
        moves.push(...this.getPawnMoves(board, pos, color))
        break
      case "r":
        moves.push(...this.getRookMoves(board, pos, color))
        break
      case "n":
        moves.push(...this.getKnightMoves(board, pos, color))
        break
      case "b":
        moves.push(...this.getBishopMoves(board, pos, color))
        break
      case "q":
        moves.push(...this.getQueenMoves(board, pos, color))
        break
      case "k":
        moves.push(...this.getKingMoves(board, pos, color))
        break
    }

    // 킹이 체크 상태가 되는 이동은 제외
    return moves.filter((move) => !this.wouldBeInCheck(board, pos, move, color))
  }

  static getPawnMoves(board: string[][], pos: Position, color: Color): Position[] {
    const moves: Position[] = []
    const direction = color === "white" ? -1 : 1
    const startRow = color === "white" ? 6 : 1

    // 한 칸 전진
    const oneStep = { row: pos.row + direction, col: pos.col }
    if (this.isValidPosition(oneStep) && board[oneStep.row][oneStep.col] === "") {
      moves.push(oneStep)

      // 두 칸 전진 (시작 위치에서만)
      if (pos.row === startRow) {
        const twoStep = { row: pos.row + 2 * direction, col: pos.col }
        if (this.isValidPosition(twoStep) && board[twoStep.row][twoStep.col] === "") {
          moves.push(twoStep)
        }
      }
    }

    // 대각선 공격
    const attacks = [
      { row: pos.row + direction, col: pos.col - 1 },
      { row: pos.row + direction, col: pos.col + 1 },
    ]

    for (const attack of attacks) {
      if (this.isValidPosition(attack)) {
        const targetPiece = board[attack.row][attack.col]
        if (targetPiece && this.getPieceColor(targetPiece) !== color) {
          moves.push(attack)
        }
      }
    }

    return moves
  }

  static getRookMoves(board: string[][], pos: Position, color: Color): Position[] {
    const moves: Position[] = []
    const directions = [
      { row: 0, col: 1 },
      { row: 0, col: -1 },
      { row: 1, col: 0 },
      { row: -1, col: 0 },
    ]

    for (const dir of directions) {
      for (let i = 1; i < 8; i++) {
        const newPos = { row: pos.row + dir.row * i, col: pos.col + dir.col * i }

        if (!this.isValidPosition(newPos)) break

        const targetPiece = board[newPos.row][newPos.col]
        if (targetPiece === "") {
          moves.push(newPos)
        } else {
          if (this.getPieceColor(targetPiece) !== color) {
            moves.push(newPos)
          }
          break
        }
      }
    }

    return moves
  }

  static getKnightMoves(board: string[][], pos: Position, color: Color): Position[] {
    const moves: Position[] = []
    const knightMoves = [
      { row: -2, col: -1 },
      { row: -2, col: 1 },
      { row: -1, col: -2 },
      { row: -1, col: 2 },
      { row: 1, col: -2 },
      { row: 1, col: 2 },
      { row: 2, col: -1 },
      { row: 2, col: 1 },
    ]

    for (const move of knightMoves) {
      const newPos = { row: pos.row + move.row, col: pos.col + move.col }

      if (this.isValidPosition(newPos)) {
        const targetPiece = board[newPos.row][newPos.col]
        if (targetPiece === "" || this.getPieceColor(targetPiece) !== color) {
          moves.push(newPos)
        }
      }
    }

    return moves
  }

  static getBishopMoves(board: string[][], pos: Position, color: Color): Position[] {
    const moves: Position[] = []
    const directions = [
      { row: 1, col: 1 },
      { row: 1, col: -1 },
      { row: -1, col: 1 },
      { row: -1, col: -1 },
    ]

    for (const dir of directions) {
      for (let i = 1; i < 8; i++) {
        const newPos = { row: pos.row + dir.row * i, col: pos.col + dir.col * i }

        if (!this.isValidPosition(newPos)) break

        const targetPiece = board[newPos.row][newPos.col]
        if (targetPiece === "") {
          moves.push(newPos)
        } else {
          if (this.getPieceColor(targetPiece) !== color) {
            moves.push(newPos)
          }
          break
        }
      }
    }

    return moves
  }

  static getQueenMoves(board: string[][], pos: Position, color: Color): Position[] {
    return [...this.getRookMoves(board, pos, color), ...this.getBishopMoves(board, pos, color)]
  }

  static getKingMoves(board: string[][], pos: Position, color: Color): Position[] {
    const moves: Position[] = []
    const directions = [
      { row: -1, col: -1 },
      { row: -1, col: 0 },
      { row: -1, col: 1 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ]

    for (const dir of directions) {
      const newPos = { row: pos.row + dir.row, col: pos.col + dir.col }

      if (this.isValidPosition(newPos)) {
        const targetPiece = board[newPos.row][newPos.col]
        if (targetPiece === "" || this.getPieceColor(targetPiece) !== color) {
          moves.push(newPos)
        }
      }
    }

    return moves
  }

  static findKing(board: string[][], color: Color): Position | null {
    const kingPiece = color === "white" ? "K" : "k"

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === kingPiece) {
          return { row, col }
        }
      }
    }

    return null
  }

  static isSquareAttacked(board: string[][], pos: Position, byColor: Color): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece && this.getPieceColor(piece) === byColor) {
          const piecePos = { row, col }
          const moves = this.getPossibleMovesWithoutCheckValidation(board, piecePos)

          if (moves.some((move) => move.row === pos.row && move.col === pos.col)) {
            return true
          }
        }
      }
    }

    return false
  }

  static getPossibleMovesWithoutCheckValidation(board: string[][], pos: Position): Position[] {
    const piece = board[pos.row][pos.col]
    if (!piece) return []

    const pieceType = this.getPieceType(piece)
    const color = this.getPieceColor(piece)

    switch (pieceType) {
      case "p":
        return this.getPawnMoves(board, pos, color)
      case "r":
        return this.getRookMoves(board, pos, color)
      case "n":
        return this.getKnightMoves(board, pos, color)
      case "b":
        return this.getBishopMoves(board, pos, color)
      case "q":
        return this.getQueenMoves(board, pos, color)
      case "k":
        return this.getKingMoves(board, pos, color)
      default:
        return []
    }
  }

  static isInCheck(board: string[][], color: Color): boolean {
    const kingPos = this.findKing(board, color)
    if (!kingPos) return false

    const opponentColor = color === "white" ? "black" : "white"
    return this.isSquareAttacked(board, kingPos, opponentColor)
  }

  static wouldBeInCheck(board: string[][], from: Position, to: Position, color: Color): boolean {
    // 임시로 이동을 시뮬레이션
    const tempBoard = board.map((row) => [...row])
    const piece = tempBoard[from.row][from.col]
    tempBoard[to.row][to.col] = piece
    tempBoard[from.row][from.col] = ""

    return this.isInCheck(tempBoard, color)
  }

  static isCheckmate(board: string[][], color: Color): boolean {
    if (!this.isInCheck(board, color)) return false

    // 모든 말의 가능한 이동을 확인
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece && this.getPieceColor(piece) === color) {
          const moves = this.getPossibleMoves(board, { row, col })
          if (moves.length > 0) {
            return false // 가능한 이동이 있으면 체크메이트가 아님
          }
        }
      }
    }

    return true // 가능한 이동이 없으면 체크메이트
  }

  static isValidMove(board: string[][], from: Position, to: Position): boolean {
    const piece = board[from.row][from.col]
    if (!piece) return false

    const possibleMoves = this.getPossibleMoves(board, from)
    return possibleMoves.some((move) => move.row === to.row && move.col === to.col)
  }
}
