import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export default class BaseModel {
  constructor() {
    this.connection = null;
    this.tableName = '';
  }

  /**
   * Create database connection
   * @returns {Promise<Object>} Database connection
   */
  async connect() {
    if (!this.connection) {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'test_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
    return this.connection;
  }

  /**
   * Close database connection
   */
  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  /**
   * Execute query with error handling
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async query(sql, params = []) {
    try {
      const connection = await this.connect();
      const [rows] = await connection.execute(sql, params);
      return rows;
    } catch (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  /**
   * Get all records from table
   * @param {Object} options - Query options (where, orderBy, limit)
   * @returns {Promise<Array>} Array of records
   */
  async getAll(options = {}) {
    let sql = `SELECT * FROM ${this.tableName}`;
    const params = [];

    if (options.where) {
      const whereConditions = [];
      Object.entries(options.where).forEach(([key, value]) => {
        whereConditions.push(`${key} = ?`);
        params.push(value);
      });
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }

    if (options.limit) {
      sql += ` LIMIT ?`;
      params.push(options.limit);
    }

    return await this.query(sql, params);
  }

  /**
   * Get record by ID
   * @param {number|string} id - Record ID
   * @returns {Promise<Object|null>} Record object or null
   */
  async getById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const results = await this.query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Create new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await this.query(sql, values);
    
    // Return the created record
    return await this.getById(result.insertId);
  }

  /**
   * Update record by ID
   * @param {number|string} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object|null>} Updated record or null
   */
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    if (keys.length === 0) {
      throw new Error('No data provided for update');
    }
    
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    
    values.push(id);
    await this.query(sql, values);
    
    return await this.getById(id);
  }

  /**
   * Delete record by ID
   * @param {number|string} id - Record ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = await this.query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Count records in table
   * @param {Object} where - Where conditions
   * @returns {Promise<number>} Record count
   */
  async count(where = {}) {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params = [];

    if (Object.keys(where).length > 0) {
      const whereConditions = [];
      Object.entries(where).forEach(([key, value]) => {
        whereConditions.push(`${key} = ?`);
        params.push(value);
      });
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    const result = await this.query(sql, params);
    return result[0].count;
  }

  /**
   * Check if record exists
   * @param {number|string} id - Record ID
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async exists(id) {
    const sql = `SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`;
    const result = await this.query(sql, [id]);
    return result.length > 0;
  }
}