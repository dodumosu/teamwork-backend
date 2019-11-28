const faker = require('faker');
const request = require('supertest');

const pool = require('../src/database/connection');
const GIFHelper = require('../src/database/gif');
const UserHelper = require('../src/database/user');
const generateToken = require('../src/utils');
const { generateUserData, getRandomImageFixture } = require('./seeder');

let app;

describe('GIFController', () => {
  const gifHelper = new GIFHelper(pool);
  const userHelper = new UserHelper(pool);

  beforeEach(async () => {
    await gifHelper.dropTables();
    await userHelper.dropTable();

    await userHelper.createTable();
    await gifHelper.createTables();

    app = require('../src/app');
  });

  it('should be able to create a GIF', async done => {
    const userData = generateUserData();
    const user = await userHelper.createUser(userData);
    const token = generateToken(user.id);
    const bearerHeader = `Bearer: ${token}`;
    const title = faker.lorem.sentence();

    request(app)
      .post('/api/v1/gifs')
      .set('Authorization', bearerHeader)
      .send({ title: title })
      .attach('image', getRandomImageFixture())
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body.status).toBe('success');
        expect(response.body.data.id).not.toBe(null);
        expect(response.body.data.id).not.toBe(undefined);
        expect(response.body.data.url).not.toBe(null);
        expect(response.body.data.url).not.toBe(undefined);
        expect(response.body.data.title).toBe(title);
      })
      .end(err => {
        if (err) done.fail(err);
        else done();
      });
  });
  it('should be able to comment on a GIF', async done => {
    const user1Data = generateUserData();
    const user1 = await userHelper.createUser(user1Data);
    const user2Data = generateUserData();
    const user2 = await userHelper.createUser(user2Data);
    const token = generateToken(user2.id);
    const bearerHeader = `Bearer: ${token}`;
    const title = faker.lorem.sentence();
    const comment = faker.lorem.sentence();
    const gifInfo = gifHelper.createGIF(user1.id, getRandomImageFixture(), title, false);

    request(app)
      .post(`/api/v1/gifs/${gifInfo.id}/comment`)
      .set('Authorization', bearerHeader)
      .send({ comment: comment })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body.status).toBe('success');
        expect(response.body.data.id).not.toBe(null);
        expect(response.body.data.id).not.toBe(undefined);
        expect(response.body.data.comment).toBe(comment);
        expect(response.body.data.gif_id).toBe(gifInfo.id);
        expect(response.body.data.author_id).toBe(user2.id);
      })
      .end(err => {
        if (err) done.fail(err);
        else done();
      });
  });

  it('should be able to flag a GIF', async done => {
    const user1Data = generateUserData();
    const user1 = await userHelper.createUser(user1Data);
    const user2Data = generateUserData();
    const user2 = await userHelper.createUser(user2Data);
    const token = generateToken(user2.id);
    const bearerHeader = `Bearer: ${token}`;
    const title = faker.lorem.sentence();
    const gifInfo = gifHelper.createGIF(user1.id, getRandomImageFixture(), title, false);

    request(app)
      .post(`/api/v1/gifs/${gifInfo.id}/flag`)
      .set('Authorization', bearerHeader)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body.status).toBe('success');
        expect(response.body.data.id).toBe(gifInfo.id);
      })
      .end(err => {
        if (err) done.fail(err);
        else done();
      });
  });

  it('should be able to flag a GIF comment', async done => {
    const user1Data = generateUserData();
    const user1 = await userHelper.createUser(user1Data);
    const user2Data = generateUserData();
    const user2 = await userHelper.createUser(user2Data);
    const token = generateToken(user1.id);
    const bearerHeader = `Bearer: ${token}`;
    const title = faker.lorem.sentence();
    const comment = faker.lorem.sentence();
    const gifInfo = gifHelper.createGIF(user1.id, getRandomImageFixture(), title, false);
    const gifComment = gifHelper.createComment(user2.id, gifInfo.id, comment);

    request(app)
      .post(`/api/v1/gifs/${gifInfo.id}/comments/${gifComment.id}/flag`)
      .set('Authorization', bearerHeader)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body.status).toBe('success');
        expect(response.body.data.id).toBe(gifInfo.id);
      })
      .end(err => {
        if (err) done.fail(err);
        else done();
      });
  });

  it('should be able to delete a GIF', async done => {
    const user1Data = generateUserData();
    const user1 = await userHelper.createUser(user1Data);
    const user2Data = generateUserData();
    const user2 = await userHelper.createUser(user2Data);
    const admin = await userHelper.createAdmin();
    const title = faker.lorem.sentence();
    const uploadFile = getRandomImageFixture();

    let gifInfo = await gifHelper.createGIF(user1.id, uploadFile, title, false);
    let userToken = generateToken(user2.id);
    let bearerHeader = `Bearer: ${userToken}`;

    // test deleting another user's GIF
    request(app)
      .delete(`/api/v1/gifs/${gifInfo.id}`)
      .set('Authorization', bearerHeader)
      .expect(403)
      .expect(response => {
        expect(response.body.status).toBe('error');
      })
      .end(err => {
        if (err) done.fail(err);
        else done();
      });

    // test deleting user's own GIF
    userToken = generateToken(user1.id);
    bearerHeader = `Bearer: ${userToken}`;

    request(app)
      .delete(`/api/v1/gifs/${gifInfo.id}`)
      .set('Authorization', bearerHeader)
      .expect(200)
      .expect(response => {
        expect(response.body.status).toBe('success');
      })
      .end(err => {
        if (err) done.fail(err);
        else done();
      });

    // test deleting unflagged GIF as admin
    gifInfo = await gifHelper.createGIF(user2.id, uploadFile, title, false);
    userToken = generateToken(admin.id);
    bearerHeader = `Bearer: ${userToken}`;

    request(app)
      .delete(`/api/v1/gifs/${gifInfo.id}`)
      .set('Authorization', bearerHeader)
      .expect(403)
      .expect(response => {
        expect(response.body.status).toBe('error');
      })
      .end(err => {
        if (err) done.fail(err);
        else done();
      });

    // test deleting flagged GIF as admin
    await gifHelper.flagGIF(gifInfo.id);
    request(app)
      .delete(`/api/v1/gifs/${gifInfo.id}`)
      .set('Authorization', bearerHeader)
      .expect(200)
      .expect(response => {
        expect(response.body.status).toBe('success');
      })
      .end(err => {
        if (err) done.fail(err);
        else done();
      });
  });

  it('should be able to delete a GIF comment', async done => {
    const userData = generateUserData();
    const user = await userHelper.createUser(userData);
    const admin = await userHelper.createAdmin();
    const uploadFile = getRandomImageFixture();
    const title = faker.lorem.sentence();
    const comment = faker.lorem.sentence();
    const gifInfo = await gifHelper.createGIF(user.id, uploadFile, title, false);
    const commentInfo = await gifHelper.createComment(user.id, gifInfo.id, comment);
    const token = generateToken(admin.id);
    const bearerHeader = `Bearer: ${token}`;

    // try to delete unflagged comment
    request(app)
      .delete(`/api/v1/gifs/${gifInfo.id}/comments/${commentInfo.id}`)
      .set('Authorization', bearerHeader)
      .expect(403)
      .end(err => {
        if (err) done.fail(err);
        else done();
      });
  });
});
