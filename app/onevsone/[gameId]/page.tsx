"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Ably from "ably";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { Chess, type Square } from "chess.js";
import { pieceLegalTargets, boardHasCapture, type CheckersBoard } from "@/lib/game";

type ChessPromotion = "q" | "r" | "b" | "n";
type Player = { _id: string; name: string; image?: string };

type Game = {
  _id: string;
  gameType: "CHESS" | "CHECKERS";
  whitePlayerId: Player;
  blackPlayerId: Player;
  boardState: string;
  turn: "white" | "black";
  status: string;
  scheduledFor: string;
  moves: Array<{ notation: string; color: "white" | "black" }>;
  playerColor: "white" | "black";
  pendingCapture: string | null;
  endReason?: string;
  winnerId?: string;
};

const CHESS_SYMBOLS: Record<string, string> = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

const PROMOTION_OPTIONS: Array<{ value: ChessPromotion; label: string }> = [
  { value: "q", label: "Ferz" },
  { value: "r", label: "Tura" },
  { value: "b", label: "Fil" },
  { value: "n", label: "Ot" },
];

const END_REASON_LABELS: Record<string, string> = {
  checkmate: "Mat qo‘yildi",
  stalemate: "Pat — durang",
  threefold: "Uch marta takrorlanish — durang",
  insufficient_material: "Yetarli kuch yo‘q — durang",
  fifty_move: "50 yurish qoidasi — durang",
  draw: "Durang",
  no_pieces: "Barcha donalar yutib olindi",
  no_moves: "Raqibda yurish qolmadi",
};

export default function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [promotionChoice, setPromotionChoice] = useState<{ from: string; to: string } | null>(null);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const latestMoveRef = useRef<HTMLLIElement>(null);
  const boardSectionRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const response = await fetch(`/api/onevsone/game/${gameId}`);
    if (response.ok) setGame(await response.json());
    else setError((await response.json()).error || "O‘yin yuklanmadi");
  }, [gameId]);

  useEffect(() => {
    queueMicrotask(() => void load());
    const client = new Ably.Realtime({
      authCallback: async (_, callback) => {
        try {
          const response = await fetch(`/api/onevsone/token?gameId=${gameId}`);
          callback(null, await response.json());
        } catch (error) {
          callback(
            error instanceof Error ? error.message : "Ably token olinmadi",
            null,
          );
        }
      },
    });
    const channel = client.channels.get(`onevsone:game:${gameId}`);
    channel.subscribe("game:update", () => void load());
    const timer = setInterval(() => void load(), 15000);
    return () => {
      clearInterval(timer);
      channel.unsubscribe();
      client.close();
    };
  }, [gameId, load]);

  useEffect(() => {
    latestMoveRef.current?.scrollIntoView({ block: "nearest" });
  }, [game?.moves.length]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch { /* not supported */ }
      }
      return;
    }
    setIsFullscreen(true);
    try { await boardSectionRef.current?.requestFullscreen(); } catch { /* not supported, CSS overlay still applies */ }
  };

  // Zanjirli urish davomida donani majburiy tanlangan holatda ushlab turish.
  const forcedSelection = useMemo(() => {
    if (game?.gameType === "CHECKERS" && game.status === "ACTIVE" && game.pendingCapture && game.turn === game.playerColor) return game.pendingCapture;
    return null;
  }, [game]);
  const effectiveSelected = forcedSelection ?? selected;

  const chessInstance = useMemo(
    () => (game?.gameType === "CHESS" ? new Chess(game.boardState) : null),
    [game],
  );
  const checkersBoard = useMemo(
    () => (game?.gameType === "CHECKERS" ? (JSON.parse(game.boardState) as CheckersBoard) : null),
    [game],
  );
  const mustCapture = useMemo(
    () => (game?.gameType === "CHECKERS" && checkersBoard ? boardHasCapture(checkersBoard, game.playerColor) : false),
    [game, checkersBoard],
  );
  const movableIds = useMemo(() => {
    const ids = new Set<string>();
    if (!game || game.status !== "ACTIVE" || game.turn !== game.playerColor) return ids;
    if (game.gameType === "CHESS" && chessInstance) {
      chessInstance.board().forEach((row, rowIndex) => row.forEach((square, columnIndex) => {
        if (square && square.color === (game.playerColor === "white" ? "w" : "b")) {
          const id = `${"abcdefgh"[columnIndex]}${8 - rowIndex}`;
          if (chessInstance.moves({ square: id as Square, verbose: true }).length > 0) ids.add(id);
        }
      }));
    } else if (game.gameType === "CHECKERS" && checkersBoard) {
      for (let row = 0; row < 8; row += 1) for (let column = 0; column < 8; column += 1) {
        if (pieceLegalTargets(checkersBoard, row, column, game.playerColor).targets.length > 0) ids.add(`${row},${column}`);
      }
    }
    return ids;
  }, [game, chessInstance, checkersBoard]);
  const legalTargets = useMemo(() => {
    const ids = new Set<string>();
    if (!game || !effectiveSelected) return ids;
    if (game.gameType === "CHESS" && chessInstance) {
      chessInstance.moves({ square: effectiveSelected as Square, verbose: true }).forEach((move) => ids.add(move.to));
    } else if (game.gameType === "CHECKERS" && checkersBoard) {
      const [row, column] = effectiveSelected.split(",").map(Number);
      pieceLegalTargets(checkersBoard, row, column, game.playerColor).targets.forEach((target) => ids.add(`${target.row},${target.column}`));
    }
    return ids;
  }, [game, effectiveSelected, chessInstance, checkersBoard]);

  const ownsPiece = useCallback((piece: string | null) => {
    if (!piece || !game) return false;
    if (game.gameType === "CHESS") return piece[0] === (game.playerColor === "white" ? "w" : "b");
    return game.playerColor === "white" ? ["r", "R"].includes(piece) : ["b", "B"].includes(piece);
  }, [game]);

  const sendMove = async (from: string, to: string, promotion?: ChessPromotion) => {
    setPromotionChoice(null);
    const response = await fetch(`/api/onevsone/game/${gameId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, promotion }),
    });
    if (!response.ok) setError((await response.json()).error || "Yurish noto‘g‘ri");
    else {
      setSelected(null);
      setError("");
      setGame(await response.json());
    }
  };

  const attemptMove = async (from: string, to: string) => {
    if (game?.gameType === "CHESS" && chessInstance) {
      const isPromotion = chessInstance.moves({ square: from as Square, verbose: true }).some((move) => move.to === to && move.promotion);
      if (isPromotion) { setPromotionChoice({ from, to }); return; }
    }
    await sendMove(from, to);
  };

  const handleCellClick = (cellId: string, piece: string | null) => {
    if (!game || game.status !== "ACTIVE") return;
    const myTurn = game.turn === game.playerColor;
    const locked = !!forcedSelection;
    if (!effectiveSelected) {
      if (myTurn && !locked && ownsPiece(piece)) setSelected(cellId);
      return;
    }
    if (legalTargets.has(cellId)) {
      void attemptMove(effectiveSelected, cellId);
      return;
    }
    if (effectiveSelected === cellId) {
      if (!locked) setSelected(null);
      return;
    }
    if (!locked && myTurn && ownsPiece(piece)) setSelected(cellId);
  };

  if (error && !game)
    return (
      <main className="mx-auto max-w-xl p-8 text-center text-red-600">
        {error}
      </main>
    );
  if (!game)
    return (
      <main className="p-8 text-center text-gray-500">
        O‘yin yuklanmoqda...
      </main>
    );
  if (game.status === "SCHEDULED")
    return (
      <main className="mx-auto max-w-xl space-y-4 p-8 text-center">
        <h1 className="text-2xl font-bold text-dark">
          O‘yin kelishilgan vaqtda boshlanadi
        </h1>
        <p className="text-gray-500">
          {new Date(game.scheduledFor).toLocaleString("uz-UZ")}
        </p>
        <Link className="font-bold text-primary" href="/onevsone">
          Arenaga qaytish
        </Link>
      </main>
    );
  if (game.status === "CANCELLED")
    return (
      <main className="mx-auto max-w-xl space-y-4 p-8 text-center">
        <h1 className="text-2xl font-bold text-dark">O‘yin bekor qilindi</h1>
        <p className="text-gray-500">
          Belgilangan vaqtdan 1 soat o‘tib hech kim kirmagani uchun o‘yin
          avtomatik bekor qilindi.
        </p>
        <Link className="font-bold text-primary" href="/onevsone">
          Arenaga qaytish
        </Link>
      </main>
    );

  const opponent = game.playerColor === "white" ? game.blackPlayerId : game.whitePlayerId;
  const inCheck = game.status === "ACTIVE" && !!chessInstance?.isCheck();
  const myTurn = game.status === "ACTIVE" && game.turn === game.playerColor;
  const winnerName = game.winnerId
    ? game.winnerId === game.whitePlayerId._id ? game.whitePlayerId.name : game.blackPlayerId.name
    : null;

  return (
    <main className="mx-auto max-w-full sm:max-w-4xl space-y-3 px-3 pb-12 sm:space-y-4 sm:px-6">
      <header className="space-y-2 border-b border-gray-200 pb-3 py-5">
        <div className="flex items-center justify-between">
          <Link
            href="/onevsone"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Arenaga qaytish
          </Link>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
            {game.gameType === "CHESS" ? "♟ Shaxmat" : "⛀ Shashka"}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">
            Raqib: <span className="font-bold text-dark">{opponent?.name || "—"}</span>
          </p>
          <h1 className="mt-0.5 text-xl font-bold text-dark sm:text-2xl">
            {game.status === "COMPLETED"
              ? "O‘yin yakunlandi"
              : `${game.turn === "white" ? "Oq" : "Qora"} donalar navbati`}
          </h1>
        </div>
        {game.status === "ACTIVE" && (myTurn || inCheck) && (
          <div className="flex flex-wrap gap-2">
            {myTurn && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                Sizning navbatingiz
              </span>
            )}
            {inCheck && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                Shoh xavf ostida!
              </span>
            )}
            {mustCapture && myTurn && !game.pendingCapture && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Urish majburiy
              </span>
            )}
            {game.pendingCapture && myTurn && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Urishni davom ettiring
              </span>
            )}
          </div>
        )}
      </header>
      
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {game.status === "COMPLETED" && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-lg font-bold text-dark">
            {winnerName ? `G‘olib: ${winnerName}` : "Durang"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {game.endReason ? END_REASON_LABELS[game.endReason] : ""}
          </p>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-160 flex-col gap-5">
        <div
          ref={boardSectionRef}
          className={
            isFullscreen
              ? "fixed inset-0 z-40 flex items-center justify-center bg-white"
              : "relative -mx-3 sm:mx-0"
          }
        >
          <button
            onClick={() => void toggleFullscreen()}
            className="absolute right-2 top-2 z-10 rounded-full bg-dark/70 p-2.5 text-white shadow-lg hover:bg-dark/90"
            aria-label={isFullscreen ? "Kichraytirish" : "To‘liq ekran"}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
          <div className={isFullscreen ? "aspect-square w-[min(100vw,100vh)]" : "w-full"}>
            <Board
              game={game}
              selected={effectiveSelected}
              legalTargets={legalTargets}
              movableIds={movableIds}
              onCellClick={handleCellClick}
              fullscreen={isFullscreen}
            />
          </div>
        </div>
        <aside className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="shrink-0 font-bold text-dark">Yurishlar</h2>
          {game.moves.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">Hali yurish qilinmagan.</p>
          ) : (
            <ol className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1 text-sm text-gray-600">
              {game.moves.map((item, index) => (
                <li
                  key={index}
                  ref={index === game.moves.length - 1 ? latestMoveRef : undefined}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full border ${item.color === "white" ? "border-gray-400 bg-white" : "border-dark bg-dark"}`}
                    title={item.color === "white" ? "Oq" : "Qora"}
                  />
                  <span className="w-5 shrink-0 text-xs font-semibold text-gray-400">{index + 1}.</span>
                  <span className="truncate font-medium text-dark">{item.notation}</span>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    
      {promotionChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5">
            <h2 className="mb-4 text-center text-sm font-bold text-dark">
              Piyodani kimga aylantiramiz?
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {PROMOTION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => void sendMove(promotionChoice.from, promotionChoice.to, option.value)}
                  className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 p-3 hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-3xl leading-none text-dark">
                    {CHESS_SYMBOLS[`${game.playerColor === "white" ? "w" : "b"}${option.value}`]}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setPromotionChoice(null)}
              className="mt-4 w-full text-center text-xs font-semibold text-gray-400 hover:text-gray-600"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Board({
  game,
  selected,
  legalTargets,
  movableIds,
  onCellClick,
  fullscreen = false,
}: {
  game: Game;
  selected: string | null;
  legalTargets: Set<string>;
  movableIds: Set<string>;
  onCellClick: (id: string, piece: string | null) => void;
  fullscreen?: boolean;
}) {
  const cells = useMemo(
    () =>
      game.gameType === "CHESS"
        ? new Chess(game.boardState)
            .board()
            .flatMap((row, rowIndex) =>
              row.map((piece, columnIndex) => ({
                id: `${"abcdefgh"[columnIndex]}${8 - rowIndex}`,
                piece: piece ? `${piece.color}${piece.type}` : null,
              })),
            )
        : (JSON.parse(game.boardState) as Array<Array<string | null>>).flatMap(
            (row, rowIndex) =>
              row.map((piece, columnIndex) => ({
                id: `${rowIndex},${columnIndex}`,
                piece,
              })),
          ),
    [game],
  );
  const displayCells = game.playerColor === "black" ? [...cells].reverse() : cells;
  const showHints = game.status === "ACTIVE" && game.turn === game.playerColor;
  const ownsPiece = (piece: string | null) => {
    if (!piece) return false;
    if (game.gameType === "CHESS") return piece[0] === (game.playerColor === "white" ? "w" : "b");
    return game.playerColor === "white" ? ["r", "R"].includes(piece) : ["b", "B"].includes(piece);
  };
  return (
    <div className={`grid aspect-square w-full grid-cols-8 overflow-hidden border-dark ${fullscreen ? "border-2" : "rounded-xl border-4"}`}>
      {displayCells.map((cell, index) => {
        const dark = (Math.floor(index / 8) + (index % 8)) % 2 === 1;
        const isSelected = selected === cell.id;
        const isTarget = legalTargets.has(cell.id);
        const dimmed = showHints && ownsPiece(cell.piece) && !movableIds.has(cell.id);
        const isBottomRow = index >= 56;
        const isLeftColumn = index % 8 === 0;
        return (
          <button
            key={cell.id}
            onClick={() => onCellClick(cell.id, cell.piece)}
            className={`${dark ? "bg-[#769656]" : "bg-[#eeeed2]"} relative grid aspect-square place-items-center ${isSelected ? "ring-4 ring-inset ring-yellow-400" : ""}`}
          >
            {game.gameType === "CHESS" && isBottomRow && (
              <span className={`absolute bottom-0.5 left-1 text-[9px] font-bold ${dark ? "text-[#eeeed2]" : "text-[#769656]"}`}>
                {cell.id[0]}
              </span>
            )}
            {game.gameType === "CHESS" && isLeftColumn && (
              <span className={`absolute top-0.5 right-1 text-[9px] font-bold ${dark ? "text-[#eeeed2]" : "text-[#769656]"}`}>
                {cell.id[1]}
              </span>
            )}
            {cell.piece && (
              <span
                className={
                  game.gameType === "CHESS"
                    ? `text-[clamp(1.75rem,8.5vmin,4.5rem)] leading-none transition-opacity ${cell.piece[0] === "w" ? "text-white drop-shadow-[0_2px_1px_rgba(0,0,0,.55)]" : "text-dark"} ${dimmed ? "opacity-40" : ""}`
                    : `h-[72%] w-[72%] rounded-full border-2 transition-opacity ${String(cell.piece).toLowerCase() === "r" ? "border-red-900 bg-red-500" : "border-gray-800 bg-gray-900"} ${cell.piece === "R" || cell.piece === "B" ? "ring-2 ring-yellow-300" : ""} ${dimmed ? "opacity-40" : ""}`
                }
              >
                {game.gameType === "CHESS" ? CHESS_SYMBOLS[cell.piece] : ""}
              </span>
            )}
            {isTarget && !cell.piece && (
              <span className="absolute h-[28%] w-[28%] rounded-full bg-black/25" />
            )}
            {isTarget && cell.piece && (
              <span className="absolute inset-1 rounded-full ring-4 ring-black/35" />
            )}
          </button>
        );
      })}
    </div>
  );
}
