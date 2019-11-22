const faker = require('faker');
const request = require('supertest');

const pool = require('../src/database/connection');
const UserHelper = require('../src/database/user');
const generateToken = require('../src/utils');

let app;

describe('UserController', () => {
  const userHelper = new UserHelper(pool);

  beforeEach(async () => {
    await userHelper.dropTable();
    await userHelper.createTable();

    app = require('../src/app');
  });

  it('should be able to login', async done => {
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

    request(app)
      .post('/api/v1/auth/signin')
      .set('Accept', 'application/json')
      .send({
        email: seedData.email,
        password: seedData.password
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body.status).toBe('success');
        expect(response.body.data.userId).toBe(userInfo.id);
        expect(response.body.data.token).toBe(generateToken(userInfo.id));
      })
      .end(err => {
        if (err) done.fail(err);
        else done();
      });
  });

  it('should fail to login with invalid credentials', async done => {
    request(app)
      .post('/api/v1/auth/signin')
      .set('Accept', 'application/json')
      .send({
        email: faker.internet.email(),
        password: faker.random.word()
      })
      .expect(401)
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body.status).toBe('error');
        expect(response.body.error).toBe('Login failed. Please check your credentials');
      })
      .end(err => {
        if (err) done.fail(err);
        else done();
      });
  });
});
