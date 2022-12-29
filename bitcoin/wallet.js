const CoinKey = require("coinkey");
const { strPreview } = require("./helpers");
const createTransaction = require("./transaction");
const { getAmtPerAddress } = require("./blockchain");

class Wallet {
  constructor(owner) {
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
  }
  async fundWallet(purchaseAmountBtc) {
    // create a transaction to initialize your wallet usage.
    // The transaction is sent to the network and enters the txPool of each miner
    // (simulation of purchasing BTC from exchange or elsewhere)

    // For simplicity we can assume the exchange always has enough money to
    // fund these wallets
    console.log(`Funding ${this.owner}'s wallet with ${purchaseAmountBtc} BTC`);
    const exchangeCoinkey = new CoinKey.createRandom();
    await createTransaction(
      exchangeCoinkey.privateKey,
      exchangeCoinkey.publicKey,
      exchangeCoinkey.publicAddress,
      this.address,
      purchaseAmountBtc
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
      console.log("Transaction Successful and sent to Transaction Pool");
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
