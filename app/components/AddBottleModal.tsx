"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Trash2, X } from "lucide-react";

interface BottleDraft {
  _id?: Id<"bottles">;
  name: string;
  distillery?: string;
  category?: string;
  type?: string;
  region?: string;
  age?: number;
  abv?: number;
  notes?: string;
  description?: string;
}

interface AddBottleModalProps {
  sessionId: Id<"tastingSessions">;
  userId: Id<"users">;
  onClose: () => void;
  bottle?: BottleDraft;
}

export default function AddBottleModal({ sessionId, userId, onClose, bottle }: AddBottleModalProps) {
  const [name, setName] = useState("");
  const [distillery, setDistillery] = useState("");
  const [category, setCategory] = useState("Single Malt");
  const [region, setRegion] = useState("");
  const [age, setAge] = useState("");
  const [abv, setAbv] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const addBottle = useMutation(api.bottles.addBottle);
  const updateBottle = useMutation(api.bottles.updateBottle);
  const deleteBottle = useMutation(api.bottles.deleteBottle);

  useEffect(() => {
    if (!bottle) return;
    setName(bottle.name ?? "");
    setDistillery(bottle.distillery ?? "");
    setCategory(bottle.category ?? bottle.type ?? "Single Malt");
    setRegion(bottle.region ?? "");
    setAge(bottle.age?.toString() ?? "");
    setAbv(bottle.abv?.toString() ?? "");
    setNotes(bottle.notes ?? bottle.description ?? "");
  }, [bottle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        distillery: distillery.trim() || undefined,
        category,
        region: region.trim() || undefined,
        age: age ? parseInt(age, 10) : undefined,
        abv: abv ? parseFloat(abv) : undefined,
        notes: notes.trim() || undefined,
      };

      if (bottle?._id) {
        await updateBottle({ bottleId: bottle._id, ...payload });
      } else {
        await addBottle({ sessionId, userId, ...payload });
      }

      onClose();
    } catch (error) {
      console.error(error);
      alert(bottle?._id ? "Nepodařilo se upravit lahev." : "Nepodařilo se přidat lahev.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!bottle?._id) return;
    if (!confirm(`Opravdu smazat ${bottle.name}?`)) return;

    setIsDeleting(true);
    try {
      await deleteBottle({ bottleId: bottle._id });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Nepodařilo se smazat lahev.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-xl rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">{bottle ? "Upravit lahev" : "Přidat lahev"}</h2>
            <p className="text-sm text-stone-500">Jen to důležité, zbytek můžeš doplnit později.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-stone-500 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Název lahve</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="např. Ardbeg 10"
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Palírna</label>
              <input
                value={distillery}
                onChange={(e) => setDistillery(e.target.value)}
                placeholder="Ardbeg"
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Kategorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
              >
                <option>Single Malt</option>
                <option>Blended Malt</option>
                <option>Blended Scotch</option>
                <option>Bourbon</option>
                <option>Rye</option>
                <option>Irish</option>
                <option>Japanese</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Region</label>
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Islay"
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Stáří</label>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                inputMode="numeric"
                placeholder="10"
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">ABV %</label>
              <input
                value={abv}
                onChange={(e) => setAbv(e.target.value)}
                inputMode="decimal"
                placeholder="46"
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Poznámka</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="např. první vzorek večera"
              rows={3}
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="flex-1 rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {isSubmitting ? (bottle ? "Ukládám..." : "Přidávám...") : bottle ? "Uložit změny" : "Přidat lahev"}
            </button>

            {bottle?._id && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300 px-4 py-3 font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Mažu..." : "Smazat"}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-stone-300 px-4 py-3 font-medium text-stone-700 hover:bg-stone-50"
            >
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
