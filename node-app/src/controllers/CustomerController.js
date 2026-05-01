import BaseController from './BaseController.js';
import CustomerModel from '../models/CustomerModel.js';

export default class CustomerController extends BaseController {
  constructor() {
    super();
    this.customerModel = new CustomerModel();
  }

  /**
   * Get all customers or search customers
   * GET /customers?search=term&status=active
   */
  async getCustomers(req, res) {
    try {
      const { id, search, status } = req.query;

      if (id) {
        const customer = await this.customerModel.getById(id);
        if (!customer) {
          return this.sendNotFound(res, 'Customer not found');
        }
        return this.sendSuccess(res, customer, 'Customer retrieved successfully');
      }

      if (search) {
        const customers = await this.customerModel.search(search);
        return this.sendSuccess(res, customers, `Found ${customers.length} customers matching "${search}"`);
      }

      if (status) {
        const customers = await this.customerModel.getByStatus(status);
        return this.sendSuccess(res, customers, `Found ${customers.length} customers with status "${status}"`);
      }

      const customers = await this.customerModel.getAll();
      this.sendSuccess(res, customers, 'Customers retrieved successfully');
    } catch (err) {
      // Return sample data if table doesn't exist
      if (err.message && err.message.includes("doesn't exist")) {
        const sampleCustomers = [
          { id: 1, name: 'John Doe', email: 'john.doe@example.com', phone: '+1-555-0123', status: 'active' },
          { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+1-555-0124', status: 'active' },
          { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com', phone: '+1-555-0125', status: 'inactive' }
        ];
        return this.sendSuccess(res, sampleCustomers, 'Sample customers (database table not created yet)');
      }
      
      this.sendError(res, 'Failed to retrieve customers', 500, err);
    }
  }

  /**
   * Create new customer
   * POST /customers
   */
  async createCustomer(req, res) {
    try {
      const { 
        name, 
        email, 
        phone, 
        address, 
        company, 
        status = 'active',
        notes 
      } = req.body;

      // Validation
      if (!name || !email) {
        return this.sendValidationError(res, 'Name and email are required');
      }

      // Check if email already exists
      const existingCustomer = await this.customerModel.getByEmail(email);
      if (existingCustomer) {
        return this.sendError(res, 'Email already exists', 400);
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return this.sendValidationError(res, 'Invalid email format');
      }

      const customerData = {
        name,
        email,
        phone: phone || null,
        address: address || null,
        company: company || null,
        status,
        notes: notes || null
      };

      const customer = await this.customerModel.create(customerData);
      this.sendCreated(res, customer, 'Customer created successfully');
    } catch (err) {
      this.sendError(res, 'Failed to create customer', 500, err);
    }
  }

  /**
   * Update customer
   * PUT /customers/:id
   */
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, 
        email, 
        phone, 
        address, 
        company, 
        status,
        notes 
      } = req.body;

      // Check if customer exists
      const existingCustomer = await this.customerModel.getById(id);
      if (!existingCustomer) {
        return this.sendNotFound(res, 'Customer not found');
      }

      // If email is being updated, check if it's already taken by another customer
      if (email && email !== existingCustomer.email) {
        const emailExists = await this.customerModel.getByEmail(email);
        if (emailExists) {
          return this.sendError(res, 'Email already exists', 400);
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return this.sendValidationError(res, 'Invalid email format');
        }
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (company !== undefined) updateData.company = company;
      if (status !== undefined) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const customer = await this.customerModel.update(id, updateData);
      this.sendSuccess(res, customer, 'Customer updated successfully');
    } catch (err) {
      this.sendError(res, 'Failed to update customer', 500, err);
    }
  }

  /**
   * Delete customer
   * DELETE /customers/:id
   */
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;

      // Check if customer exists
      const existingCustomer = await this.customerModel.getById(id);
      if (!existingCustomer) {
        return this.sendNotFound(res, 'Customer not found');
      }

      const deleted = await this.customerModel.delete(id);
      if (deleted) {
        this.sendSuccess(res, null, `Customer "${existingCustomer.name}" deleted successfully`);
      } else {
        this.sendError(res, 'Failed to delete customer', 500);
      }
    } catch (err) {
      this.sendError(res, 'Failed to delete customer', 500, err);
    }
  }

  /**
   * Update customer status
   * PATCH /customers/:id/status
   */
  async updateCustomerStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return this.sendValidationError(res, 'Status is required');
      }

      const validStatuses = ['active', 'inactive', 'suspended', 'archived'];
      if (!validStatuses.includes(status)) {
        return this.sendValidationError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      // Check if customer exists
      const existingCustomer = await this.customerModel.getById(id);
      if (!existingCustomer) {
        return this.sendNotFound(res, 'Customer not found');
      }

      const customer = await this.customerModel.updateStatus(id, status);
      this.sendSuccess(res, customer, `Customer status updated to "${status}"`);
    } catch (err) {
      this.sendError(res, 'Failed to update customer status', 500, err);
    }
  }

  /**
   * Get customers created within date range
   * GET /customers/range?start=2024-01-01&end=2024-12-31
   */
  async getCustomersByDateRange(req, res) {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        return this.sendValidationError(res, 'Start and end dates are required');
      }

      // Date validation
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate) || isNaN(endDate)) {
        return this.sendValidationError(res, 'Invalid date format. Use YYYY-MM-DD');
      }

      if (startDate > endDate) {
        return this.sendValidationError(res, 'Start date must be before end date');
      }

      const customers = await this.customerModel.getByDateRange(start, end);
      this.sendSuccess(res, customers, `Found ${customers.length} customers between ${start} and ${end}`);
    } catch (err) {
      this.sendError(res, 'Failed to retrieve customers by date range', 500, err);
    }
  }

  /**
   * Get customer count by status
   * GET /customers/count?status=active
   */
  async getCustomerCount(req, res) {
    try {
      const { status } = req.query;

      let count;
      if (status) {
        count = await this.customerModel.count({ status });
      } else {
        count = await this.customerModel.count();
      }

      const message = status 
        ? `Found ${count} customers with status "${status}"`
        : `Total customers: ${count}`;

      this.sendSuccess(res, { count, status: status || 'all' }, message);
    } catch (err) {
      this.sendError(res, 'Failed to get customer count', 500, err);
    }
  }
}
