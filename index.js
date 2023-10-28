const express = require('express');
const cors = require('cors');
const app = express();
const AWS = require('aws-sdk');
const Chime = new AWS.Chime({ region: 'us-east-1' });
app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());


const { v4: uuid } = require('uuid');

const bodyParser = require('body-parser');



app.use(bodyParser.json());


const chime = new AWS.ChimeSDKMeetings({ region: 'us-east-1' });

app.post('/api/join-meeting', async (req, res) => {
  try {
    // Generate a unique ExternalMeetingId
    const ExternalMeetingId = uuid();
    const externalUserId = `${uuid()}-${req.body.username}`;

    // Create a new meeting
    const meetingResponse = await chime.createMeeting({
      ClientRequestToken: ExternalMeetingId,
      MediaRegion: 'us-west-2',
      ExternalMeetingId: ExternalMeetingId,
    }).promise();

    // Create an attendee and link them to an identity managed by your application
    const attendeeResponse = await chime.createAttendee({
      MeetingId: meetingResponse.Meeting.MeetingId,
      ExternalUserId:externalUserId ,
    }).promise();

    // Generate a meeting link using the meeting ID or any other identifier
    const meetingLink = `http://localhost:300/meeting/${meetingResponse.Meeting.MeetingId}`;

    // Send the meetingResponse, attendeeResponse, and meetingLink back to the frontend
    res.send({ meetingResponse, attendeeResponse, meetingLink });
  } catch (error) {
    console.error('Error creating meeting and attendee:', error);
    res.status(500).send('Error creating meeting and attendee');
  }
});

app.delete('/delete-meeting', (req, res) => {
  const body = req.body;
  const meetingId = body.MEETING_ID;

  // Now you can use the meetingId in your deleteMeeting logic
});

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
// const multer  = require('multer')
// const { MongoClient } = require('mongodb');
// const mongodb = require('mongodb');
// const stream = require('stream');

// const uri = process.env.MongoDB_URL; // Replace with your MongoDB connection URI
// const dbName = 'test'; // Replace with your MongoDB database name
// const client = new MongoClient(uri);
// const { GridFSBucket } = require('mongodb');

// const storage = multer.memoryStorage(); // Store file content in memory

// // Create multer instance
// const upload = multer({ storage: storage });
// const mongoose = require('mongoose')



// app.post('/upload', upload.single('video'), async (req, res) => {
//   try {
//     const { title } = req.body;
//     const buffer = req.file.buffer;

//     const writestream = gfs.createWriteStream({
//       filename: title,
//     });

//     writestream.on('close', (file) => {
//       res.json({ message: 'Video uploaded successfully' });
//     });

//     writestream.end(buffer);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
// app.post('/upload', upload.fields([
//   { name: 'aadharCard', maxCount: 1 },
  
// ]), async (req, res) => {
//   try {
//     await client.connect(); // Connect to MongoDB

//     const db = client.db(dbName);
//     const bucket = new mongodb.GridFSBucket(db);
//     const userId=req.body.userId;
//     const submissionId = generateSubmissionId(); 
//     const { aadharCard, panCard } = req.files;

//     // Upload files to GridFS
//     const uploadFile = async (file) => {
//       return new Promise((resolve, reject) => {
//         const uploadStream = bucket.openUploadStream(file.originalname,{ metadata: { userId,submissionId } });
//         const bufferStream = new stream.PassThrough();
//         bufferStream.end(file.buffer);
//         bufferStream.pipe(uploadStream)
//           .on('error', reject)
//           .on('finish', resolve);
//       });
//     };

//     const uploadFiles = async (files) => {
//       return Promise.all(files.map(file => uploadFile(file)));
//     };

//     await uploadFiles([aadharCard[0], panCard[0], formC[0], payslip[0]]);

//     res.status(201).json({ message: 'Files submitted successfully', submissionId  });
   
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'An error occurred while submitting the files' });
//   } finally {
//     await client.close(); // Close MongoDB connection
//   }
// });


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

app.post('/upload', upload.single('video'), async (req, res) => {
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

    res.status(201).json({ message: 'Video submitted successfully', submissionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while submitting the video' });
  } finally {
    await client.close();
    console.log('connection closed') // Close MongoDB connection
  }
});


// app.get('/video/:userId', async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     console.log(userId);
//     console.log("records fetching is completed successfully");
//     await client.connect(); // Connect to MongoDB

//     const db = client.db('test');
//     const bucket = new mongodb.GridFSBucket(db);
//     const videos = await db.collection('fs.files').find({ 'metadata.userId': userId }).toArray();

//     if (!videos || videos.length === 0) {
//       return res.status(404).json({ message: 'No videos found for this user' });
//     }

//     const videoDataArray = [];
//     for (const video of videos) {
//       const downloadStream = bucket.openDownloadStream(video._id);
//       const videoData = await new Promise((resolve, reject) => {
//         const chunks = [];
//         downloadStream.on('data', (chunk) => chunks.push(chunk));
//         downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
//         downloadStream.on('error', reject);
//       });
//       videoDataArray.push(videoData.toString('base64'));
//     }

//     res.status(200).json(videoDataArray);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'An error occurred while retrieving the videos' });
//   }
// });

app.get('/video/:userId', async (req, res) => {
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
});

app.get('/download/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists',
      });
    }

    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
});




