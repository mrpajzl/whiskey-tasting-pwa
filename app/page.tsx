"use client";

export const dynamic = 'force-dynamic';

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import Link from "next/link";
import { Plus, Users, CalendarDays } from "lucide-react";

export default function Home() {
  const { user, isLoaded, isSignedIn } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isSignedIn && user ? { clerkId: user.id } : "skip"
  );
  const userGroups = useQuery(
    api.groups.getUserGroups,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  useEffect(() => {
    if (isSignedIn && user && !currentUser) {
      createOrUpdateUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || user.username || "Unknown",
        imageUrl: user.imageUrl,
      });
    }
  }, [isSignedIn, user, currentUser, createOrUpdateUser]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-amber-100 mb-2">🥃</h1>
            <h2 className="text-3xl font-bold text-white mb-2">
              WhiskeyTaste
            </h2>
            <p className="text-amber-100">
              Track and share your whiskey tasting experiences
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 hover:bg-amber-50 transition">
              <SignInButton mode="modal">
                <button className="w-full font-semibold text-amber-900">
                  Sign In
                </button>
              </SignInButton>
            </div>
            <div className="bg-amber-600 rounded-lg p-4 hover:bg-amber-700 transition">
              <SignUpButton mode="modal">
                <button className="w-full font-semibold text-white">
                  Create Account
                </button>
              </SignUpButton>
            </div>
          </div>

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
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-2">
            Welcome back, {user?.firstName || "Taster"}!
          </h2>
          <p className="text-amber-700">
            Manage your groups and tasting sessions
          </p>
        </div>

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
              {userGroups.map((group: any) => (
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
