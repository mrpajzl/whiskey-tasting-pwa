"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BarChart3, Save, Star } from "lucide-react";

interface BottleRatingProps {
  bottleId: Id<"bottles">;
  sessionId: Id<"tastingSessions">;
  userId: Id<"users">;
}

const axes = [
  { key: "sweetness", label: "Sladkost" },
  { key: "smoke", label: "Kouř" },
  { key: "fruit", label: "Ovocnost" },
  { key: "spice", label: "Kořenitost" },
  { key: "body", label: "Plnost" },
] as const;

type AxisKey = (typeof axes)[number]["key"];

export default function BottleRating({ bottleId, sessionId, userId }: BottleRatingProps) {
  const existingRating = useQuery(api.ratings.getUserRating, { bottleId, userId });
  const saveRating = useMutation(api.ratings.addOrUpdateRating);

  const [expanded, setExpanded] = useState(false);
  const [overall, setOverall] = useState(3);
  const [values, setValues] = useState<Record<AxisKey, number>>({
    sweetness: 2,
    smoke: 2,
    fruit: 2,
    spice: 2,
    body: 2,
  });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existingRating) return;
    setOverall(existingRating.overall);
    setValues({
      sweetness: existingRating.sweetness,
      smoke: existingRating.smoke,
      fruit: existingRating.fruit,
      spice: existingRating.spice,
      body: existingRating.body,
    });
    setNotes(existingRating.notes ?? "");
  }, [existingRating]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveRating({
        bottleId,
        sessionId,
        userId,
        overall,
        sweetness: values.sweetness,
        smoke: values.smoke,
        fruit: values.fruit,
        spice: values.spice,
        body: values.body,
        notes: notes.trim() || undefined,
      });
      setExpanded(false);
    } catch (error) {
      console.error(error);
      alert("Nepodařilo se uložit hodnocení.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
      <button
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <div className="flex items-center gap-2 text-stone-900">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="font-semibold">
              {existingRating ? `Moje hodnocení ${existingRating.overall}/5` : "Přidat hodnocení"}
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Rychlé skóre + 5 jednoduchých profilů chuti
          </p>
        </div>
        <BarChart3 className="h-5 w-5 text-stone-400" />
      </button>

      {expanded && (
        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Celkový dojem: <span className="font-bold text-amber-700">{overall}/5</span>
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={overall}
              onChange={(e) => setOverall(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {axes.map((axis) => (
              <div key={axis.key}>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  {axis.label}: <span className="font-semibold text-stone-900">{values[axis.key]}/5</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={values[axis.key]}
                  onChange={(e) =>
                    setValues((current) => ({
                      ...current,
                      [axis.key]: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-600"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Poznámka</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="např. hodně kouřová, ale překvapivě sladká"
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Ukládám..." : "Uložit hodnocení"}
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="rounded-2xl border border-stone-300 px-4 py-3 font-medium text-stone-700 hover:bg-white"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
