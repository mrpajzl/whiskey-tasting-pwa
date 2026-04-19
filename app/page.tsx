"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  CalendarDays,
  LogOut,
  Mail,
  Star,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const currentUser = useQuery(
    api.users.getCurrentUser,
    email ? { email } : "skip"
  );
  const userGroups = useQuery(
    api.groups.getUserGroups,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const pendingInvitations = useQuery(
    api.groups.getPendingInvitations,
    email ? { email } : "skip"
  );
  const dashboard = useQuery(api.dashboard.getUserDashboard, {});

  const acceptInvitation = useMutation(api.groups.acceptInvitation);
  const declineInvitation = useMutation(api.groups.declineInvitation);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("userEmail");
      const storedName = localStorage.getItem("userName");
      if (storedEmail) {
        setEmail(storedEmail);
        setName(storedName || "");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !name) return;

    await createOrUpdateUser({
      email: inputEmail,
      name: name,
    });

    localStorage.setItem("userEmail", inputEmail);
    localStorage.setItem("userName", name);
    setEmail(inputEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setEmail(null);
    setName("");
    setInputEmail("");
  };

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold text-amber-100 mb-2">🥃</h1>
            <h2 className="text-3xl font-bold text-white mb-2">
              WhiskeyTaste
            </h2>
            <p className="text-amber-100">
              Track and share your whiskey tasting experiences
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-amber-100 mb-2 text-sm">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-amber-300/30 text-white placeholder-amber-200/50 focus:outline-none focus:border-amber-300"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-amber-100 mb-2 text-sm">
                Email
              </label>
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-amber-300/30 text-white placeholder-amber-200/50 focus:outline-none focus:border-amber-300"
                placeholder="john@example.com"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition font-semibold"
            >
              Get Started
            </button>
          </form>

          <div className="mt-8 text-amber-200 text-sm">
            <p className="mb-2">✨ Features:</p>
            <ul className="space-y-1 text-left">
              <li>• Create tasting groups with friends</li>
              <li>• Track bottles and sessions</li>
              <li>• Rate and review whiskeys</li>
              <li>• Works offline as a PWA</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🥃</span>
            <h1 className="text-2xl font-bold text-amber-900">WhiskeyTaste</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-amber-700">{name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-800"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-2">
            Welcome back, {name.split(" ")[0]}!
          </h2>
          <p className="text-amber-700">
            Manage your groups, sessions, bottles, and tasting notes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mb-8">
          <section className="bg-amber-900 text-amber-50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-amber-200/80 mb-2">
                  tasting hub
                </p>
                <h3 className="text-2xl font-bold mb-2">
                  Keep every bottle, session, and score in one place
                </h3>
                <p className="text-amber-100/85 max-w-2xl">
                  Perfect for tasting nights with friends, quick scoring at the table,
                  and looking back at what was actually worth buying again.
                </p>
              </div>
              <div className="hidden sm:flex items-center justify-center rounded-2xl bg-white/10 p-4">
                <Sparkles className="w-10 h-10 text-amber-200" />
              </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              <HeroMetric
                label="Groups"
                value={dashboard?.totalGroups ?? userGroups?.length ?? 0}
              />
              <HeroMetric
                label="Sessions"
                value={dashboard?.totalSessions ?? 0}
              />
              <HeroMetric
                label="Bottles"
                value={dashboard?.totalBottles ?? 0}
              />
              <HeroMetric
                label="Ratings"
                value={dashboard?.totalRatings ?? 0}
              />
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
            <div className="flex items-center gap-2 mb-3 text-amber-800">
              <CalendarDays className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Coming up</h3>
            </div>
            {dashboard?.upcomingSessions && dashboard.upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {dashboard.upcomingSessions.map((session) => (
                  <Link
                    key={session._id}
                    href={`/sessions/${session._id}`}
                    className="block rounded-xl border border-amber-100 p-4 hover:border-amber-300 hover:bg-amber-50/60 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-amber-950">{session.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(session.sessionDate).toLocaleDateString()} 
                          {session.location ? ` • ${session.location}` : ""}
                        </p>
                        <p className="text-xs text-amber-700 mt-2">
                          {session.bottleCount} {session.bottleCount === 1 ? "bottle" : "bottles"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-500 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                No upcoming session yet. Create one and start planning the next tasting night.
              </div>
            )}
          </section>
        </div>

        {/* Pending Invitations */}
        {pendingInvitations && pendingInvitations.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Pending Invitations
            </h3>
            <div className="space-y-3">
              {pendingInvitations.map((invite) => (
                <div
                  key={invite._id}
                  className="bg-white rounded-xl p-4 shadow-md flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {invite.group?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Invited by {invite.inviter?.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await acceptInvitation({
                            invitationId: invite._id,
                            userId: currentUser!._id,
                          });
                        } catch (error: any) {
                          alert(error.message || "Failed to accept invitation");
                        }
                      }}
                      className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await declineInvitation({
                            invitationId: invite._id,
                          });
                        } catch (error: any) {
                          alert(error.message || "Failed to decline invitation");
                        }
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groups Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-amber-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Groups
            </h3>
            <Link
              href="/groups/new"
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Group
            </Link>
          </div>

          {!userGroups || userGroups.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-md">
              <Users className="w-12 h-12 text-amber-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                You haven't joined any groups yet
              </p>
              <Link
                href="/groups/new"
                className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
              >
                Create Your First Group
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userGroups.map((group) => (
                <Link
                  key={group._id}
                  href={`/groups/${group._id}`}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border-2 border-transparent hover:border-amber-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-amber-900">
                      {group.name}
                    </h4>
                    {group.role === "admin" && (
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {group.memberCount}{" "}
                    {group.memberCount === 1 ? "member" : "members"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
            <div className="flex items-center gap-2 mb-4 text-amber-800">
              <Star className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Recent ratings</h3>
            </div>
            {dashboard?.recentRatings && dashboard.recentRatings.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentRatings.map((rating) => (
                  <div
                    key={rating._id}
                    className="flex items-center justify-between gap-4 rounded-xl bg-amber-50/70 p-4"
                  >
                    <div>
                      <p className="font-semibold text-amber-950">{rating.bottleName}</p>
                      <p className="text-sm text-gray-600">{rating.distillery}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-700">{rating.score.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">out of 10</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                No ratings yet. Add a bottle to a session and start scoring.
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-amber-900">Overview</h3>
              <span className="text-sm text-amber-700">
                Avg. score {dashboard?.averageRating ? dashboard.averageRating.toFixed(1) : "-"}
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <OverviewRow
                label="Pending invitations"
                value={pendingInvitations?.length ?? 0}
              />
              <OverviewRow
                label="Groups you are in"
                value={userGroups?.length ?? 0}
              />
              <OverviewRow
                label="Tracked sessions"
                value={dashboard?.totalSessions ?? 0}
              />
              <OverviewRow
                label="Saved bottles"
                value={dashboard?.totalBottles ?? 0}
              />
              <OverviewRow
                label="Written ratings"
                value={dashboard?.totalRatings ?? 0}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur-sm border border-white/10">
      <p className="text-sm text-amber-100/80">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function OverviewRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-amber-100 px-4 py-3">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-amber-900">{value}</span>
    </div>
  );
}
