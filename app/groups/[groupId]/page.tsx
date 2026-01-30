"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Users, Mail, Calendar } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function GroupDetail() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as Id<"groups">;
  const { user, isSignedIn } = useUser();
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isSignedIn && user ? { clerkId: user.id } : "skip"
  );
  const group = useQuery(api.groups.getGroup, { groupId });
  const sessions = useQuery(api.sessions.getGroupSessions, { groupId });
  const inviteToGroup = useMutation(api.groups.inviteToGroup);

  const isAdmin =
    group?.members.find((m) => m.userId === currentUser?._id)?.role ===
    "admin";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await inviteToGroup({
        groupId,
        email: inviteEmail.trim(),
        invitedBy: currentUser._id,
      });
      setInviteEmail("");
      setShowInviteForm(false);
      alert("Invitation sent!");
    } catch (error: unknown) {
      console.error("Failed to invite:", error);
      const message = error instanceof Error ? error.message : "Failed to send invitation";
      alert(message);
    } finally {
      setIsInviting(false);
    }
  };

  if (!group || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-amber-600 hover:text-amber-700 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-amber-900">{group.name}</h1>
            {group.description && (
              <p className="text-gray-600 text-sm">{group.description}</p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sessions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-amber-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Tasting Sessions
                </h2>
                <Link
                  href={`/groups/${groupId}/sessions/new`}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Session
                </Link>
              </div>

              {!sessions || sessions.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center shadow-md">
                  <Calendar className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No sessions yet</p>
                  <Link
                    href={`/groups/${groupId}/sessions/new`}
                    className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
                  >
                    Create First Session
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <Link
                      key={session._id}
                      href={`/sessions/${session._id}`}
                      className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition border-2 border-transparent hover:border-amber-300 block"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-amber-900">
                            {session.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(session.sessionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            session.status === "active"
                              ? "bg-green-100 text-green-800"
                              : session.status === "completed"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      {session.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {session.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>🥃 {session.bottlesCount} bottles</span>
                        {session.location && <span>📍 {session.location}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Members ({group.members.length})
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="text-amber-600 hover:text-amber-700"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                )}
              </div>

              {showInviteForm && isAdmin && (
                <form onSubmit={handleInvite} className="mb-4">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isInviting}
                      className="flex-1 bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition text-sm disabled:opacity-50"
                    >
                      {isInviting ? "Sending..." : "Invite"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInviteForm(false)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {group.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50"
                  >
                    <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-semibold">
                      {member.user?.name?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
