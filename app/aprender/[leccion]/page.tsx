import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lessonById, lessons } from "@/lib/content";
import { LessonPlayer } from "@/components/screens/LessonPlayer";

export const dynamicParams = false;

export function generateStaticParams() {
  return lessons.map((l) => ({ leccion: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ leccion: string }> }): Promise<Metadata> {
  const { leccion } = await params;
  return { title: lessonById.get(leccion)?.title };
}

export default async function Page({ params }: { params: Promise<{ leccion: string }> }) {
  const { leccion } = await params;
  if (!lessonById.has(leccion)) notFound();
  return <LessonPlayer key={leccion} lessonId={leccion} />;
}
