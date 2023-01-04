const eccrypto = require("eccrypto");
const { hashObject } = require("./helpers");

async function validateSignature(tx) {
  try {
    await eccrypto.verify(tx.verifyKey, tx.txHash, tx.signature);
    return 1;
  } catch (error) {
    return 0;
  }
}

// A node on the network
// could be a miner or another full node
// We extend this class to create miners
// and also use it for our Network object which simulates
// concencus
class Node {
  constructor() {
    // every node has their own copy of the blockchain
    this.blockchain = [];

    // txPool holds transactions before they are on the block chain
    // every node will have their own transaction pool
    this.txPool = [];
  }
  getBlockHash(block) {
    if (block) return hashObject(block).toString("hex");
    else return null;
  }
  validateNonse(block) {
    const { bits } = block;
    const blockHash = this.getBlockHash(block);
    const valid = blockHash.slice(0, bits) === "0".repeat(bits);
    return valid;
  }
  async validateTransaction(tx, lastBlock) {
    // Validate signature and compare transactions from
    // prior block
    const validSignature = await validateSignature(tx);

    // check to see if any of the transactions being added
    // into this block were in the previous block
    let dupTransaction = false;
    if (lastBlock) {
      dupTransaction = lastBlock.transactions.some(
        (x) => x.txHash === tx.txHash
      );
    }
    const isOk = validSignature & !dupTransaction;
    return isOk;
  }
  getLastBlock() {
    if (!this.blockchain.length) return null;
    return this.blockchain[this.blockchain.length - 1];
  }
  getLastBlockHash() {
    if (!this.getLastBlock()) return null;
    else return this.getBlockHash(this.getLastBlock());
  }
  cleanTxPool(completedTransactions) {
    // if a new block is received from the blockchain
    // then we need to remove tx that were included in it
    const txHashes = completedTransactions.map((x) => x.txHash);
    this.txPool = this.txPool.filter((tx) => !txHashes.includes(tx.txHash));
  }
  validateBlock(block) {
    // used by minors to validate potential blocks
    // that are sent to the network
    // (this method won't be used until there are multiple miners)
    const priorBlock = this.getLastBlock();
    const txsOk = block.transactions.every((x) =>
      this.validateTransaction(x, priorBlock)
    );
    const nonseOk = this.validateNonse(block);
    const prevHashOk = block.previousBlockHash === this.getLastBlockHash();
    const blockOk = txsOk & nonseOk & prevHashOk;
    return blockOk;
  }
}

module.exports = { Node };
