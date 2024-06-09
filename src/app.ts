import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import nocache from 'nocache';
import 'dotenv/config';

import router from '~/routes/index';

// Create Express server
const app = express(); // New express instance
const port = process.env.PORT ?? 3000; // Port number

// Express configuration
app.use(cors()); // Enable CORS
app.use(nocache())
app.use(morgan('short'));
app.use(express.json()); // Enable JSON body parser

// Start Express server
app.listen(port, () => {
  // Callback function when server is successfully started
  console.log(`Listening on port ${port}`);
});

// Use routes
app.use('/', router);

// Export Express app
export default app;
