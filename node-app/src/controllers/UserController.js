import BaseModel from '../models/BaseModel.js';
import BaseController from './BaseController.js';

class UserModel extends BaseModel {
  constructor() {
    super();
    this.tableName = 'users';
  }
}

export default class UserController extends BaseController {
  constructor() {
    super();
    this.userModel = new UserModel();
  }

  async getUsers(req, res) {
    try {
      const { id } = req.query;

      if (id) {
        const user = await this.userModel.getById(id);
        if (!user) {
          return this.sendNotFound(res, 'User not found');
        }
        return this.sendSuccess(res, user, 'User retrieved successfully');
      }

      const users = await this.userModel.getAll();
      this.sendSuccess(res, users, 'Users retrieved successfully');
    } catch (err) {
      this.sendError(res, 'Failed to retrieve users', 500, err);
    }
  }

  async createUser(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return this.sendValidationError(res, 'Name, email and password are required');
      }

      const user = await this.userModel.create({ name, email, password });
      this.sendCreated(res, user, 'User created successfully');
    } catch (err) {
      this.sendError(res, 'Failed to create user', 500, err);
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;

      const user = await this.userModel.getById(id);
      if (!user) {
        return this.sendNotFound(res, 'User not found');
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (password !== undefined) updateData.password = password;

      const updatedUser = await this.userModel.update(id, updateData);
      this.sendSuccess(res, updatedUser, 'User updated successfully');
    } catch (err) {
      this.sendError(res, 'Failed to update user', 500, err);
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await this.userModel.getById(id);
      if (!user) {
        return this.sendNotFound(res, 'User not found');
      }

      const deleted = await this.userModel.delete(id);
      if (deleted) {
        this.sendSuccess(res, null, `User ${id} deleted successfully`);
      } else {
        this.sendError(res, 'Failed to delete user', 500);
      }
    } catch (err) {
      this.sendError(res, 'Failed to delete user', 500, err);
    }
  }
}
