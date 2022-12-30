# Blockchain Simulation

To help me to remember the details of how block chains work I am simulating some core concepts.

The directory `bitcoin` aims to simulate concepts from the Bitcoin blockchain such as `Wallet`s, `Transaction`s, the Transaction Pool and the Blockchain itself. A simulation of events is then run in the script `bitcoin/simulate.js`. I hope to increase the complexity overtime of the simulation to make it a more accurate representation of the actual blockchain technology.

## Concepts Modelled:

Core concepts included so far are:

### Wallet

- A Wallet is produced containing a `privateKey`, `publicKey` and `publicAddress`.
- The `Wallet` itself has no intrinsic `balance` but rather to calculate a `Wallet`s balance the blockchain is inspected for all prior transactons as a necessary precurser to creating a `Transaction`.

### Transaction

- A `Transaction` is created using a Wallets prior transactions to calculate available funds.
- A `Transaction` creates a hash value of the `fromAddress`, `toAddress`, `amount` and `gas` (gas is static right now, this feature could be fleshed out later)
- A Signature is produced on each `Transaction` using the wallet holders private key

### Transaction Pool (TX Pool)

- The transaction pool is represented crudely to begin with as a simple queue (no gas fees incorporated yet)
- A simple indiscriminate setInterval runs to check the pool periodically.

### Block

- Contains a list of transactions
- Calculates the MerkleTree of the transactions and stores the MerkleRoot Hash value (hex)
- Stores the hash of the previos block

### Blockchain

- For now this is a simple/crude array and blocks are pushed to this array
- transactions are verified by observing data in this array

### Miner

- A miner will pick up transactions from the TX Pool and attempt to create blocks
- All Miners have their own transaction pool and blockchain
- The miner will:

  - Verify the signature of each transaction on the block
  - (For simplicity to begin with, a block is produced from a single transaction)
  - Search for a valid nonse per the `bits` specified in the `Block`

- A miner runs a simple subprocess (using `child_process`) to find the `nonse` utilizing a single CPU (no gpus here)
- A miner will be rewarded with newly minted bitcoin (tx fees not incorporated)

The single CPU should work fine for simulation so long as the parameter `bits` on the `Block` object is kept lower than on the actual blockchain

## Simulation

Presently the app is running in Node JS with a simple terminal stdout display. It would also be useful to produce a front end that vizualizes the various components of the blockchain.

### Features to add:

- fix transactions - so that prior transactions are fed in as inputs to a transaction. Right now I'm checking the whole blockchain.
- fix transactions - After each transaction there should be "change" returned to the senders address
- Change blockchain data structure from JS Array to "back linked list"
- mining / proof of work. DONE (for single minor)
- Tx fees/Gas

- Miners should validate blocks produced by other miners and add to their copy of the blockchain or reject if invalid

### FRONT END:

Things to include in view:

- the blockchain
- miners working
- people sending transactions

Blockchain operation info like :

- Avg time to produce a block
- Then we can see if and when the bit rate will change and maybe even keep a log
