const {
  createBlockFromTxPool,
  displayTxPool,
  displayBlockChain,
} = require("./blockchain");
const Wallet = require("./wallet");

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

const main = async function (secsPerDisplay) {
  const myWallet = new Wallet("Robert", 1.0);
  const davesWallet = new Wallet("Dave", 1.0);
  displayInitial(myWallet, davesWallet);

  const myExpectedFinalBalance = 0.9;
  let success = await myWallet.createTransaction(davesWallet.address, 0.1);

  const interval = setInterval(async function () {
    displayBlockchainInfo(myWallet, davesWallet);
    if (!success) {
      success = await myWallet.createTransaction(davesWallet.address, 0.1);
    }
    if (myWallet.getBalance() === myExpectedFinalBalance) {
      clearInterval(interval);
    }
  }, secsPerDisplay * 1000);
};

createBlockFromTxPool(11); // every 11 seconds process transactions
main(10); // every 5 seconds display data
