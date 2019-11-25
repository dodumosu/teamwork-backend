const bcrypt = require('bcrypt');

class UserHelper {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  createTable() {
    return this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL NOT NULL PRIMARY KEY,
        email VARCHAR(64) NOT NULL UNIQUE,
        first_name VARCHAR(64) NOT NULL,
        last_name VARCHAR(64) NOT NULL,
        gender VARCHAR(8) NOT NULL,
        department VARCHAR(32) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(64) NOT NULL,
        password VARCHAR(256) NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT 'f',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  dropTable() {
    return this.pool.query('DROP TABLE IF EXISTS users');
  }

  async createUser(userSpec) {
    if (
      !(
        userSpec.email &&
        userSpec.first_name &&
        userSpec.last_name &&
        userSpec.gender &&
        userSpec.department &&
        userSpec.address &&
        userSpec.phone &&
        userSpec.password
      )
    )
      return null;
    const hash = await bcrypt.hash(userSpec.password, 10);
    const params = [
      userSpec.email,
      userSpec.first_name,
      userSpec.last_name,
      userSpec.gender,
      userSpec.department,
      userSpec.address,
      userSpec.phone,
      hash
    ];
    const result = await this.pool.query(
      `INSERT INTO users (
          email, first_name, last_name, gender, department, address, phone,
          password
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email;
      `,
      params
    );
    return result.rows[0];
  }

  async authenticate(email, password) {
    const result = await this.pool.query(
      `
      SELECT id, email, password, is_admin FROM users WHERE email = $1
    `,
      [email]
    );

    if (result.rowCount > 0) {
      const valid = await bcrypt.compare(password, result.rows[0].password);
      if (valid) {
        const userInfo = {
          id: result.rows[0].id,
          email: result.rows[0].email
        };
        return userInfo;
      }
      return null;
    }
    return null;
  }

  async getUser(userId) {
    const result = await this.pool.query(
      `
      SELECT * FROM users WHERE id = $1;
    `,
      [userId]
    );
    if (result.rowCount > 0) return result.rows[0];
    return null;
  }

  async getUserCount() {
    const result = await this.pool.query('SELECT COUNT(id) AS cnt FROM users;');
    // the parseInt() call is necessary. for some reason, it's
    // returned as a string
    return Number.parseInt(result.rows[0].cnt);
  }

  async createAdmin() {
    const userSpec = {
      email: 'admin@example.com',
      password: 'password',
      first_name: 'Admin',
      last_name: 'User',
      department: 'Tech',
      gender: 'Neuter',
      address: 'Internet',
      phone: '127.0.0.1'
    };

    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [userSpec.email]);
    if (result.rowCount === 0) return this.createUser(userSpec);
    return result.rows[0];
  }
}

module.exports = UserHelper;
