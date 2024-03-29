const fs = require('fs');
const path = require('path');

const NUM_SHARDS = process.env.NUM_SHARDS;


// Private Functions

function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

module.exports.getShardID = function(key) {
    return Math.abs(hashCode(key)) % NUM_SHARDS + 1;
}

module.exports.getShardFromShardID = function(shardID) {
    const shard = process.env[`SHARD_${shardID}`]

    if (!shard) {
        throw new Error(`Shard ${shardID} not found`)
    };

    return shard;
}



module.exports.findKeyData = function(collection, key) {
    return new Promise((resolve, reject) => {
        const shardID = this.getShardID(key)
        const shardIn = this.getShardFromShardID(shardID)

        const data = fs.readFile(path.join(shardIn, `${collection}_${key}.json`), 'utf8', (err, data) => {
            if (err) {
                throw new Error(`Key ${key} not found in collection ${collection}`)
            }

            return data;
        });

        resolve(data);
    });
}

module.exports.createKey = function(collection, key, value) {
   return new Promise((resolve, reject) => {
        const shardID = this.getShardID(key)
        const shardIn = this.getShardFromShardID(shardID)

        fs.writeFile(path.join(shardIn, `${collection}_${key}.json`), value, 'utf8', (err) => {
            if (err) {
                throw new Error(`Error creating key ${key} for collection ${collection}`)
            }
        });

        resolve(value);
   });
}