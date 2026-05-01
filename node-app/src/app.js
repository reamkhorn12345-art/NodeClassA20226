import express from 'express';
import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Wellcom node.js!');
});

app.get('/about', (req, res) => {
  res.send('About page node.js I love node.js');
});

// API routes - Separate mounting to avoid conflicts
console.log('Loading customer routes first...');
app.use('/api/customers', customerRoutes);

console.log('Loading user routes...');
app.use('/api/users', userRoutes);

// Debug: Add a simple customer route to test
app.get('/api/customers-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Customer test route working!',
    data: [
      { id: 1, name: 'Test Customer', email: 'test@example.com' }
    ]
  });
});

// Debug: Add direct customer route to bypass router
app.get('/api/customers-direct', async (req, res) => {
  try {
    const CustomerController = (await import('./controllers/CustomerController.js')).default;
    const controller = new CustomerController();
    await controller.getCustomers(req, res);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Debug routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API routes are working!' });
});

app.get('/api/routes-info', (req, res) => {
  res.json({ 
    message: 'Current routing setup',
    customerRoutes: 'Mounted at /api/customers',
    userRoutes: 'Mounted at /api/users',
    availableEndpoints: {
      customers: [
        'GET /api/customers',
        'GET /api/customers/count',
        'POST /api/customers',
        'PUT /api/customers/:id',
        'DELETE /api/customers/:id'
      ],
      users: [
        'GET /api/users',
        'POST /api/users',
        'PUT /api/users/:id',
        'DELETE /api/users/:id'
      ]
    }
  });
});

// Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;