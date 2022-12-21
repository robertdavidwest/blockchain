const { MerkleTree } = require("merkletreejs");
const SHA256 = require("crypto-js/sha256");

const MAGIC_NUMBER = 123;
const BLOCK_VERSION = "1.0.0";

class Block {
  constructor(transactions, previousBlockHash) {
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
    this.bits = null; // needs to be added

    // Nonse - a special number
    // determined by minors
    // Added to the end of the Block by a Minor as their proof
    // as a valid block
    // (and that a certain amt of work has been done to validate this block)
    this.nonse = null; // needs to be implemented

    // blockReward - how much bitcoin will be given to the minor
    // that successfully mines the block
    // typically decreases as the network gets older
    // (this is the case with bitcoin)
    this.blockReward = null;
    // Bitcoin:
    // first block created has a reward of 50 BTC
    // by 2012 reward was halved to 25 BTC
    // 2016 halved again 12.5 BTC
    // 2020 halved 6.25 BTC
  }
}

// Here is a the Genesis Block. This is just conceptual information at this stage
// Its not used in the simulation yet
class GenesisBlock extends Block {
  // Has additional properties beyond a block:

  // - Difficulty and difficulty interval for the blockchain:
  // ( defines how the difficulty is increasing or decreasing as blocks are added )

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

  constructor(transactions) {
    super(transactions, null);
    this.blockReward = 50;
  }
}
module.exports = { Block, GenesisBlock };
