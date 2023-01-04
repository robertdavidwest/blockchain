const crypto = require("crypto");

function hash(obj, digest) {
  var msg = crypto
    .createHash("sha256")
    .update(Buffer.from(JSON.stringify(obj)))
    .digest(digest);
  return msg;
}

function hashObject(obj) {
  return hash(obj);
}

function hashObjectHex(obj) {
  return hash(obj, "hex");
}

function strPreview(s) {
  if (s) return `${s.slice(0, 8)}...`;
  else return s;
}
module.exports = { hashObject, hashObjectHex, strPreview };
