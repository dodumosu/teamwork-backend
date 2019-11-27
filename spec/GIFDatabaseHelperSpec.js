const fs = require('fs');
const path = require('path');

const pool = require('../src/database/connection');
const GIFHelper = require('../src/database/gif');
const UserHelper = require('../src/database/user');
const { generateUserData, getRandomImageFixture } = require('./seeder');

describe('GIFHelper', () => {
  const gifHelper = new GIFHelper(pool);
  const userHelper = new UserHelper(pool);

  beforeEach(async () => {
    gifHelper.deleteUploads();
    await gifHelper.dropTables();
    await userHelper.dropTable();
    await userHelper.createTable();
    await gifHelper.createTables();
  });

  it('should be able to create a GIF', async () => {
    const seedData = generateUserData();

    const userInfo = await userHelper.createUser(seedData);
    const filePath = getRandomImageFixture();
    const gifInfo = await gifHelper.createGIF(userInfo.id, filePath, false);

    expect(gifInfo.id).not.toBeNull();
    expect(gifInfo.id).toBeDefined();
    expect(gifInfo.public_id).not.toBeNull();
    expect(gifInfo.public_id).toBeDefined();
    expect(gifInfo.url).not.toBeNull();
    expect(gifInfo.url).toBeDefined();
  });

  it('should be able to create a GIF comment', async () => {
    const seedData = generateUserData();

    const userInfo = await userHelper.createUser(seedData);
    const filePath = getRandomImageFixture();
    const gifInfo = await gifHelper.createGIF(userInfo.id, filePath, false);

    const gifComment = await gifHelper.createComment(userInfo.id, gifInfo.id, 'First comment!');
    expect(gifComment.id).toBeDefined();
    expect(gifComment.id).not.toBeNull();
    expect(gifComment.comment).toBe('First comment!');
  });

  it('should be able to delete a GIF', async () => {
    const user1Data = generateUserData();
    const user2Data = generateUserData();
    const user1 = await userHelper.createUser(user1Data);
    const user2 = await userHelper.createUser(user2Data);
    const admin = await userHelper.createAdmin();
    const filePath = getRandomImageFixture();

    const gifInfo = await gifHelper.createGIF(user1.id, filePath);
  });
});
