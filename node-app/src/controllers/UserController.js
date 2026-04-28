import UserModel from '../models/UserModel.js';

export default class UserController {
  static async getUsers(req, res) {
    try {
      const { id } = req.query;

      if (id) {
        const user = await UserModel.getById(id);
        return res.json(user);
      }

      const users = await UserModel.getAll();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async createUser(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: 'Name, email and password are required',
        });
      }

      const user = await UserModel.create({ name, email, password });

      res.status(201).json({
        message: 'User created successfully',
        user,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;

      const user = await UserModel.update(id, {
        name,
        email,
        password,
      });

      res.json({ message: 'User updated', user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      await UserModel.delete(id);

      res.json({ message: `User ${id} deleted` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}