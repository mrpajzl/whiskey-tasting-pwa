"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Users,
  CalendarDays,
  Settings,
  Trash2,
  Mail,
  UserX,
  Shield,
  User,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as Id<"groups">;

  const [email, setEmail] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const currentUser = useQuery(
    api.users.getCurrentUser,
    email ? { email } : "skip"
  );
  const group = useQuery(api.groups.getGroup, { groupId });
  const sessions = useQuery(api.sessions.getGroupSessions, { groupId });

  const inviteToGroup = useMutation(api.groups.inviteToGroup);
  const updateGroup = useMutation(api.groups.updateGroup);
  const deleteGroup = useMutation(api.groups.deleteGroup);
  const removeMember = useMutation(api.groups.removeMember);
  const updateMemberRole = useMutation(api.groups.updateMemberRole);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("userEmail");
      if (!storedEmail) {
        router.push("/");
        return;
      }
      setEmail(storedEmail);
    }
  }, [router]);

  useEffect(() => {
    if (group) {
      setEditName(group.name);
      setEditDescription(group.description || "");
    }
  }, [group]);

  if (!email || !currentUser || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="text-amber-900">Loading...</div>
      </div>
    );
  }

  const currentMembership = group.members.find(
    (m) => m.userId === currentUser._id
  );
  const isAdmin = currentMembership?.role === "admin";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      await inviteToGroup({
        groupId,
        email: inviteEmail,
        invitedBy: currentUser._id,
      });
      setInviteEmail("");
      setShowInviteModal(false);
      alert("Invitation sent!");
    } catch (error: any) {
      alert(error.message || "Failed to send invitation");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGroup({
        groupId,
        name: editName,
        description: editDescription,
        userId: currentUser._id,
      });
      setShowEditModal(false);
      alert("Group updated!");
    } catch (error: any) {
      alert(error.message || "Failed to update group");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGroup({
        groupId,
        userId: currentUser._id,
      });
      router.push("/");
    } catch (error: any) {
      alert(error.message || "Failed to delete group");
    }
  };

  const handleRemoveMember = async (membershipId: Id<"groupMembers">) => {
    if (!confirm("Remove this member from the group?")) return;
    try {
      await removeMember({
        groupId,
        membershipId,
        userId: currentUser._id,
      });
    } catch (error: any) {
      alert(error.message || "Failed to remove member");
    }
  };

  const handleToggleRole = async (
    membershipId: Id<"groupMembers">,
    currentRole: "admin" | "member"
  ) => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    try {
      await updateMemberRole({
        groupId,
        membershipId,
        role: newRole,
        userId: currentUser._id,
      });
    } catch (error: any) {
      alert(error.message || "Failed to update role");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-amber-600 hover:text-amber-700 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-amber-900">{group.name}</h1>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="text-amber-600 hover:text-amber-700 p-2"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700 p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {group.description && (
          <p className="text-gray-600 mb-8">{group.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Members</p>
                <p className="text-2xl font-bold text-amber-900">
                  {group.members.length}
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
                <p className="text-2xl font-bold text-amber-900">
                  {sessions?.length || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-lg">
                <span className="text-2xl">🥃</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Bottles</p>
                <p className="text-2xl font-bold text-amber-900">
                  {sessions?.reduce((sum, s) => sum + s.bottlesCount, 0) || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-amber-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Members
            </h3>
            {isAdmin && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition flex items-center gap-2 text-sm"
              >
                <Mail className="w-4 h-4" />
                Invite
              </button>
            )}
          </div>
          <div className="space-y-3">
            {group.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.user?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {member.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      member.role === "admin"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {member.role}
                  </span>
                  {isAdmin && member.userId !== currentUser._id && (
                    <>
                      <button
                        onClick={() => handleToggleRole(member._id, member.role)}
                        className="text-amber-600 hover:text-amber-700 p-1"
                        title={
                          member.role === "admin"
                            ? "Remove admin"
                            : "Make admin"
                        }
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Remove member"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sessions Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-amber-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Tasting Sessions
            </h3>
            <Link
              href={`/groups/${groupId}/sessions/new`}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Session
            </Link>
          </div>

          {!sessions || sessions.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-amber-300 mx-auto mb-4" />
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
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {session.name}
                      </h4>
                      {session.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {session.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>
                          📅 {new Date(session.sessionDate).toLocaleDateString()}
                        </span>
                        {session.location && <span>📍 {session.location}</span>}
                        <span>🥃 {session.bottlesCount} bottles</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        session.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : session.status === "active"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-amber-900 mb-4">
              Invite Member
            </h3>
            <form onSubmit={handleInvite}>
              <label className="block text-sm text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="friend@example.com"
                required
              />
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
                >
                  Send Invite
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-amber-900 mb-4">
              Edit Group
            </h3>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Delete Group?
            </h3>
            <p className="text-gray-700 mb-6">
              This will permanently delete the group, all sessions, bottles, and
              ratings. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete Forever
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
