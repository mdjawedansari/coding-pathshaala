import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define a simple route
app.get('/', (_req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, async () => {
  await connectDB();
  console.log(`Server is running on port ${port}`);
});
