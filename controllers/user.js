
const User=require("../models/user")

require('dotenv').config();
const { MongoClient } = require('mongodb');
const mongodb = require('mongodb');
const jwt=require("jsonwebtoken")

const uri = process.env.MongoDB_URL; // Replace with your MongoDB connection URI
const dbName = 'test'; // Replace with your MongoDB database name
const client = new MongoClient(uri);
async function createUser(req, res) {
    try {
      const body = req.body;
      if (
        !body ||
        !body.username ||
        !body.password ||
        !body.email 
      ) {
        return res.status(400).json({ msg: "All fields are required" });
      }
      // Connect to the MongoDB database using the provided URI
      const client = new MongoClient(uri, { useUnifiedTopology: true });
      await client.connect();
       // Check if the email already exists in the database
      const db = client.db(dbName);
      const existingUser = await db.collection('users').findOne({ email: body.email });
      if (existingUser) {
        return res.status(409).json({ msg: "User already exists with this email" });
      }

      // Create the user if the email is not already registered
      const result = await db.collection('users').insertOne({
       username: body.username,
        password: body.password,
        email: body.email,   
      });
      console.log(result);
      client.close(); // Close the MongoDB client connection  
      return res.status(201).json({ msg: "Success", id: result.insertedId,username:result.username });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "An error occurred while creating the user", error: error.message });
    }
  }


  async function handleUserLogin(req, res) {
    try {
        console.log("handle login executed")
      const { email, password } = req.body;
       console.log(email)
       console.log(password)
      // Assume User is the Mongoose model representing your user data
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "user doesn't exists" });
      }
  
      if (user.password !== password) {
        
        return res.status(401).json({ message: 'Invalid password or Invalid email' });
      }
  
      // Generate the token
      const expiresIn='1h'
      const token = jwt.sign({ id: user.id, role: user.firstname, }, 'your-secret-key',{expiresIn});
      console.log('Generated Token:', token);
  
      // Instead of setting the token as a cookie, send it in the response as JSON
      return res.status(201).json({ token, message: 'You have successfully logged in',username:user.username,userId:user.id });
    } catch (error) {
      console.error(error);
      // res.status(500).json({ message: 'An error occurred while logging in' });
      res.status(500).json({ message: 'please provide valid credentilas', error: error.message  });
    }
  }


  async function connectDatabase() {
    try {
      await client.connect();
      console.log('Connected to database');
    } catch (error) {
      console.error('Error connecting to database:', error);
    }
  }
  
  
  let bucket;
  const generateSubmissionId = () => {
    return new mongodb.ObjectId().toHexString();
  };
  connectDatabase().then(() => {
    const db = client.db(dbName);
    bucket = new GridFSBucket(db);
  });
  // const { MongoClient } = require('mongodb');
const { GridFSBucket, ObjectId } = require('mongodb');
const fs = require('fs');
const stream = require('stream');
const multer = require('multer');

const storage = multer.memoryStorage(); // Use memory storage for handling files as Buffers

const upload = multer({ storage: storage });

// const mongodb = require('mongodb');
// const uri = 'mongodb+srv://pangajayakrishna3:nhqmbaiIUfkBzfRt@cluster0.b0wyrdr.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB URI
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// const dbName = 'test'; // Replace with your database name

  
  async function  handlerecords(req,res){

    try {
      const userId = req.params.userId;
      console.log(userId);
      console.log("records fetching is completed successfully");
      await client.connect(); // Connect to MongoDB
  
      const db = client.db('test');
      const bucket = new mongodb.GridFSBucket(db);
      const videos = await db.collection('fs.files').find({ 'metadata.userId': userId }).toArray();
  
      if (!videos || videos.length === 0) {
        return res.status(404).json({ message: 'No videos found for this user' });
      }
  
      const videoDataArray = [];
      for (const video of videos) {
        const downloadStream = bucket.openDownloadStream(video._id);
        const videoData = await new Promise((resolve, reject) => {
          const chunks = [];
          downloadStream.on('data', (chunk) => chunks.push(chunk));
          downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
          downloadStream.on('error', reject);
        });
        videoDataArray.push({
          data: videoData.toString('base64'),
          uploadDate: video.uploadDate // Add the uploadDate
        });
      }
  console.log(videoDataArray)
      res.status(200).json(videoDataArray);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while retrieving the videos' });
    }

  }
async function handleupload(req,res){

  try {
    const { userId } = req.body;
    console.log("records fecthing is completed successfully")
    console.log(req.body.userId)
    console.log(userId)
    const submissionId = generateSubmissionId(); 
    const video = req.file;

    if (!video) {
      return res.status(400).json({ message: 'No video uploaded' });
    }

    const uploadVideo = async (file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream('recorded_video.webm', { metadata: { userId, submissionId } });
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        bufferStream.pipe(uploadStream)
          .on('error', reject)
          .on('finish', resolve);
      });
    };

    await uploadVideo(video);

    res.status(200).json({ message: 'Video submitted successfully', submissionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while submitting the video' });
  } 

}
  module.exports={
    createUser,
    handleUserLogin,
    handleupload,
    handlerecords
 }