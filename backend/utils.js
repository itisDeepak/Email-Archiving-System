function decodeBase64(data) {
    return Buffer.from(data, 'base64').toString('utf-8');
  }
  
  module.exports = { decodeBase64 };
  