const pool = require('../src/database/connection');
const UserHelper = require('../src/database/user');
const { generateUserData } = require('./seeder');

describe('UserHelper', () => {
  const userHelper = new UserHelper(pool);

  beforeEach(async () => {
    await userHelper.dropTable();
    await userHelper.createTable();
  });

  it('should be able to create an employee', async () => {
    const originalUserCount = await userHelper.getUserCount();
    const seedData = generateUserData();

    const userInfo = await userHelper.createUser(seedData);
    const newUserCount = await userHelper.getUserCount();

    expect(newUserCount).toBe(originalUserCount + 1);
    expect(userInfo.email).toBe(seedData.email);
    const dbUser = await userHelper.getUser(userInfo.id);
    expect(dbUser.email).toBe(seedData.email);
    expect(dbUser.first_name).toBe(seedData.first_name);
    expect(dbUser.last_name).toBe(seedData.last_name);
    expect(dbUser.gender).toBe(seedData.gender);
    expect(dbUser.department).toBe(seedData.department);
    expect(dbUser.address).toBe(seedData.address);
    expect(dbUser.phone).toBe(seedData.phone);
  });

  it('should be able to authenticate a user', async () => {
    const seedData = generateUserData();

    const userInfo = await userHelper.createUser(seedData);
    const authUser = await userHelper.authenticate(seedData.email, seedData.password);

    expect(authUser.email).toBe(userInfo.email);

    const nonAuthUser = await userHelper.authenticate(
      'nonexistentemail@nonexistentdomain.nz',
      'non-existent-password'
    );
    expect(nonAuthUser).toBe(null);
  });
});
