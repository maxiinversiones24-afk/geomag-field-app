"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Station = {
  id: string;
  station: string | null;
  latitude: number | null;
  longitude: number | null;
  elevation: number | null;
  measured_at: string;
  measurement_date: string;

  mag_avg: number | null;
  wmm_total: number | null;
  wmm_model: string | null;
  mag_corr: number | null;

  grav1: number | null;
  grav2: number | null;
  grav3: number | null;
  mag1: number | null;
  mag2: number | null;
  mag3: number | null;
};

/* =========================
   📝 CELDA EDITABLE
========================= */
function EditableCell({
  value,
  onSave,
  type = "number",
  disabled = false,
}: {
  value: string | number | null;
  onSave: (v: string) => void;
  type?: "text" | "number";
  disabled?: boolean;
}) {
  const [v, setV] = useState(value?.toString() ?? "");

  useEffect(() => {
    setV(value?.toString() ?? "");
  }, [value]);

  return (
    <input
      value={v}
      disabled={disabled}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => !disabled && onSave(v)}
      type={type}
      className={`
        w-full px-2 py-1 rounded outline-none
        ${
          disabled
            ? "bg-transparent text-neutral-400"
            : "bg-neutral-800 focus:bg-neutral-700"
        }
      `}
    />
  );
}

export default function StationsList({
  campaignId,
  refreshKey = 0, // ✅ DEFAULT
}: {
  campaignId: string;
  refreshKey?: number;
}) {



  const supabase = createClient();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
  load();
}, [campaignId, refreshKey]);



  async function load() {
    setLoading(true);

    const { data, error } = await supabase
    .from("field_stations")
    .select("*")
    .eq("campaign_id", campaignId) // ✅ CAMBIO 6.2
    .order("measured_at", { ascending: true });


    if (!error && data) setStations(data);
    setLoading(false);
  }

  async function updateField(id: string, field: string, value: string) {
    await supabase
      .from("field_stations")
      .update({ [field]: value === "" ? null : value })
      .eq("id", id);
  }

  async function deleteStation(id: string) {
    const ok = confirm("¿Eliminar esta estación?");
    if (!ok) return;

    await supabase.from("field_stations").delete().eq("id", id);
    load();
  }

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
        s.latitude ?? "",
        s.longitude ?? "",
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
        "mag3",
      ];

      rows = stations.map((s) => [
        s.station ?? "",
        s.latitude ?? "",
        s.longitude ?? "",
        s.elevation ?? "",
        s.measured_at,
        s.mag1 ?? "",
        s.mag2 ?? "",
        s.mag3 ?? "",
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

  async function processMagnetism() {
    setLoading(true);

    try {
      const res = await fetch("/api/process-magnetism", {
        method: "POST",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error ?? "Error procesando");
      }

      await load();
      alert("Procesamiento WMM finalizado");
    } catch (e) {
      console.error(e);
      alert("Error procesando magnetismo");
    }

    setLoading(false);
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Estaciones ({stations.length})</h3>

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

          <button
            onClick={processMagnetism}
            className="text-xs px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 border border-emerald-500"
          >
            🧲 Procesar WMM
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] border border-neutral-800 rounded-lg">
        <table className="min-w-225 md:min-w-full text-sm">

          <thead className="bg-neutral-900 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2">Est</th>
              <th className="px-3 py-2">Lat</th>
              <th className="px-3 py-2">Lon</th>
              <th className="px-3 py-2">Cota</th>
              <th className="px-3 py-2">Hora</th>
              <th className="px-3 py-2">G1</th>
              <th className="px-3 py-2">G2</th>
              <th className="px-3 py-2">G3</th>
              <th className="px-3 py-2">M1</th>
              <th className="px-3 py-2">M2</th>
              <th className="px-3 py-2">M3</th>
              <th className="px-3 py-2">Mag Avg</th>
              <th className="px-3 py-2">WMM</th>
              <th className="px-3 py-2">Mag Corr</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {stations.map((s) => (
              <tr
                key={s.id}
                className="border-t border-neutral-800 hover:bg-neutral-900/50"
              >
                <td className="px-3 py-2">
                  <EditableCell
                    value={s.station}
                    type="text"
                    disabled={editingId !== s.id}
                    onSave={(v) => updateField(s.id, "station", v)}
                  />
                </td>

                <td className="px-3 py-2">
                  {typeof s.latitude === "number"
                    ? s.latitude.toFixed(5)
                    : "-"}
                </td>

                <td className="px-3 py-2">
                  {typeof s.longitude === "number"
                    ? s.longitude.toFixed(5)
                    : "-"}
                </td>

                <td className="px-3 py-2">
                  <EditableCell
                    value={s.elevation}
                    disabled={editingId !== s.id}
                    onSave={(v) => updateField(s.id, "elevation", v)}
                  />
                </td>

                <td className="px-3 py-2">
                  {new Date(s.measured_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                <td className="px-3 py-2">
                  <EditableCell
                    value={s.grav1}
                    disabled={editingId !== s.id}
                    onSave={(v) => updateField(s.id, "grav1", v)}
                  />
                </td>
                <td className="px-3 py-2">
                  <EditableCell
                    value={s.grav2}
                    disabled={editingId !== s.id}
                    onSave={(v) => updateField(s.id, "grav2", v)}
                  />
                </td>
                <td className="px-3 py-2">
                  <EditableCell
                    value={s.grav3}
                    disabled={editingId !== s.id}
                    onSave={(v) => updateField(s.id, "grav3", v)}
                  />
                </td>

                <td className="px-3 py-2">
                  <EditableCell
                    value={s.mag1}
                    disabled={editingId !== s.id}
                    onSave={(v) => updateField(s.id, "mag1", v)}
                  />
                </td>
                <td className="px-3 py-2">
                  <EditableCell
                    value={s.mag2}
                    disabled={editingId !== s.id}
                    onSave={(v) => updateField(s.id, "mag2", v)}
                  />
                </td>
                <td className="px-3 py-2">
                  <EditableCell
                    value={s.mag3}
                    disabled={editingId !== s.id}
                    onSave={(v) => updateField(s.id, "mag3", v)}
                  />
                </td>

                <td className="px-3 py-2 text-right">
                  {typeof s.mag_avg === "number"
                    ? s.mag_avg.toFixed(1)
                    : "-"}
                </td>

                <td className="px-3 py-2 text-right">
                  {typeof s.wmm_total === "number"
                    ? s.wmm_total.toFixed(1)
                    : "-"}
                </td>

                <td className="px-3 py-2 text-right font-semibold">
                  {typeof s.mag_corr === "number"
                    ? s.mag_corr.toFixed(1)
                    : "-"}
                </td>

                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    {editingId === s.id ? (
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 text-xs rounded bg-green-600 hover:bg-green-500"
                      >
                        Guardar
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingId(s.id)}
                        className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500"
                      >
                        Editar
                      </button>
                    )}

                    <button
                      onClick={() => deleteStation(s.id)}
                      className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-500"
                    >
                      Borrar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan={15} className="text-center py-4 opacity-60">
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
