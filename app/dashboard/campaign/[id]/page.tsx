"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import FieldStationForm from "@/app/dashboard/field/FieldStationForm";
import StationsList from "@/app/dashboard/field/StationsList";

export default function CampaignPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main
      className="
        w-full
        px-3 py-4
        space-y-6
        md:max-w-6xl md:mx-auto md:px-6
      "
    >
      <FieldStationForm
        campaignId={campaignId}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />

      <StationsList
        campaignId={campaignId}
        refreshKey={refreshKey}
      />
    </main>
  );
}
