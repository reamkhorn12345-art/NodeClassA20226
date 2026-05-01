import BaseModel from './BaseModel.js';

export default class CustomerModel extends BaseModel {
  constructor() {
    super();
    this.tableName = 'customers';
  }

  /**
   * Search customers by name or email
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching customers
   */
  async search(searchTerm) {
    const sql = `SELECT * FROM ${this.tableName} 
                 WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
                 ORDER BY name`;
    const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
    return await this.query(sql, params);
  }

  /**
   * Get customers by status
   * @param {string} status - Customer status (active, inactive, etc.)
   * @returns {Promise<Array>} Array of customers with specified status
   */
  async getByStatus(status) {
    return await this.getAll({ where: { status } });
  }

  /**
   * Get customer by email
   * @param {string} email - Customer email
   * @returns {Promise<Object|null>} Customer object or null
   */
  async getByEmail(email) {
    const sql = `SELECT * FROM ${this.tableName} WHERE email = ?`;
    const results = await this.query(sql, [email]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get customers created within date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Array of customers
   */
  async getByDateRange(startDate, endDate) {
    const sql = `SELECT * FROM ${this.tableName} 
                 WHERE created_at BETWEEN ? AND ?
                 ORDER BY created_at DESC`;
    return await this.query(sql, [startDate, endDate]);
  }

  /**
   * Update customer status
   * @param {number|string} id - Customer ID
   * @param {string} status - New status
   * @returns {Promise<Object|null>} Updated customer or null
   */
  async updateStatus(id, status) {
    return await this.update(id, { status });
  }
}
