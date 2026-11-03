import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { conversationById, conversations } from "@/lib/content";
import { ConversationView } from "@/components/screens/ConversationView";

export const dynamicParams = false;

export function generateStaticParams() {
  return conversations.map((c) => ({ escenario: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ escenario: string }> }): Promise<Metadata> {
  const { escenario } = await params;
  return { title: conversationById.get(escenario)?.title };
}

export default async function Page({ params }: { params: Promise<{ escenario: string }> }) {
  const { escenario } = await params;
  if (!conversationById.has(escenario)) notFound();
  return <ConversationView key={escenario} conversationId={escenario} />;
}
