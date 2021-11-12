const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const { query } = require('express');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sxeom.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri)

async function run() {
    try {
        await client.connect();

        const database = client.db("sneakerz_freakz");

        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");
        const usersCollection = database.collection("users");
        const reviewsCollection = database.collection("reviews");
        //GET PRODUCTS API
        app.get('/products', async (req, res) => {
            const page = req.query.page;
            console.log(req.query.page)
            const cursor = productsCollection.find({});
            let products;
            if (page === "home") {
                products = await cursor.limit(6).toArray();
            }
            else {
                products = await cursor.toArray();
            }


            // console.log(products)
            res.send(products);
        })

        // GETTING LOGGED IN USERS API
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;

            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.send({ admin: isAdmin })
        })

        //GET ORDERS API
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })
        //GET REVIEWS API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        // GET MY ORDERS API
        app.get('/orders/:email', async (req, res) => {
            const query = req.params.email;

            const cursor = ordersCollection.find({ email: query });
            const orders = await cursor.toArray();
            res.send(orders);
        })

        //POST ORDERS API
        app.post('/orders', async (req, res) => {

            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder)

            res.send(result)
        })
        //POST USERS API
        app.post('/users', async (req, res) => {

            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser)

            res.send(result)
        })
        //POST PRODUCTS API
        app.post('/products', async (req, res) => {

            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct)

            res.send(result)
        })
        //POST REVIEWS API
        app.post('/reviews', async (req, res) => {

            const newReview = req.body;

            const result = await reviewsCollection.insertOne(newReview)

            res.send(result)
        })

        // MAKE AN ADMIN
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.adminEmail };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);

        })

        //UPDATE API

        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedOrder.status,


                }
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options)

            res.send(result);
        })

        //DELETE ORDER API

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            //console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            // console.log('deleted count', result)
            // console.log('deleting user with id', id)

            res.json(result);
        })

        //DELETE PRODUCT API

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            //console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            // console.log('deleted count', result)
            // console.log('deleting user with id', id)

            res.json(result);
        })



    }
    finally {
        //await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('sneakerz-freakz backend started');
})

app.listen(port, () => {
    console.log('listening to the port', port)
})