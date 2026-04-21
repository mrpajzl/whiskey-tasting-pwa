"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CalendarDays, LogOut, MapPin, Pencil, Plus, Star, Wine } from "lucide-react";
import AddBottleModal from "./components/AddBottleModal";
import BottleRating from "./components/BottleRating";

function formatDateTime(value: number) {
  return new Date(value).toLocaleString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<Id<"tastingSessions"> | null>(null);
  const [showBottleModal, setShowBottleModal] = useState(false);
  const [editingBottle, setEditingBottle] = useState<any | null>(null);

  const [sessionName, setSessionName] = useState("");
  const [sessionLocation, setSessionLocation] = useState("");
  const [sessionDate, setSessionDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [sessionNotes, setSessionNotes] = useState("");

  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const createSession = useMutation(api.sessions.createSession);

  const user = useQuery(api.users.getCurrentUser, email ? { email } : "skip");
  const sessions = useQuery(api.sessions.listSessionsForUser, user ? { userId: user._id } : "skip");

  const fallbackSessionId = sessions?.[0]?._id ?? null;
  const activeSessionId = selectedSessionId ?? fallbackSessionId;
  const activeSession = useQuery(
    api.sessions.getSession,
    activeSessionId ? { sessionId: activeSessionId } : "skip"
  );

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("wt_email") ?? "";
      const savedName = localStorage.getItem("wt_name") ?? "";
      const savedPassword = localStorage.getItem("wt_password") ?? "";
      if (savedEmail) setEmail(savedEmail);
      if (savedName) setName(savedName);
      if (savedPassword) setPassword(savedPassword);
    } catch {
      // ignore storage issues
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!selectedSessionId && fallbackSessionId) {
      setSelectedSessionId(fallbackSessionId);
    }
  }, [fallbackSessionId, selectedSessionId]);

  const displayName = (name || email.split("@")[0] || "host").trim();

  const stats = useMemo(() => {
    const bottleCount = sessions?.reduce((sum, session) => sum + session.bottleCount, 0) ?? 0;
    const ratingCount = sessions?.reduce((sum, session) => sum + session.ratingCount, 0) ?? 0;
    return {
      sessionCount: sessions?.length ?? 0,
      bottleCount,
      ratingCount,
    };
  }, [sessions]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!email.trim() || !password.trim()) {
      setAuthError("Vyplň email a heslo.");
      return;
    }

    if (authMode === "register" && !name.trim()) {
      setAuthError("Při registraci vyplň i jméno.");
      return;
    }

    try {
      const finalName = (
        authMode === "register" ? name.trim() : localStorage.getItem("wt_name") || email.trim().split("@")[0]
      ).trim();
      await createOrUpdateUser({ email: email.trim(), name: finalName });
      localStorage.setItem("wt_email", email.trim());
      localStorage.setItem("wt_name", finalName);
      localStorage.setItem("wt_password", password);
      setName(finalName);
    } catch {
      setAuthError("Přihlášení selhalo. Zkus to znovu.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("wt_email");
    localStorage.removeItem("wt_name");
    localStorage.removeItem("wt_password");
    setEmail("");
    setName("");
    setPassword("");
    setSelectedSessionId(null);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sessionName.trim()) return;

    const id = await createSession({
      userId: user._id,
      name: sessionName.trim(),
      hostName: displayName,
      sessionDate: new Date(sessionDate).getTime(),
      location: sessionLocation.trim() || undefined,
      notes: sessionNotes.trim() || undefined,
    });

    setSelectedSessionId(id);
    setSessionName("");
    setSessionLocation("");
    setSessionNotes("");
    setShowCreateSession(false);
  };

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-stone-950 text-stone-100">Načítám…</div>;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#78350f,_#1c1917_55%)] px-4 py-10 text-white">
        <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-white/10 p-8 backdrop-blur">
          <div className="mb-8 text-center">
            <div className="mb-3 text-5xl">🥃</div>
            <h1 className="text-3xl font-bold">Whiskey Tasting</h1>
            <p className="mt-2 text-sm text-amber-100/80">Jednoduchá appka na dnešní tasting, bez zbytečností.</p>
          </div>
          <div className="mb-4 flex rounded-2xl bg-white/10 p-1 text-sm">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
              }}
              className={`flex-1 rounded-xl px-3 py-2 ${authMode === "login" ? "bg-white text-stone-950" : "text-white/80"}`}
            >
              Přihlášení
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setAuthError("");
              }}
              className={`flex-1 rounded-xl px-3 py-2 ${authMode === "register" ? "bg-white text-stone-950" : "text-white/80"}`}
            >
              Registrace
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authMode === "register" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tvoje jméno"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-white/50"
                required
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-white/50"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Heslo"
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-white/50"
              required
            />
            {authError && <p className="text-sm text-rose-300">{authError}</p>}
            <button className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-stone-950 hover:bg-amber-400">
              {authMode === "login" ? "Přihlásit se" : "Vytvořit účet"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-4 flex flex-col gap-4 rounded-[28px] bg-stone-950 px-4 py-4 text-white shadow-xl sm:mb-6 sm:rounded-[32px] sm:px-6 sm:py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-amber-300/70">whiskey tasting</p>
            <h1 className="mt-2 text-3xl font-bold">Ahoj {displayName.split(" ")[0]}</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-300">
              Vytvoř session, naházej lahve a během ochutnávky rychle zapisuj dojmy i skóre.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateSession(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-stone-950 hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              Nová session
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm text-stone-200 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Odhlásit
            </button>
          </div>
        </header>

        <div className="mb-4 grid gap-3 sm:mb-6 sm:gap-4 sm:grid-cols-3">
          <StatCard label="Sessiony" value={stats.sessionCount} />
          <StatCard label="Lahve" value={stats.bottleCount} />
          <StatCard label="Hodnocení" value={stats.ratingCount} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
          <aside className="space-y-4">
            <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-stone-200">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Sessiony</h2>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  {sessions?.length ?? 0}
                </span>
              </div>
              <div className="space-y-3">
                {sessions?.length ? (
                  sessions.map((session) => (
                    <button
                      key={session._id}
                      onClick={() => setSelectedSessionId(session._id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        activeSessionId === session._id
                          ? "border-amber-400 bg-amber-50"
                          : "border-stone-200 bg-stone-50 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-stone-900">{session.name}</p>
                        {session.averageOverall !== null && (
                          <span className="rounded-full bg-stone-900 px-2.5 py-1 text-xs font-medium text-white">
                            {session.averageOverall.toFixed(1)}/5
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-stone-500">{formatDateTime(session.sessionDate)}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {session.bottleCount} lahví, {session.ratingCount} hodnocení
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-500">
                    Zatím nic. Vytvoř první session a můžeš začít.
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            {activeSession ? (
              <>
                <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:rounded-[32px] sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-stone-900">{activeSession.name}</h2>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-stone-600">
                        <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1">
                          <CalendarDays className="h-4 w-4" />
                          {formatDateTime(activeSession.sessionDate)}
                        </span>
                        {activeSession.location && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1">
                            <MapPin className="h-4 w-4" />
                            {activeSession.location}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1">
                          <Wine className="h-4 w-4" />
                          {activeSession.bottles.length} lahví
                        </span>
                      </div>
                      {activeSession.notes && <p className="mt-4 text-sm text-stone-600">{activeSession.notes}</p>}
                    </div>
                    <button
                      onClick={() => {
                        setEditingBottle(null);
                        setShowBottleModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white hover:bg-amber-700"
                    >
                      <Plus className="h-4 w-4" />
                      Přidat lahev
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {activeSession.bottles.length ? (
                    activeSession.bottles.map((bottle, index) => (
                      <article key={bottle._id} className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:rounded-[32px] sm:p-6">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                              vzorek {index + 1}
                            </div>
                            <h3 className="text-xl font-bold text-stone-900">{bottle.name}</h3>
                            <p className="mt-1 text-sm text-stone-600">
                              {[bottle.distillery, bottle.category ?? bottle.type, bottle.region].filter(Boolean).join(" • ") || "Bez detailů"}
                            </p>
                            <p className="mt-2 text-sm text-stone-500">
                              {[bottle.age ? `${bottle.age} yo` : null, bottle.abv ? `${bottle.abv}% ABV` : null].filter(Boolean).join(" • ")}
                            </p>
                            {(bottle.notes || bottle.description) && <p className="mt-3 text-sm text-stone-600">{bottle.notes ?? bottle.description}</p>}
                            {bottle.imageStorageId && <BottleImage storageId={bottle.imageStorageId} />}
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="flex items-center gap-2 sm:justify-end">
                              <div className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-3 py-1 text-sm font-semibold text-white">
                                <Star className="h-4 w-4 text-amber-300" />
                                {bottle.averageOverall ? `${bottle.averageOverall.toFixed(1)}/5` : "bez skóre"}
                              </div>
                              <button
                                onClick={() => {
                                  setEditingBottle(bottle);
                                  setShowBottleModal(true);
                                }}
                                className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-3 py-1 text-sm font-medium text-stone-700 hover:bg-stone-50"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Upravit
                              </button>
                            </div>
                            <p className="mt-2 text-xs text-stone-500">{bottle.ratingCount} hodnocení</p>
                          </div>
                        </div>
                        <BottleRating bottleId={bottle._id} sessionId={activeSession._id} userId={user._id} />
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[28px] border border-dashed border-stone-300 bg-white p-6 text-center text-stone-500 sm:rounded-[32px] sm:p-10">
                      Ještě tu nejsou žádné lahve. Přidej je před tastingem nebo průběžně během večera.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-stone-200 sm:rounded-[32px] sm:p-10">
                <h2 className="text-2xl font-semibold text-stone-900">Začni novou session</h2>
                <p className="mt-2 text-stone-500">Ať máš večer rychlý flow: session, lahve, hodnocení.</p>
                <button
                  onClick={() => setShowCreateSession(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white hover:bg-amber-700"
                >
                  <Plus className="h-4 w-4" />
                  Vytvořit session
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {showCreateSession && user && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/50 p-4">
          <div className="flex min-h-full items-end justify-center py-4 sm:items-center">
            <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="border-b border-stone-200 px-4 py-3 sm:px-5 sm:py-4">
              <h2 className="text-xl font-semibold text-stone-900">Nová tasting session</h2>
              <p className="text-sm text-stone-500">Jen minimum polí, ať to nezdržuje.</p>
            </div>
            <form onSubmit={handleCreateSession} className="max-h-[calc(100dvh-7rem)] space-y-4 overflow-y-auto px-4 py-4 overscroll-contain sm:px-5 sm:py-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Název session</label>
                <input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="např. Islay evening"
                  className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">Datum a čas</label>
                  <input
                    type="datetime-local"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700">Místo</label>
                  <input
                    value={sessionLocation}
                    onChange={(e) => setSessionLocation(e.target.value)}
                    placeholder="např. doma"
                    className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Poznámka</label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={3}
                  placeholder="např. blind tasting, 6 vzorků"
                  className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white hover:bg-amber-700">
                  Vytvořit session
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateSession(false)}
                  className="rounded-2xl border border-stone-300 px-4 py-3 font-medium text-stone-700 hover:bg-stone-50"
                >
                  Zrušit
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {showBottleModal && activeSession && user && (
        <AddBottleModal
          sessionId={activeSession._id}
          userId={user._id}
          bottle={editingBottle ?? undefined}
          onClose={() => {
            setShowBottleModal(false);
            setEditingBottle(null);
          }}
        />
      )}
    </main>
  );
}

function BottleImage({ storageId }: { storageId: Id<"_storage"> }) {
  const imageUrl = useQuery(api.files.getImageUrl, { storageId });

  if (!imageUrl) return null;

  return (
    <img
      src={imageUrl}
      alt="Bottle"
      className="mt-4 h-44 w-full rounded-2xl object-cover"
    />
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-stone-900">{value}</p>
    </div>
  );
}
