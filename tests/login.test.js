const login = require('../test_cases/login');

const expectedObject = {
  email: expect.stringMatching(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g),
  password: expect.stringMatching(/^[\S]{4,}$/g),
};

test('login test', () => {
  let result = login("rawad@gmail.com","b1-a")
  expect(result).toMatchObject(expectedObject);
});