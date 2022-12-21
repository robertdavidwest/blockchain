const CoinKey = require("coinkey");
const { strPreview } = require("./helpers");
const createTransaction = require("./transaction");
const { getAmtPerAddress } = require("./blockchain");

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
    // (simulation of purchasing BTC from exchange or elsewhere)
    const exchangeCoinkey = new CoinKey.createRandom();
    this._createInitTransaction(
      exchangeCoinkey.privateKey,
      exchangeCoinkey.publicKey,
      exchangeCoinkey.publicAddress,
      this.address,
      initBalance
    );
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
  async _createInitTransaction(pk, verifyKey, fromAddress, toAddress, amount) {
    await createTransaction(pk, verifyKey, fromAddress, toAddress, amount);
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
      const pk = this.keys.privateKey;
      const verifyKey = this.keys.publicKey;
      await createTransaction(pk, verifyKey, fromAddress, toAddress, amount);
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
