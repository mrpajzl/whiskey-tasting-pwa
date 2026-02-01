"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, CalendarDays, LogOut, Mail } from "lucide-react";

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
            Welcome back, {name.split(' ')[0]}!
          </h2>
          <p className="text-amber-700">
            Manage your groups and tasting sessions
          </p>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Groups</p>
                <p className="text-2xl font-bold text-amber-900">
                  {userGroups?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-lg">
                <CalendarDays className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Sessions</p>
                <p className="text-2xl font-bold text-amber-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-lg">
                <span className="text-2xl">🥃</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Bottles Rated</p>
                <p className="text-2xl font-bold text-amber-900">-</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
