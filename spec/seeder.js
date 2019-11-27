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

module.exports = {
  generateUserData
};
