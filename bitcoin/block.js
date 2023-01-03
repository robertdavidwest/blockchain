const { MerkleTree } = require("merkletreejs");
const SHA256 = require("crypto-js/sha256");

const MAGIC_NUMBER = 123;
const BLOCK_VERSION = "1.0.0";

function getBlockReward(blockchainLength) {
  const init = genesisBlockInfo.initialBlockReward;
  const expoonent = Math.floor(
    blockchainLength / genesisBlockInfo.blocksPerHalfing
  );
  return init * Math.pow(0.5, expoonent);
}

class Block {
  constructor(transactions, previousBlockHash, reward) {
    // identifies the bitcoin blockchain
    // could also be prod or dev network etc
    this.magicNumber = MAGIC_NUMBER;

    // max amt of data for each block
    this.blockSize = "1mb"; // for bitcoin 1mb

    this.blockHeader = "meta data about the block";

    this.transactionCount = transactions.length; // no. of transactions stored on the block

    this.transactions = transactions;

    this.version = BLOCK_VERSION;

    this.previousBlockHash = previousBlockHash;

    const tree = new MerkleTree(
      transactions.map((x) => x.txHash),
      SHA256
    );
    this.hashMerkleRoot = tree.getRoot().toString("hex");

    this.timestamp = new Date(Date.now());

    // the difficulty rating of the block
    // more bits, difficulty of blockchain increases
    // making it more difficult to mine the block
    this.bits = 4; // needs to be added

    // Nonse - a special number
    // determined by minors
    // Added to the end of the Block by a Minor as their proof
    // as a valid block
    // (and that a certain amt of work has been done to validate this block)
    // A valid Nonse is the "Proof of work"
    this.nonse = 0;

    // blockReward - how much bitcoin will be given to the minor
    // that successfully mines the block
    // typically decreases as the network gets older
    // (this is the case with bitcoin)
    this.blockReward = reward;
    // Bitcoin:
    // first block created has a reward of 50 BTC
    // by 2012 reward was halved to 25 BTC
    // 2016 halved again 12.5 BTC
    // 2020 halved 6.25 BTC
  }
}

// Here is a the Genesis Block. This is just conceptual information at this stage
// Its not used in the simulation yet
const genesisBlockInfo = {
  // Has additional properties beyond a block:

  // - Difficulty and difficulty interval for the blockchain:
  // ( defines how the difficulty is increasing or decreasing as blocks are added )
  // block difficulty is adjusted every 2 weeks on the bitcoin blockchain network - as of 12/2022
  // (based on the volume of the network )
  // Bitcoin wants to have an average blocktime of 10 minutes
  // (1 new block, to be created every 10 minutes)

  // - Reward for mining:
  // every time somone is "rewarded" with bitcoin. This is new coin. It is created at this
  // point (you increase the supply)
  // eventually the reward can reach zero and the minors will only
  // be incentivized by picking up the transactions fees associated with a block

  // - Circulating Supply:
  // There is a given "circulating supply" of coins at any given time (or qty of blocks)
  // max possible "circlulating supply" of Bitcoin will be 21 million
  // Before any blocks were mined there was 0 BTC in circulation
  // Satoshi mined the first block and mined many subsequent blocks
  // bringing 50 BTC into supply
  initialBlockReward: 50,
  blocksPerHalfing: 2, // network is actuall 210,000 (approx every 4 years)
};
module.exports = { getBlockReward, Block };
