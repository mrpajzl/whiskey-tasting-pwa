"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronDown, Save, Sparkles, Star } from "lucide-react";

interface BottleRatingProps {
  bottleId: Id<"bottles">;
  sessionId: Id<"tastingSessions">;
  userId: Id<"users">;
}

const axes = [
  { key: "sweetness", label: "Sladkost", hint: "med, vanilka, karamel", color: "#f59e0b" },
  { key: "fruit", label: "Ovocnost", hint: "citrus, jablko, sušené ovoce", color: "#ef4444" },
  { key: "spice", label: "Kořenitost", hint: "pepř, skořice, hřebíček", color: "#f97316" },
  { key: "smoke", label: "Kouř", hint: "rašelina, popel, medicinální tón", color: "#6366f1" },
  { key: "body", label: "Plnost", hint: "lehké vs. hutné a olejnaté", color: "#14b8a6" },
] as const;

type AxisKey = (typeof axes)[number]["key"];

const size = 320;
const center = size / 2;
const maxRadius = 112;

export default function BottleRating({ bottleId, sessionId, userId }: BottleRatingProps) {
  const existingRating = useQuery(api.ratings.getUserRating, { bottleId, userId });
  const saveRating = useMutation(api.ratings.addOrUpdateRating);
  const svgRef = useRef<SVGSVGElement | null>(null);

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
    setOverall(existingRating.overall ?? existingRating.score ?? 3);
    setValues({
      sweetness: existingRating.sweetness ?? 2,
      smoke: existingRating.smoke ?? 2,
      fruit: existingRating.fruit ?? 2,
      spice: existingRating.spice ?? 2,
      body: existingRating.body ?? 2,
    });
    setNotes(existingRating.notes ?? existingRating.nose ?? existingRating.palate ?? existingRating.finish ?? "");
  }, [existingRating]);

  const profileText = useMemo(() => {
    const strongest = [...axes].sort((a, b) => values[b.key] - values[a.key]).slice(0, 2);
    return strongest.map((axis) => axis.label.toLowerCase()).join(" + ");
  }, [values]);

  const pointFor = (index: number, value: number, scale = 1) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / axes.length;
    const radius = (value / 5) * maxRadius * scale;
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      angle,
    };
  };

  const radar = useMemo(() => {
    const polygon = axes
      .map((axis, index) => {
        const point = pointFor(index, values[axis.key]);
        return `${point.x},${point.y}`;
      })
      .join(" ");

    const rings = [1, 2, 3, 4, 5].map((step) =>
      axes
        .map((_, index) => {
          const point = pointFor(index, step);
          return `${point.x},${point.y}`;
        })
        .join(" ")
    );

    const spokes = axes.map((_, index) => {
      const point = pointFor(index, 5, 1.08);
      return { x: point.x, y: point.y };
    });

    const labels = axes.map((axis, index) => {
      const point = pointFor(index, 5, 1.32);
      return { ...point, label: axis.label, color: axis.color, value: values[axis.key], key: axis.key };
    });

    const dots = axes.map((axis, index) => ({
      ...pointFor(index, values[axis.key]),
      color: axis.color,
      key: axis.key,
      value: values[axis.key],
      label: axis.label,
    }));

    return { polygon, rings, spokes, labels, dots };
  }, [values]);

  const updateAxisFromPointer = (axis: AxisKey, clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * size;
    const y = ((clientY - rect.top) / rect.height) * size;

    const axisIndex = axes.findIndex((item) => item.key === axis);
    if (axisIndex === -1) return;

    const axisPoint = pointFor(axisIndex, 5);
    const vectorX = axisPoint.x - center;
    const vectorY = axisPoint.y - center;
    const pointX = x - center;
    const pointY = y - center;
    const axisLengthSquared = vectorX * vectorX + vectorY * vectorY;
    const projection = (pointX * vectorX + pointY * vectorY) / axisLengthSquared;
    const nextValue = Math.max(0, Math.min(5, Math.round(projection * 5)));

    setValues((current) => ({
      ...current,
      [axis]: nextValue,
    }));
  };

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
    <div className="overflow-hidden rounded-[28px] border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-stone-50 shadow-sm">
      <button
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left sm:px-5 sm:py-3"
      >
        <div className="flex items-center gap-2 text-stone-900">
          <Star className="h-4 w-4 text-amber-500" />
          <span className="font-semibold">
            {existingRating ? `Moje hodnocení ${existingRating.overall ?? existingRating.score ?? 3}/5` : "Ohodnotit lahev"}
          </span>
        </div>
        <ChevronDown className={`h-5 w-5 text-stone-400 transition ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="space-y-5 border-t border-amber-100 px-3 py-4 sm:space-y-6 sm:px-5 sm:py-5">
          <div className="rounded-[28px] bg-stone-950 px-3 py-4 text-white sm:rounded-[32px] sm:px-4 sm:py-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-amber-300/70">profil chuti</p>
                <p className="mt-1 text-sm text-stone-300">Nejsilnější směr: {profileText || "vyber chuť"}</p>
              </div>
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>

            <div className="mx-auto w-full max-w-[360px]">
              <svg ref={svgRef} viewBox={`0 0 ${size} ${size}`} className="h-auto w-full overflow-visible touch-none select-none">
                {radar.rings.map((ring, index) => (
                  <polygon
                    key={index}
                    points={ring}
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                  />
                ))}

                {radar.spokes.map((point, index) => (
                  <line
                    key={index}
                    x1={center}
                    y1={center}
                    x2={point.x}
                    y2={point.y}
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="1"
                  />
                ))}

                <polygon
                  points={radar.polygon}
                  fill="rgba(245,158,11,0.30)"
                  stroke="rgba(251,191,36,0.95)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />

                {radar.labels.map((label) => (
                  <g key={label.key}>
                    <text
                      x={label.x}
                      y={label.y - 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-stone-200 text-[12px] font-semibold"
                    >
                      {label.label}
                    </text>
                    <text
                      x={label.x}
                      y={label.y + 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-stone-400 text-[11px]"
                    >
                      {label.value}/5
                    </text>
                  </g>
                ))}

                {radar.dots.map((dot) => (
                  <g key={dot.key}>
                    <line
                      x1={center}
                      y1={center}
                      x2={dot.x}
                      y2={dot.y}
                      stroke={dot.color}
                      strokeOpacity="0.45"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r="30"
                      fill="transparent"
                      onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        updateAxisFromPointer(dot.key, event.clientX, event.clientY);
                      }}
                      onPointerMove={(event) => {
                        if (event.buttons === 1) {
                          updateAxisFromPointer(dot.key, event.clientX, event.clientY);
                        }
                      }}
                    />
                    <circle cx={dot.x} cy={dot.y} r="16" fill={dot.color} fillOpacity="0.18" />
                    <circle cx={dot.x} cy={dot.y} r="10" fill={dot.color} stroke="white" strokeWidth="3" />
                    <circle cx={dot.x} cy={dot.y} r="4" fill="white" />
                  </g>
                ))}
              </svg>
            </div>

            <p className="mt-3 text-center text-sm text-stone-300">
              Táhni barevné body po osách grafu. Na telefonu to funguje i prstem.
            </p>

            <div className="mt-4 rounded-2xl bg-white/8 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">celkový dojem</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-3xl font-bold text-amber-300">{overall}/5</span>
                <span className="text-sm text-stone-300">{overall <= 1 ? "slabé" : overall <= 3 ? "dobré" : "výborné"}</span>
              </div>
              <div className="mt-3 grid grid-cols-6 gap-2">
                {[0, 1, 2, 3, 4, 5].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setOverall(step)}
                    className={`h-11 rounded-2xl border text-sm font-semibold transition ${
                      overall === step
                        ? "border-amber-400 bg-amber-400 text-stone-950"
                        : "border-white/10 bg-white/6 text-stone-200 hover:bg-white/12"
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {axes.map((axis) => (
              <button
                key={axis.key}
                type="button"
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    [axis.key]: (current[axis.key] + 1) % 6,
                  }))
                }
                className="rounded-[24px] border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: axis.color }} />
                      <p className="font-semibold text-stone-900">{axis.label}</p>
                    </div>
                    <p className="mt-1 text-sm text-stone-500">{axis.hint}</p>
                  </div>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-700">
                    {values[axis.key]}/5
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-stone-700">Poznámka k lahvi</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="např. výrazná rašelina, citrus v závěru, super pitelná"
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Ukládám..." : "Uložit hodnocení"}
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="rounded-2xl border border-stone-300 px-5 py-3 font-medium text-stone-700 hover:bg-stone-50"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
