"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type Campaign = {
  id: string;
  name: string;
  description: string | null;
};

export default function Dashboard() {
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setCampaigns(data);
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Campañas</h1>

      <Link
        href="/dashboard/campaign/new"
        className="block p-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-center"
      >
        ➕ Crear campaña
      </Link>

      <div className="space-y-3">
        {campaigns.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/campaign/${c.id}`}
            className="block p-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          >
            <div className="font-semibold">{c.name}</div>
            {c.description && (
              <div className="text-sm text-neutral-400">
                {c.description}
              </div>
            )}
          </Link>
        ))}

        {campaigns.length === 0 && (
          <p className="text-neutral-500 text-sm">
            Todavía no creaste campañas.
          </p>
        )}
      </div>
    </main>
  );
}
