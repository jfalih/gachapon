import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/** Type-safe, validated client env. Add new NEXT_PUBLIC_* vars here. */
export const env = createEnv({
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_GATEWAY_URL: z.string().url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
  },
  emptyStringAsUndefined: true,
});
