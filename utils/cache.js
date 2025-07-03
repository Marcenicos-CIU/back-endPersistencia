const NodeCache = require('node-cache');

// TTL (time-to-live) en segundos. Acá son 60 segundos.
const cache = new NodeCache({ stdTTL: 60 });

module.exports = cache;
