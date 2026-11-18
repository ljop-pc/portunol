import type { Metadata } from "next";
import { ReviewView } from "@/components/screens/ReviewView";

export const metadata: Metadata = { title: "Repaso de hoy" };

export default function Page() {
  return <ReviewView />;
}
