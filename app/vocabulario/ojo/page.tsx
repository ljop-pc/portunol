import type { Metadata } from "next";
import { FalseFriendsView } from "@/components/screens/FalseFriendsView";

export const metadata: Metadata = { title: "Ojo con esta palabra" };

export default function Page() {
  return <FalseFriendsView />;
}
