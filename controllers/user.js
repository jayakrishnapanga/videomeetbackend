
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

  module.exports={
    createUser,
    handleUserLogin
 }