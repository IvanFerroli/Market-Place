#!/usr/bin/env node
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const ROOT = process.cwd();

// === Config “do projeto” (muda aqui se quiser) =========================
const ENV_FILE = path.join(ROOT, ".env.local");
const ENV_KEY = "NEXT_PUBLIC_BOTPRESS_CONFIG_SCRIPT_URL";
const ENV_VALUE =
  "https://files.bpcontent.cloud/2025/04/27/22/20250427224443-L36685G9.js";

const TYPEDOC_INDEX = path.join(ROOT, "docs", "typedoc", "index.html");
const COVERAGE_INDEX = path.join(ROOT, "coverage", "lcov-report", "index.html");

const APP_URL = process.env.DX_APP_URL ?? "http://localhost:3000";

// abre o deploy também (por padrão ON)
const DEPLOY_URL = process.env.DX_DEPLOY_URL ?? "https://ncart.vercel.app";
const OPEN_DEPLOY = (process.env.DX_OPEN_DEPLOY ?? "1") !== "0";

const OPEN_UI = (process.env.DX_OPEN_UI ?? "1") !== "0"; // 1 = abre navegador
const RUN_TESTS = (process.env.DX_SKIP_TESTS ?? "0") !== "1";

// Coverage ON por padrão.
// - DX_COVERAGE=0 desliga
// - DX_COVERAGE=1 liga (explicitamente)
const RUN_COVERAGE = (process.env.DX_COVERAGE ?? "1") !== "0";

const RUN_E2E = (process.env.DX_E2E ?? "0") === "1"; // opcional
// ======================================================================

function banner(msg) {
  console.log(`\n=== ${msg} ===`);
}

function run(cmd, { allowFail = false } = {}) {
  const res = spawnSync(cmd, { stdio: "inherit", shell: true, cwd: ROOT });
  if (!allowFail && (res.status ?? 1) !== 0) process.exit(res.status ?? 1);
  return (res.status ?? 1) === 0;
}

// roda um binário com args, sem passar pelo /bin/sh (evita comer "\" no WSL)
function runBin(bin, args, { allowFail = false, cwd = ROOT } = {}) {
  const res = spawnSync(bin, args, { stdio: "inherit", shell: false, cwd });
  if (!allowFail && (res.status ?? 1) !== 0) process.exit(res.status ?? 1);
  return (res.status ?? 1) === 0;
}

function isWSL() {
  return (
    process.platform === "linux" &&
    (process.env.WSL_DISTRO_NAME ||
      (fs.existsSync("/proc/version") &&
        fs.readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft")))
  );
}

function stripFileUrl(u) {
  return u.startsWith("file://") ? u.replace(/^file:\/\//, "") : u;
}

function wslToWindowsPath(linuxPath) {
  const p = stripFileUrl(linuxPath);
  if (!p.startsWith("/")) return p; // já é URL ou windows path
  const res = spawnSync("wslpath", ["-w", p], { cwd: ROOT, encoding: "utf8" });
  const out = (res.stdout ?? "").trim();
  return out.length ? out : p;
}

function tryOpen(target) {
  if (!OPEN_UI) return;

  // WSL: NÃO usar shell=true (senão o /bin/sh come "\" e quebra UNC)
  // e NÃO abrir explorer (invasivo)
  if (isWSL()) {
    const cwd = fs.existsSync("/mnt/c") ? "/mnt/c" : ROOT;

    const t =
      target.startsWith("/") || target.startsWith("file://")
        ? wslToWindowsPath(target)
        : target;

    // cmd.exe "start" costuma abrir URL/HTML no browser default
    const ok = runBin("cmd.exe", ["/d", "/c", "start", "", t], {
      allowFail: true,
      cwd,
    });

    if (ok) return;

    console.warn("Aviso: não consegui abrir automaticamente no navegador.");
    console.warn(`Abra manualmente: ${t}`);
    return;
  }

  // Windows
  if (process.platform === "win32") {
    run(`cmd /c start "" "${target}"`, { allowFail: true });
    return;
  }

  // macOS
  if (process.platform === "darwin") {
    run(`open "${target}"`, { allowFail: true });
    return;
  }

  // Linux com GUI
  const attempts = [`xdg-open "${target}"`, `gio open "${target}"`];
  for (const cmd of attempts) {
    const ok = run(cmd, { allowFail: true });
    if (ok) return;
  }

  console.warn("Aviso: não consegui abrir automaticamente no navegador.");
}

function ensureNode20() {
  const major = Number(process.versions.node.split(".")[0] ?? 0);
  if (major < 20) {
    console.error(`Node 20+ requerido. Atual: ${process.versions.node}`);
    process.exit(1);
  }
  if (major !== 20) {
    console.warn(
      `Aviso: package.json pede node 20.x, mas você está em ${process.versions.node}. ` +
        `Pode funcionar, mas pode gerar warnings.`,
    );
  }
}

function ensurePnpm() {
  banner("Checando pnpm/corepack");
  const hasPnpm = run("pnpm -v", { allowFail: true });
  if (hasPnpm) return;

  // tenta habilitar via corepack (Node 20)
  run("corepack enable", { allowFail: true });
  // tenta uma versão estável (pode ajustar)
  run("corepack prepare pnpm@9.15.0 --activate", { allowFail: true });

  const ok = run("pnpm -v", { allowFail: true });
  if (!ok) {
    console.error(
      "Não consegui ativar o pnpm via corepack.\n" +
        "Tenta manualmente: corepack enable && corepack prepare pnpm@latest --activate",
    );
    process.exit(1);
  }
}

function upsertEnvVar() {
  banner("Criando/atualizando .env.local");
  const line = `${ENV_KEY}=${ENV_VALUE}`;
  const exists = fs.existsSync(ENV_FILE);

  const current = exists ? fs.readFileSync(ENV_FILE, "utf8") : "";
  const hasKey = new RegExp(`^${ENV_KEY}=.*$`, "m").test(current);

  let next = current;
  if (!exists || current.trim().length === 0) {
    next = `${line}\n`;
  } else if (hasKey) {
    next = current.replace(new RegExp(`^${ENV_KEY}=.*$`, "m"), line);
    if (!next.endsWith("\n")) next += "\n";
  } else {
    next = current;
    if (!next.endsWith("\n")) next += "\n";
    next += `${line}\n`;
  }

  fs.writeFileSync(ENV_FILE, next, "utf8");
  console.log(`OK: setado ${ENV_KEY} em ${path.relative(ROOT, ENV_FILE)}`);
}

function ensureDeps() {
  banner("Instalando dependências (pnpm install)");
  run("pnpm install");
}

function ensureTypedoc() {
  banner("TypeDoc (gerar se necessário + abrir)");
  const ok = fs.existsSync(TYPEDOC_INDEX);

  if (!ok) {
    console.log("TypeDoc não encontrado. Gerando...");
    // pnpm v10 tem comando builtin "docs" (abre docs no browser) -> usa "run" pra forçar o script
    const okRun = run("pnpm run docs", { allowFail: true });
    if (!okRun) {
      console.warn(
        "Aviso: falhou ao gerar TypeDoc (pnpm run docs). Seguindo o DX mesmo assim.",
      );
    }
  }

  if (fs.existsSync(TYPEDOC_INDEX)) {
    const target = isWSL() ? TYPEDOC_INDEX : pathToFileURL(TYPEDOC_INDEX).href;
    tryOpen(target);
    console.log(`TypeDoc: ${path.relative(ROOT, TYPEDOC_INDEX)}`);
  } else {
    console.warn("Aviso: TypeDoc ainda não encontrado após gerar.");
  }
}

function openCoverageReport() {
  if (!fs.existsSync(COVERAGE_INDEX)) {
    console.warn("Aviso: coverage HTML não encontrado.");
    return;
  }
  const target = isWSL() ? COVERAGE_INDEX : pathToFileURL(COVERAGE_INDEX).href;
  tryOpen(target);
  console.log(`Coverage: ${path.relative(ROOT, COVERAGE_INDEX)}`);
}

function runCoverageHtml() {
  // Preferido: script dedicado (se existir)
  const ok = run("pnpm run test:coverage:html", { allowFail: true });
  if (ok) return;

  // Fallback: usa o test:coverage e injeta reporters/directory via args
  run(
    "pnpm run test:coverage -- --coverageDirectory=coverage --coverageReporters=text-summary --coverageReporters=html --coverageReporters=lcov",
  );
}

function runUnitTests() {
  if (!RUN_TESTS) return;

  // coverage HTML também roda os testes — evita rodar 2x
  if (RUN_COVERAGE) {
    banner("Rodando coverage (HTML + summary)");
    runCoverageHtml();
    openCoverageReport();
    return;
  }

  banner("Rodando testes (unit)");
  run("pnpm run test");
}

function runE2E() {
  if (!RUN_E2E) return;
  banner("Rodando E2E (Playwright)");
  run("pnpm exec playwright install", { allowFail: true });
  run("pnpm run e2e");
}

async function waitForApp(url, timeoutMs = 45_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.ok) return true;
    } catch {
      // ignore
    }
    await sleep(400);
  }
  return false;
}

async function startDevServer() {
  banner("Subindo Next (pnpm dev)");
  const child = spawn("pnpm", ["run", "dev"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env },
  });

  const ok = await waitForApp(APP_URL);
  if (ok) {
    banner("Abrindo app no navegador");
    tryOpen(APP_URL);
    console.log(`App: ${APP_URL}`);
  } else {
    console.warn(`Aviso: não consegui confirmar app em ${APP_URL} a tempo.`);
    console.warn("Se o Next subiu em outra porta, abre pelo log do terminal.");
  }

  if (OPEN_DEPLOY) {
    banner("Abrindo deploy público");
    tryOpen(DEPLOY_URL);
    console.log(`Deploy: ${DEPLOY_URL}`);
  }

  return child;
}

(async function main() {
  banner("DX Bootstrap — Market Place");
  ensureNode20();
  ensurePnpm();
  ensureDeps();
  upsertEnvVar();

  // 1) Sobe o app primeiro (pra pessoa “brincar” logo)
  const dev = await startDevServer();

  // 2) Abre docs depois que o app já tá no ar (menos ruído no começo)
  ensureTypedoc();

  // 3) Testes/coverage mais perto da ponta
  runUnitTests();
  runE2E();

  // mantém o processo vivo enquanto o Next estiver rodando
  await new Promise((resolve) => dev.on("exit", resolve));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
