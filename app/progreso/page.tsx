import type { Metadata } from "next";
import { ProgressView } from "@/components/screens/ProgressView";

export const metadata: Metadata = { title: "Mi progreso" };

export default function Page() {
  return <ProgressView />;
}
