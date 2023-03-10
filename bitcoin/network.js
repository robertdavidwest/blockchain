const Wallet = require("./wallet");
const createTransaction = require("./transaction");
const { Miner } = require("./miner");
const { Node } = require("./node");

class Network extends Node {
  constructor(numMiners, secondsPerCheck) {
    super();
    this.miners = [];
    for (let i = 0; i < numMiners; i++) {
      this.miners.push(new Miner());
    }
    this.minerIds = this.miners.map((x) => x.work(secondsPerCheck));

    this.exchangeWallet = new Wallet("exchange");
  }
  async sendBtc(wallet, toAddress, amount) {
    const pk = wallet.keys.privateKey;
    const vk = wallet.keys.publicKey;
    const fromAddress = wallet.keys.publicAddress;
    const tx = await createTransaction(pk, vk, fromAddress, toAddress, amount);
    this.sendToTxPool(tx);
  }
  createWallet(owner) {
    return new Wallet(owner);
  }
  async fundWallet(wallet, purchaseAmountBtc) {
    // create a transaction to initialize your wallet usage.
    // The transaction is sent to the network and enters the txPool of each miner
    // (simulation of purchasing BTC from exchange or elsewhere)

    // For simplicity we can assume the exchange always has enough money to
    // fund these wallets
    await this.sendBtc(this.exchangeWallet, wallet.address, purchaseAmountBtc);
  }
  getAmtPerAddress(transactionType, walletAddress) {
    // I'm not sure where this work get's done. To add the "input" transactions for a new
    // transaction. For now it lives here but I don't think a miner does this
    let address;
    if (transactionType === "sent") address = "fromAddress";
    else if (transactionType === "received") address = "toAddress";

    return this.blockchain.reduce((accum, block) => {
      const transactions = block.transactions.filter(
        (t) => t[address] === walletAddress
      );
      accum += transactions.reduce((a, x) => a + x.amount, 0);
      return accum;
    }, 0);
  }
  getWalletBalance(wallet) {
    return (
      this.getAmtPerAddress("received", wallet.address) -
      this.getAmtPerAddress("sent", wallet.address)
    );
  }
  addNewBlock(block) {
    const blockOk = this.miners.every((x) => x.validateBlock(block));
    if (blockOk) {
      this.miners.forEach((miner) => {
        miner.newBlockReceived = block;
      });
      this.blockchain.push(block);
      this.cleanTxPool(block.transactions);
    }
  }
  checkForNewBlocks() {
    // The "network" represents the concensus.
    // It checks the validity of the block against it's
    // centralized data received from all miners

    // Is it possible to model this concencus and lose the centralization?
    //
    // each miner would need to :
    //
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

    let newBlock;
    for (let i = 0; i < this.miners.length; i++) {
      const miner = this.miners[i];
      if (miner.newBlockSend) {
        newBlock = miner.newBlockSend;
        break;
      }
    }
    if (newBlock && this.validateBlock(newBlock)) {
      this.addNewBlock(newBlock);
    }
  }
}

function createMinerProcess(network, secondsPerCheck) {
  // processing a single transaction per block
  let tx = null;
  const txProcessId = setInterval(async function () {
    const txKeys = Object.keys(network.txPool);
    if (txKeys.length === 0) {
      return;
    }
    const newTx = network.txPool[txKeys[0]];
    if (tx !== newTx) {
      tx = newTx;
      network.miners.forEach((miner) => miner.sendToTxPool(tx));
    }
    network.checkForNewBlocks();
  }, secondsPerCheck * 1000);
  const processIds = network.minerIds.concat([txProcessId]);
  return processIds;
}

module.exports = { Network, createMinerProcess };
