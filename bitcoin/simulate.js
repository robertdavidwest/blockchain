const {
  createMinerProcess,
  displayTxPool,
  displayBlockChain,
} = require("./blockchain");
const Wallet = require("./wallet");

function printFooter() {
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("");
}

function displayInitial(wallet1, wallet2) {
  console.log("#---------------------------------------------------------");
  console.log("#---------------------------------------------------------");
  console.log(`Info at: ${new Date(Date.now())}`);
  console.log("");
  wallet1.displayWalletInfo();
  wallet2.displayWalletInfo();
}

function displayBlockchainInfo(wallet1, wallet2) {
  console.log("#---------------------------------------------------------");
  console.log("#---------------------------------------------------------");
  console.log(`Info at: ${new Date(Date.now())}`);
  displayTxPool();
  displayBlockChain();
  wallet1.displayBalance();
  wallet2.displayBalance();
  console.log("");
}

const main = async function () {
  const secondsPerDisplay = 10;
  const secondsPerMine = 11;

  const myWallet = new Wallet("Robert");
  const davesWallet = new Wallet("Dave");

  displayInitial(myWallet, davesWallet);
  await myWallet.fundWallet(1.0);
  await davesWallet.fundWallet(0.25);

  const myExpectedFinalBalance = 0.9;
  let success = await myWallet.createTransaction(davesWallet.address, 0.1);

  const minorSimId = createMinerProcess(secondsPerMine);
  const displayLoopId = setInterval(async function () {
    displayBlockchainInfo(myWallet, davesWallet);
    if (!success) {
      success = await myWallet.createTransaction(davesWallet.address, 0.1);
    }
    if (myWallet.getBalance() === myExpectedFinalBalance) {
      clearInterval(displayLoopId);
      clearInterval(minorSimId);
    }

    printFooter();
  }, secondsPerDisplay * 1000);
};

if (require.main === module) {
  main();
}
