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
- A simple agnostic setInterval runs to check the pool periodically.
- The signature of each transaction is verified
- A block is created from the transactions
- For simplicity to begin with, a block is produced from a single transaction

### Block

- Contains a list of transactions
- Calculates the MerkleTree of the transactions and stores the MerkleRoot Hash value (hex)
- Stores the hash of the previos block

### Blockchain

- For now this is a simple/crude array and blocks are pushed to this array
- transactions are verified by observing data in this array

## Simulation

Presently the app is running in Node JS with a simple terminal stdout display. It would also be useful to produce a front end that vizualizes the various components of the blockchain.
