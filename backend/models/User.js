const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(id, name, email, password, role, created_at, updated_at) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role || 'user';
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { name, email, password, role } = userData;

    try {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const result = await query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at, updated_at`,
        [name, email, hashedPassword, role || 'user']
      );

      const user = result.rows[0];
      return new User(user.id, user.name, user.email, null, user.role, user.created_at, user.updated_at);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return new User(
        user.id,
        user.name,
        user.email,
        user.password,
        user.role,
        user.created_at,
        user.updated_at
      );
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const result = await query(
        'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return new User(user.id, user.name, user.email, null, user.role, user.created_at, user.updated_at);
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Check if user is admin
  isAdmin() {
    return this.role === 'admin';
  }

  // Update user password
  static async updatePassword(userId, currentPassword, newPassword) {
    try {
      // First, get the user with password to verify current password
      const result = await query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password in database
      const updateResult = await query(
        `UPDATE users
         SET password = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, name, email, role, created_at, updated_at`,
        [hashedNewPassword, userId]
      );

      const updatedUser = updateResult.rows[0];
      return new User(
        updatedUser.id,
        updatedUser.name,
        updatedUser.email,
        null,
        updatedUser.role,
        updatedUser.created_at,
        updatedUser.updated_at
      );
    } catch (error) {
      throw error;
    }
  }

  // Get user data without password
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = User;
