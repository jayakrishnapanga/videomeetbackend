const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());


const { v4: uuid } = require('uuid');

const bodyParser = require('body-parser');



app.use(bodyParser.json());




const userRouter= require("./routes/user")
app.use("/user",userRouter)


console.log("MongoDB_URL:", process.env.MongoDB_URL);
const {connectMongoDB}=require("./connection")
// connectMongoDB('mongodb://localhost:27017/tax').then(()=> console.log("mongodb connected")).catch(err => console.log("mongodb error",err));
connectMongoDB('mongodb+srv://pangajayakrishna3:nhqmbaiIUfkBzfRt@cluster0.b0wyrdr.mongodb.net/?retryWrites=true&w=majority').then(()=> console.log("mongodb connected")).catch(err => console.log("mongodb error",err));

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});


app.use(express.urlencoded({extended:true}))


const { MongoClient } = require('mongodb');
const { GridFSBucket, ObjectId } = require('mongodb');
const fs = require('fs');
const stream = require('stream');
const multer = require('multer');

const storage = multer.memoryStorage(); // Use memory storage for handling files as Buffers

const upload = multer({ storage: storage });

const mongodb = require('mongodb');
const uri = 'mongodb+srv://pangajayakrishna3:nhqmbaiIUfkBzfRt@cluster0.b0wyrdr.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'test'; // Replace with your database name








