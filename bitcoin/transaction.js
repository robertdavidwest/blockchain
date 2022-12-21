const eccrypto = require("eccrypto");
const { hashObject } = require("./helpers");

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

module.exports = Transaction;
