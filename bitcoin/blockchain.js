const eccrypto = require("eccrypto");

const Block = require("./block");
const { hashObject, strPreview } = require("./helpers");

// TX_POOL holds transactions before they are on the block chain
const TX_POOL = [];
const BLOCK_CHAIN = [];

function getAmtPerAddress(transactionType, walletAddress) {
  let address;
  if (transactionType === "sent") address = "fromAddress";
  else if (transactionType === "received") address = "toAddress";

  return BLOCK_CHAIN.reduce((accum, block) => {
    const transactions = block.transactions.filter(
      (t) => t[address] === walletAddress
    );
    accum += transactions.reduce((a, x) => a + x.amount, 0);
    return accum;
  }, 0);
}

function getLastBlockHash() {
  if (!BLOCK_CHAIN.length) return null;
  return hashObject(BLOCK_CHAIN[BLOCK_CHAIN.length - 1]).toString("hex");
}

async function validateSignature(tx) {
  try {
    await eccrypto.verify(tx.verifyKey, tx.txHash, tx.signature);
    return 1;
  } catch (error) {
    return 0;
  }
}

function createBlockFromTxPool(secondsPerBlock) {
  return setInterval(async function () {
    if (TX_POOL.length) {
      // For simplcity I am having each block
      // contain just a single transaction for now
      const tx = TX_POOL.shift();
      const isOk = await validateSignature(tx);
      if (isOk) {
        const previousBlockHash = getLastBlockHash();
        const block = new Block([tx], previousBlockHash);
        BLOCK_CHAIN.push(block);
      } else {
        console.log(
          `Tx not processed. Signature was bad for tx with txHash ${tx.txHash}`
        );
      }
    }
  }, secondsPerBlock * 1000);
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
  if (!BLOCK_CHAIN.length) console.log("empty");
  BLOCK_CHAIN.map((x, i) => {
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
  TX_POOL,
  BLOCK_CHAIN,
  getAmtPerAddress,
  createBlockFromTxPool,
  displayTxPool,
  displayBlockChain,
};
