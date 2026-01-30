"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Star, Edit, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import BottleRating from "@/app/components/BottleRating";
import AddBottleModal from "@/app/components/AddBottleModal";

export default function SessionDetail() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as Id<"tastingSessions">;
  const { user, isSignedIn } = useUser();
  const [showAddBottle, setShowAddBottle] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState<Id<"bottles"> | null>(null);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isSignedIn && user ? { clerkId: user.id } : "skip"
  );
  const session = useQuery(api.sessions.getSession, { sessionId });
  const updateStatus = useMutation(api.sessions.updateSessionStatus);
  const deleteBottle = useMutation(api.bottles.deleteBottle);

  if (!session || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <p className="text-amber-900">Loading...</p>
      </div>
    );
  }

  const handleStatusChange = async (status: "upcoming" | "active" | "completed") => {
    await updateStatus({ sessionId, status });
  };

  const handleDeleteBottle = async (bottleId: Id<"bottles">) => {
    if (confirm("Are you sure you want to delete this bottle and all its ratings?")) {
      await deleteBottle({ bottleId });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 pb-20">
      <header className="bg-white shadow-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-amber-600 hover:text-amber-700 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-amber-900">{session.name}</h1>
              <p className="text-sm text-gray-600">
                {new Date(session.sessionDate).toLocaleDateString()} 
                {session.location && ` • ${session.location}`}
              </p>
            </div>
            <select
              value={session.status}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          {session.description && (
            <p className="text-gray-700 mt-2 ml-10">{session.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-amber-900">
            Bottles ({session.bottles.length})
          </h2>
          <button
            onClick={() => setShowAddBottle(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Bottle
          </button>
        </div>

        {session.bottles.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-md">
            <div className="text-6xl mb-4">🥃</div>
            <p className="text-gray-600 mb-4">No bottles added yet</p>
            <button
              onClick={() => setShowAddBottle(true)}
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
            >
              Add Your First Bottle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {session.bottles.map((bottle) => (
              <div
                key={bottle._id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {bottle.imageUrl && (
                      <img
                        src={bottle.imageUrl}
                        alt={bottle.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-amber-900">
                            {bottle.name}
                          </h3>
                          <p className="text-gray-700">{bottle.distillery}</p>
                          <div className="flex gap-2 mt-1 text-sm text-gray-600">
                            {bottle.age && <span>{bottle.age}yr</span>}
                            {bottle.type && <span>• {bottle.type}</span>}
                            {bottle.abv && <span>• {bottle.abv}%</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {bottle.avgRating !== null && (
                            <div className="bg-amber-100 px-3 py-1 rounded-lg flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                              <span className="font-semibold text-amber-900">
                                {bottle.avgRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <button
                            onClick={() => handleDeleteBottle(bottle._id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {bottle.description && (
                        <p className="text-gray-600 text-sm mb-3">
                          {bottle.description}
                        </p>
                      )}
                      <div className="flex gap-2 text-xs text-gray-500">
                        {bottle.region && <span>📍 {bottle.region}</span>}
                        {bottle.caskType && <span>🛢️ {bottle.caskType}</span>}
                        <span>💬 {bottle.ratingsCount} ratings</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="border-t border-gray-200 bg-amber-50/50 p-4">
                  <BottleRating
                    bottleId={bottle._id}
                    sessionId={sessionId}
                    userId={currentUser._id}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showAddBottle && (
        <AddBottleModal
          sessionId={sessionId}
          userId={currentUser._id}
          onClose={() => setShowAddBottle(false)}
        />
      )}
    </div>
  );
}
