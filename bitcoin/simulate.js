const {
  createBlockFromTxPool,
  displayTxPool,
  displayBlockChain,
} = require("./blockchain");
const Wallet = require("./wallet");

const main = async function () {
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
  }, 5000);

  // I send 0.1 BTC to Dave
  // console.log("I am sending 0.1 BTC to Dave");
  // console.log("");
  // const transaction = await myWallet.(
  // davesWallet.address,
  // 0.1
  // );
  /*

  console.log(
    "My Transaction Signature:",
    transaction.signature.toString("hex")
  );
  console.log("My transaction signature can be verified using my public key:");
  console.log("");

  eccrypto
    .verify(myWallet.keys.publicKey, transaction.txHash, transaction.signature)
    .then(function () {
      console.log("Signature is OK");

      console.log(myWallet.displayWalletInfo());
    })
    .catch(function () {
      console.log("Signature is BAD");
    });
    */
};

createBlockFromTxPool(10); // every 10 seconds
main();
