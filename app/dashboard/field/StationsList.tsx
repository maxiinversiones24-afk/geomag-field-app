"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Station = {
  id: string;
  station: string | null;
  latitude: number;
  longitude: number;
  elevation: number | null;
  measured_at: string;
  grav1: number | null;
  grav2: number | null;
  grav3: number | null;
  mag1: number | null;
  mag2: number | null;
};

/* =========================
   📝 CELDA EDITABLE
========================= */
function EditableCell({
  value,
  onSave,
  type = "number",
}: {
  value: string | number | null;
  onSave: (v: string) => void;
  type?: "text" | "number";
}) {
  const [v, setV] = useState(value?.toString() ?? "");

  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => onSave(v)}
      type={type}
      className="
        bg-transparent w-full outline-none
        focus:bg-neutral-800 px-1 rounded
      "
    />
  );
}

export default function StationsList({ refreshKey }: { refreshKey: number }) {
  const supabase = createClient();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, [refreshKey]);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("field_stations")
      .select("*")
      .order("measured_at", { ascending: true });

    if (!error && data) setStations(data);
    setLoading(false);
  }

  /* =========================
     💾 UPDATE CAMPO
  ========================= */
  async function updateField(id: string, field: string, value: string) {
    await supabase
      .from("field_stations")
      .update({ [field]: value === "" ? null : value })
      .eq("id", id);
  }

  /* =========================
     📥 EXPORT CSV
  ========================= */
  function exportCSV(type: "grav" | "mag") {
    if (!stations.length) return;

    let headers: string[] = [];
    let rows: any[] = [];

    if (type === "grav") {
      headers = [
        "station",
        "latitude",
        "longitude",
        "elevation",
        "measured_at",
        "grav1",
        "grav2",
        "grav3",
      ];

      rows = stations.map((s) => [
        s.station ?? "",
        s.latitude,
        s.longitude,
        s.elevation ?? "",
        s.measured_at,
        s.grav1 ?? "",
        s.grav2 ?? "",
        s.grav3 ?? "",
      ]);
    }

    if (type === "mag") {
      headers = [
        "station",
        "latitude",
        "longitude",
        "elevation",
        "measured_at",
        "mag1",
        "mag2",
      ];

      rows = stations.map((s) => [
        s.station ?? "",
        s.latitude,
        s.longitude,
        s.elevation ?? "",
        s.measured_at,
        s.mag1 ?? "",
        s.mag2 ?? "",
      ]);
    }

    const csv =
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}_stations_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-6 space-y-3">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Estaciones ({stations.length})
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => exportCSV("grav")}
            className="text-xs px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          >
            📥 Grav CSV
          </button>

          <button
            onClick={() => exportCSV("mag")}
            className="text-xs px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          >
            📥 Mag CSV
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-auto max-h-[60vh] border border-neutral-800 rounded-lg">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-neutral-900 sticky top-0">
            <tr>
              <th className="px-2 py-2 text-left">Est</th>
              <th className="px-2 py-2 text-left">Lat</th>
              <th className="px-2 py-2 text-left">Lon</th>
              <th className="px-2 py-2 text-left">Cota</th>
              <th className="px-2 py-2 text-left">Hora</th>
              <th className="px-2 py-2 text-left">G1</th>
              <th className="px-2 py-2 text-left">G2</th>
              <th className="px-2 py-2 text-left">G3</th>
              <th className="px-2 py-2 text-left">M1</th>
              <th className="px-2 py-2 text-left">M2</th>
            </tr>
          </thead>

          <tbody>
            {stations.map((s) => (
              <tr
                key={s.id}
                className="border-t border-neutral-800 hover:bg-neutral-900/50"
              >
                {/* Estación editable */}
                <td className="px-2 py-1">
                  <EditableCell
                    value={s.station}
                    type="text"
                    onSave={(v) => updateField(s.id, "station", v)}
                  />
                </td>

                {/* Coordenadas (solo lectura) */}
                <td className="px-2 py-1">{s.latitude.toFixed(5)}</td>
                <td className="px-2 py-1">{s.longitude.toFixed(5)}</td>

                {/* Cota editable */}
                <td className="px-2 py-1">
                  <EditableCell
                    value={s.elevation}
                    onSave={(v) => updateField(s.id, "elevation", v)}
                  />
                </td>

                {/* Hora */}
                <td className="px-2 py-1">
                  {new Date(s.measured_at).toLocaleTimeString()}
                </td>

                {/* Grav editable */}
                <td className="px-2 py-1">
                  <EditableCell
                    value={s.grav1}
                    onSave={(v) => updateField(s.id, "grav1", v)}
                  />
                </td>
                <td className="px-2 py-1">
                  <EditableCell
                    value={s.grav2}
                    onSave={(v) => updateField(s.id, "grav2", v)}
                  />
                </td>
                <td className="px-2 py-1">
                  <EditableCell
                    value={s.grav3}
                    onSave={(v) => updateField(s.id, "grav3", v)}
                  />
                </td>

                {/* Mag editable */}
                <td className="px-2 py-1">
                  <EditableCell
                    value={s.mag1}
                    onSave={(v) => updateField(s.id, "mag1", v)}
                  />
                </td>
                <td className="px-2 py-1">
                  <EditableCell
                    value={s.mag2}
                    onSave={(v) => updateField(s.id, "mag2", v)}
                  />
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan={10} className="text-center py-4 opacity-60">
                  Cargando...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
