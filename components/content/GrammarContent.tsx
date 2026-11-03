import type { GrammarTopic } from "@/lib/content/schema";
import { PtText } from "./PtText";

const PERSONS = [
  ["eu", "eu"],
  ["tu", "tu"],
  ["ele", "ele / ela / você"],
  ["nos", "nós"],
  ["eles", "eles / elas / vocês"],
] as const;

export function GrammarRule({ topic }: { topic: GrammarTopic }) {
  return (
    <div className="space-y-3">
      {topic.rule.map((r, i) => (
        <p key={i} className="text-[17px] leading-relaxed">
          {r}
        </p>
      ))}
      {topic.pattern && (
        <p className="rounded-xl bg-brand-soft p-3 font-semibold text-brand" lang="pt-PT">
          {topic.pattern}
        </p>
      )}
    </div>
  );
}

export function GrammarTables({ topic }: { topic: GrammarTopic }) {
  return (
    <div className="space-y-4">
      {topic.conjugations.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {topic.conjugations.map((c) => (
            <div key={c.verb} className="rounded-2xl bg-surface shadow-card p-3">
              <p className="font-bold" lang="pt-PT">
                {c.verb} <span className="font-normal text-ink-2">· {c.meaning}</span>
              </p>
              <table className="mt-2 w-full text-[15px]">
                <tbody>
                  {PERSONS.map(([k, label]) => (
                    <tr key={k} className="border-t border-line first:border-0">
                      <td className="py-1.5 pr-3 text-ink-2">{label}</td>
                      <td className="py-1.5 font-semibold" lang="pt-PT">
                        {c.forms[k]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {c.note && <p className="mt-2 text-sm text-ink-2">{c.note}</p>}
            </div>
          ))}
        </div>
      )}
      {topic.table && (
        <div className="overflow-x-auto rounded-2xl bg-surface shadow-card">
          <table className="w-full text-[15px]">
            <caption className="px-3 pt-3 text-left text-sm font-semibold text-ink-2">{topic.table.caption}</caption>
            <thead>
              <tr>
                {topic.table.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topic.table.rows.map((row, i) => (
                <tr key={i} className="border-t border-line">
                  {row.map((cell, j) => (
                    <td key={j} className={`px-3 py-2 ${j === 0 ? "font-semibold" : ""}`} lang={j === 0 ? "pt-PT" : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function GrammarExamples({ topic }: { topic: GrammarTopic }) {
  return (
    <div className="divide-y divide-line rounded-2xl bg-surface shadow-card px-4">
      {topic.examples.map((e) => (
        <PtText key={e.pt} example={e} />
      ))}
    </div>
  );
}

export function GrammarContrast({ topic }: { topic: GrammarTopic }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface shadow-card p-4">
        <p className="mb-2 font-semibold">Comparación con el español</p>
        <ul className="list-disc space-y-1.5 pl-5 text-[16px] leading-relaxed">
          {topic.contrastEs.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl bg-surface shadow-card p-4">
        <p className="mb-2 font-semibold">Errores frecuentes</p>
        <ul className="space-y-3">
          {topic.commonErrors.map((e) => (
            <li key={e.wrong} className="text-[16px]">
              <p className="text-bad line-through decoration-1" lang="pt-PT">
                {e.wrong}
              </p>
              <p className="font-semibold text-ok" lang="pt-PT">
                ✓ {e.right}
              </p>
              <p className="text-sm text-ink-2">{e.why}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
