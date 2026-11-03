"use client";
import { useSyncExternalStore } from "react";
import { createLocalStore, emptyState, type ProgressState, type ProgressStore } from "./store";

let store: ProgressStore | null = null;
const SERVER_STATE = emptyState(new Date(0));

/** Store único del navegador. En el servidor (prerender) no existe. */
export function getStore(): ProgressStore {
  if (!store) {
    let storage: Storage | undefined;
    try {
      storage = window.localStorage;
      const probe = "pdb:probe";
      storage.setItem(probe, "1");
      storage.removeItem(probe);
    } catch {
      storage = undefined;
    }
    store = createLocalStore(storage);
  }
  return store;
}

const subscribe = (l: () => void) => getStore().subscribe(l);

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, () => getStore().get(), () => SERVER_STATE);
}

const noop = () => () => {};
/** true solo en el cliente, tras hidratar. Evita mostrar datos vacíos como si fueran reales. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

export function updateProgress(fn: (s: ProgressState) => ProgressState) {
  getStore().update(fn);
}
