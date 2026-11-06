// src/cli/hook.ts
import { spawn } from "child_process";
import { closeSync as closeSync2, openSync as openSync2, statSync as statSync2 } from "fs";
import { tmpdir } from "os";
import { join as join3 } from "path";
import { fileURLToPath } from "url";

// src/payload.ts
import { isAbsolute } from "path";

// src/shared/state.ts
import { randomUUID } from "crypto";
import {
  chmodSync,
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync
} from "fs";
import { join } from "path";
import { setTimeout as sleep } from "timers/promises";
var FILE_ID = /^[A-Za-z0-9_-]{1,128}$/;
function isFileId(value) {
  return typeof value === "string" && FILE_ID.test(value);
}
function ensurePrivateDir(dir, options) {
  mkdirSync(dir, { recursive: true, mode: 448 });
  if (options?.tighten === true && process.platform !== "win32") chmodSync(dir, 448);
}

// src/payload.ts
var REASON = /^[A-Z][A-Z0-9_]{0,63}$/;
var MODEL_MAX = 256;
function handOff(stop) {
  return JSON.stringify(stop);
}
function readStop(payload, at) {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return void 0;
  const given = payload;
  const { conversationId, transcriptPath } = given;
  if (!isFileId(conversationId)) return void 0;
  if (typeof transcriptPath !== "string" || !isAbsolute(transcriptPath) || !transcriptPath.endsWith(".jsonl"))
    return void 0;
  const stop = {
    conversationId,
    transcriptPath,
    errored: typeof given.error === "string" && given.error.trim() !== "",
    // `false` alone holds the turn: Antigravity before the field never said, and its stop was the turn's end.
    idle: given.fullyIdle !== false,
    at
  };
  const workspaces = Array.isArray(given.workspacePaths) ? given.workspacePaths : [];
  const workspace = workspaces.find(
    (path) => typeof path === "string" && isAbsolute(path)
  );
  if (workspace !== void 0) stop.workspace = workspace;
  const model = typeof given.modelName === "string" ? given.modelName.trim() : "";
  if (model !== "" && model.length <= MODEL_MAX) stop.modelName = model;
  if (typeof given.terminationReason === "string" && REASON.test(given.terminationReason))
    stop.reason = given.terminationReason;
  return stop;
}

// src/paths.ts
import { homedir } from "os";
import { join as join2 } from "path";
function configDir(home = homedir()) {
  return join2(home, ".gemini", "config");
}
function stateDir(home) {
  return join2(configDir(home), "telmoni");
}

// src/cli/hook.ts
var MAX_INPUT_BYTES = 64 * 1024 * 1024;
var HANDOFF_MS = 2e3;
async function input() {
  const chunks = [];
  let size = 0;
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > MAX_INPUT_BYTES) return "";
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}
function start(stop) {
  const dir = stateDir();
  let cwd = tmpdir();
  let errors = "ignore";
  try {
    ensurePrivateDir(dir);
    cwd = dir;
    errors = openSync2(join3(dir, "hook.log"), "a", 384);
  } catch {
  }
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(done, HANDOFF_MS);
    try {
      const worker = fileURLToPath(new URL("./worker.mjs", import.meta.url));
      const child = spawn(process.execPath, [worker], {
        cwd,
        detached: true,
        stdio: ["pipe", "ignore", errors],
        windowsHide: true
      });
      child.on("error", done);
      child.stdin?.on("error", done);
      child.stdin?.end(handOff(stop), done);
      child.unref();
    } catch {
      done();
    } finally {
      if (typeof errors === "number") closeSync2(errors);
    }
  });
}
try {
  const at = Date.now();
  const stop = readStop(JSON.parse(await input()), at);
  if (stop !== void 0) {
    try {
      stop.size = statSync2(stop.transcriptPath).size;
    } catch {
    }
    await start(stop);
  }
} catch {
}
process.stdout.write("{}\n");
