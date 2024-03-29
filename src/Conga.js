
const fs = require('fs')
const path = require('path')

const Sharder = require('./Sharder')

// Public Functions

class Collection {
    constructor (collectionKey) {
        this.collectionKey = collectionKey
    
        this.path = path.join(Sharder.getShardFromShardID(Sharder.getShardID(collectionKey)), collectionKey)
    }

    // Schema: "defaultValue", "required", "type"

    get schema() { 
        return JSON.parse(fs.readFileSync(path.join(this.path, 'schema.json')))
    }

    setSchema(jsonObject) {
        fs.writeFileSync(path.join(this.path, 'schema.json'), JSON.stringify(jsonObject))
    }

    getKeys() {
        // ignore schema.json
        return fs.readdirSync(this.path).filter(file => file !== 'schema.json').map(file => file.replace('.json', ''))
    }

    createDocument(key) {
        if (key == "schema") {
            throw new Error("Key cannot be 'schema'")
        }

        let data = {}

        for (const [key, value] of Object.entries(this.schema)) {
            if (value.defaultValue) {
                data[key] = value.defaultValue
            }
        }

        fs.writeFileSync(path.join(this.path, `${key}.json`), JSON.stringify(data))

        return data
    }

    setDocument(key, jsonObject) {
        if (key == "schema") {
            throw new Error("Key cannot be 'schema'")
        }

        for (const [key, value] of Object.entries(jsonObject)) {
            if (typeof value !== this.schema[key].type) {
                throw new Error(`Value ${value} is not of type ${this.schema[key].type}`)
            }
        }

        fs.writeFileSync(path.join(this.path, `${key}.json`), JSON.stringify(jsonObject))
    }

    deleteDocument(key) {
        if (key == "schema") {
            throw new Error("Key cannot be 'schema'")
        }

        fs.unlinkSync(path.join(this.path, `${key}.json`))
    }

    getDocument(key) {
        if (key == "schema") {
            throw new Error("Key cannot be 'schema'")
        }

        return JSON.parse(fs.readFileSync(path.join(this.path, `${key}.json`)))
    }
}

module.exports.newCollection = function(collectionKey) {
    const shardID = Sharder.getShardID(collectionKey)
    const shardIn = Sharder.getShardFromShardID(shardID)

    fs.mkdirSync(path.join(shardIn, collectionKey))

    return new Collection(collectionKey)
}

module.exports.getCollection = function(collectionKey) {
    return new Collection(collectionKey)
}

module.exports.deleteCollection = function(collectionKey) {
    const shardID = Sharder.getShardID(collectionKey)
    const shardIn = Sharder.getShardFromShardID(shardID)

    fs.rm(path.join(shardIn, collectionKey), { recursive: true })
}
