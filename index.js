const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(cors({
  origin:'https://riktammeets-5c61zknh9-jayakrishnapanga.vercel.app'
}));

app.use(express.json());
require('dotenv').config();
const port=process.env.PORT || 3000
const { v4: uuid } = require('uuid');

const bodyParser = require('body-parser');



app.use(bodyParser.json());




const userRouter= require("./routes/user")
app.use("/user",userRouter)


console.log("MongoDB_URL:", process.env.MongoDB_URL);
const {connectMongoDB}=require("./connection")
// connectMongoDB('mongodb://localhost:27017/tax').then(()=> console.log("mongodb connected")).catch(err => console.log("mongodb error",err));
connectMongoDB('mongodb+srv://pangajayakrishna3:nhqmbaiIUfkBzfRt@cluster0.b0wyrdr.mongodb.net/?retryWrites=true&w=majority').then(()=> console.log("mongodb connected")).catch(err => console.log("mongodb error",err));

app.listen(8080, () => {
  console.log('Server is running on on port 8080');
});

app.get('/',(req,res)=>{
  res.send('hello world')
})

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








