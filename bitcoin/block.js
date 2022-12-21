const { MerkleTree } = require("merkletreejs");
const SHA256 = require("crypto-js/sha256");

const MAGIC_NUMBER = 123;
const BLOCK_VERSION = "1.0.0";

// For simplcity I am having each block
// contain just a single transaction
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
  }
}

module.exports = Block;
