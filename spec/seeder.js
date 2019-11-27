const faker = require('faker');

const generateUserData = () => {
  return {
    email: faker.internet.email(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    gender: faker.random.number() % 2 === 0 ? 'Female' : 'Male',
    department: faker.commerce.department(),
    address: faker.address.streetAddress(),
    phone: faker.phone.phoneNumber(),
    password: faker.random.word()
  };
};

const getRandomImageFixture = () => {
  const fileName = `0${Math.trunc(6 * Math.random())}.gif`;
  return path.join(process.cwd(), 'spec', 'fixtures', fileName);
};

module.exports = {
  generateUserData,
  getRandomImageFixture
};
