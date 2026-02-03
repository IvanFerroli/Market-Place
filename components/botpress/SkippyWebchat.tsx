"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    botpress?: {
      init: (config: unknown) => void;
      open: () => void;
      close: () => void;
      toggle: () => void;
      on?: (event: string, cb: () => void) => void;
    };
  }
}

const INJECT_SRC = "https://cdn.botpress.cloud/webchat/v3.5/inject.js";

function loadScriptOnce(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) return resolve();

    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.async = true;

    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    s.defer = true;
    (document.head || document.body).appendChild(s);
  });
}

export default function SkippyWebchat() {
  const bootedRef = useRef(false);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  const waitForBotpress = (ms = 5000) =>
    new Promise<void>((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        if (window.botpress?.toggle) return resolve();
        if (Date.now() - started > ms) return reject(new Error("botpress not ready"));
        setTimeout(tick, 50);
      };
      tick();
    });

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    let cancelled = false;

    const configScriptUrl = process.env.NEXT_PUBLIC_BOTPRESS_CONFIG_SCRIPT_URL;
    const botId = process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID;
    const clientId = process.env.NEXT_PUBLIC_BOTPRESS_CLIENT_ID;

    initPromiseRef.current = (async () => {
      await loadScriptOnce(INJECT_SRC, "bp-webchat-inject");
      if (cancelled) return;

      // Opção A (preferida): usar o script gerado pelo Botpress (files.bpcontent...js)
      if (configScriptUrl) {
        await loadScriptOnce(configScriptUrl, "bp-webchat-config");
        // espera o init efetivamente “subir” window.botpress
        await waitForBotpress().catch(() => {});
        return;
      }

      // Opção B (fallback): init manual via env (se tu quiser depois)
      if (botId && clientId) {
        window.botpress?.init({
          botId,
          clientId,
          configuration: {
            botName: "Skippy",
            themeMode: "dark",
            variant: "solid",
            fontFamily: "inter",
          },
        });
      }
    })().catch(() => {
      // sem spam: falha silenciosa (tu vai ver pelo DBG)
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleChat = async () => {
    // Se ainda não inicializou, espera um pouco e tenta de novo
    if (!window.botpress?.toggle && initPromiseRef.current) {
      await initPromiseRef.current.catch(() => {});
    }
    window.botpress?.toggle?.();
  };

  const isDev = process.env.NODE_ENV !== "production";
  const missingConfig =
    !process.env.NEXT_PUBLIC_BOTPRESS_CONFIG_SCRIPT_URL &&
    !(
      process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID &&
      process.env.NEXT_PUBLIC_BOTPRESS_CLIENT_ID
    );

  return (
    <>
      {/* Botão custom (também serve se tu ativar "Custom element" no Botpress) */}
      <button
        id="bp-toggle-chat"
        type="button"
        aria-label="Toggle Skippy chat"
        onClick={toggleChat}
        className={[
          "fixed bottom-6 right-6 z-[9999]",
          "h-16 w-16 rounded-full",
          "cp-glass-strong cp-pill",
          "flex items-center justify-center",
          "hover:scale-[1.05] active:scale-[0.99] transition",
        ].join(" ")}
      >
        <Image
          src="/brand/skippy.png"
          alt="Skippy"
          width={64}
          height={64}
          className="h-full w-full object-contain scale-[1.5]"
          priority={false}
        />
      </button>
    </>
  );
}