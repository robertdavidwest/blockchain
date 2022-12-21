const CoinKey = require("coinkey");
var eccrypto = require("eccrypto");
const { hashObject, strPreview } = require("./bitcoin/helpers");

const {
  TX_POOL,
  BLOCK_CHAIN,
  createBlockFromTxPool,
  getAmtPerAddress,
  displayTxPool,
  displayBlockChain,
} = require("./bitcoin/blockchain");

createBlockFromTxPool(10); // every 10 seconds

function getGas() {
  // will figure this out later
  // Minors will pick up transactions from the pool
  // that have the highest transaction fee. So adding
  // more gas to a transaction helps to prioritize it and
  // get it processes quicker

  // if gas is below a certain minimum it may never get picked up
  // (since there would always be better options for the minors)
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
    this.txHash = hashObject(transactionObj);
    // transactionObj should include signature too
    // leaving out for now cause async

    this.timestamp = new Date(Date.now());
    this.signature = null;

    // note for etherium transaction you would also include:
    // "nonce" - starts at 0 and increments each transaction
    // and
    // "data" - could be a smart contract or inputs to call another smart contract
  }
  // signature is calculated outside of constructor because it is async
  async addSignature(privateKey) {
    this.signature = await eccrypto.sign(privateKey, this.txHash);
  }
}

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

const main = async function () {
  console.log("# ------------------------------");
  console.log(`Info at: ${new Date(Date.now())}`);
  console.log("");
  const myWallet = new Wallet("Robert", 1.0);
  const davesWallet = new Wallet("Dave", 1.0);
  myWallet.displayWalletInfo();
  davesWallet.displayWalletInfo();
  myWallet.createTransaction(davesWallet.address, 0.1);
  console.log("");
  console.log("");
  console.log("");
  let success = 0;
  const myExpectedFinalBalance = 0.9;

  const interval = setInterval(async function () {
    console.log(`Info at: ${new Date(Date.now())}`);
    displayTxPool();
    displayBlockChain();
    myWallet.displayBalance();
    davesWallet.displayBalance();
    console.log("");
    if (!success) {
      success = await myWallet.createTransaction(davesWallet.address, 0.1);
    }
    if (myWallet.getBalance() === myExpectedFinalBalance) {
      clearInterval(interval);
    }
    console.log("");
    console.log("");
    console.log("");
  }, 5000);

  // I send 0.1 BTC to Dave
  // console.log("I am sending 0.1 BTC to Dave");
  // console.log("");
  // const transaction = await myWallet.(
  // davesWallet.address,
  // 0.1
  // );
  /*

  console.log(
    "My Transaction Signature:",
    transaction.signature.toString("hex")
  );
  console.log("My transaction signature can be verified using my public key:");
  console.log("");

  eccrypto
    .verify(myWallet.keys.publicKey, transaction.txHash, transaction.signature)
    .then(function () {
      console.log("Signature is OK");

      console.log(myWallet.displayWalletInfo());
    })
    .catch(function () {
      console.log("Signature is BAD");
    });
    */
};

main();
