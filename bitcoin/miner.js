const eccrypto = require("eccrypto");

const Wallet = require("./wallet");
const { Block } = require("./block");
const { hashObject } = require("./helpers");

function getBlockHash(block) {
  if (block) return hashObject(block).toString("hex");
  else return null;
}

async function validateSignature(tx) {
  try {
    await eccrypto.verify(tx.verifyKey, tx.txHash, tx.signature);
    return 1;
  } catch (error) {
    return 0;
  }
}

async function validTransaction(tx, lastBlock) {
  // Validate signature and compare transactions from
  // prior block
  const validSignature = await validateSignature(tx);

  // check to see if any of the transactions being added
  // into this block were in the previous block
  let dupTransaction = false;
  if (lastBlock) {
    dupTransaction = lastBlock.transactions.some((x) => x.txHash === tx.txHash);
  }
  const isOk = validSignature & !dupTransaction;
  return isOk;
}

function validateNonse(block) {
  const { bits } = block;
  const blockHash = getBlockHash(block);
  const valid = blockHash.slice(0, bits) === "0".repeat(bits);
  return valid;
}

function findValidNonse(block) {
  // Used by minors to create a valid block
  while (!validateNonse(block)) block.nonse++;
  return block;
}

function validateBlock(block, priorBlock) {
  // used by minors to validate potential blocks
  // that are sent to the network
  // (this method won't be used until there are multiple miners)
  const txsOk = block.transactions.every((x) =>
    validTransaction(x, priorBlock)
  );
  const nonseOk = validateNonse(block);
  const blockOk = txsOk & nonseOk;
  return blockOk;
}

// Simulates a Full node of the bitcoin network
class Miner {
  constructor() {
    this.wallet = new Wallet("Miner");

    // every node has their own copy of the blockchain
    this.blockchain = [];

    // txPool holds transactions before they are on the block chain
    // every node will have their own transaction pool
    this.txPool = [];
  }
  getLastBlock() {
    if (!this.blockchain.length) return null;
    return this.blockchain[this.blockchain.length - 1];
  }
  createNewBlock() {
    if (this.txPool.length) {
      // For simplcity I am having each block
      // contain just a single transaction for now
      const tx = this.txPool.shift();
      const lastBlock = this.getLastBlock();
      if (validTransaction(tx, lastBlock)) {
        const previousBlockHash = getBlockHash(lastBlock);
        let block = new Block([tx], previousBlockHash);
        block = findValidNonse(block);
        this.blockchain.push(block);
      } else {
        console.log(
          "Transaction not valid, either the signature was bad or the tx appeared in a previous block"
        );
      }
    }
  }
}

module.exports = Miner;
