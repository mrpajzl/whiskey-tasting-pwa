"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewSessionPage() {
  const params = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href={`/groups/${params.groupId}`}
            className="text-amber-600 hover:text-amber-700 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">New Tasting Session</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-amber-600">Coming soon: Create tasting sessions</p>
        </div>
      </main>
    </div>
  );
}
