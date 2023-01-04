const { strPreview } = require("./helpers");

function displayTxPool(network) {
  console.log("");
  console.log("TX Pool:");
  const txKeys = Object.keys(network.txPool);
  if (!txKeys.length) console.log("empty");
  txKeys.map((key, i) => {
    const tx = network.txPool[key];
    console.log(
      i,
      strPreview(tx.fromAddress),
      "->",
      strPreview(tx.toAddress),
      "; Amt: ",
      tx.amount
    );
  });
}

function displayBlockChain(network) {
  console.log("");
  console.log("Block Chain:");
  if (!network.blockchain.length) console.log("empty");
  network.blockchain.map((x, i) => {
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

function displayWalletInfo(network, wallet) {
  console.log(`${wallet.owner}'s wallet Information`);
  console.log("# ----------------# ");
  console.log("Private Key: ", wallet.keys.privateKey.toString("hex"));
  console.log("Public Key: ", wallet.keys.publicKey.toString("hex"));
  console.log("Public Address: ", wallet.address);
  console.log("Balance: ", network.getWalletBalance(wallet));
  console.log("");
}

function displayBalance(network, wallet) {
  console.log(
    `${wallet.owner}'s wallet Balance: ${network.getWalletBalance(wallet)}`
  );
}

module.exports = {
  displayWalletInfo,
  displayBalance,
  displayTxPool,
  displayBlockChain,
};
