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

module.exports = Block;
