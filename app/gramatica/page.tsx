import type { Metadata } from "next";
import { GrammarIndex } from "@/components/screens/GrammarIndex";

export const metadata: Metadata = { title: "Gramática" };

export default function Page() {
  return <GrammarIndex />;
}
