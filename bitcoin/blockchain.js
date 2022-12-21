// holds transactions before they are on the block chain
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

module.exports = {
  TX_POOL,
  BLOCK_CHAIN,
  getAmtPerAddress,
};
