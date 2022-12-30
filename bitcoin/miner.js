const child_process = require("child_process");
const eccrypto = require("eccrypto");

const Wallet = require("./wallet");
const { Block } = require("./block");
const { hashObject } = require("./helpers");

function getBlockHash(block) {
  if (block) return hashObject(block).toString("hex");
  else return null;
}

function validateNonse(block) {
  const { bits } = block;
  const blockHash = getBlockHash(block);
  const valid = blockHash.slice(0, bits) === "0".repeat(bits);
  return valid;
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

    // subprocess used to perform work
    this.workerProcess = null;
  }
  getLastBlock() {
    if (!this.blockchain.length) return null;
    return this.blockchain[this.blockchain.length - 1];
  }
  cleanTxPool(completedTransactions) {
    // if a new block is received from the blockchain
    // then we need to remove tx that were included in it
    const txHashes = completedTransactions.map((x) => x.txHash);
    this.txPool = this.txPool.filter(!tx.hashes.includes(x.txHash));
  }
  checkForNewBlocks() {
    // do something
  }
  shareNewBlock(block) {
    // do something
  }
  createPotentialBlock(transactions, lastBlock) {
    if (transactions.every((tx) => validTransaction(tx, lastBlock))) {
      const previousBlockHash = getBlockHash(lastBlock);
      let block = new Block(transactions, previousBlockHash);
      return block;
    } else {
      console.log(
        "Transaction not valid, either the signature was bad or the tx appeared in a previous block"
      );
    }
  }
  createBlock() {
    if (this.txPool.length === 0) {
      return;
    }
    const tx = this.txPool[0];
    const lastBlock = this.getLastBlock();
    const block = this.createPotentialBlock([tx], lastBlock);
    if (!block) return;

    // Send block to worker process to find valid nonse
    const worker = child_process.fork("./minerWorker");
    worker.send({ block });

    // When nonse is found the block is added to the miners blockchain
    // and broadcast to the network
    worker.on("message", ({ nonse }) => {
      block.nonse = nonse;
      this.txPool.shift();
      this.blockchain.push(block);
      this.shareNewBlock(block);
      worker.kill();
    });
    return worker;
  }
  work(secondsPerCheck) {
    return setInterval(() => {
      if (!this.workerProcess || this.workerProcess.killed)
        this.workerProcess = this.createBlock();

      const newBlock = this.checkForNewBlocks();
      if (newBlock && validateBlock(newBlock)) {
        // new block received from network
        // kill current work
        // validate the block and add it to the chain
        // then start working again
        this.workerProcess.kill();
        this.blockchain.push(newBlock);
        this.cleanTxPool(newBlock.transactions);
      }
    }, secondsPerCheck * 1000);
  }
}

// eventually I want the block creation process to be running asynchrousnly for a miner
// so that the miner can be listening to the network for new blocks to validate
// if they successfully validate a new block from the network then they will abandon
// the block being processed and start again
// (because the existence of a new block will make the work done irrrelevant since a block
//  contains the hash of the previous block)
//
// so something like...
// async work() {
//  await tryToMakeBlocks()
//  await listenForNewBlocks()
// }
// listenForNewBlocks will not only be validating new blocks coming in. It also has to
// check to see if a fork has occured and switch if it is in the "wrong" chain
//
// Fork occurs when 2 valid blocks are submitted to the network
// at the same time.
// Miners/nodes will always except the "longest chain" in a fork situation
// "longest chain" - Not just number of blocks. The longest chain is the chain that has the
// highest "cumulative difficulty" that is valid.
// "cumulative difficulty" - the amount of proof of work. So take the total sum of all "bits"
// on all blocks

// difficulty of the network
// hashing time

module.exports = { validateNonse, Miner };
