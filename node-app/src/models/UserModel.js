import db from '../config/db.js';

export default class UserModel {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async create({ name, email, password }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return { id: result.insertId, name, email };
  }
  

  static async update(id, { name, email, password }) {
    await db.query(
      'UPDATE users SET name=?, email=?, password=? WHERE id=?',
      [name, email, password, id]
    );
    return { id, name, email };
  }

  static async delete(id) {
    await db.query('DELETE FROM users WHERE id=?', [id]);
    return true;
  }
}