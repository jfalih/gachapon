import qs from "query-string";

import { env } from "@/services/env/client";

type RecordQuery = Record<string, string | number | boolean | null | undefined>;

/**
 * Build a fully-qualified gateway URL. `query-string` drops `undefined` values
 * automatically, so optional params can be passed through as-is.
 */
export const gatewayUrl = (path: string, query?: RecordQuery): string => {
  const base = env.NEXT_PUBLIC_GATEWAY_URL;
  const url = new URL(path, base).toString();
  return qs.stringifyUrl({ url, query: query as qs.StringifiableRecord });
};

export const apiUrl = gatewayUrl;
