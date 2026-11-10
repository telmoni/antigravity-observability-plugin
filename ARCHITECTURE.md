# Architecture

The Antigravity plugin for Telmoni: a `Stop` hook that records each turn of a person's Antigravity sessions as a trace, metadata only unless the person turns content on, through the platform's TypeScript SDK ([`telmoni/telmoni`](https://github.com/telmoni/telmoni), `sdk/typescript`). The repository is the plugin: Antigravity installs it from its address or from a clone, and runs the hook from the copy. The bundle in `dist/` is committed, since Antigravity builds nothing.

## Purpose and scope

The plugin records one trace per turn, from the person's prompt to the agent's last reply, of the agent `antigravity`, in the conversation Antigravity names. A trace holds:

- its model calls, with their tokens;
- its tool calls;
- its API errors, as failed model calls;
- its compactions;
- the tags of its workspace;

each with its times and whether it failed or was cancelled.

The plugin reads Antigravity's own transcript after the fact. It adds no tool and no rule, and it never fails or slows a turn. Its one skill, whose full text Antigravity loads only when a prompt calls for it, tells the agent how to connect, tag and troubleshoot the plugin. What becomes of a run past ingest is Telmoni's.

## How Antigravity loads it

- **The manifest**, `.antigravity-plugin/plugin.json`, which Antigravity reads before a root `plugin.json`. It holds:
  - the name `telmoni-observability`, the display name and the version;
  - the description, the logo and the author;
  - the logo is `assets/logo.png`, rendered at 1024 px from the vector mark of the Console amber icon pack (`svg/mark.svg`): the dark mark with its amber unit on a light rounded square.
    - It has 102 px (10%) of transparent padding on every side, as the Marketplace asks.
    - The tile is `#FAFAFA`, 820 px, with corners of 18.75% of its side and an 8 px `#E5E5E5` edge, as the pack's padded Chrome Web Store icon has. On a white page, the tile would vanish without the edge.
    - The mark is 61.7% of the tile's width, centred.
    - The light tile keeps the mark legible on light and dark themes alike;
  - the fields the Antigravity Marketplace asks for.

  It names no settings, since Antigravity offers a plugin's hooks none: its only settings are an MCP server's `variables`.
- **The skill**, `skills/telmoni-observability/SKILL.md`, with the manifest's three `suggestedPrompts`, which the Marketplace asks for and shows as chips on the plugin's page. It covers connecting the key, the content and scrubbing switches, writing `.telmoni-tags.json`, and reading `hook.log`. It runs nothing of the plugin's.
  - It forbids the agent to ask for a key, take one in the chat, put one in a command, or open the key file. The person sets the key in their own terminal, by a command that keeps it out of the shell's history.
  - It has the agent tag a repository by its name alone, never its remote's URL, which can hold a token.
  - Antigravity loads its name and description at a session's start and its text when a prompt calls for it.
- **The hooks file**, `hooks.json` at the plugin's root, where Antigravity reads it; a `hooks/hooks.json` is not read. It has one named hook, `telmoni-observability`, with one handler on `Stop`: `node ./dist/hook.mjs`, timeout 10 s.
  - Antigravity runs the command through `sh -c` (`cmd /c` on Windows) in the plugin's folder, with the payload on stdin, and waits for it before the turn ends.
  - It gives the hook no `PLUGIN_ROOT` or `PLUGIN_DATA`; `agy plugin validate` warns where a command names either.
  - A command that exits non-zero, or a missing `node`, is logged by Antigravity and ignored.
  - The hook prints `{}`: a `Stop` answer with no `decision` lets the stop go on.
- **Where it runs.** Antigravity's hooks docs list a plugin's `hooks.json` for the CLI alone. For the App and the IDE they list only a workspace's `.agents/hooks.json` and the global `~/.gemini/config/hooks.json`, without saying that either ignores a plugin's. The README says how to add the same command to the global file by its installed path. Where both run, the lock and the ids sent keep each turn to one run. Only the CLI has been checked live.
- **Its marketplace.** Antigravity installs from one marketplace, `antigravity-plugins-official`, which `<name>@<marketplace>` alone names. Unlike Claude Code, it has no command that adds another, so this repository is no marketplace of its own. Until the plugin is listed, people install it by its GitHub address.
- **What was checked against a live Antigravity**, the CLI 1.4.12 on 5 November 2026: the plugin's `Stop` handler runs in the plugin's folder, its payload's fields (below), and a run sent end to end, its tokens matching Antigravity's own count.

## Processes: the hook and its worker

`dist/hook.mjs` (`src/cli/hook.ts`) loads no SDK: it imports none, so its file holds only the payload, the paths and the state helpers.

1. It reads stdin, 64 MiB at most, since the payload carries the prompt and the last answer.
2. It keeps what `payload.ts` reads (below). It stamps the stop with the time the hook ran, which is the turn's end, and with the transcript's size as it finds it (a `stat`, nothing read).
3. It starts `dist/worker.mjs` with Node's own executable (`process.execPath`): detached, in a process group of its own (`windowsHide` on Windows), its working folder the plugin's state folder, never the plugin's, which an update replaces.
4. It hands the stop over on the worker's stdin, never as an argument, which others on the machine can read. It waits for the pipe to take it, 2 s at most.
5. It prints `{}`.

Any fault is swallowed: the hook exits 0 and prints `{}` whatever it meets.

The worker (`src/worker.ts`) resolves the settings, then takes the conversation's lock and reads its state. It waits for the transcript to settle: no change of size or mtime for 0.5 s, 3 s at most. It reads the transcript, sends each turn that can no longer change, and keeps the rest. If nothing of its own is left kept, it sends what other conversations left. It exits 0 whatever happens; a fault is one line in the log naming its type.

## What it reads

**The payload** (`payload.ts`). Of Antigravity's `Stop` payload, the plugin keeps:

- `conversationId`, a plain id (`[A-Za-z0-9_-]{1,128}`), else nothing is done;
- `transcriptPath`, absolute and ending in `.jsonl`, else nothing is done;
- the first absolute entry of `workspacePaths`, only to find the tags file;
- `modelName`, up to 256 characters;
- `terminationReason`, as a word of capitals;
- whether `error` says anything, never what;
- `fullyIdle`, which holds the turn only where it is `false`, since Antigravity before the field never said.

It never reads `lastUserInput`, `finalModelOutput`, `error`'s words or `artifactDirectoryPath`.

Antigravity 1.4.12 names `transcript_full.jsonl` (`<app data>/brain/<conversation>/.system_generated/logs/`), whose content is not truncated as `transcript.jsonl`'s is.

**The transcript** (`transcript.ts`). A JSON object a line for each step of the conversation, read whole at each hook, 256 MiB at most.

- It is opened without blocking and checked to be a file, so a pipe in its place cannot hold the worker.
- A line that is not a JSON object with an integer `step_index` and a string `type` is passed over.
- Rows are sorted by `step_index`, since Antigravity writes a reply's row after some of its results. Each step is kept once, from the last line written for it, at the byte offset of the first.

Of each row the plugin reads:

- `type`, `source`, `status` and `created_at`, which is to the second, read as UTC where it names no zone;
- of a reply (`PLANNER_RESPONSE`): `input_tokens`, `output_tokens` and `cache_read_tokens`, and each `tool_calls` entry's `name`;
- of a tool's result, `exit_code`, where Antigravity records one;
- of an error (`ERROR_MESSAGE`), `error_code`, never `error`.

**With content on**, it also reads:

- a row's `content`, and of a prompt (`USER_INPUT`), only what lies inside `<USER_REQUEST>`. Antigravity wraps the typed prompt in its own blocks (`<ADDITIONAL_METADATA>`, a setting changed), which can name the person's folders and open files, so those are never read;
- a reply's `thinking`;
- a tool call's `args`.

It never reads `media`, the images a prompt carries. With content off, none of the above is read.

## How turns are cut

`turns.ts`. A `USER_INPUT` row opens a turn and closes the one before it; rows before a conversation's first prompt open none. Within a turn, as `record.ts` reads it:

- **Model calls.** Each `PLANNER_RESPONSE` row is one model call. Its tokens are counted as the conventions count them: the input with the cache's reads, which Antigravity's own `input_tokens` leaves out, and the reads beside it.
- **Tool calls.** A reply's tool calls are answered, in order, by the result rows that follow it until the next reply: a row from the `MODEL` source that is neither a reply nor an error.
  - A call fails as `ToolError` where its result's `status` is `ERROR`, or where its `exit_code` is not `0`.
  - A call whose result is `RUNNING`, a command left at work in the background, is not failed.
  - A call never answered is cancelled, placed where the turn moved on.
- **Errors.** Each `ERROR_MESSAGE` row is a failed model call, named by its code: `429` is `rate_limit`, a `5xx` `server_error`, another `4xx` `http_<code>`, else `ApiError`.
- **Compactions.** Each `CHECKPOINT` row is a step named `compaction`. Where Antigravity counted its tokens, the step holds the summary's model call.
- **Times.** Each step lasts from its `created_at` to the next step's, and the turn's last step to the turn's end.
  - The live check confirmed this: a reply's row is written as its call begins, and a result's as its tool begins.
  - A turn's end is the time of the hook of the stop that ended it, else its last row's time. The worker keeps that time in the state for a turn not yet sent.

A turn is complete, and sent, when nothing can still change it:

- a later prompt follows it; or
- it is the turn this stop ended, and the stop says the conversation is fully idle.

The turn a stop ended is the last whose prompt the transcript already held as the hook ran: its row was first written below the size the hook found. Where the hook found no transcript, it is the last whose prompt's `created_at` is no later than the stop.

The size is what tells a prompt queued while the agent worked from the turn it waited on. Antigravity writes a queued prompt as the stop ends, and its time, to the second, is the stop's own. Read by time, the queued prompt's turn would be sent as soon as it began, without its calls, and passed over.

A prompt written after the hook ran opens a turn still at work. The first turn not complete holds every turn after it, and the log says `held <trace id>` at each hook that holds it.

A turn with no call in it is not recorded.

**Where a conversation starts.** The cursor is the step of the first prompt not yet done with. A conversation first heard of starts it at the turn that stop ended, so its history from before the plugin, or before a key, is never sent.

## What it sends

One trace a turn, built by `record.ts` as the SDK's `TraceRecord`, which is also what the state keeps, and sent through `recordTrace`.

- **Ids.** The trace's id is the 16 bytes of a version 5 UUID of `<conversation>:<prompt's step>`, under the plugin's own namespace, `uuid5(NAMESPACE_URL, "https://telmoni.com/antigravity-observability-plugin")`, written as 32 hex digits. The SDK makes each span's id from it and the span's place, so a turn sent twice is stored once. The worker also remembers the newest 500 ids it sent, and passes over a turn among them.
- **The trace.**
  - It is a trace of the agent `antigravity`, in the conversation, from the prompt to the turn's end.
  - It is cancelled where the stop says `USER_CANCELED`.
  - It fails where the stop says `ERROR`, or named an error: by the kind of the turn's last API error, else `AgentError`.
  - It fails by the limit where the stop names one (`MAX_INVOCATIONS` is `max_invocations`).
  - Where no stop said how the turn ended, it fails only where the turn's last call is an API error.
  - It carries the tags of the workspace's `.telmoni-tags.json`.
- **Model calls.** Each names the stop's model, as Antigravity's transcript names none for any step, with its effort apart: `gemini-3.8-flash-low` goes as `gemini-3.8-flash` with the reasoning level `low`. Its provider is `gcp.vertex_ai`, under which the price table names every model Antigravity offers. A name holding a control character or a path goes as `unknown`.
- **Tool calls** by name. A name holding anything but letters, digits and `_.:@+-` goes as `unknown`.

Every call is ordered by its start.

**With content on**:

- the agent's input is the prompt as typed, and its output the last reply;
- each model call carries what is new to it: the turn's first is handed the prompt, each later one the results since the call before, as one `tool` message of `tool_call_response` parts. A system message is never handed;
- each model call's output is its reasoning, its words and its tool calls with their arguments;
- each tool call carries its arguments and its output;
- each compaction carries its summary, as its output.

The SDK sends content only where the project's content mode is `on`, and scrubs it first unless a switch says otherwise. Antigravity's tool calls carry no ids, so the responses are matched to their calls by order.

## Configuration

The worker reads the settings at every hook (`shared/settings.ts`).

- **The key.** `TELMONI_API_KEY` in the environment the CLI started in comes first. Beside it, `TELMONI_ENDPOINT`, `TELMONI_CAPTURE_CONTENT` (on at `1` alone), and `TELMONI_SCRUB_SECRETS` and `TELMONI_SCRUB_PII` (off at `0` alone), each with Unicode's White_Space trimmed.
- **The key file.** Else `~/.gemini/config/telmoni.json`: `apiKey`, `endpoint`, `captureContent`, `scrubSecrets` and `scrubPii`.
  - It is read only while it is a regular file, the person's own, with no bit of `077`, at most 64 KiB, and a JSON object.
  - It is opened without blocking.
  - A field there but empty, or a switch neither `true` nor `false`, has the whole file passed over, logged once a conversation, and nothing is sent.
- **Pairing.** A key never goes to an endpoint, nor takes a switch, named anywhere but beside it.
- **Where it lives.** Antigravity gives a hook no folder or setting of its own, so the file sits in Antigravity's shared configuration folder, which the agent's own tools may not read.
- **The endpoint.** The SDK's `Config` checks it. One it refuses is logged once a conversation, in the SDK's words, which name at most the host, and the turns wait for it to be fixed.

## State and the log

The plugin's folder is `~/.gemini/config/telmoni/`, made or closed to its owner (0700), and every file in it is 0600. In it:

- `<conversation>.json`, the conversation's state:
  - `cursor`;
  - `sent`, the newest 500 trace ids;
  - `pending`, the traces Telmoni could not take yet, with their conversation where content is on, the newest 200;
  - `ends`, the stops heard for turns not yet sent, each with its time, reason and whether it named an error;
  - `warned`, the once-a-conversation lines;
  - `destination`, an HMAC of the endpoint under the key, its first 16 hex digits.

  It is written whole to `<conversation>.json.<pid>.tmp`, synced and renamed over the last, after each trace sent or kept and at the end. A state that cannot be read is left as it is: the conversation sends nothing until it is fixed or moved aside, since read as new it would lose its kept traces.
- `<conversation>.pending`, beside a state that still holds traces, made once, so the longest waiting goes first, and any hook finds them without reading every state.
- `<conversation>.lock`, the worker's while it works on the conversation (`shared/state.ts`'s `withLock`). It holds a token of the worker's own, and is freshened every 10 s; one not freshened for a minute was left by a worker that died. A stop's worker waits a minute for the lock, then logs that another hook holds the conversation and leaves its turns to the next.
- `hook.log`, a line `<UTC time> <conversation> <text>` for each trace sent, taken in part, refused or kept, each turn held, each once-a-conversation warning, each tag dropped and each fault. The worker's stderr goes there too. Past a mebibyte it is moved aside to `hook.log.1`.

Nothing of the conversation is logged: a conversation is named by the first 8 characters of its id, and a trace by the first 8 of its.

## Delivery and failure

`shared/send.ts`: a client a trace, so the SDK's once-per-client warnings are the trace's. Its queue has no bound, and a flush waits as long as the SDK's own attempts take. The verdict is read from each warning's kind, status and problem type, never its words:

- **Kept, sent again.** A network failure, a timed-out flush, or a refusal with a status that is not final, such as `401`, `403`, `404`, `429`, a `5xx` other than `500`, or a `500` for ingest's database.
- **Refused for good**, logged and remembered as sent. A refusal at `400` or `413` for what the trace holds, `402` for the organization's standing, or `500` for a fault of Telmoni's own; and a trace the SDK itself refuses, which includes a kept trace that no longer builds.
- **Taken in part**, logged: a span or a field dropped.

A conversation's kept traces go before its new ones, in order: a turn queues behind a kept trace unsent.

A conversation that ends while it still holds traces has no next stop of its own. So the next stop of any conversation that holds none of its own sends what the others left, the longest waiting first:

- each under that conversation's lock, taken without waiting;
- only where its `destination` is the same, so traces go nowhere their own key did not send them;
- stopping at the first Telmoni still cannot take.

Past 200 kept traces the oldest go, and the log says how many. A key or endpoint changed under a conversation drops what it kept for the old one, logged.

## Shared code

`src/shared/` holds copies of the SDK's coding-agent module (`telmoni/telmoni` `sdk/typescript/src/coding-agent/` at `95db29c9`): `settings`, `log`, `state`, `send` and `tags`. They are the Codex plugin's copies, byte for byte, changed from the SDK's only in their imports and Prettier's line width. The SDK does not export the module yet; once it does, the copies go and the plugin imports it.

## Build and the SDK

`tsup` (`tsup.config.ts`) bundles two entries, `src/cli/hook.ts` and `src/cli/worker.ts`, into `dist/` as two self-contained ESM files for Node 22, `hook.mjs` and `worker.mjs`, every dependency inside, unminified. It is the Claude Code plugin's build, with this repository's entries; Vitest runs on its defaults, with no config file.

The build is unsplit (`splitting: false`): splitting wrote a file for every dynamic import esbuild met, and nothing ever loaded them. Five were OpenTelemetry's machine-id detectors, which the SDK never calls, and one was a helper only they imported. The hook holds no SDK without splitting, since it imports none, and nothing in either file calls `require`. `manifest.test.ts` holds `dist/` to those two files and the hook to no SDK. `.gitattributes` marks `dist/` generated (`-diff linguist-generated=true`): `git diff` and GitHub's pull requests show its files as changed, not line by line, and CI's comparison fails on any difference all the same.

The SDK is a development dependency, `file:../telmoni/sdk/typescript`, a checkout of the core beside this one. The published `telmoni` 0.2.0 has no structured warnings, no content messages, no scrubbers and no steps inside steps. Once the SDK's next release is on npm, the dependency becomes its version range.

## Testing

From a checkout, with the core cloned beside it for the SDK until its next release is on npm:

```sh
git clone https://github.com/telmoni/telmoni.git
git clone https://github.com/telmoni/antigravity-observability-plugin.git
(cd telmoni/sdk/typescript && npm ci && npm run build)
cd antigravity-observability-plugin && npm ci
npm run verify     # format check, type-check, build, tests
npm run validate   # agy plugin validate --strict .
npm run format     # Prettier, as the format check wants it
```

`npm run verify` runs Prettier's check (`.prettierrc.json`, the Claude Code plugin's own), the type-check, the build and the suite (vitest). It needs no network once the core's SDK is built. `npm run validate` runs `agy plugin validate --strict .`, which the Marketplace asks to pass. It fails on a root `AGENTS.md` or `GEMINI.md`, which Antigravity would read as a misplaced plugin rule.

`dist/` is committed, since Antigravity builds nothing when it installs a plugin: it goes in with the change that rebuilt it.

`tests/helpers.ts` holds the fixtures, all synthetic, never a recorded session:

- `Transcript` writes a conversation's rows as Antigravity 1.4 writes them: prompts wrapped in their metadata, replies with tokens, reasoning and tool calls, results, errors, system messages and compactions, written in or out of step order.
- `stopPayload` is Antigravity's `Stop` payload, the prompt and the last answer in it.
- `FakeTelmoni`, given to the SDK as its transport, answers each export as told, names a content mode, and goes offline on request.
- `SECRETS` are marked phrases planted wherever a session says something or names a place. `assertMetadataOnly` fails on any of them, or the key, in what is sent, kept or logged.

Each suite proves its module:

- `payload.test.ts`: what is kept of a stop, and the hand-off to the worker;
- `transcript.test.ts`: each field read, the order, the prompt as typed, content only when asked, and a pipe or a folder in the transcript's place;
- `turns.test.ts`: how turns are cut, the turn a stop ended (a prompt queued in its own second included), and when one is complete;
- `names.test.ts`: models, efforts, tools and error kinds;
- `record.test.ts`: a turn as a trace, with its times, pairing, failures, errors, compactions, outcomes and ids, and with content off and on;
- `worker.test.ts`: the worker end to end, the SDK included. It covers:
  - delivery;
  - holding and the end of a held turn;
  - one trace a turn;
  - where a conversation starts;
  - a prompt after the stop;
  - kept, refused and left traces;
  - the key, the key file and the environment;
  - tags;
  - an unreadable state and a lock held;
  - content only under both switches;
- `hook.test.ts`: the built hook, run as Antigravity runs it, in the plugin's folder. It answers `{}` and exits 0 on anything, returns before its worker, and its worker sends to a Telmoni on this machine;
- `manifest.test.ts`: the versions agree, the Marketplace's fields and its three prompts at most are there, the logo is outside the folders the bundle leaves out, the skill is named as its folder within Antigravity's limits, and the hook's script exists.

CI (`.github/workflows/ci.yml`) runs on every push to `main` and every pull request:

- it checks out the core at a pinned commit beside this repository and builds its SDK;
- it runs the type-check, the build and a check that the committed `dist/` is what the build makes, on Node 22.23.4 and 26.13.0. These are exact versions, the pins the Claude Code and Codex plugins use, since a bare major takes the runner's cached build, days behind a fix;
- it runs the suite;
- it checks the workflows under actionlint.

`agy plugin validate` is not in CI, for want of a pinned `agy` to install; run it before a release.

## Release

Everything an install needs is in the repository: the manifest, the hooks file, `dist/` and the logo. Antigravity names an installed plugin by its manifest's version.

A release is the version bumped in `.antigravity-plugin/plugin.json` and `package.json` in one commit on `main`; `manifest.test.ts` fails where they differ. On that push, `.github/workflows/release.yml`:

1. checks that the two agree on a plain `X.Y.Z`;
2. asks GitHub whether tag `v<version>` and its release exist;
3. for a new version, waits for CI's run on the commit to pass;
4. once the owner approves the `release` environment, makes the tag through the API and cuts the GitHub release.

Every other push ends green with nothing done, as does every push while the version is `0.0.0`, which is unreleased: nothing is tagged or asked for until it is bumped.

A Marketplace listing is a partner intake form, sent once `agy plugin validate --strict` passes. It is the owner's to send.

## Decisions

- **TypeScript, bundled, `dist/` committed**, as for the other Telmoni plugins. Antigravity copies a plugin as it finds it and builds nothing; Node runs the bundle on every platform, through `sh` and through `cmd`. The cost: Node 22 or later on the `PATH`.
- **The transcript, not the hooks, as the source.** Only `Stop` is registered. `PreInvocation`, `PostInvocation` and `PostToolUse` would each start a Node process the agent's loop waits on, at every model call and tool. The transcript holds every step, its time and its tokens. The cost: reading a format Antigravity owns and can move.
- **A detached worker.** Antigravity waits on a hook before the turn ends. The sending, which may wait on a slow Telmoni, happens where nothing waits on it. The cost: the session never hears how a send went; the log alone says.
- **A skill for the Marketplace's prompts.** The Marketplace asks for up to three starter prompts. A plugin of hooks alone gives the agent nothing to act on for them, so the skill teaches it the plugin: what it can do for the person (a tags file, reading the log) and what it must leave to them (the key). The cost: its name and description in every session's context, and its text where a prompt calls for it.
- **A key file in Antigravity's configuration folder.** Antigravity offers a plugin's hooks no settings and no data folder. An MCP server's `variables` would bring Antigravity's own setup form, at the cost of a server running in every session for nothing else. The file follows the Codex plugin's: the person's own, shut to everyone else, and a folder the agent's tools may not read.
- **History stays home.** A conversation first heard of is recorded from the turn that stop ended, so installing the plugin, or setting a key, never sends the past.
- **`gcp.vertex_ai` as every model's provider.** Antigravity serves its models from Google Cloud, and Vertex AI is the provider under which the price table names each of them.
- **The effort split from the model's name**, so the model is the one the price table names, and the effort is metadata of its own.

## Known gaps

- A moved transcript format is not detected. It shows as traces with less in them, or turns held, until the reader catches up.
- `created_at` is to the second, so a step shorter than a second shows as none.
- Antigravity's transcript names no model for a step: every call of a turn names the model of the stop that sent it. A model changed in the middle of a turn shows as the later one.
- A command's exit code is read only where Antigravity records it (`exit_code`). Where it writes it in the command's output alone, a failed command is recorded as one that ran.
- A subagent (`invoke_subagent`) is recorded as its tool call. What it did is in a conversation of its own, recorded as that conversation's turns where Antigravity runs its hooks there.
- A compaction that rewrites the transcript under its own step numbers would show its turns again under new trace ids. One that rewrites it between a stop and its worker's read moves the offsets the stop's size is held against.
- A turn held on a background task that never ends waits until the conversation's next prompt, holding every turn after it. A conversation that never stops again leaves its last turn unsent.
- Rows written for a turn after it was sent are not recorded.
- No image is sent, even with content on, and no release: Antigravity gives a hook neither its version nor a path to it.
- Kept traces are capped at 200 a conversation, the oldest dropped. A conversation's state file is never removed.
