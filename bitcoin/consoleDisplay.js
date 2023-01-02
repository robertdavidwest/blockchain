const { strPreview } = require("./helpers");

function displayTxPool(network) {
  console.log("");
  console.log("TX Pool:");
  if (!network.txPool.length) console.log("empty");
  network.txPool.map((x, i) => {
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
