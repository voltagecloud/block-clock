type SoftforkStatus = "defined" | "started" | "locked_in" | "active" | "failed";
type SoftforkType = "buried" | "bip9";

type Bip9Statistics = {
  period: number;
  threshold: number;
  elapsed: number;
  count: number;
  possible: boolean;
};

type Bip9 = {
  status: SoftforkStatus;
  bit?: number; // Only for "started" status
  start_time: number;
  timeout: number;
  since: number;
  statistics?: Bip9Statistics; // Only for "started" status
};

type Softfork = {
  type: SoftforkType;
  bip9?: Bip9; // Only for "bip9" type
  height: number; // For "buried" type, or "bip9" type with "active" status
  active: boolean;
};

export type GetBlockchainInfoResponse = {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  time: number;
  mediantime: number;
  verificationprogress: number;
  initialblockdownload: boolean;
  chainwork: string;
  size_on_disk: number;
  pruned: boolean;
  pruneheight?: number; // Only present if pruning is enabled
  automatic_pruning?: boolean; // Only present if pruning is enabled
  prune_target_size?: number; // Only present if automatic pruning is enabled
  softforks: Record<string, Softfork>;
  warnings: string;
};

export type BlockStats = {
  avgfee?: number; // Average fee in the block
  avgfeerate?: number; // Average feerate (in satoshis per virtual byte)
  avgtxsize?: number; // Average transaction size
  blockhash?: string; // The block hash (to check for potential reorgs)
  feerate_percentiles?: [
    // Feerates at the 10th, 25th, 50th, 75th, and 90th percentile weight unit (in satoshis per virtual byte)
    number, // The 10th percentile feerate
    number, // The 25th percentile feerate
    number, // The 50th percentile feerate
    number, // The 75th percentile feerate
    number, // The 90th percentile feerate
  ];
  height?: number; // The height of the block
  ins?: number; // The number of inputs (excluding coinbase)
  maxfee?: number; // Maximum fee in the block
  maxfeerate?: number; // Maximum feerate (in satoshis per virtual byte)
  maxtxsize?: number; // Maximum transaction size
  medianfee?: number; // Truncated median fee in the block
  mediantime?: number; // The block median time past
  mediantxsize?: number; // Truncated median transaction size
  minfee?: number; // Minimum fee in the block
  minfeerate?: number; // Minimum feerate (in satoshis per virtual byte)
  mintxsize?: number; // Minimum transaction size
  outs?: number; // The number of outputs
  subsidy?: number; // The block subsidy
  swtotal_size?: number; // Total size of all segwit transactions
  swtotal_weight?: number; // Total weight of all segwit transactions
  swtxs?: number; // The number of segwit transactions
  time?: number; // The block time
  total_out?: number; // Total amount in all outputs (excluding coinbase and thus reward [ie subsidy + totalfee])
  total_size?: number; // Total size of all non-coinbase transactions
  total_weight?: number; // Total weight of all non-coinbase transactions
  totalfee?: number; // The fee total
  txs?: number; // The number of transactions (including coinbase)
  utxo_increase?: number; // The increase/decrease in the number of un
  utxo_size_inc?: number; // The increase/decrease in size for the utxo index (not discounting op_return and similar)
};
