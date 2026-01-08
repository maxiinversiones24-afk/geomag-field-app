"use client";

import { useState } from "react";
import FieldStationForm from "./FieldStationForm";
import StationsList from "./StationsList";

export default function FieldPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <main className="max-w-md mx-auto p-4">
      <FieldStationForm onSaved={() => setRefresh((v) => v + 1)} />
      <StationsList refreshKey={refresh} />
    </main>
  );
}
