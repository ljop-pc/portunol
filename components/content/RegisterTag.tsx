import type { z } from "zod";
import type { RegisterSchema } from "@/lib/content/schema";

const LABEL = { informal: "informal", neutro: "neutro", formal: "formal" } as const;

export function RegisterTag({ register }: { register: z.infer<typeof RegisterSchema> }) {
  return (
    <span className="ml-1 inline-block rounded-md bg-surface-2 px-1.5 py-0.5 align-middle text-[11px] font-medium text-ink-2">
      {LABEL[register]}
    </span>
  );
}
