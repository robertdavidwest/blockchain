const Wallet = require("./wallet");
const createTransaction = require("./transaction");
const { getBlockHash, Miner } = require("./miner");

class Network {
  constructor(numMiners, secondsPerCheck) {
    this.miners = [];
    for (let i = 0; i < numMiners; i++) {
      this.miners.push(new Miner());
    }
    this.minerIds = this.miners.map((x) => x.work(secondsPerCheck));

    this.txPool = [];
    this.blockchain = [];

    this.exchangeWallet = new Wallet("exchange");
  }
  getLastBlock() {
    if (!this.blockchain.length) return null;
    return this.blockchain[this.blockchain.length - 1];
  }
  getLastBlockHash() {
    if (!this.getLastBlock()) return null;
    else return getBlockHash(this.getLastBlock());
  }
  addNewBlock(resetMiners, block) {
    const blockOk = resetMiners.every((x) => x.validateBlock(block));
    if (blockOk) {
      resetMiners.forEach((miner) => {
        miner.newBlock = block;
      });
      this.blockchain.push(block);
    }
  }
  checkForNewBlocks() {
    const lastBlockHash = this.getLastBlockHash();
    let newBlock;
    const resetMiners = [];
    this.miners.forEach((miner) => {
      if (miner.getLastBlockHash() !== lastBlockHash) {
        newBlock = miner.getLastBlock();
      } else {
        resetMiners.push(miner);
      }
    });
    if (newBlock) {
      this.addNewBlock(resetMiners, newBlock);
      return 1;
    }
    return 0;
  }
  async sendBtc(wallet, toAddress, amount) {
    const pk = wallet.keys.privateKey;
    const vk = wallet.keys.publicKey;
    const fromAddress = wallet.keys.publicAddress;
    const tx = await createTransaction(pk, vk, fromAddress, toAddress, amount);
    this.txPool.push(tx);
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
}

function createMinerProcess(network, secondsPerCheck) {
  // processing a single transaction per block
  let tx = null;
  const txProcessId = setInterval(async function () {
    if (network.txPool.length === 0) {
      return;
    }
    if (tx !== network.txPool[0]) {
      tx = network.txPool[0];
      network.miners.forEach((miner) => miner.txPool.push(tx));
    }
    if (network.checkForNewBlocks()) {
      network.txPool.shift();
    }
    console.log("miner balances:");
    network.miners.forEach((x, i) => {
      const balance = network.getWalletBalance(x.wallet);
      console.log(`miner ${i}: ${balance}`);
    });
  }, secondsPerCheck * 1000);
  const processIds = network.minerIds.concat([txProcessId]);
  return processIds;
}

module.exports = { Network, createMinerProcess };
