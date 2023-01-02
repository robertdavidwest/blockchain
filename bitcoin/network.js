const Wallet = require("./wallet");
const createTransaction = require("./transaction");
const { Miner } = require("./miner");

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
  // our network concensus comes from a single miner at this stage
  const miner = network.miners[0];
  const minerId = network.minerIds[0];

  const txProcessId = setInterval(async function () {
    const tx = network.txPool.shift();
    if (tx) miner.txPool.push(tx);
    network.blockchain = miner.blockchain;
    console.log("miner balance", network.getWalletBalance(miner.wallet));
  }, secondsPerCheck * 1000);
  return [minerId, txProcessId];
}

module.exports = { Network, createMinerProcess };
