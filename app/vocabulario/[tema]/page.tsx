import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { vocabTopicById, vocabTopics } from "@/lib/content";
import { VocabTopicView } from "@/components/screens/VocabTopicView";

export const dynamicParams = false;

export function generateStaticParams() {
  return vocabTopics.map((t) => ({ tema: t.topic }));
}

export async function generateMetadata({ params }: { params: Promise<{ tema: string }> }): Promise<Metadata> {
  const { tema } = await params;
  return { title: vocabTopicById.get(tema)?.title };
}

export default async function Page({ params }: { params: Promise<{ tema: string }> }) {
  const { tema } = await params;
  if (!vocabTopicById.has(tema)) notFound();
  return <VocabTopicView key={tema} topicId={tema} />;
}
