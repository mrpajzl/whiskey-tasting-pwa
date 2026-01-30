"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Star } from "lucide-react";

interface BottleRatingProps {
  bottleId: Id<"bottles">;
  sessionId: Id<"tastingSessions">;
  userId: Id<"users">;
}

export default function BottleRating({ bottleId, sessionId, userId }: BottleRatingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [score, setScore] = useState(5);
  const [nose, setNose] = useState("");
  const [palate, setPalate] = useState("");
  const [finish, setFinish] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const existingRating = useQuery(api.ratings.getUserRating, {
    bottleId,
    userId,
  });
  const addOrUpdateRating = useMutation(api.ratings.addOrUpdateRating);

  useEffect(() => {
    if (existingRating) {
      setScore(existingRating.score);
      setNose(existingRating.nose || "");
      setPalate(existingRating.palate || "");
      setFinish(existingRating.finish || "");
      setNotes(existingRating.notes || "");
    }
  }, [existingRating]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await addOrUpdateRating({
        bottleId,
        userId,
        sessionId,
        score,
        nose: nose || undefined,
        palate: palate || undefined,
        finish: finish || undefined,
        notes: notes || undefined,
      });
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to save rating:", error);
      alert("Failed to save rating");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full text-left"
        >
          {existingRating ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
                <span className="font-semibold text-amber-900">
                  {existingRating.score.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                Your rating • Click to edit
              </span>
            </div>
          ) : (
            <div className="text-amber-600 hover:text-amber-700 font-medium">
              + Add your rating
            </div>
          )}
        </button>
      ) : (
        <div className="space-y-4">
          {/* Score Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Score: <span className="text-2xl font-bold text-amber-600">{score.toFixed(1)}</span>/10
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.floor(score) + 1 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < score ? "text-amber-500 fill-amber-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tasting Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nose
              </label>
              <textarea
                value={nose}
                onChange={(e) => setNose(e.target.value)}
                placeholder="Aroma notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palate
              </label>
              <textarea
                value={palate}
                onChange={(e) => setPalate(e.target.value)}
                placeholder="Taste notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Finish
              </label>
              <textarea
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
                placeholder="Aftertaste notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other thoughts..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : existingRating ? "Update Rating" : "Save Rating"}
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
