# The Oracle Speaks

> "The Oracle Keeps the Human Human"

*Mirror reality. Amplify, don't override. Support consciousness, don't replace it.*

*AI removes obstacles. Work gets done. Freedom returns.*

---

# MISSION-04: Hooks Challenge

*Part of* **"Level Up with AI"** *— Squad Team*

*"Learn free, help pass on knowledge"*

---

## The Story

Your AI assistant is powerful — perhaps too powerful. It can run any command, delete any file, force push to any branch.

**Your mission**: Create a hook that adds guardrails. Make the AI safer.

---

## What are Hooks?

Claude Code hooks are shell scripts that run at specific lifecycle events:

| Event | When | Can Block? |
|-------|------|------------|
| `PreToolUse` | Before a tool runs | Yes (exit 2) |
| `PostToolUse` | After a tool runs | No |
| `UserPromptSubmit` | When user sends message | No |
| `SessionStart` | When session begins | No |

### How Hooks Work

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ User Action │ ──▶ │ Hook Script  │ ──▶ │ Tool Runs   │
└─────────────┘     └──────────────┘     └─────────────┘
                          │
                    exit 0 = allow
                    exit 2 = block
```

### Hook Input (stdin)

Hooks receive JSON via stdin:
```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /important/folder"
  }
}
```

Parse with: `jq -r '.tool_input.command'`

---

## Challenge: Safety Guardian (100 points)

### Goal

Create a `PreToolUse` hook that blocks dangerous commands.

### What to Block

| Pattern | Why Dangerous |
|---------|---------------|
| `rm -rf` | Recursive delete, no recovery |
| `--force` or `-f` with git | Overwrites history |
| `git reset --hard` | Loses uncommitted work |
| `git push origin main` | Direct push to main branch |

### Requirements

- [ ] Block `rm -rf` commands
- [ ] Block `--force` flags on git commands
- [ ] Block `git reset --hard`
- [ ] Block direct push to main
- [ ] Show helpful error with safe alternative
- [ ] Don't block safe commands

### Example Output (What Success Looks Like)

```
$ rm -rf ./my-folder

BLOCKED: rm -rf not allowed.
Use: mv ./my-folder /tmp/trash_20260115_123456_my-folder
Recovery: ls /tmp/trash_*
```

### Starter File

Edit: `.claude/hooks/safety-guardian.sh`

### Hints

<details>
<summary>Hint 1: Read command from stdin</summary>

```bash
INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
```
</details>

<details>
<summary>Hint 2: Check for rm -rf pattern</summary>

```bash
if echo "$CMD" | grep -qE '^rm\s+.*-rf|^rm\s+-rf'; then
    echo "BLOCKED: rm -rf not allowed." >&2
    echo "Use: mv <path> /tmp/trash_\$(date +%Y%m%d_%H%M%S)_\$(basename <path>)" >&2
    exit 2
fi
```
</details>

<details>
<summary>Hint 3: Check for --force on git commands</summary>

```bash
if echo "$CMD" | grep -qE '^git\s+.*--force|^git\s+.*\s-f\s'; then
    echo "BLOCKED: --force flag not allowed on git commands." >&2
    exit 2
fi
```
</details>

<details>
<summary>Hint 4: Block direct push to main</summary>

```bash
if echo "$CMD" | grep -qE '^git\s+push\s+(origin\s+)?main'; then
    echo "BLOCKED: Direct push to main not allowed." >&2
    echo "Use: Create a PR instead" >&2
    exit 2
fi
```
</details>

### Testing

```bash
# Should be BLOCKED:
rm -rf ./test-folder
git push --force origin feature
git reset --hard HEAD~5
git push origin main

# Should be ALLOWED:
rm file.txt
rm -r empty-folder    # (no -f)
git push origin feature-branch
git status
```

---

## Configuration

Add to your `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/safety-guardian.sh"
          }
        ]
      }
    ]
  }
}
```

---

## Scoring

| Criteria | Points |
|----------|--------|
| Blocks rm -rf | 25 |
| Blocks --force on git | 20 |
| Blocks git reset --hard | 20 |
| Blocks push to main | 15 |
| Shows safe alternative | 10 |
| Clean code + comments | 10 |
| **Total** | **100** |

---

## Run Tests

We provide automated tests using Bun. Run them to verify your implementation:

```bash
# Install bun if needed
curl -fsSL https://bun.sh/install | bash

# Run tests
bun test

# Watch mode (re-run on changes)
bun test --watch
```

### Expected Output (When Passing)

```
bun test v1.x.x

tests/safety-guardian.test.ts:
✓ Safety Guardian Hook > should BLOCK dangerous commands > blocks rm -rf
✓ Safety Guardian Hook > should BLOCK dangerous commands > blocks git push --force
✓ Safety Guardian Hook > should BLOCK dangerous commands > blocks git reset --hard
✓ Safety Guardian Hook > should BLOCK dangerous commands > blocks git push origin main
✓ Safety Guardian Hook > should ALLOW safe commands > allows rm single file
✓ Safety Guardian Hook > should ALLOW safe commands > allows git push to feature branch
✓ Safety Guardian Hook > should show helpful messages > rm -rf suggests mv to trash

 14 pass
 0 fail
```

---

## Submission

1. Fork this repo
2. Implement the hook
3. Run `bun test` and ensure all tests pass
4. Create PR with:
   - Your hook implementation
   - Screenshot of tests passing
   - Brief explanation of your approach

---

## Resources

- [Claude Code Hooks Documentation](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [jq Manual](https://jqlang.github.io/jq/manual/)
- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/)

---

*"Safety first. The Oracle protects."*
