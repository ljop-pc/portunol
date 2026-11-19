"use client";
/**
 * Capa de audio intercambiable.
 *
 * Orden de proveedores:
 *   1. Grabación de un hablante nativo (archivo) — preparado, aún sin archivos.
 *   2. Voz sintética del sistema, SOLO si su idioma es exactamente pt-PT.
 *   3. Sin audio (se indica claramente en la interfaz).
 *
 * Nunca se usa una voz pt-BR ni una voz "pt" genérica como sustituto.
 */
import { useSyncExternalStore } from "react";

export type AudioSource = "native" | "synthetic-pt-PT" | "none";

export interface AudioRef {
  text: string;
  /** Ruta a una grabación nativa, cuando exista (p. ej. /audio/olá.mp3). */
  file?: string;
}

export interface AudioStatus {
  /** Ya se ha consultado la lista de voces del sistema. */
  ready: boolean;
  /** Hay voz sintética pt-PT disponible en este dispositivo. */
  syntheticAvailable: boolean;
  voiceName?: string;
  /** El navegador no tiene Web Speech en absoluto. */
  unsupported: boolean;
}

let status: AudioStatus = { ready: false, syntheticAvailable: false, unsupported: false };
let ptVoice: SpeechSynthesisVoice | null = null;
const listeners = new Set<() => void>();
let started = false;

export function isEuropeanPortuguese(lang: string): boolean {
  return lang.replace("_", "-").toLowerCase() === "pt-pt";
}

function setStatus(next: AudioStatus) {
  status = next;
  listeners.forEach((l) => l());
}

function scanVoices() {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const candidates = voices.filter((v) => isEuropeanPortuguese(v.lang));
  // Preferir voces locales (funcionan sin conexión) y de mayor calidad si el nombre lo indica.
  candidates.sort((a, b) => Number(b.localService) - Number(a.localService));
  ptVoice = candidates[0] ?? null;
  setStatus({
    ready: voices.length > 0 || status.ready,
    syntheticAvailable: !!ptVoice,
    voiceName: ptVoice?.name,
    unsupported: false,
  });
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  if (!("speechSynthesis" in window)) {
    setStatus({ ready: true, syntheticAvailable: false, unsupported: true });
    return;
  }
  scanVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", scanVoices);
  // En iOS la lista de voces puede tardar en llegar y no siempre emite el evento.
  let tries = 0;
  const timer = window.setInterval(() => {
    tries += 1;
    scanVoices();
    if (ptVoice || tries >= 10) {
      window.clearInterval(timer);
      setStatus({ ...status, ready: true });
    }
  }, 300);
}

export function useAudioStatus(): AudioStatus {
  return useSyncExternalStore(
    (l) => {
      start();
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => status,
    () => status,
  );
}

export function sourceFor(ref: AudioRef, s: AudioStatus = status): AudioSource {
  if (ref.file) return "native";
  if (s.syntheticAvailable) return "synthetic-pt-PT";
  return "none";
}

export interface PlayOptions {
  rate?: number;
  onEnd?: () => void;
  /** No se ha podido reproducir (error del sistema o no empezó a sonar). */
  onFail?: () => void;
}

/**
 * Safari (iOS) puede descartar una frase antes de reproducirla si nadie
 * guarda una referencia: la conservamos aquí mientras suena.
 */
let current: SpeechSynthesisUtterance | null = null;

/** Vuelve a pedir la voz al sistema: en iOS la referencia guardada puede caducar. */
function freshPtVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (ptVoice) {
    const same = voices.find((v) => v.voiceURI === ptVoice!.voiceURI && isEuropeanPortuguese(v.lang));
    if (same) return same;
  }
  return voices.find((v) => isEuropeanPortuguese(v.lang)) ?? ptVoice;
}

export function play(ref: AudioRef, opts: PlayOptions = {}): AudioSource {
  const source = sourceFor(ref);
  if (source === "native" && ref.file) {
    const audio = new Audio(ref.file);
    audio.playbackRate = opts.rate ?? 1;
    audio.onended = () => opts.onEnd?.();
    audio.play().catch(() => {
      opts.onEnd?.();
      opts.onFail?.();
    });
    return source;
  }
  if (source === "synthetic-pt-PT") {
    const synth = window.speechSynthesis;
    const voice = freshPtVoice();
    if (!voice) return "none";
    // En Safari, cancel() seguido de speak() en el mismo instante hace que la
    // nueva frase se pierda: solo se cancela si de verdad hay algo sonando.
    if (synth.speaking || synth.pending) synth.cancel();
    const u = new SpeechSynthesisUtterance(ref.text);
    u.voice = voice;
    u.lang = "pt-PT";
    u.rate = opts.rate ?? 0.9;
    let started = false;
    let finished = false;
    const finish = (failed: boolean) => {
      if (finished) return;
      finished = true;
      if (current === u) current = null;
      opts.onEnd?.();
      if (failed) opts.onFail?.();
    };
    u.onstart = () => {
      started = true;
    };
    u.onend = () => finish(false);
    u.onerror = (e) => finish(e.error !== "interrupted" && e.error !== "canceled");
    current = u;
    synth.speak(u);
    // iOS a veces deja la síntesis «en pausa»: se reactiva.
    if (synth.paused) synth.resume();
    // Si en unos segundos no ha empezado a sonar, se avisa en lugar de fallar en silencio.
    window.setTimeout(() => {
      if (!started && !finished) {
        synth.resume();
        window.setTimeout(() => {
          if (!started && !finished) {
            synth.cancel();
            finish(true);
          }
        }, 1500);
      }
    }, 1500);
    return source;
  }
  return "none";
}

export function stop() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  if (synth.speaking || synth.pending) synth.cancel();
  current = null;
}
