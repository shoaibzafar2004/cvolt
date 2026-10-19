import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Integration tests run the real route handlers against the local Supabase
// stack (`npm run db:start` locally, `supabase start` in CI). URLs and keys
// come from `supabase status`, never from .env.local.
function supabaseEnv(): Record<string, string> {
  let out: string;
  try {
    out = execSync("npx supabase status -o env", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    throw new Error(
      "Local Supabase isn't running — start it with `npm run db:start`.",
    );
  }
  const vars = Object.fromEntries(
    [...out.matchAll(/^([A-Z_]+)="(.*)"$/gm)].map((m) => [m[1], m[2]]),
  );
  return {
    NEXT_PUBLIC_SUPABASE_URL: vars.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: vars.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: vars.SERVICE_ROLE_KEY,
  };
}

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./tests/stubs/empty.ts", import.meta.url),
      ),
    },
  },
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    // Tests in a file share state (one purchase walked through its lifecycle)
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 120_000,
    hookTimeout: 120_000,
    env: {
      ...supabaseEnv(),
      STRIPE_SECRET_KEY: "sk_test_integration",
      STRIPE_WEBHOOK_SECRET: "whsec_integration_test_secret",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    },
  },
});
