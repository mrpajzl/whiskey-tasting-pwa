"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function NewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as Id<"groups">;

  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const currentUser = useQuery(
    api.users.getCurrentUser,
    email ? { email } : "skip"
  );
  const group = useQuery(api.groups.getGroup, { groupId });
  const createSession = useMutation(api.sessions.createSession);

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

  if (!email || !currentUser || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="text-amber-900">Loading...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const sessionId = await createSession({
        groupId,
        name,
        description: description || undefined,
        location: location || undefined,
        sessionDate: new Date(sessionDate).getTime(),
        userId: currentUser._id,
      });

      router.push(`/sessions/${sessionId}`);
    } catch (error: any) {
      alert(error.message || "Failed to create session");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href={`/groups/${groupId}`}
            className="text-amber-600 hover:text-amber-700 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">
            New Tasting Session
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 mb-6">
            Create a new tasting session for <strong>{group.name}</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                placeholder="Spring 2024 Tasting"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                placeholder="John's Place, Local Pub..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                rows={4}
                placeholder="What's special about this session? Theme, notes, etc."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition font-semibold"
              >
                Create Session
              </button>
              <Link
                href={`/groups/${groupId}`}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
