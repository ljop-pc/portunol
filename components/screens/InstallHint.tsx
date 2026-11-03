"use client";
import { useState, useSyncExternalStore } from "react";

const KEY = "pdb:install-hint-dismissed";
const noop = () => () => {};

function shouldShow(): boolean {
  try {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const isIos = /iPhone|iPad|iPod/.test(nav.userAgent);
    const standalone = nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
    return isIos && !standalone && localStorage.getItem(KEY) !== "1";
  } catch {
    return false;
  }
}

/** Sugerencia para instalar la app en la pantalla de inicio del iPhone. */
export function InstallHint() {
  const initial = useSyncExternalStore(noop, shouldShow, () => false);
  const [dismissed, setDismissed] = useState(false);
  if (!initial || dismissed) return null;
  return (
    <div className="mt-4 rounded-2xl border border-line bg-surface p-4 text-sm">
      <p className="font-semibold">Instálala en tu iPhone</p>
      <p className="mt-1 text-ink-2">
        En Safari, toca <strong>Compartir</strong> → <strong>Añadir a pantalla de inicio</strong>. Se abrirá a pantalla completa y es
        menos probable que iOS borre tu progreso.
      </p>
      <button
        type="button"
        className="mt-2 min-h-[44px] font-semibold text-brand"
        onClick={() => {
          try {
            localStorage.setItem(KEY, "1");
          } catch {}
          setDismissed(true);
        }}
      >
        Entendido
      </button>
    </div>
  );
}
