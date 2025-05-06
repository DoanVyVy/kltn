"use client";

import dynamic from "next/dynamic";

// Dynamically import the vocabulary content with no SSR to ensure full page load
const VocabularyContent = dynamic(
  () => import("@/components/vocabulary/vocabulary-content"),
  { ssr: false }
);

export default function VocabularyPage() {
  return <VocabularyContent />;
}
