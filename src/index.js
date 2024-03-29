
require('dotenv').config({ path: '../.env' })

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const app = express();


const PORT = 80;

const http = require('http').createServer(app);

http.listen(PORT, process.env.SERVER_ADDRESS,() => console.log(`Server listening on port ${PORT}`));

app.use( express.json() );

var io = require('socket.io')(http);

io.on('connection', function(socket){
    console.log('a user connected');
});

io.on('connect_error', (error) => {
    console.log('connect_error', error);
});

const Conga = require("./Conga.js")

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.get(`/api/:collection/:key`, async (req, res) => { // Get Document
    const collection = Conga.getCollection(req.params.collection)
    res.json(collection.getDocument(req.params.key))
})

app.get(`/api/:collection/`, async (req, res) => { // Get Collection
    const collection = Conga.getCollection(req.params.collection)
    res.json(collection.getKeys())
})

app.post(`/api/create/:collection/`, async (req, res) => { // Create Collection
    const collection = Conga.newCollection(req.params.collection)

    res.json(collection.getKeys())
})

app.post(`/api/create/:collection/:key`, async (req, res) => { // Create collection document
    const collection = Conga.getCollection(req.params.collection)

    const data = collection.createDocument(req.params.key)

    res.json(data)
})

app.post(`/api/set/:collection/:key`, async (req, res) => { // Set Document
    const collection = Conga.getCollection(req.params.collection)

    collection.setDocument(req.params.key, req.body)

    res.json(collection.getDocument(req.params.key))
})

app.post(`/api/setSchema/:collection/`, async (req, res) => { // Set Schema
    const collection = Conga.getCollection(req.params.collection)

    collection.setSchema(req.body)

    res.json(collection.schema)
})

app.post(`/api/delete/:collection/:key`, async (req, res) => { // Delete Document
    const collection = Conga.getCollection(req.params.collection)



    collection.deleteDocument(req.params.key)

    res.json(collection.getKeys())
})

app.post(`/api/delete/:collection/`, async (req, res) => { // Delete Collection
    Conga.deleteCollection(req.params.collection)

    res.json(true)
})