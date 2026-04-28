import express from 'express';
import userRoutes from './routes/userRoutes.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/about', (req, res) => {
  res.send('About page node.js');
});

// API routes
app.use('/api', userRoutes);

// Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;