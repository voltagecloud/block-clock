import type { BlockStats, GetBlockchainInfoResponse } from "./types.ts";

const mimeType = "text/plain";

export class BitcoinRpc {
  constructor(
    public rpcUser: string,
    public rpcPassword: string,
    public rpcEndpoint: string
  ) {}

  async fetch<T>({
    method,
    params,
    optionalHeaders,
  }: {
    method: string;
    params?: unknown[];
    optionalHeaders?: HeadersInit;
  }) {
    const fetchMethod = "POST";
    console.log(this.rpcEndpoint);
    const url = `https://${this.rpcEndpoint}`;
    console.log("url", url);
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
      Authorization: `Basic ${btoa(`${this.rpcUser}:${this.rpcPassword}`)}`,
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

  public async getBlockchainInfo() {
    return this.fetch<GetBlockchainInfoResponse>({
      method: "getblockchaininfo",
    });
  }

  public async getBestBlockHash() {
    return this.fetch<string>({
      method: "getbestblockhash",
    });
  }

  public async getBlockStats({
    hashOrHeight,
    stats,
  }: {
    hashOrHeight: number | string;
    stats: (keyof BlockStats)[];
  }) {
    return this.fetch<BlockStats>({
      method: "getblockstats",
      params: [hashOrHeight, stats],
    });
  }
}
