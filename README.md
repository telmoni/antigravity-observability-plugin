# Telmoni for Antigravity

Records each turn of your [Antigravity](https://antigravity.google) sessions in [Telmoni](https://telmoni.com) as a run: the models it called and their tokens, the tools it used and the compactions it made, each with its times and whether it failed. Nothing you or the agent said, unless you turn on **content** and the project keeps content: then each turn's conversation too.

[Telmoni](https://github.com/telmoni/telmoni) is open-source monitoring for AI agents: with your sessions recorded, its [alerts](https://telmoni.com/docs/monitoring/alerts) tell you when a turn fails, loops on one tool or costs more than you set, and show you the turn that did it.

## Install

You need the Antigravity CLI (`agy`) and [Node.js](https://nodejs.org) 22 or later on your `PATH`. The plugin runs as a `Stop` hook. Antigravity's docs list a plugin's hooks for its CLI.

```sh
agy plugin install https://github.com/telmoni/antigravity-observability-plugin
```

Or from a clone:

```sh
git clone https://github.com/telmoni/antigravity-observability-plugin.git
agy plugin install ./antigravity-observability-plugin
```

Antigravity copies the plugin into `~/.gemini/config/plugins/telmoni-observability/`. There is nothing to build: the hook runs the bundle committed in `dist/`, which holds the [Telmoni TypeScript SDK](https://telmoni.com/docs/api/sdks). Start a new session once the plugin is installed and the key is set (below).

To update, install it again: from its address, or from your clone after `git pull`. Antigravity replaces the copy it has.

### The Antigravity App and IDE

Antigravity's [hooks docs](https://antigravity.google/docs/hooks) list a plugin's hooks for the CLI alone. For the App and the IDE, they list your global `~/.gemini/config/hooks.json`. If their sessions don't show up in Telmoni, add the plugin's hook there, beside any you have:

```json
{
  "telmoni-observability": {
    "Stop": [{ "type": "command", "command": "node ~/.gemini/config/plugins/telmoni-observability/dist/hook.mjs", "timeout": 10 }]
  }
}
```

Where the CLI runs both, each turn is still sent once.

## Configure

The plugin needs a [project API key](https://telmoni.com/docs/api/api-keys) that holds the **ingest** scope. Antigravity gives a plugin's hooks no settings of their own, so the key goes in one of two places.

**A key file**, `~/.gemini/config/telmoni.json`, readable by you alone. Run this, then type `{"apiKey": "tm_…"}`, press Enter, then Ctrl-D. The key never reaches your shell history:

```sh
(umask 077 && cat > ~/.gemini/config/telmoni.json) && chmod 600 ~/.gemini/config/telmoni.json
```

Add `"endpoint"` for a self-hosted Telmoni, which gives its machine host. The plugin reads the file only while it is yours and shut to everyone else. If anyone else can read it, the plugin sends nothing and says why in its log.

**The environment** the CLI starts in: `TELMONI_API_KEY`, and `TELMONI_ENDPOINT` beside it for a self-hosted Telmoni. A key in the environment comes first, and the file is then not read. A key is never sent to an endpoint named somewhere else.

Left blank, the endpoint is `https://api.telmoni.com`. The key file is read as each turn ends, so a change takes effect from the next turn. A key in the environment is read as the CLI starts.

### Ask the agent

The plugin brings a skill, `telmoni-observability`, so you can ask the agent in plain words to help connect Telmoni, to tag this workspace's runs with its repo and branch, or to work out why your sessions aren't showing up. The skill never asks for your key or reads the key file: it tells you what to run in your own terminal.

### A turn's conversation

**Content** is off unless you turn it on: `"captureContent": true` in the key file, or `TELMONI_CAPTURE_CONTENT=1` beside a key in the environment. With it on, each turn carries its conversation too:

- your prompt as you typed it, without the metadata Antigravity wraps it in;
- each reply, with the reasoning Antigravity wrote in plain text;
- each tool's arguments and output;
- each compaction's summary.

Telmoni keeps it only in a project whose [content mode](https://telmoni.com/docs/workspace/organizations-and-projects#a-projects-content-mode) is on. For any other project, nothing of the conversation leaves your machine.

**Scrubbing secrets** and **personal data** are on unless you turn them off: `"scrubSecrets": false` or `"scrubPii": false` in the key file, or `TELMONI_SCRUB_SECRETS=0` or `TELMONI_SCRUB_PII=0` beside a key in the environment. Before content leaves, each match is replaced with a marker such as `[secret: aws_key]` or `[pii: email]`:

- secrets: keys, tokens, passwords, private keys and connection strings;
- personal data: emails, phone numbers, card numbers, IP addresses and home folders' paths.

No pattern finds a name or a street address.

## What a turn records

A turn, from your prompt to the agent's last reply, is one run of the agent `antigravity`. Your conversation is the run's session, so the console groups a conversation's runs together. Inside the run:

- **Model calls.** One per model call Antigravity made. Each names the conversation's model, its effort apart: `gemini-3.8-flash-low` is `gemini-3.8-flash` at `low`. Each has its input, output and cache-read tokens.
- **Tool calls.** Each by its name, with its time. A call fails where Antigravity recorded an error, or a command's non-zero exit code where it records one. A call never answered is cancelled.
- **API errors.** Each is a failed model call, named by its kind (`rate_limit`, `server_error`), never its message.
- **Compactions.** Each is a step named `compaction`, with the model call that made it.

A turn you cancel is a cancelled run. A turn an error ended, or one that hit Antigravity's limits (`max_invocations`), is a failed one.

A turn is sent when Antigravity's loop stops with no background task still running. A turn whose background task outlasts it is sent at the stop that finds the conversation idle. The first stop the plugin hears in a conversation records that turn on: turns from before the plugin was installed, or before a key was set, stay on your machine.

With content off, the plugin reads only:

- each step's kind, time and status;
- each model call's tokens;
- each tool call's name;
- a command's exit code;
- an error's code.

It never keeps or sends your prompt, a reply, the reasoning, a tool's arguments or output, a file's path or contents, the workspace's folders, the transcript's path, a compaction's summary or an error's message. With content on, it sends the conversation above, and still never the workspace's folders or the transcript's path, beyond what you or the agent wrote in the conversation itself.

## Tags

A `.telmoni-tags.json` in your workspace folder, or the nearest folder above it, labels every turn started there, for example `{"repo": "telmoni", "branch": "main"}`.

- The file is read for its tags alone, never through a link, and its path is never sent.
- A key is 1 to 64 letters, digits, `_`, `.` or `-`, and a value up to 256 characters.
- A turn carries 32 tags at most.

A tag that breaks a rule is dropped with a line in the log, and the turn is sent without it. Tags are metadata: they are sent in every content mode and everyone on the project can see them, so a secret or a personal detail never belongs in one.

## When nothing shows up

The hook runs as each turn ends and hands the work to a process of its own, so no turn waits on Telmoni. Its log is `~/.gemini/config/telmoni/hook.log`. Each line names a conversation by the start of its id, never anything said in it, and says one of:

- a turn sent;
- no key;
- a key file passed over, and why;
- an endpoint the SDK refused;
- a turn held because its conversation was still at work;
- a turn Telmoni could not take, which is kept and sent again at the next turn's end;
- a turn it refused for good.

Kept turns are capped at the newest 200 a conversation.

If the log is missing, check that `node --version` prints 22 or later in the shell you start `agy` from, and that `agy plugin list` shows the plugin enabled.

To remove the plugin, run `agy plugin uninstall telmoni-observability`, then delete `~/.gemini/config/telmoni.json` and `~/.gemini/config/telmoni/`.

## Developing

[ARCHITECTURE.md](ARCHITECTURE.md) says how the plugin works, and how to build and test it from a checkout. To contribute, start with Telmoni's [contributing guide](https://telmoni.com/docs/contributing/introduction).

## License

Apache-2.0.
