"use client";
/** "Modo concentración": mientras hay un ejercicio en pantalla se oculta la barra inferior. */
import { useEffect, useSyncExternalStore } from "react";

let count = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useFocusMode(active = true) {
  useEffect(() => {
    if (!active) return;
    count += 1;
    emit();
    return () => {
      count -= 1;
      emit();
    };
  }, [active]);
}

export function useIsFocused(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => count > 0,
    () => false,
  );
}
