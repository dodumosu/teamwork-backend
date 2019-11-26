const fs = require('fs');

const cloudinary = require('cloudinary').v2;

require('../config');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class GIFHelper {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async createTables() {
    return await this.pool.query(`
      CREATE TABLE IF NOT EXISTS gifs (
        id SERIAL NOT NULL PRIMARY KEY,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        url VARCHAR(512) NOT NULL,
        public_id VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        flagged BOOLEAN NOT NULL DEFAULT 'f'
      );
      CREATE TABLE IF NOT EXISTS gif_comments (
        id SERIAL PRIMARY KEY NOT NULL,
        gif_id INTEGER NOT NULL REFERENCES gifs(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        flagged BOOLEAN NOT NULL DEFAULT 'f'
      );
    `);
  }

  async deleteUploads() {
    const result = await this.pool.query('SELECT public_id FROM gifs;');
    if (result.rowCount > 0) {
      result.rows.forEach(public_id => {
        cloudinary.uploader.destroy(public_id);
      });
    }
  }

  async dropTables() {
    return await this.pool.query(`
      DROP TABLE IF EXISTS gif_comments;
      DROP TABLE IF EXISTS gifs;
    `);
  }

  async createGIF(userId, filePath, removeFile = true) {
    const resource = await cloudinary.uploader.upload(filePath, {
      format: 'gif',
      resource_type: 'auto'
    });
    const params = [resource.url, userId, resource.public_id];
    const result = await this.pool.query(
      `
      INSERT INTO gifs (url, author_id, public_id) VALUES ($1, $2, $3) RETURNING id, url, public_id;
      `,
      params
    );

    if (removeFile) fs.unlink(filePath);

    return result.rows[0];
  }

  async createComment(userId, gifId, comment) {
    const params = [gifId, userId, comment];
    const result = await this.pool.query(
      `INSERT INTO gif_comments (
          gif_id, author_id, comment
        ) VALUES ($1, $2, $3) RETURNING id, comment;
      `,
      params
    );

    return result.rows[0];
  }

  async getGIF(gifId) {
    const result = await this.pool.query(
      `
        SELECT id, url, public_id, flagged FROM gifs WHERE id = $1;
      `,
      [gifId]
    );
    if (result.rowCount === 1) {
      return result.rows[0];
    }

    return null;
  }

  async deleteGIF(user, gifId) {
    // if the user is an admin, they can delete flagged GIFs
    // otherwise, a user can only delete their own GIFs
    const gif = await this.getGIF(gifId);
    const canDelete =
      (user.email === 'admin@example.com' && gif.flagged) || gif.author_id === user.id;
    let result = null;
    if (canDelete) {
      result = await this.pool.query('DELETE FROM gifs WHERE id = $1', [gifId]);
      cloudinary.uploader.destroy(gif.public_id);
    }

    if (result) return result.rowCount === 1;
    else return false;
  }
}

module.exports = GIFHelper;
