import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { computeWMMField } from "@/lib/geomagnetism/wmm/computeWMM"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    const { data: stations, error } = await supabase
      .from("field_stations")
      .select("*")
      .is("wmm_total", null)

    if (error || !stations) {
      return NextResponse.json(
        { error: "No stations to process" },
        { status: 400 }
      )
    }

    for (const s of stations) {
      try {
        if (!s.measurement_date || s.mag_avg == null) continue

        const field = computeWMMField({
          lat: Number(s.latitude),
          lon: Number(s.longitude),
          height: Number(s.elevation ?? 0),
          date: new Date(s.measurement_date),
        })

        const magCorr = s.mag_avg - field.F

        await supabase
          .from("field_stations")
          .update({
            wmm_total: field.F,
            mag_corr: magCorr,
            wmm_model: "WMM-2025",
          })
          .eq("id", s.id)
      } catch (err) {
        console.error("Error estación", s.id, err)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("PROCESS MAGNETISM ERROR:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
