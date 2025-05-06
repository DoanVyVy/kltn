"use client";

import dynamic from "next/dynamic";

// Dynamically import the dashboard content with no SSR to ensure full page load
const DashboardContent = dynamic(
  () => import("@/components/dashboard/dashboard-content"),
  { ssr: false }
);

export default function DashboardPage() {
  return <DashboardContent />;
}
