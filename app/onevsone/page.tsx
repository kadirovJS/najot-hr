"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Swords, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Player = {
  _id: string;
  name: string;
  image?: string;
  role: string;
  department: string;
  gameRating: number;
  gamesWon: number;
  gamesLost: number;
};
type Challenge = {
  _id: string;
  challengerId: Player;
  opponentId: Player;
  gameType: "CHESS" | "CHECKERS";
  scheduledFor: string;
};
type Game = {
  _id: string;
  gameType: "CHESS" | "CHECKERS";
  status: "SCHEDULED" | "ACTIVE";
  scheduledFor: string;
  whitePlayerId: { _id: string; name: string };
  blackPlayerId: { _id: string; name: string };
};

export default function OneVsOnePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [viewerId, setViewerId] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Player | null>(null);
  const [gameType, setGameType] = useState<"CHESS" | "CHECKERS">("CHESS");
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    const res = await fetch("/api/onevsone");
    const data = await res.json();
    if (res.ok) {
      setPlayers(data.players);
      setLeaderboard(data.leaderboard);
      setChallenges(data.challenges);
      setGames(data.games);
      setViewerId(data.viewerId);
    }
    setLoading(false);
  };
  // Server ma’lumotlarini birinchi yuklash va keyingi yangilanishlar.
  useEffect(() => {
    queueMicrotask(() => void load());
    const interval = setInterval(() => void load(), 10000);
    return () => clearInterval(interval);
  }, []);
  const filtered = useMemo(
    () =>
      players.filter((player) =>
        `${player.name} ${player.department} ${player.role}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [players, search],
  );
  const sendChallenge = async () => {
    if (!selected) return;
    setSaving(true);
    const response = await fetch("/api/onevsone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opponentId: selected._id,
        gameType,
        scheduledFor: scheduledFor || new Date().toISOString(),
      }),
    });
    setSaving(false);
    if (!response.ok)
      return alert((await response.json()).error || "Taklif yuborilmadi");
    setSelected(null);
    setScheduledFor("");
    void load();
  };
  const answer = async (id: string, action: "accept" | "decline" | "cancel") => {
    const response = await fetch(`/api/onevsone/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await response.json();
    if (response.ok && data.gameId) router.push(`/onevsone/${data.gameId}`);
    else void load();
  };
  return (
    <main className="mx-auto max-w-6xl space-y-7 pb-16 p-5">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">
            Jamoaviy o‘yinlar
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-dark">
            1 vs 1 arena
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Ustozni tanlang, taklif yuboring va reyting uchun bellashing.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-bold text-primary hover:underline"
        >
          Dashboardga qaytish
        </Link>
      </header>
      {games.length > 0 && (
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <h2 className="mb-3 text-sm font-bold text-dark">O‘yinlarim</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {games.map((game) => (
              <Link
                key={game._id}
                href={`/onevsone/${game._id}`}
                className="relative flex flex-col gap-1 rounded-lg bg-white p-3 pb-6 text-sm font-semibold text-dark hover:text-primary"
              >
                <div className="flex items-center justify-between">
                  <span>
                    {game.gameType === "CHESS" ? "♟ Shaxmat" : "⛀ Shashka"} ·{" "}
                    {game.status === "ACTIVE"
                      ? "Davom etmoqda"
                      : "Rejalashtirilgan"}
                  </span>
                  <span className="text-primary">Kirish</span>
                </div>
                <p className="text-xs font-medium text-gray-500">
                  {game.whitePlayerId?._id === viewerId
                    ? "Siz"
                    : game.whitePlayerId?.name}{" "}
                  vs{" "}
                  {game.blackPlayerId?._id === viewerId
                    ? "Siz"
                    : game.blackPlayerId?.name}
                </p>
                <span className="absolute bottom-2 right-3 text-[10px] font-semibold text-gray-400">
                  {new Date(game.scheduledFor).toLocaleString("uz-UZ", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {challenges.length > 0 && (
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <h2 className="mb-3 text-sm font-bold text-dark">
            Kutilayotgan takliflar
          </h2>
          <div className="space-y-2">
            {challenges.map((challenge) => {
              const incoming = challenge.opponentId._id === viewerId;
              return (
                <div
                  key={challenge._id}
                  className="flex flex-col gap-3 rounded-lg bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm font-medium text-dark">
                    <b>
                      {incoming
                        ? challenge.challengerId.name
                        : challenge.opponentId.name}
                    </b>{" "}
                    · {challenge.gameType === "CHESS" ? "Shaxmat" : "Shashka"}
                  </p>
                  {incoming ? (
                    <div className="flex gap-2">
                      <Button
                        className="h-10"
                        onClick={() => void answer(challenge._id, "accept")}
                      >
                        Qabul qilish
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-10"
                        onClick={() => void answer(challenge._id, "decline")}
                      >
                        Rad etish
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500">
                        Javob kutilmoqda
                      </span>
                      <button
                        className="text-xs font-semibold text-red-500 hover:underline"
                        onClick={() => void answer(challenge._id, "cancel")}
                      >
                        Bekor qilish
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
      <div className="grid gap-7 lg:grid-cols-[1fr_300px]">
        <section>
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2 focus-within:border-primary">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              className="h-10 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ustozlarni qidiring..."
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {loading ? (
              <p className="p-8 text-center text-sm text-gray-500">
                Yuklanmoqda...
              </p>
            ) : filtered.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">
                {search
                  ? "Hech kim topilmadi. Boshqa nom bilan qidirib ko‘ring."
                  : "Hozircha boshqa faol xodimlar yo‘q."}
              </p>
            ) : (
              filtered.map((player) => (
                <article
                  key={player._id}
                  className="flex items-center gap-3 border-b border-gray-100 p-4 last:border-0"
                >
                  <Avatar player={player} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-bold text-dark">
                      {player.name}
                    </h2>
                    <p className="truncate text-xs text-gray-500">
                      {player.department} · {player.role}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-bold text-dark">
                      {player.gameRating}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {player.gamesWon}W · {player.gamesLost}L
                    </p>
                  </div>
                  <Button
                    className="h-10 shrink-0 px-4 text-sm"
                    icon={<Swords className="h-4 w-4" />}
                    onClick={() => setSelected(player)}
                  >
                    1 vs 1
                  </Button>
                </article>
              ))
            )}
          </div>
        </section>
        <aside className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-dark">Top reyting</h2>
          </div>
          <ol className="space-y-3">
            {leaderboard.map((player, index) => (
              <li key={player._id} className="flex items-center gap-3">
                <span className="w-4 text-xs font-bold text-gray-400">
                  {index + 1}
                </span>
                <Avatar player={player} small />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-dark">
                  {player.name}
                </span>
                <span className="text-sm font-bold text-primary">
                  {player.gameRating}
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/35 p-0 sm:items-center sm:justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <section className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-dark">
                {selected.name} bilan o‘yin
              </h2>
              <button
                className="p-2 text-gray-500"
                onClick={() => setSelected(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {(["CHESS", "CHECKERS"] as const).map((type) => (
                <button
                  key={type}
                  className={`rounded-xl border p-4 text-sm font-bold ${gameType === type ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-600"}`}
                  onClick={() => setGameType(type)}
                >
                  {type === "CHESS" ? "♟ Shaxmat" : "⛀ Shashka"}
                </button>
              ))}
            </div>
            <label className="mt-5 block text-sm font-semibold text-dark">
              Boshlanish vaqti{" "}
              <span className="font-normal text-gray-500">
                (bo‘sh qoldirilsa — hozir)
              </span>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(event) => setScheduledFor(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <Button
              className="mt-5 h-12 w-full"
              isLoading={saving}
              onClick={() => void sendChallenge()}
            >
              Taklif yuborish
            </Button>
          </section>
        </div>
      )}
    </main>
  );
}
function Avatar({
  player,
  small = false,
}: {
  player: Player;
  small?: boolean;
}) {
  return player.image ? (
    <img
      src={player.image}
      alt=""
      className={`${small ? "h-8 w-8" : "h-11 w-11"} rounded-full object-cover`}
    />
  ) : (
    <span
      className={`${small ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm"} grid shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary`}
    >
      {player.name.charAt(0)}
    </span>
  );
}
