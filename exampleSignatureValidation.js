var crypto = require("crypto");
var eccrypto = require("eccrypto");

// A new random 32-byte private key.
var privateKey = Buffer.from(
  "7ba3308fbaac93d46f31177abe0e050634af9b1bc4602f0a309c529874a7a536",
  // "2fd7cab0970c692b4151d77a6aeebcae2a3284556cbfc6f182c571eccfc2424f",
  "hex"
);
// Corresponding uncompressed (65-byte) public key.
// var publicKey = eccrypto.getPublic(privateKey);
var publicKey = Buffer.from(
  "031887e01f35d0663a01edbbeef0eb945a2cf1e9318442a585c5905e0d886bc34a",
  "hex"
);
var buf = Buffer.from(
  "05de69f5d37f41340eed3230f03d2394dde5e497738a76f027b7d962a0cbdf39",
  "hex"
);
// Always hash you message to sign!
var msg = crypto.createHash("sha256").update(buf).digest();

eccrypto.sign(privateKey, msg).then(function (sig) {
  console.log("Signature in DER format (hex):", sig.toString("hex"));
  eccrypto
    .verify(publicKey, msg, sig)
    .then(function () {
      console.log("Signature is OK");
    })
    .catch(function () {
      console.log("Signature is BAD");
    });
});
