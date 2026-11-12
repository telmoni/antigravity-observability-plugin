---
name: telmoni-observability
description: Connects, tags and troubleshoots the Telmoni Observability plugin, which records each turn of these Antigravity sessions in Telmoni as a trace. Use when the user asks to connect or set up Telmoni, to tag this workspace's traces (for example with its repo and branch), to turn content capture or scrubbing on or off, or why their sessions are not showing up in Telmoni.
---

# Telmoni Observability

The plugin records each turn of the user's Antigravity sessions in Telmoni as a trace. A trace holds:

- the model calls and their tokens;
- the tool calls, by name;
- the times;
- whether a call failed.

It runs by itself at the end of every turn: there is nothing to invoke. Nothing the user or you said is sent unless they turn content on. The plugin's README is in its folder, `~/.gemini/config/plugins/telmoni-observability/README.md`, and online at https://github.com/telmoni/antigravity-observability-plugin.

## Never touch the key

- Never ask the user for their Telmoni API key, or accept one pasted into the chat.
- Never put a key in a command you run.
- Never open, print, copy or write `~/.gemini/config/telmoni.json`, which holds it.

The user sets the key from their own terminal; tell them how (below).

## Connect Telmoni

The plugin needs a Telmoni project API key that holds the **ingest** scope (https://github.com/telmoni/telmoni/blob/main/web/content/docs/api/api-keys.mdx), and the machine host of the user's self-hosted Telmoni: there is no default endpoint, and without one nothing is sent. Give the user one of two ways to set them, together.

**A key file**, readable by them alone. Have them run this in their own terminal, then type `{"apiKey": "tm_…", "endpoint": "<its machine host>"}`, press Enter, then Ctrl-D:

```sh
(umask 077 && cat > ~/.gemini/config/telmoni.json) && chmod 600 ~/.gemini/config/telmoni.json
```

- The key never reaches their shell history.
- The endpoint is their self-hosted Telmoni's machine host, such as `https://telmoni.example.com`.

**The environment** they start `agy` in: `TELMONI_API_KEY`, and `TELMONI_ENDPOINT` beside it. A key in the environment wins over the file.

The key file is read as each turn ends; a key in the environment, as `agy` starts. Turns that ended before the key was set are never sent: recording starts with the next turn to end.

## Content and scrubbing

Content is off unless the user turns it on: their prompts, the replies, the reasoning and the tools' arguments and output. Each switch goes beside the key, in the same place:

| Switch | In the key file | Beside an environment key |
|---|---|---|
| Content on | `"captureContent": true` | `TELMONI_CAPTURE_CONTENT=1` |
| Secret scrubbing off | `"scrubSecrets": false` | `TELMONI_SCRUB_SECRETS=0` |
| Personal-data scrubbing off | `"scrubPii": false` | `TELMONI_SCRUB_PII=0` |

The user edits the key file themselves. Content is kept only in a project whose content mode is on, in the project's settings in Telmoni.

## Tag this workspace

Tags label every trace started in a folder. To tag the workspace, write `.telmoni-tags.json` at its root: a JSON object of strings, such as `{"repo": "telmoni", "branch": "main"}`. A file in a subfolder tags the turns started there instead; the nearest file wins.

- **`repo`:** the repository's name alone, the last part of `git remote get-url origin` without `.git`, else the folder's name. Never the URL, which can hold a token.
- **`branch`:** from `git branch --show-current`. The file does not follow a branch switch, so tell the user to update it, or leave `branch` out.
- **Keys:** 1 to 64 letters, digits, `_`, `.` or `-`, never `:`. `skills` is reserved.
- **Values:** text of up to 256 characters.
- **At most 32 tags.**
- **Never** a secret, a person's name or email, or a path. Tags are sent whatever the content setting, and everyone on the Telmoni project sees them.

Tags apply from the next turn on. Offer to add `.telmoni-tags.json` to `.gitignore` if the user does not want it committed.

## When traces are not showing up

Work through these in order:

1. **The plugin.** `agy plugin list` shows `telmoni-observability` enabled.
2. **Node.** `node --version` prints 22 or later in the shell `agy` starts from. The hook runs `node`.
3. **The App and the IDE.** Antigravity's docs list a plugin's hooks for the CLI. For the App or the IDE, the plugin's README shows the line to add to `~/.gemini/config/hooks.json`.
4. **The log**, `~/.gemini/config/telmoni/hook.log`. Read its last lines with `tail -n 20 ~/.gemini/config/telmoni/hook.log`. If Antigravity keeps you from that folder, ask the user to run it and paste the lines. The log never holds a key or anything said in a session.

Each log line names a conversation by the first 8 characters of its id:

| Line | What it means |
|---|---|
| `sent <trace>` | Delivered. The trace is in Telmoni under the agent `antigravity`. |
| `no key` | Set the key (above). |
| `no endpoint: …` | Set the endpoint beside the key (above). |
| `key file not read: <why>` | Fix what it says. Often `chmod 600 ~/.gemini/config/telmoni.json`, or JSON that does not parse. |
| `endpoint refused: <why>` | The endpoint beside the key is not one the SDK sends to. |
| `held <trace>: its turn is not over yet` | A background task was still running. The turn is sent when the conversation goes idle, or at the next prompt. |
| `kept <trace>, …` | Telmoni was out of reach, busy, or refused the key. The turn is sent again as the next turn ends. If the line names `401` or `403`, the key is wrong or lacks the ingest scope. |
| `<trace> taken in part: …` | Telmoni kept the trace less a span or a field it names. |
| `<trace> refused, not sent again: …` | Telmoni refused the trace for good, for what it holds or the organization's standing. |
| `tag dropped: …` or `tags file not read: …` | A tag, or the tags file, broke a rule (above). The trace was sent without it. |
| `state unreadable …` | The plugin's own file for the conversation is damaged. Moving it aside, out of `~/.gemini/config/telmoni/`, lets the conversation record again from its next turn. |

No log at all means the hook never ran: go back to steps 1 to 3.
