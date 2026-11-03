import type { Metadata } from "next";
import { ConversationIndex } from "@/components/screens/ConversationIndex";

export const metadata: Metadata = { title: "Conversación" };

export default function Page() {
  return <ConversationIndex />;
}
