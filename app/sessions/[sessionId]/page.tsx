"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Camera,
  Upload,
  Settings,
  Star,
  Wine,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as Id<"tastingSessions">;

  const [email, setEmail] = useState<string | null>(null);
  const [showBottleModal, setShowBottleModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bottle form state
  const [bottleName, setBottleName] = useState("");
  const [distillery, setDistillery] = useState("");
  const [age, setAge] = useState("");
  const [type, setType] = useState("Single Malt");
  const [region, setRegion] = useState("");
  const [abv, setAbv] = useState("");
  const [caskType, setCaskType] = useState("");
  const [description, setDescription] = useState("");

  // Rating form state
  const [score, setScore] = useState(5);
  const [nose, setNose] = useState("");
  const [palate, setPalate] = useState("");
  const [finish, setFinish] = useState("");
  const [notes, setNotes] = useState("");

  // Edit session state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStatus, setEditStatus] = useState<
    "upcoming" | "active" | "completed"
  >("upcoming");

  const currentUser = useQuery(
    api.users.getCurrentUser,
    email ? { email } : "skip"
  );
  const session = useQuery(api.sessions.getSession, { sessionId });
  const group = useQuery(
    api.groups.getGroup,
    session ? { groupId: session.groupId } : "skip"
  );

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const addBottle = useMutation(api.bottles.addBottle);
  const deleteBottle = useMutation(api.bottles.deleteBottle);
  const addOrUpdateRating = useMutation(api.ratings.addOrUpdateRating);
  const updateSession = useMutation(api.sessions.updateSession);
  const deleteSession = useMutation(api.sessions.deleteSession);
  const updateSessionStatus = useMutation(api.sessions.updateSessionStatus);

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
    if (session) {
      setEditName(session.name);
      setEditDescription(session.description || "");
      setEditLocation(session.location || "");
      setEditDate(new Date(session.sessionDate).toISOString().split("T")[0]);
      setEditStatus(session.status);
    }
  }, [session]);

  if (!email || !currentUser || !session || !group) {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBottle = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageStorageId: Id<"_storage"> | undefined;

      if (imageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;
      }

      await addBottle({
        sessionId,
        name: bottleName,
        distillery,
        age: age ? parseInt(age) : undefined,
        type,
        region: region || undefined,
        abv: abv ? parseFloat(abv) : undefined,
        caskType: caskType || undefined,
        description: description || undefined,
        imageStorageId,
        userId: currentUser._id,
      });

      resetBottleForm();
      setShowBottleModal(false);
    } catch (error: any) {
      alert(error.message || "Failed to add bottle");
    }
  };

  const resetBottleForm = () => {
    setBottleName("");
    setDistillery("");
    setAge("");
    setType("Single Malt");
    setRegion("");
    setAbv("");
    setCaskType("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleOpenRating = (bottle: any) => {
    setSelectedBottle(bottle);
    
    // Check if user already rated this bottle
    const existingRating = bottle.ratings?.find(
      (r: any) => r.userId === currentUser._id
    );
    
    if (existingRating) {
      setScore(existingRating.score);
      setNose(existingRating.nose || "");
      setPalate(existingRating.palate || "");
      setFinish(existingRating.finish || "");
      setNotes(existingRating.notes || "");
    } else {
      setScore(5);
      setNose("");
      setPalate("");
      setFinish("");
      setNotes("");
    }
    
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBottle) return;

    try {
      await addOrUpdateRating({
        bottleId: selectedBottle._id,
        userId: currentUser._id,
        sessionId,
        score,
        nose: nose || undefined,
        palate: palate || undefined,
        finish: finish || undefined,
        notes: notes || undefined,
      });

      setShowRatingModal(false);
      setSelectedBottle(null);
    } catch (error: any) {
      alert(error.message || "Failed to save rating");
    }
  };

  const handleDeleteBottle = async (bottleId: Id<"bottles">) => {
    if (!confirm("Delete this bottle and all its ratings?")) return;
    try {
      await deleteBottle({ bottleId });
    } catch (error: any) {
      alert(error.message || "Failed to delete bottle");
    }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSession({
        sessionId,
        name: editName,
        description: editDescription,
        location: editLocation,
        sessionDate: new Date(editDate).getTime(),
        userId: currentUser._id,
      });
      
      if (editStatus !== session.status) {
        await updateSessionStatus({
          sessionId,
          status: editStatus,
        });
      }
      
      setShowEditModal(false);
      alert("Session updated!");
    } catch (error: any) {
      alert(error.message || "Failed to update session");
    }
  };

  const handleDeleteSession = async () => {
    try {
      await deleteSession({
        sessionId,
        userId: currentUser._id,
      });
      router.push(`/groups/${session.groupId}`);
    } catch (error: any) {
      alert(error.message || "Failed to delete session");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/groups/${session.groupId}`}
                className="text-amber-600 hover:text-amber-700 transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-amber-900">
                  {session.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {new Date(session.sessionDate).toLocaleDateString()}
                  {session.location && ` • ${session.location}`}
                </p>
              </div>
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
          <div className="mt-2">
            <span
              className={`text-xs px-3 py-1 rounded-full ${
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {session.description && (
          <p className="text-gray-700 mb-6">{session.description}</p>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-amber-900">Bottles</h2>
          <button
            onClick={() => setShowBottleModal(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Bottle
          </button>
        </div>

        {!session.bottles || session.bottles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Wine className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No bottles added yet</p>
            <button
              onClick={() => setShowBottleModal(true)}
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
            >
              Add First Bottle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {session.bottles.map((bottle: any) => (
              <BottleCard
                key={bottle._id}
                bottle={bottle}
                currentUserId={currentUser._id}
                isAdmin={isAdmin}
                onRate={() => handleOpenRating(bottle)}
                onDelete={() => handleDeleteBottle(bottle._id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Bottle Modal */}
      {showBottleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold text-amber-900 mb-4">
              Add Bottle
            </h3>
            <form onSubmit={handleAddBottle}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={bottleName}
                    onChange={(e) => setBottleName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Distillery *
                  </label>
                  <input
                    type="text"
                    value={distillery}
                    onChange={(e) => setDistillery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option>Single Malt</option>
                    <option>Blended</option>
                    <option>Bourbon</option>
                    <option>Rye</option>
                    <option>Irish</option>
                    <option>Japanese</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Region
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Islay, Speyside, Kentucky..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    ABV %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={abv}
                    onChange={(e) => setAbv(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Cask Type
                  </label>
                  <input
                    type="text"
                    value={caskType}
                    onChange={(e) => setCaskType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Ex-Bourbon, Sherry, Port..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Photo
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  </div>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
                >
                  Add Bottle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBottleModal(false);
                    resetBottleForm();
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

      {/* Rating Modal */}
      {showRatingModal && selectedBottle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold text-amber-900 mb-2">
              Rate {selectedBottle.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedBottle.distillery}
            </p>
            <form onSubmit={handleSubmitRating}>
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">
                  Score: {score}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={score}
                  onChange={(e) => setScore(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Nose
                  </label>
                  <textarea
                    value={nose}
                    onChange={(e) => setNose(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={2}
                    placeholder="Aroma, scent notes..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Palate
                  </label>
                  <textarea
                    value={palate}
                    onChange={(e) => setPalate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={2}
                    placeholder="Taste, flavor profile..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Finish
                  </label>
                  <textarea
                    value={finish}
                    onChange={(e) => setFinish(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={2}
                    placeholder="Aftertaste, length..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    General Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                    placeholder="Overall impressions..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
                >
                  Save Rating
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRatingModal(false);
                    setSelectedBottle(null);
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

      {/* Edit Session Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-amber-900 mb-4">
              Edit Session
            </h3>
            <form onSubmit={handleUpdateSession}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(
                        e.target.value as "upcoming" | "active" | "completed"
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
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
              </div>
              <div className="flex gap-2 mt-6">
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
              Delete Session?
            </h3>
            <p className="text-gray-700 mb-6">
              This will permanently delete the session and all bottles and
              ratings. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteSession}
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

function BottleCard({
  bottle,
  currentUserId,
  isAdmin,
  onRate,
  onDelete,
}: {
  bottle: any;
  currentUserId: Id<"users">;
  isAdmin: boolean;
  onRate: () => void;
  onDelete: () => void;
}) {
  const imageUrl = useQuery(
    api.files.getImageUrl,
    bottle.imageStorageId ? { storageId: bottle.imageStorageId } : "skip"
  );

  const userRating = bottle.ratings?.find(
    (r: any) => r.userId === currentUserId
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={bottle.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-bold text-amber-900">{bottle.name}</h3>
        <p className="text-sm text-gray-600">{bottle.distillery}</p>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          {bottle.age && <span>{bottle.age}yo</span>}
          {bottle.type && <span>• {bottle.type}</span>}
          {bottle.abv && <span>• {bottle.abv}%</span>}
        </div>
        {bottle.avgRating !== null && (
          <div className="flex items-center gap-2 mt-3 text-amber-600">
            <Star className="w-4 h-4 fill-amber-600" />
            <span className="font-semibold">
              {bottle.avgRating.toFixed(1)}/10
            </span>
            <span className="text-xs text-gray-500">
              ({bottle.ratingsCount}{" "}
              {bottle.ratingsCount === 1 ? "rating" : "ratings"})
            </span>
          </div>
        )}
        {userRating && (
          <div className="mt-2 p-2 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-700">
              Your rating: <strong>{userRating.score}/10</strong>
            </p>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onRate}
            className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition text-sm"
          >
            {userRating ? "Edit Rating" : "Rate"}
          </button>
          {isAdmin && (
            <button
              onClick={onDelete}
              className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
