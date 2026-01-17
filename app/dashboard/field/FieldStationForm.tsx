"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";


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

export default function FieldStationForm({
  campaignId,
  onSaved,
}: {
  campaignId: string;
  onSaved?: () => void;
}) {

  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    station: "",
    latitude: "",
    latHem: "S",   // S o N
    longitude: "",
    lonHem: "W",   // W = Oeste (O)
    elevation: "",
    measurement_date: "",
    measurement_time: "",
    grav1: "",
    grav2: "",
    grav3: "",
    mag1: "",
    mag2: "",
    mag3: "",
  });

  function handleChange(
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {

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
    let lat = dmsToDecimal(form.latitude);
let lon = dmsToDecimal(form.longitude);

if (lat === null || lon === null) {
  alert("Coordenadas inválidas. Usá decimal o grados minutos segundos.");
  setLoading(false);
  return;
}

// 🔴 CAMBIO 4 — aplicar hemisferio
lat = form.latHem === "S" ? -Math.abs(lat) : Math.abs(lat);
lon = form.lonHem === "W" ? -Math.abs(lon) : Math.abs(lon);


    // ✅ ARMAR FECHA + HORA (hoy + hora ingresada)
    const measuredAt = new Date(
  `${form.measurement_date}T${form.measurement_time}:00Z`
);

  
    const mags = [form.mag1, form.mag2, form.mag3]
      .map((v) => (v ? Number(v) : null))
      .filter((v): v is number => v !== null);

    const magAvg =
      mags.length > 0 ? mags.reduce((a, b) => a + b, 0) / mags.length : null;

    const { error } = await supabase.from("field_stations").insert({
      campaign_id: campaignId,

      user_id: user.id,
      station: form.station || null,
      latitude: lat,
      longitude: lon,
      elevation: form.elevation ? Number(form.elevation) : null,

      measurement_date: form.measurement_date,
      measurement_time: form.measurement_time,
      measured_at: measuredAt.toISOString(),

      grav1: form.grav1 ? Number(form.grav1) : null,
      grav2: form.grav2 ? Number(form.grav2) : null,
      grav3: form.grav3 ? Number(form.grav3) : null,

      mag1: form.mag1 ? Number(form.mag1) : null,
      mag2: form.mag2 ? Number(form.mag2) : null,
      mag3: form.mag3 ? Number(form.mag3) : null,

      mag_avg: magAvg,       // ✅ NUEVO
      igrf_total: null,      // se calculará después
      mag_corr: null,        // se calculará después
    });

    if (error) {
      console.error(error);
      alert("Error guardando estación");
    } else {
      setForm({
        station: "",
        latitude: "",
        latHem: "S",      // 🔴 FIX
        longitude: "",
        lonHem: "W",      // 🔴 FIX
        elevation: "",
        measurement_date: "",
        measurement_time: "",
        grav1: "",
        grav2: "",
        grav3: "",
        mag1: "",
        mag2: "",
        mag3: "",
      });

      onSaved?.();

    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full md:max-w-xl md:mx-auto

        bg-neutral-900/80 backdrop-blur
        border border-neutral-800
        rounded-2xl p-6
        space-y-6
      "
    >

      <Link
        href="/dashboard"
        className="
          inline-flex items-center gap-2
          text-sm font-medium
          text-blue-400
          hover:text-blue-300
          active:opacity-70
        "
      >
        ← Volver a campañas
      </Link>

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
      <div className="grid grid-cols-1 gap-3">

      {/* LATITUD */}
      <div className="flex gap-2">
        <input
          name="latitude"
          placeholder="Lat (decimal o DMS)"
          value={form.latitude}
          onChange={handleChange}
          required
          inputMode="decimal"
          className="flex-1 p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 outline-none"
        />
        <select
          name="latHem"
          value={form.latHem}
          onChange={handleChange}
          className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700"
        >
          <option value="N">N</option>
          <option value="S">S</option>
        </select>
      </div>

      {/* LONGITUD */}
      <div className="flex gap-2">
        <input
          name="longitude"
          placeholder="Lon (decimal o DMS)"
          value={form.longitude}
          onChange={handleChange}
          required
          inputMode="decimal"
          className="flex-1 p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 outline-none"
        />
        <select
          name="lonHem"
          value={form.lonHem}
          onChange={handleChange}
          className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700"
        >
          <option value="E">E</option>
          <option value="W">O</option>
        </select>
      </div>
    </div>


      <p className="text-xs text-neutral-500">
        Formatos válidos: 38.1234 -- 38°12'20" -- 38 12 20
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

      {/* Fecha y hora */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-neutral-400">Fecha</label>
          <input
            type="date"
            name="measurement_date"
            value={form.measurement_date}
            onChange={handleChange}
            required
            className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-neutral-400">Hora</label>
          <input
            type="time"
            name="measurement_time"
            value={form.measurement_time}
            onChange={handleChange}
            required
            className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 outline-none"
          />
        </div>
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
