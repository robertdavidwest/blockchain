const { Node } = require("./node");

const node = new Node();

function findValidNonse(block) {
  // Used by minors to create a valid block
  while (!node.validateNonse(block)) block.nonse++;
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
