#!/bin/bash
# =============================================================================
# MISSION-04: Safety Guardian
# =============================================================================
#
# Goal: Block dangerous commands before they execute
#
# Input: JSON via stdin with tool_input.command
# Output: exit 0 (allow) or exit 2 (block with stderr message)
#
# What to block:
# - rm -rf (recursive force delete)
# - --force or -f on git commands
# - git reset --hard
# - git push origin main (direct to main)
#
# =============================================================================

# Step 1: Read JSON input from stdin
INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# If no command or empty, allow
if [ -z "$CMD" ]; then
    exit 0
fi

# =============================================================================
# Step 2: Check for rm -rf
# =============================================================================
# TODO: Block "rm -rf" pattern
# Remember to:
# - Output error to stderr (>&2)
# - Suggest safe alternative (mv to /tmp/trash_...)
# - Exit with code 2 to block
#
# YOUR CODE HERE


# =============================================================================
# Step 3: Check for --force on git commands
# =============================================================================
# TODO: Block git commands with --force or -f flag
# Examples to block:
# - git push --force
# - git push -f origin branch
#
# YOUR CODE HERE


# =============================================================================
# Step 4: Check for git reset --hard
# =============================================================================
# TODO: Block "git reset --hard"
# This loses uncommitted work!
#
# YOUR CODE HERE


# =============================================================================
# Step 5: Check for direct push to main
# =============================================================================
# TODO: Block "git push origin main" or "git push main"
# Suggest creating a PR instead
#
# YOUR CODE HERE


# =============================================================================
# If we got here, the command is safe
# =============================================================================
exit 0
