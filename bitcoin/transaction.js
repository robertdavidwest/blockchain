const eccrypto = require("eccrypto");

const { hashObject } = require("./helpers");
const { addToTransactionPool } = require("./blockchain");

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

async function createTransaction(pk, vk, fromAddress, toAddress, amount) {
  const transaction = new Transaction(vk, fromAddress, toAddress, amount);
  addToTransactionPool(transaction);
  // need to addSignature when ever new Transaction is created
  await transaction.addSignature(pk);
}

class Transaction {
  // Note: On actual bitcoin blockchain the fromAddress acts as the verification key
  // but that is more complicated. I'm just using the public key, the principal still holds
  constructor(verifyKey, fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.verifyKey = verifyKey;
    this.amount = amount;
    const gas = getGas();
    this.gas = gas;
    const transactionObj = { fromAddress, toAddress, amount, gas };

    // create a hash of all transacton data
    this.txHash = hashObject(transactionObj);
    this.timestamp = new Date(Date.now());

    // signature is calculated outside of constructor because it is async
    this.signature = null;

    // TBD:
    // "number of confirmations" - seen on transactions in blockchain explorers is actually
    // the number of blocks that have been added to the chain since the block containing
    // your transaction
  }
  async addSignature(privateKey) {
    this.signature = await eccrypto.sign(privateKey, this.txHash);
  }
}

// note for etherium transaction you would also include:
// "nonce" - starts at 0 and increments each transaction
// and
// "data" - could be a smart contract or inputs to call another smart contract

module.exports = createTransaction;
