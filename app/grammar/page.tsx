"use client";

import dynamic from "next/dynamic";

// Dynamically import the grammar content with no SSR to ensure full page load
const GrammarContent = dynamic(
  () => import("@/components/grammar/grammar-content"),
  { ssr: false }
);

export default function GrammarPage() {
  return <GrammarContent />;
}
