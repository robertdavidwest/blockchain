const Miner = require("./Miner");
const { strPreview } = require("./helpers");

// we need at least one minor to validate transactions
const miner = new Miner();

function createMinerProcess(secondsPerBlock) {
  return setInterval(async function () {
    miner.createNewBlock();
  }, secondsPerBlock * 1000);
}

function displayTxPool() {
  console.log("");
  console.log("TX Pool:");
  if (!miner.txPool.length) console.log("empty");
  miner.txPool.map((x, i) => {
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
  if (!miner.blockchain.length) console.log("empty");
  miner.blockchain.map((x, i) => {
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
  miner,
  createMinerProcess,
  displayTxPool,
  displayBlockChain,
};
