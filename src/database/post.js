const fs = require('fs');

const cloudinary = require('cloudinary').v2;

require('../config');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class PostHelper {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async createTables() {
    return await this.pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL NOT NULL PRIMARY KEY,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_type VARCHAR(8) NOT NULL,
        title VARCHAR(128) NOT NULL,
        body TEXT NOT NULL,
        public_id VARCHAR(64) NOT NULL,
        url VARCHAR(512) NOT NULL,
        flagged BOOLEAN NOT NULL DEFAULT 'f',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY NOT NULL,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
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
      DROP TABLE IF EXISTS comments;
      DROP TABLE IF EXISTS posts;
    `);
  }

  async createGIF(userId, filePath, title, removeFile = true) {
    const resource = await cloudinary.uploader.upload(filePath, {
      format: 'gif',
      resource_type: 'auto'
    });
    const params = [resource.url, userId, title, resource.public_id];
    const result = await this.pool.query(
      `
      INSERT INTO posts (post_type, url, author_id, title, public_id, body) VALUES ('GIF', $1, $2, $3, $4, '') RETURNING *;
      `,
      params
    );

    if (removeFile === true) fs.unlink(filePath);

    return result.rows[0];
  }

  async createArticle(userId, title, body) {
    const params = [userId, title, body];
    const result = await this.pool.query(
      `
      INSERT INTO posts (post_type, url, public_id, author_id, title, body) VALUES ('Article', '', '', $1, $2, $3) RETURNING *;
      `,
      params
    );

    return result.rows[0];
  }

  async createComment(userId, postId, comment) {
    const params = [postId, userId, comment];
    const result = await this.pool.query(
      `INSERT INTO comments (
          post_id, author_id, comment
        ) VALUES ($1, $2, $3) RETURNING id, post_id, author_id, comment;
      `,
      params
    );

    return result.rows[0];
  }

  async getPost(postId) {
    const result = await this.pool.query(
      `
        SELECT posts.*, users.first_name, users.last_name FROM posts JOIN users ON posts.author_id = users.id WHERE posts.id = $1;
      `,
      [postId]
    );
    if (result.rowCount === 1) {
      return result.rows[0];
    }

    return null;
  }

  async deletePost(user, postId) {
    // if the user is an admin, they can delete flagged posts
    // otherwise, a user can only delete their own posts
    const post = await this.getPost(postId);
    const canDelete =
      (post !== null && user.email === 'admin@example.com' && post.flagged) ||
      post.author_id === user.id;
    let result = null;
    if (canDelete) {
      result = await this.pool.query('DELETE FROM posts WHERE id = $1', [postId]);
      if (post.public_id !== '' && post.post_type === 'GIF')
        cloudinary.uploader.destroy(post.public_id);
    }

    if (result) return result.rowCount === 1;
    else return false;
  }

  async updateArticle(userId, articleId, title, body) {
    const params = [title, body, userId, articleId];
    const result = await this.pool.query(
      `
      UPDATE posts SET title = $1 AND body = $2 AND updated = NOW() WHERE author_id = $3 AND id = $4 RETURNING *;
      `,
      params
    );

    return result.rows[0];
  }

  async flagPost(postId) {
    const result = await this.pool.query("UPDATE posts SET flagged = 't' WHERE id = $1", [postId]);
    return result.rowCount === 1;
  }

  async flagComment(commentId) {
    const result = await this.pool.query("UPDATE comments SET flagged = 't' WHERE id = $1", [
      commentId
    ]);
    return result.rowCount === 1;
  }

  async getPosts() {
    const result = await this.pool.query(
      'SELECT posts.*, users.first_name, users.last_name FROM posts JOIN users ON posts.author_id = users.id ORDER BY created_at DESC'
    );

    return result.rows;
  }
}

module.exports = PostHelper;
