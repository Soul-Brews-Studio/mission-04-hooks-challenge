import { describe, test, expect, beforeAll } from "bun:test";
import { $ } from "bun";
import { resolve, dirname } from "path";

const HOOK = resolve(dirname(import.meta.path), "../.claude/hooks/safety-guardian.sh");

describe("Safety Guardian Hook", () => {

  // ==========================================================================
  // These tests should PASS when the hook is implemented correctly
  // ==========================================================================

  describe("should BLOCK dangerous commands", () => {

    test("blocks rm -rf", async () => {
      const result = await $`echo '{"tool_input":{"command":"rm -rf /tmp/test"}}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(2);
      expect(result.stderr.toString()).toContain("BLOCKED");
    });

    test("blocks rm -r -f (separate flags)", async () => {
      const result = await $`echo '{"tool_input":{"command":"rm -r -f ./folder"}}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(2);
    });

    test("blocks git push --force", async () => {
      const result = await $`echo '{"tool_input":{"command":"git push --force origin main"}}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(2);
      expect(result.stderr.toString()).toContain("BLOCKED");
    });

    test("blocks git push -f", async () => {
      const result = await $`echo '{"tool_input":{"command":"git push -f origin feature"}}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(2);
    });

    test("blocks git reset --hard", async () => {
      const result = await $`echo '{"tool_input":{"command":"git reset --hard HEAD~5"}}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(2);
      expect(result.stderr.toString()).toContain("BLOCKED");
    });

    test("blocks git push origin main", async () => {
      const result = await $`echo '{"tool_input":{"command":"git push origin main"}}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(2);
      expect(result.stderr.toString()).toContain("BLOCKED");
    });

    test("blocks git push main", async () => {
      const result = await $`echo '{"tool_input":{"command":"git push main"}}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(2);
    });

  });

  // ==========================================================================
  // These tests should PASS - safe commands should be ALLOWED
  // ==========================================================================

  describe("should ALLOW safe commands", () => {

    test("allows rm single file", async () => {
      const result = await $`echo '{"tool_input":{"command":"rm file.txt"}}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(0);
    });

    test("allows rm -r (without -f)", async () => {
      const result = await $`echo '{"tool_input":{"command":"rm -r empty-folder"}}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(0);
    });

    test("allows git push to feature branch", async () => {
      const result = await $`echo '{"tool_input":{"command":"git push origin feature-branch"}}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(0);
    });

    test("allows git status", async () => {
      const result = await $`echo '{"tool_input":{"command":"git status"}}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(0);
    });

    test("allows git log", async () => {
      const result = await $`echo '{"tool_input":{"command":"git log --oneline"}}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(0);
    });

    test("allows empty input", async () => {
      const result = await $`echo '{}' | ${HOOK}`.nothrow();
      expect(result.exitCode).toBe(0);
    });

  });

  // ==========================================================================
  // BONUS: Check for helpful error messages
  // ==========================================================================

  describe("should show helpful messages", () => {

    test("rm -rf suggests mv to trash", async () => {
      const result = await $`echo '{"tool_input":{"command":"rm -rf ./folder"}}' | ${HOOK}`.nothrow();
      expect(result.stderr.toString()).toMatch(/mv|trash|tmp/i);
    });

    test("push main suggests PR", async () => {
      const result = await $`echo '{"tool_input":{"command":"git push origin main"}}' | ${HOOK}`.nothrow();
      expect(result.stderr.toString()).toMatch(/PR|pull request|branch/i);
    });

  });

});
