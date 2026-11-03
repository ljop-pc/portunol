import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-10 text-center">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-ink-2">Página no encontrada.</p>
      <Link href="/" className="mt-6 inline-block font-semibold text-brand">
        Volver al inicio
      </Link>
    </div>
  );
}
