import type { Metadata } from "next";
import { VocabIndex } from "@/components/screens/VocabIndex";

export const metadata: Metadata = { title: "Vocabulario" };

export default function Page() {
  return <VocabIndex />;
}
