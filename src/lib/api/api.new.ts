import type { BlockStats, GetBlockchainInfoResponse } from "./types.ts";

const mimeType = "text/plain";

type RpcConfig = {
  rpcUser: string;
  rpcPassword: string;
  rpcEndpoint: string;
};

type FetchOptions = RpcConfig & {
  method: string;
  params?: unknown[];
  optionalHeaders?: HeadersInit;
};

export async function fetch<T>({
  rpcUser,
  rpcPassword,
  rpcEndpoint,
  method,
  params,
  optionalHeaders,
}: FetchOptions) {
  const fetchMethod = "POST";
  const url = `https://${rpcEndpoint}`;
  const body = {
    jsonrpc: "1.0",
    method,
    params,
  };
  const init: RequestInit = {
    method: fetchMethod,
    body: JSON.stringify(body),
  };
  const headers: HeadersInit = {
    ...optionalHeaders,
    "Content-Type": mimeType,
    Authorization: `Basic ${btoa(`${rpcUser}:${rpcPassword}`)}`,
  };
  const result = await window.fetch(url, { ...init, headers });

  if (!result.ok) {
    throw new Error(result.statusText || `${method} 😱 ${result.status}`);
  }

  const data = await result.json().catch();

  if (data.error) {
    throw new Error(`Error ${data.error.code}: ${data.error.message}`);
  }

  return data.result as T;
}

export async function getBlockchainInfo(config: RpcConfig) {
  return fetch<GetBlockchainInfoResponse>({
    method: "getblockchaininfo",
    ...config,
  });
}

export async function getBestBlockHash(config: RpcConfig) {
  return fetch<string>({
    method: "getbestblockhash",
    ...config,
  });
}

export async function getBlockStats({
  hashOrHeight,
  stats,
  ...config
}: {
  hashOrHeight: number | string;
  stats: (keyof BlockStats)[];
} & RpcConfig) {
  return fetch<BlockStats>({
    method: "getblockstats",
    params: [hashOrHeight, stats],
    ...config,
  });
}