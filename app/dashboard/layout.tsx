import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
