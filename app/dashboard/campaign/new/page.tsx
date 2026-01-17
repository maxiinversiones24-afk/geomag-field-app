"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function NewCampaign() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function createCampaign() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !name) return;

    const { data } = await supabase
      .from("campaigns")
      .insert({
        user_id: user.id,
        name,
        description,
      })
      .select()
      .single();

    if (data) {
      router.push(`/dashboard/campaign/${data.id}`);
    }
  }

  return (
    <main
      className="
        w-full
        px-3 py-4
        space-y-4
        md:max-w-lg md:mx-auto md:py-10
      "
    >
      {/* 🔙 Volver */}
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

      {/* Card */}
      <div
        className="
          bg-neutral-900/80 backdrop-blur
          border border-neutral-800
          rounded-2xl
          p-4
          space-y-4
        "
      >
        <h1 className="text-lg font-semibold">Nueva campaña</h1>

        <input
          placeholder="Nombre de la campaña"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            w-full
            px-3 py-3
            rounded-lg
            bg-neutral-800
            border border-neutral-700
            outline-none
            focus:border-blue-500
          "
        />

        <textarea
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="
            w-full
            px-3 py-3
            rounded-lg
            bg-neutral-800
            border border-neutral-700
            outline-none
            resize-none
            focus:border-blue-500
          "
        />

        <button
          onClick={createCampaign}
          className="
            w-full
            py-3
            rounded-lg
            bg-blue-600
            hover:bg-blue-500
            font-semibold
            transition
          "
        >
          Crear campaña
        </button>
      </div>
    </main>
  );
}
