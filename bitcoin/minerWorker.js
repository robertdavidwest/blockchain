const { validateNonse } = require("./miner");

function findValidNonse(block) {
  // Used by minors to create a valid block
  while (!validateNonse(block)) block.nonse++;
  return block.nonse;
}

process.on("message", function ({ block }) {
  const nonse = findValidNonse(block);
  process.send({
    childPid: process.pid,
    nonse,
  });
  process.disconnect();
});
