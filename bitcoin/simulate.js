const {
  displayTxPool,
  displayBlockChain,
  displayWalletInfo,
  displayBalance,
} = require("./consoleDisplay");
const { strPreview } = require("./helpers");
const { Network, createMinerProcess } = require("./network");

function printFooter() {
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
}

function displayInitial(network, wallet1, wallet2) {
  console.log("#---------------------------------------------------------");
  console.log("#---------------------------------------------------------");
  console.log(`Info at: ${new Date(Date.now())}`);
  console.log("");
  displayWalletInfo(network, wallet1);
  displayWalletInfo(network, wallet2);
}

function displayMinerBalances(network) {
  network.miners.forEach((m, i) => {
    const balance = network.getWalletBalance(m.wallet);
    console.log(`Miner ${i} balance: ${balance}`);
  });
}

function displayBlockchainInfo(network, wallet1, wallet2) {
  console.log("#---------------------------------------------------------");
  console.log("#---------------------------------------------------------");
  console.log(`Info at: ${new Date(Date.now())}`);
  displayTxPool(network);
  displayBlockChain(network);
  displayBalance(network, wallet1);
  displayBalance(network, wallet2);
  displayMinerBalances(network);
  console.log("");
}

async function sendIfBalance(network, wallet, toAddress, amount) {
  const fromShort = strPreview(wallet.address);
  const toShort = strPreview(toAddress);

  console.log(
    `Transaction request of ${amount} BTC from ${fromShort} to ${toShort} `
  );
  console.log("Attempting transaction...");

  const balance = network.getWalletBalance(wallet);
  if (amount < balance) {
    await network.sendBtc(wallet, toAddress, amount);
    console.log("Transaction Successful and sent to Transaction Pool");
    return 1;
  } else {
    console.log(
      `Unable to send. Not enough BTC in wallet. Balance: ${balance}`
    );
    return 0;
  }
}

const main = async function () {
  const secondsPerDisplay = 0;
  const secondsPerMine = 1;
  const numMiners = 4;

  const network = new Network(numMiners, secondsPerMine);
  const myWallet = network.createWallet("Robert");
  const davesWallet = network.createWallet("Dave");

  displayInitial(network, myWallet, davesWallet);
  await network.fundWallet(myWallet, 1.0);
  await network.fundWallet(davesWallet, 0.25);

  const sendAmount = 0.1;
  const myExpectedFinalBalance = 0.9;
  let success = await sendIfBalance(
    network,
    myWallet,
    davesWallet.address,
    sendAmount
  );

  const intervalIds = createMinerProcess(network, secondsPerMine);
  const displayLoopId = setInterval(async function () {
    displayBlockchainInfo(network, myWallet, davesWallet);
    if (!success) {
      success = await sendIfBalance(
        network,
        myWallet,
        davesWallet.address,
        sendAmount
      );
    }
    const balance = network.getWalletBalance(myWallet);
    if ((balance === myExpectedFinalBalance) | (balance === 2)) {
      intervalIds.forEach((x) => clearInterval(x));
      console.log("Finished. Final Blockchain:");
      network.blockchain = network.blockchain.map((x) => {
        x.blockHash = network.getBlockHash(x);
        return x;
      });
      console.dir(network.blockchain);
    }
    printFooter();
  }, secondsPerDisplay * 1000);
  intervalIds.push(displayLoopId);
};

if (require.main === module) {
  main();
}
