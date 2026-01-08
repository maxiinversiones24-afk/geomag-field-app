"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

/* ===============================
   CONVERSIÓN DMS → DECIMAL
================================ */
function dmsToDecimal(input: string): number | null {
  const clean = input
    .replace(/[^\d.-\s]/g, " ")
    .trim()
    .split(/\s+/)
    .map(Number);

  if (clean.length === 1 && !isNaN(clean[0])) {
    return clean[0]; // ya es decimal
  }

  if (clean.length >= 2) {
    const [deg, min = 0, sec = 0] = clean;

    const sign = deg < 0 ? -1 : 1;
    const absDeg = Math.abs(deg);

    return sign * (absDeg + min / 60 + sec / 3600);
  }

  return null;
}

export default function FieldStationForm({ onSaved }: { onSaved: () => void }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    station: "",
    latitude: "",
    longitude: "",
    elevation: "",
    measured_at: "",
    grav1: "",
    grav2: "",
    grav3: "",
    mag1: "",
    mag2: "",
    mag3: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("No autenticado");
      setLoading(false);
      return;
    }

    // ✅ CONVERTIR COORDENADAS (decimal o DMS)
    const lat = dmsToDecimal(form.latitude);
    const lon = dmsToDecimal(form.longitude);

    if (lat === null || lon === null) {
      alert("Coordenadas inválidas. Usá decimal o grados minutos segundos.");
      setLoading(false);
      return;
    }

    // ✅ ARMAR FECHA + HORA (hoy + hora ingresada)
    const now = new Date();
    const [hh, mm] = form.measured_at.split(":");

    const measuredAt = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      Number(hh),
      Number(mm)
    );

    const { error } = await supabase.from("field_stations").insert({
      user_id: user.id,
      station: form.station || null,
      latitude: lat,
      longitude: lon,
      elevation: form.elevation ? Number(form.elevation) : null,
      measured_at: measuredAt.toISOString(),
      grav1: form.grav1 ? Number(form.grav1) : null,
      grav2: form.grav2 ? Number(form.grav2) : null,
      grav3: form.grav3 ? Number(form.grav3) : null,
      mag1: form.mag1 ? Number(form.mag1) : null,
      mag2: form.mag2 ? Number(form.mag2) : null,
      mag3: form.mag3 ? Number(form.mag3) : null,
    });

    if (error) {
      console.error(error);
      alert("Error guardando estación");
    } else {
      setForm({
        station: "",
        latitude: "",
        longitude: "",
        elevation: "",
        measured_at: "",
        grav1: "",
        grav2: "",
        grav3: "",
        mag1: "",
        mag2: "",
        mag3: "",
      });
      onSaved();
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        max-w-xl mx-auto
        bg-neutral-900/80 backdrop-blur
        border border-neutral-800
        rounded-2xl p-6
        space-y-6
      "
    >
      <div>
        <h2 className="text-lg font-semibold">Nueva estación</h2>
        <p className="text-sm text-neutral-400">
          Ingresá los datos medidos en campo
        </p>
      </div>

      {/* Estación */}
      <input
        name="station"
        placeholder="Estación (ej: P12)"
        value={form.station}
        onChange={handleChange}
        className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 outline-none"
      />

      {/* Coordenadas */}
      <div className="grid grid-cols-2 gap-3">
        <input
          name="latitude"
          placeholder="Lat (decimal o DMS)"
          value={form.latitude}
          onChange={handleChange}
          required
          inputMode="decimal"
          className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 outline-none"
        />

        <input
          name="longitude"
          placeholder="Lon (decimal o DMS)"
          value={form.longitude}
          onChange={handleChange}
          required
          inputMode="decimal"
          className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 outline-none"
        />

      </div>

      <p className="text-xs text-neutral-500">
        Formatos válidos: -38.1234 -- 38°12'20" -- 38 12 20
      </p>

      {/* Elevación */}
      <input
        type="number"
        step="any"
        inputMode="decimal"
        name="elevation"
        placeholder="Cota (m)"
        value={form.elevation}
        onChange={handleChange}
        className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 outline-none"
      />

      {/* Hora */}
      <div className="space-y-1">
        <label className="text-xs text-neutral-400">Hora de medición</label>
        <input
          type="time"
          name="measured_at"
          value={form.measured_at}
          onChange={handleChange}
          required
          className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Gravimetría */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-neutral-300">Gravimetría</div>
        <div className="grid grid-cols-3 gap-3">
          <input type="number" step="any" name="grav1" placeholder="G1" value={form.grav1} onChange={handleChange} className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 outline-none" />
          <input type="number" step="any" name="grav2" placeholder="G2" value={form.grav2} onChange={handleChange} className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 outline-none" />
          <input type="number" step="any" name="grav3" placeholder="G3" value={form.grav3} onChange={handleChange} className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 outline-none" />
        </div>
      </div>

      {/* Magnetometría */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-neutral-300">Magnetometría</div>
        <div className="grid grid-cols-3 gap-3">
          <input type="number" step="any" name="mag1" placeholder="M1" value={form.mag1} onChange={handleChange} className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 outline-none" />
          <input type="number" step="any" name="mag2" placeholder="M2" value={form.mag2} onChange={handleChange} className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 outline-none" />
          <input type="number" step="any" name="mag3" placeholder="M3" value={form.mag3} onChange={handleChange} className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 outline-none" />
        </div>
      </div>

      {/* Botón */}
      <button
        disabled={loading}
        className="
          w-full py-2.5 rounded-lg font-semibold
          bg-blue-600 hover:bg-blue-500
          transition
          disabled:opacity-50
        "
      >
        {loading ? "Guardando..." : "Guardar estación"}
      </button>
    </form>
  );
}
