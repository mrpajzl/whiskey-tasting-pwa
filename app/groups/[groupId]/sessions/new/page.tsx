"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function NewSession() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as Id<"groups">;
  const { user, isSignedIn } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isSignedIn && user ? { clerkId: user.id } : "skip"
  );
  const group = useQuery(api.groups.getGroup, { groupId });
  const createSession = useMutation(api.sessions.createSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !name.trim()) return;

    setIsSubmitting(true);
    try {
      const sessionId = await createSession({
        groupId,
        userId: currentUser._id,
        name: name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        sessionDate: new Date(sessionDate).getTime(),
      });

      router.push(`/sessions/${sessionId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      const message = error instanceof Error ? error.message : "Failed to create session";
      alert(message);
    } finally {
      setIsSubmitting(false);
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
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href={`/groups/${groupId}`}
            className="text-amber-600 hover:text-amber-700 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-amber-900">
              Create Tasting Session
            </h1>
            <p className="text-sm text-gray-600">{group.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., January Tasting Night"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., John's House"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this tasting about? Any theme or special occasion?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
              rows={4}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-medium text-amber-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>1. Create the session</li>
              <li>2. Add bottles to the session</li>
              <li>3. Start tasting and rating!</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition disabled:opacity-50 font-medium text-lg"
            >
              {isSubmitting ? "Creating..." : "Create Session"}
            </button>
            <Link
              href={`/groups/${groupId}`}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
