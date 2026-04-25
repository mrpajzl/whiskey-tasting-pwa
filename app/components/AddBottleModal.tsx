"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ImagePlus, Search, Trash2, X } from "lucide-react";

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
  imageStorageId?: Id<"_storage">;
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
  const [searchText, setSearchText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const addBottle = useMutation(api.bottles.addBottle);
  const updateBottle = useMutation(api.bottles.updateBottle);
  const deleteBottle = useMutation(api.bottles.deleteBottle);
  const learnFromBottle = useMutation(api.catalog.learnFromBottle);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const existingImageUrl = useQuery(
    api.files.getImageUrl,
    bottle?.imageStorageId ? { storageId: bottle.imageStorageId } : "skip"
  );

  const normalizedSearchText = searchText.trim();
  const catalog = useQuery(
    api.catalog.searchCatalog,
    normalizedSearchText.length >= 2 ? { query: normalizedSearchText } : "skip"
  );

  useEffect(() => {
    if (!bottle) return;
    setName(bottle.name ?? "");
    setDistillery(bottle.distillery ?? "");
    setCategory(bottle.category ?? bottle.type ?? "Single Malt");
    setRegion(bottle.region ?? "");
    setAge(bottle.age?.toString() ?? "");
    setAbv(bottle.abv?.toString() ?? "");
    setNotes(bottle.notes ?? bottle.description ?? "");
    setImagePreview(null);
    setImageFile(null);
  }, [bottle]);

  const suggestions = useMemo(() => {
    if (normalizedSearchText.length < 2) return [];
    if (!catalog) return null;

    const distillerySuggestions = catalog.distilleries.map((item) => ({
      kind: "distillery" as const,
      label: item.name,
      sublabel: item.region ?? "Palírna",
      action: () => {
        setDistillery(item.name ?? "");
        if (!name.trim()) {
          setName(item.name ?? "");
        }
        setRegion(item.region ?? "");
        setSearchText("");
      },
    }));

    const bottleSuggestions = catalog.bottles.map((item) => ({
      kind: "bottle" as const,
      label: item.name,
      sublabel: [item.distillery, item.region, item.abv ? `${item.abv}%` : null].filter(Boolean).join(" • "),
      action: () => {
        setName(item.name ?? "");
        setDistillery(item.distillery ?? "");
        setCategory(item.category ?? "Single Malt");
        setRegion(item.region ?? "");
        setAge(item.age?.toString() ?? "");
        setAbv(item.abv?.toString() ?? "");
        setNotes(item.notes ?? "");
        setSearchText("");
      },
    }));

    return [...distillerySuggestions, ...bottleSuggestions].slice(0, 10);
  }, [catalog, name, normalizedSearchText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      let imageStorageId = bottle?.imageStorageId;

      if (imageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        const json = await result.json();
        imageStorageId = json.storageId;
      }

      const payload = {
        name: name.trim(),
        distillery: distillery.trim() || undefined,
        category,
        region: region.trim() || undefined,
        age: age ? parseInt(age, 10) : undefined,
        abv: abv ? parseFloat(abv) : undefined,
        notes: notes.trim() || undefined,
        imageStorageId,
      };

      if (bottle?._id) {
        await updateBottle({ bottleId: bottle._id, ...payload });
      } else {
        await addBottle({ sessionId, userId, ...payload });
      }

      await learnFromBottle({
        name: payload.name,
        distillery: payload.distillery,
        category: payload.category,
        region: payload.region,
        age: payload.age,
        abv: payload.abv,
        notes: payload.notes,
      });
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="flex min-h-full items-end justify-center py-4 sm:items-center">
        <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 sm:px-5 sm:py-4">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">{bottle ? "Upravit lahev" : "Přidat lahev"}</h2>
              <p className="text-sm text-stone-500">Katalog si pamatuje předchozí lahve a palírny.</p>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-stone-500 hover:bg-stone-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="max-h-[calc(100dvh-7rem)] space-y-4 overflow-y-auto px-4 py-4 overscroll-contain sm:px-5 sm:py-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Rychlé hledání v katalogu</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="např. Ardbeg, Lagavulin 16, Springbank"
                  className="w-full rounded-2xl border border-stone-300 py-3 pl-11 pr-4 outline-none focus:border-amber-500"
                />
              </div>
              {normalizedSearchText.length >= 2 && (
                <div className="mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                  {suggestions === null ? (
                    <div className="px-4 py-3 text-sm text-stone-500">Načítám výsledky…</div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((item, index) => (
                      <button
                        key={`${item.kind}-${item.label}-${index}`}
                        type="button"
                        onClick={item.action}
                        className="block w-full border-b border-stone-200 px-4 py-3 text-left last:border-b-0 hover:bg-white"
                      >
                        <p className="font-medium text-stone-900">{item.label}</p>
                        <p className="text-sm text-stone-500">{item.kind === "distillery" ? `Palírna • ${item.sublabel}` : item.sublabel}</p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-stone-500">V katalogu zatím nic nesedí na „{normalizedSearchText}“.</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Fotka lahve</label>
              <div className="rounded-2xl border border-dashed border-stone-300 p-4">
                {(imagePreview || existingImageUrl) ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreview ?? existingImageUrl ?? undefined}
                      alt="Bottle preview"
                      className="h-48 w-full rounded-2xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="text-sm font-medium text-rose-600 hover:text-rose-700"
                    >
                      Odebrat novou fotku
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 py-4 text-center text-stone-500">
                    <ImagePlus className="h-6 w-6" />
                    <span className="font-medium">Nahrát fotku lahve</span>
                    <span className="text-sm">JPG, PNG nebo HEIC z telefonu</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setImageFile(file);
                        if (file) {
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

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
    </div>
  );
}
