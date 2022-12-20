const CoinKey = require("coinkey");
const crypto = require("crypto");
var eccrypto = require("eccrypto");

function hashObj(obj) {
  var msg = crypto
    .createHash("sha256")
    .update(Buffer.from(JSON.stringify(obj)))
    .digest();
  return msg;
}

function getGas() {
  // will figure this out later
  return 0.05;
}

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    const gas = getGas();
    this.gas = gas;
    this.signature = null;
    const transactionObj = { fromAddress, toAddress, amount, gas };

    // create a hash of all transacton data
    this.txHash = hashObj(transactionObj);
    this.timestamp = new Date(Date.now());
    this.signature = null;
  }
  // signature is calculated outside of constructor because it is async
  async addSignature(privateKey) {
    this.signature = await eccrypto.sign(privateKey, this.txHash);
  }
}

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
    this.addresss = coinkey.publicAddress.toString("hex");
  }
  displayWalletInfo() {
    console.log(`${this.owner}'s wallet Information`);
    console.log("# ----------------# ");
    console.log("Private Key: ", this.keys.privateKey.toString("hex"));
    console.log("Public Key: ", this.keys.publicKey.toString("hex"));
    console.log("Public Address: ", this.addresss);
    console.log("");
  }
  async createTransaction(toAddress, amount) {
    const fromAddress = this.addresss;
    const gas = getGas();
    const transaction = new Transaction(fromAddress, toAddress, amount);
    await transaction.addSignature(this.keys.privateKey);
    return transaction;
  }
}

const main = async function () {
  const myWallet = new Wallet("Robert");
  const davesWallet = new Wallet("Dave");

  myWallet.displayWalletInfo();
  davesWallet.displayWalletInfo();

  // I send 0.1 BTC to Dave
  console.log("I am sending 0.1 BTC to Dave");
  console.log("");
  const transaction = await myWallet.createTransaction(
    davesWallet.addresss,
    0.1
  );

  console.log(
    "My Transaction Signature:",
    transaction.signature.toString("hex")
  );

  // verify signature on transaction
  console.log("My transaction signature can be verified using my public key:");
  console.log("");
  eccrypto
    .verify(myWallet.keys.publicKey, transaction.txHash, transaction.signature)
    .then(function () {
      console.log("Signature is OK");
    })
    .catch(function () {
      console.log("Signature is BAD");
    });
};

main();
