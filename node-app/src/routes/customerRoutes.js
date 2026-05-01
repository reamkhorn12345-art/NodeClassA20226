import express from 'express';
import CustomerController from '../controllers/CustomerController.js';

console.log('CustomerRoutes: Starting to load...');

const router = express.Router();
let customerController;

try {
  customerController = new CustomerController();
  console.log('CustomerRoutes: CustomerController created successfully');
} catch (error) {
  console.error('CustomerRoutes: Error creating CustomerController:', error.message);
}

// GET /customers - Get all customers (with optional search and status filter)
// GET /customers?search=john - Search customers
// GET /customers?status=active - Filter by status
// GET /customers?id=1 - Get customer by ID
router.get('/', customerController.getCustomers.bind(customerController));

// GET /customers/count - Get customer count
// GET /customers/count?status=active - Get count by status
router.get('/count', customerController.getCustomerCount.bind(customerController));
router.post('/', customerController.createCustomer.bind(customerController));
router.put('/:id', customerController.updateCustomer.bind(customerController));
router.patch('/:id/status', customerController.updateCustomerStatus.bind(customerController));
router.delete('/:id', customerController.deleteCustomer.bind(customerController));


export default router;
