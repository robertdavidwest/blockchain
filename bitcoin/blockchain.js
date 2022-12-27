const eccrypto = require("eccrypto");

const { Block } = require("./block");
const { hashObject, strPreview } = require("./helpers");

// TX_POOL holds transactions before they are on the block chain
// every minor has a transaction pool in memory on their machine/node
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

function getLastBlock() {
  if (!BLOCK_CHAIN.length) return null;
  return BLOCK_CHAIN[BLOCK_CHAIN.length - 1];
}

function getBlockHash(block) {
  if (block) return hashObject(block).toString("hex");
  else return null;
}

async function validateSignature(tx) {
  try {
    await eccrypto.verify(tx.verifyKey, tx.txHash, tx.signature);
    return 1;
  } catch (error) {
    return 0;
  }
}

async function validTransaction(tx, lastBlock) {
  // Validate signature and compare transactions from
  // prior block
  const validSignature = await validateSignature(tx);

  // check to see if any of the transactions being added
  // into this block were in the previous block
  let dupTransaction = false;
  if (lastBlock) {
    dupTransaction = lastBlock.transactions.some((x) => x.txHash === tx.txHash);
  }
  const isOk = validSignature & !dupTransaction;
  return isOk;
}

function validNonse(block) {
  const { bits } = block;
  const blockHash = getBlockHash(block);
  const valid = blockHash.slice(0, bits) === "0".repeat(bits);
  return valid;
}

function findValidNonse(block) {
  while (!validNonse(block)) block.nonse++;
  return block;
}

function createBlockFromTxPool() {
  if (TX_POOL.length) {
    // For simplcity I am having each block
    // contain just a single transaction for now
    const tx = TX_POOL.shift();
    const lastBlock = getLastBlock();
    if (validTransaction(tx, lastBlock)) {
      const previousBlockHash = getBlockHash(lastBlock);
      let block = new Block([tx], previousBlockHash);
      block = findValidNonse(block);
      BLOCK_CHAIN.push(block);
    } else {
      console.log(
        `Tx not processed. Signature was bad for tx with txHash ${tx.txHash}`
      );
    }
  }
}

function createMinorProcess(secondsPerBlock) {
  return setInterval(async function () {
    createBlockFromTxPool();
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
  createMinorProcess,
  createBlockFromTxPool,
  displayTxPool,
  displayBlockChain,
};
