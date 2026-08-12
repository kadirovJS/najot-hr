import { Chess } from 'chess.js';

export type GameType = 'CHESS' | 'CHECKERS';
export type CheckersPiece = 'r' | 'b' | 'R' | 'B';
export type CheckersBoard = Array<Array<CheckersPiece | null>>;
export type CheckersColor = 'white' | 'black';

export const initialCheckersBoard = (): CheckersBoard => Array.from({ length: 8 }, (_, row) => Array.from({ length: 8 }, (_, column) => {
  if ((row + column) % 2 === 0) return null;
  if (row < 3) return 'b';
  if (row > 4) return 'r';
  return null;
}));

const inBounds = (row: number, column: number) => row >= 0 && row < 8 && column >= 0 && column < 8;
const ownPieces = (color: CheckersColor): CheckersPiece[] => color === 'white' ? ['r', 'R'] : ['b', 'B'];
const opponentPieces = (color: CheckersColor): CheckersPiece[] => color === 'white' ? ['b', 'B'] : ['r', 'R'];
const isOwn = (piece: CheckersPiece | null, color: CheckersColor) => !!piece && ownPieces(color).includes(piece);
const DIAGONALS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

const checkersPosition = (value: string) => {
  const match = /^([0-7]),([0-7])$/.exec(value);
  return match ? { row: Number(match[1]), column: Number(match[2]) } : null;
};

export type StepTarget = { row: number; column: number };
export type CaptureTarget = { row: number; column: number; capturedRow: number; capturedColumn: number };

export const pieceSteps = (board: CheckersBoard, row: number, column: number, piece: CheckersPiece, color: CheckersColor): StepTarget[] => {
  const isKing = piece === 'R' || piece === 'B';
  const forward = color === 'white' ? -1 : 1;
  const directions = isKing ? DIAGONALS : DIAGONALS.filter(([rowDelta]) => rowDelta === forward);
  return directions
    .map(([rowDelta, columnDelta]) => ({ row: row + rowDelta, column: column + columnDelta }))
    .filter(({ row: targetRow, column: targetColumn }) => inBounds(targetRow, targetColumn) && !board[targetRow][targetColumn]);
};

export const pieceCaptures = (board: CheckersBoard, row: number, column: number, piece: CheckersPiece, color: CheckersColor): CaptureTarget[] => {
  const opponents = opponentPieces(color);
  return DIAGONALS
    .map(([rowDelta, columnDelta]) => ({
      capturedRow: row + rowDelta,
      capturedColumn: column + columnDelta,
      row: row + rowDelta * 2,
      column: column + columnDelta * 2,
    }))
    .filter(({ capturedRow, capturedColumn, row: targetRow, column: targetColumn }) => {
      if (!inBounds(targetRow, targetColumn) || board[targetRow][targetColumn]) return false;
      const middle = board[capturedRow]?.[capturedColumn];
      return !!middle && opponents.includes(middle);
    });
};

export const boardHasCapture = (board: CheckersBoard, color: CheckersColor): boolean => {
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const piece = board[row][column];
      if (isOwn(piece, color) && pieceCaptures(board, row, column, piece!, color).length > 0) return true;
    }
  }
  return false;
};

export const hasAnyLegalMove = (board: CheckersBoard, color: CheckersColor): boolean => {
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const piece = board[row][column];
      if (!isOwn(piece, color)) continue;
      if (pieceCaptures(board, row, column, piece!, color).length > 0) return true;
      if (pieceSteps(board, row, column, piece!, color).length > 0) return true;
    }
  }
  return false;
};

export const pieceLegalTargets = (board: CheckersBoard, row: number, column: number, color: CheckersColor): { targets: StepTarget[]; mustCapture: boolean } => {
  const piece = board[row][column];
  if (!isOwn(piece, color)) return { targets: [], mustCapture: false };
  const mustCapture = boardHasCapture(board, color);
  const captures = pieceCaptures(board, row, column, piece!, color);
  if (mustCapture) return { targets: captures.map(({ row: targetRow, column: targetColumn }) => ({ row: targetRow, column: targetColumn })), mustCapture: true };
  return { targets: [...captures.map(({ row: targetRow, column: targetColumn }) => ({ row: targetRow, column: targetColumn })), ...pieceSteps(board, row, column, piece!, color)], mustCapture: false };
};

export const makeCheckersMove = (state: CheckersBoard, fromValue: string, toValue: string, color: CheckersColor): { board: CheckersBoard; captured: boolean; continued: boolean } => {
  const from = checkersPosition(fromValue);
  const to = checkersPosition(toValue);
  if (!from || !to) throw new Error('Yurish noto‘g‘ri.');
  const piece = state[from.row][from.column];
  if (!isOwn(piece, color)) throw new Error('Bu sizning donangiz emas.');
  const globalMustCapture = boardHasCapture(state, color);
  const captures = pieceCaptures(state, from.row, from.column, piece!, color);
  const capture = captures.find(({ row, column }) => row === to.row && column === to.column);
  if (!capture) {
    if (globalMustCapture) throw new Error('Urish imkoni bor — boshqa donangiz bilan urishingiz shart.');
    const step = pieceSteps(state, from.row, from.column, piece!, color).find(({ row, column }) => row === to.row && column === to.column);
    if (!step) throw new Error('Shashkada faqat diagonal yurish mumkin.');
    const next = state.map((row) => [...row]);
    next[from.row][from.column] = null;
    next[to.row][to.column] = piece === 'r' && to.row === 0 ? 'R' : piece === 'b' && to.row === 7 ? 'B' : piece;
    return { board: next, captured: false, continued: false };
  }
  const next = state.map((row) => [...row]);
  next[capture.capturedRow][capture.capturedColumn] = null;
  next[from.row][from.column] = null;
  const promoted: CheckersPiece = piece === 'r' && to.row === 0 ? 'R' : piece === 'b' && to.row === 7 ? 'B' : piece!;
  next[to.row][to.column] = promoted;
  const continued = pieceCaptures(next, to.row, to.column, promoted, color).length > 0;
  return { board: next, captured: true, continued };
};

export const initialGameState = (type: GameType) => type === 'CHESS' ? new Chess().fen() : JSON.stringify(initialCheckersBoard());
