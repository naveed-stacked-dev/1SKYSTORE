const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

/**
 * Encrypt a plaintext string using AES-256
 */
function encrypt(text) {
  if (!text) return null;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

/**
 * Decrypt an AES-256 encrypted string
 */
function decrypt(ciphertext) {
  if (!ciphertext) return null;
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Decrypt specific fields from an object (returns new object)
 */
function decryptFields(obj, fields) {
  if (!obj) return obj;
  const result = obj.toJSON ? obj.toJSON() : { ...obj };
  for (const field of fields) {
    if (result[field]) {
      result[field] = decrypt(result[field]);
    }
  }
  return result;
}

module.exports = { encrypt, decrypt, decryptFields };
