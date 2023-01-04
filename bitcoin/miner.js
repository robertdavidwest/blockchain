const child_process = require("child_process");

const Wallet = require("./wallet");
const createTransaction = require("./transaction");
const { getBlockReward, Block } = require("./block");
const { Node } = require("./node");

// Simulates a Full node of the bitcoin network
class Miner extends Node {
  constructor() {
    super();
    this.wallet = new Wallet("Miner");

    // subprocess used to perform work
    this.workerProcess = null;

    // new block sent to the network
    this.newBlockSend = null;

    // new block received from the network
    this.newBlockReceived = null;
  }
  async getBlockRewardTx(reward) {
    // new bitcoin is minted after a successful block creation
    // im not sure how the actual blockchain mints money
    // im just creating a transaction from a minter
    const minter = new Wallet("reward");
    return await createTransaction(
      minter.keys.privateKey,
      minter.keys.publicKey,
      minter.keys.publicAddress,
      this.wallet.address,
      reward
    );
  }
  sendNewBlock(block) {
    this.newBlockSend = block;
    this.cleanTxPool(block.transactions);
  }
  checkForNewBlocksReceived() {
    let newBlock;
    if (this.newBlockReceived) newBlock = this.newBlockReceived;
    this.newBlockReceived = null;
    if (newBlock && this.validateBlock(newBlock)) {
      // validate the block and add it to the chain
      this.blockchain.push(newBlock);

      // if any block was waiting for review it is now invalid
      this.newBlockSend = null;
      this.cleanTxPool(newBlock.transactions);
      return 1;
    }
    return 0;
  }
  async createPotentialBlock(transactions, lastBlock) {
    if (transactions.every((tx) => this.validateTransaction(tx, lastBlock))) {
      const previousBlockHash = this.getBlockHash(lastBlock);

      // add miner reward to transactions
      const reward = getBlockReward(this.blockchain.length);
      const rewardTx = await this.getBlockRewardTx(reward);
      transactions.push(rewardTx);

      let block = new Block(transactions, previousBlockHash, reward);
      return block;
    } else {
      console.log(
        "Transaction not valid, either the signature was bad or the tx appeared in a previous block"
      );
    }
  }
  async createBlock() {
    const txKeys = Object.keys(this.txPool);

    if (txKeys.length === 0) {
      return;
    }
    const tx = this.txPool[txKeys[0]];
    const lastBlock = this.getLastBlock();
    const block = await this.createPotentialBlock([tx], lastBlock);
    if (!block) return;

    // Send block to worker process to find valid nonse
    const worker = child_process.fork("./minerWorker");
    worker.send({ block });

    // Block Validation:
    // When nonse is found the block is added to the miners blockchain
    // and broadcast to the network
    worker.on("message", async ({ nonse }) => {
      block.nonse = nonse;
      this.sendNewBlock(block);
      worker.kill();
    });
    return worker;
  }
  work(secondsPerCheck) {
    return setInterval(async () => {
      if (!this.workerProcess || this.workerProcess.killed)
        this.workerProcess = await this.createBlock();

      if (this.checkForNewBlocksReceived() && this.workerProcess) {
        // new block received from network
        // kill current work
        this.workerProcess.kill();
      }
    }, secondsPerCheck * 1000);
  }
}

module.exports = { Miner };
