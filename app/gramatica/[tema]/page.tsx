import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { grammarById, grammarTopics } from "@/lib/content";
import { GrammarSheet } from "@/components/screens/GrammarSheet";

export const dynamicParams = false;

export function generateStaticParams() {
  return grammarTopics.map((g) => ({ tema: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ tema: string }> }): Promise<Metadata> {
  const { tema } = await params;
  return { title: grammarById.get(tema)?.title };
}

export default async function Page({ params }: { params: Promise<{ tema: string }> }) {
  const { tema } = await params;
  if (!grammarById.has(tema)) notFound();
  return <GrammarSheet key={tema} topicId={tema} />;
}
