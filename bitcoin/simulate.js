const {
  createBlockFromTxPool,
  displayTxPool,
  displayBlockChain,
} = require("./blockchain");
const Wallet = require("./wallet");

const main = async function (secsPerDisplay) {
  console.log("# ------------------------------");
  console.log(`Info at: ${new Date(Date.now())}`);
  console.log("");
  const myWallet = new Wallet("Robert", 1.0);
  const davesWallet = new Wallet("Dave", 1.0);
  myWallet.displayWalletInfo();
  davesWallet.displayWalletInfo();
  myWallet.createTransaction(davesWallet.address, 0.1);
  console.log("");
  console.log("");
  console.log("");
  let success = 0;
  const myExpectedFinalBalance = 0.9;

  const interval = setInterval(async function () {
    console.log(`Info at: ${new Date(Date.now())}`);
    displayTxPool();
    displayBlockChain();
    myWallet.displayBalance();
    davesWallet.displayBalance();
    console.log("");
    if (!success) {
      success = await myWallet.createTransaction(davesWallet.address, 0.1);
    }
    if (myWallet.getBalance() === myExpectedFinalBalance) {
      clearInterval(interval);
    }
    console.log("");
    console.log("");
    console.log("");
  }, secsPerDisplay * 1000);
};

createBlockFromTxPool(10); // every 10 seconds process transactions
main(5); // every 5 seconds display data
