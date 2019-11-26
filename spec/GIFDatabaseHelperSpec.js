const fs = require('fs');
const path = require('path');

const faker = require('faker');

const pool = require('../src/database/connection');
const GIFHelper = require('../src/database/gif');
const UserHelper = require('../src/database/user');

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
    const seedData = {
      email: faker.internet.email(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      gender: faker.random.number() % 2 === 0 ? 'Female' : 'Male',
      department: faker.commerce.department(),
      address: faker.address.streetAddress(),
      phone: faker.phone.phoneNumber(),
      password: faker.random.word()
    };

    const userInfo = await userHelper.createUser(seedData);
    const fileName = `0${Math.trunc(6 * Math.random())}.gif`;
    const filePath = path.join(process.cwd(), 'spec', 'fixtures', fileName);
    const gifInfo = await gifHelper.createGIF(userInfo.id, filePath, false);

    expect(gifInfo.id).not.toBeNull();
    expect(gifInfo.id).toBeDefined();
    expect(gifInfo.public_id).not.toBeNull();
    expect(gifInfo.public_id).toBeDefined();
    expect(gifInfo.url).not.toBeNull();
    expect(gifInfo.url).toBeDefined();
  });

  it('should be able to create a GIF comment', async () => {
    const seedData = {
      email: faker.internet.email(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      gender: faker.random.number() % 2 === 0 ? 'Female' : 'Male',
      department: faker.commerce.department(),
      address: faker.address.streetAddress(),
      phone: faker.phone.phoneNumber(),
      password: faker.random.word()
    };

    const userInfo = await userHelper.createUser(seedData);
    const fileName = `0${Math.trunc(6 * Math.random())}.gif`;
    const filePath = path.join(process.cwd(), 'spec', 'fixtures', fileName);
    const gifInfo = await gifHelper.createGIF(userInfo.id, filePath, false);

    const gifComment = await gifHelper.createComment(userInfo.id, gifInfo.id, 'First comment!');
    expect(gifComment.id).toBeDefined();
    expect(gifComment.id).not.toBeNull();
    expect(gifComment.comment).toBe('First comment!');
  });
});
