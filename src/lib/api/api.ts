import type { BlockStats, GetBlockchainInfoResponse } from "./types.ts";

const mimeType = "text/plain";

type RpcConfig = {
  rpcUser: string;
  rpcPassword: string;
  rpcEndpoint: string;
};

type FetchOptions = {
  method: string;
  params?: unknown[];
  optionalHeaders?: HeadersInit;
};

type RpcFetchOptions = RpcConfig & FetchOptions;

type ProxyConfig = {
  proxyEndpoint: string;
  token: string;
};

type ProxyFetchOptions = ProxyConfig & FetchOptions;

type UniversalFetchOptions = RpcFetchOptions | ProxyFetchOptions;

export async function proxyFetch<T>({
  proxyEndpoint,
  token,
  method,
  params,
  optionalHeaders,
}: ProxyFetchOptions) {
  const fetchMethod = "POST";
  const url = proxyEndpoint;
  const body = {
    method,
    params,
  };
  const init: RequestInit = {
    method: fetchMethod,
    body: JSON.stringify(body),
    headers: {
      ...optionalHeaders,
      "Content-Type": mimeType,
      Authorization: `Bearer ${token}`,
    },
  };

  const result = await window.fetch(url, init);

  if (!result.ok) {
    throw new Error(result.statusText || `${method} 😱 ${result.status}`);
  }

  return (await result.json()) as T;
}

export async function rpcFetch<T>({
  rpcUser,
  rpcPassword,
  rpcEndpoint,
  method,
  params,
  optionalHeaders,
}: RpcFetchOptions) {
  const fetchMethod = "POST";
  const url = rpcEndpoint;
  const body = {
    jsonrpc: "1.0",
    method,
    params,
  };
  const init: RequestInit = {
    method: fetchMethod,
    body: JSON.stringify(body),
  };
  let headers: HeadersInit = {
    ...optionalHeaders,
    "Content-Type": mimeType,
    ...(rpcUser && rpcPassword
      ? { Authorization: `Basic ${btoa(`${rpcUser}:${rpcPassword}`)}` }
      : {}),
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

export async function fetch<T>(options: UniversalFetchOptions): Promise<T> {
  if ("proxyEndpoint" in options && "token" in options) {
    return proxyFetch<T>(options);
  } else if (
    "rpcUser" in options &&
    "rpcPassword" in options &&
    "rpcEndpoint" in options
  ) {
    return rpcFetch<T>(options);
  } else {
    throw new Error(
      "Invalid configuration: Must provide either RPC or Proxy config"
    );
  }
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
