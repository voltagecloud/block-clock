import type { BlockStats, GetBlockchainInfoResponse } from "./types.ts";

const mimeType = "text/plain";

// TODO: This is temporary and will eventually not be necessary because the backend will hold the credentials and URL
const rpcUser = "frontend";
const rpcPassword = "quintet-chill-palatable-figment";
const apiEndpoint = "bitcoind-prune1100.m.staging.voltageapp.io";

type RpcFetchArgs = {
  rpcUser: string;
  rpcPassword: string;
  apiEndpoint: string;
  method: string;
  params?: unknown[];
  optionalHeaders?: HeadersInit;
};

export async function bitcoinRpcFetch<T>({
  rpcUser,
  rpcPassword,
  apiEndpoint,
  params,
  method,
  optionalHeaders,
}: RpcFetchArgs) {
  const fetchMethod = "POST";
  const url = `https://${apiEndpoint}`;
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

export async function getBlockchainInfo() {
  return bitcoinRpcFetch<GetBlockchainInfoResponse>({
    rpcUser,
    rpcPassword,
    apiEndpoint,
    method: "getblockchaininfo",
  });
}

export async function getBestBlockHash() {
  return bitcoinRpcFetch<string>({
    rpcUser,
    rpcPassword,
    apiEndpoint,
    method: "getbestblockhash",
  });
}

export async function getBlockStats({
  hashOrHeight,
  stats,
}: {
  hashOrHeight: number | string;
  stats: (keyof BlockStats)[];
}) {
  return bitcoinRpcFetch<BlockStats>({
    rpcUser,
    rpcPassword,
    apiEndpoint,
    method: "getblockstats",
    params: [hashOrHeight, stats],
  });
}

export class RpcClient {
  constructor(
    public rpcUser: string,
    public rpcPassword: string,
    public apiEndpoint: string
  ) {}

  get rpcUrl() {
    return `https://${this.apiEndpoint}`;
  }
}
