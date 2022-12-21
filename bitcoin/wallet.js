const CoinKey = require("coinkey");
const { strPreview } = require("./helpers");
const Transaction = require("./transaction");
const { TX_POOL, getAmtPerAddress } = require("./blockchain");

class Wallet {
  constructor(owner, initBalance) {
    // Private Key is a 64 digit hex randomly created
    // Public key is a hash of the private key
    // ( using elliptic curve )

    // Public address comes from hashing the public key
    // the address is a 27 to 34 digit alpha numeric value

    // Using the CoinKey library to construct these
    const coinkey = new CoinKey.createRandom();
    this.owner = owner; // actual blockchain does not have this (for illustration purposes)
    this.keys = coinkey;
    this.address = coinkey.publicAddress.toString("hex");
    this.balance = 0;
    // create a transaction to initialize your wallet and put it in the TX_POOL
    const transaction = new Transaction("exchange", this.address, initBalance);
    TX_POOL.push(transaction);
    // irl the "balance" is calculated on every
    // transaction by feeding in all prior transactions (or hashes of them)
    // so we will generate a fake transaction with the initBalance to kick things off
    // this.balance = 0;
    // this.transactionRecords = [];
    // if (initBalance) {
    // this.transactionRecords.push(initBalance);
    // this.updateBalance();
    // }
  }
  checkBalance() {
    this.balance =
      getAmtPerAddress("received", this.address) -
      getAmtPerAddress("sent", this.address);
  }
  getBalance() {
    this.checkBalance();
    return this.balance;
  }
  displayWalletInfo() {
    console.log(`${this.owner}'s wallet Information`);
    console.log("# ----------------# ");
    // console.log("Balance : ", this.balance);
    console.log("Private Key: ", this.keys.privateKey.toString("hex"));
    console.log("Public Key: ", this.keys.publicKey.toString("hex"));
    console.log("Public Address: ", this.address);
    console.log("Balance: ", this.getBalance());
    console.log("");
  }
  displayBalance() {
    console.log(`${this.owner}'s wallet Balance: ${this.getBalance()}`);
    console.log("");
  }

  async createTransaction(toAddress, amount) {
    const fromShort = strPreview(this.address);
    const toShort = strPreview(toAddress);

    console.log(
      `Transaction request of ${amount} BTC from ${fromShort} to ${toShort} `
    );
    console.log("Attempting transaction...");

    const balance = this.getBalance();
    if (amount < balance) {
      const fromAddress = this.address;
      const transaction = new Transaction(fromAddress, toAddress, amount);
      await transaction.addSignature(this.keys.privateKey);
      TX_POOL.push(transaction);
      console.log("Transaction Successful and sent to TX_POOL");
      return 1;
    } else {
      console.log(
        `Unable to send. Not enough BTC in wallet. Balance: ${balance}`
      );
      return 0;
    }
  }
}

module.exports = Wallet;
