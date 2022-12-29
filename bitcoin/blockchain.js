const { strPreview } = require("./helpers");

// these objects represent the consensus of the network
let BLOCKCHAIN = [];
const TX_POOL = [];

function createMinerProcess(secondsPerBlock) {
  const Miner = require("./Miner");
  // we need at least one minor to validate transactions
  const miner = new Miner();
  return setInterval(async function () {
    miner.txPool.push(TX_POOL.shift());
    miner.createNewBlock();

    // our network concensus comes from a single miner at this stage
    BLOCKCHAIN = miner.blockchain;
  }, secondsPerBlock * 1000);
}

function addToTransactionPool(tx) {
  TX_POOL.push(tx);
}

function getAmtPerAddress(transactionType, walletAddress) {
  // I'm not sure where this work get's done. To add the "input" transactions for a new
  // transaction. For now it lives here but I don't think a miner does this
  let address;
  if (transactionType === "sent") address = "fromAddress";
  else if (transactionType === "received") address = "toAddress";

  return BLOCKCHAIN.reduce((accum, block) => {
    const transactions = block.transactions.filter(
      (t) => t[address] === walletAddress
    );
    accum += transactions.reduce((a, x) => a + x.amount, 0);
    return accum;
  }, 0);
}

function displayTxPool() {
  console.log("");
  console.log("TX Pool:");
  if (!TX_POOL.length) console.log("empty");
  TX_POOL.map((x, i) => {
    console.log(
      i,
      strPreview(x.fromAddress),
      "->",
      strPreview(x.toAddress),
      "; Amt: ",
      x.amount
    );
  });
}

function displayBlockChain() {
  console.log("");
  console.log("Block Chain:");
  if (!BLOCKCHAIN.length) console.log("empty");
  BLOCKCHAIN.map((x, i) => {
    console.log(
      "Block ",
      i,
      " : hashMerkleRoot: ",
      strPreview(x.hashMerkleRoot),
      "; previousBlockHash: ",
      strPreview(x.previousBlockHash)
    );
  });
  console.log("");
}

module.exports = {
  addToTransactionPool,
  getAmtPerAddress,
  createMinerProcess,
  displayTxPool,
  displayBlockChain,
};
