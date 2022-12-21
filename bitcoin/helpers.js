const crypto = require("crypto");

function hashObject(obj) {
  var msg = crypto
    .createHash("sha256")
    .update(Buffer.from(JSON.stringify(obj)))
    .digest();
  return msg;
}

function strPreview(s) {
  if (s) return `${s.slice(0, 8)}...`;
  else return s;
}
module.exports = { hashObject, strPreview };
