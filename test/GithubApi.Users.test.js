const agent = require('superagent-promise')(require('superagent'), Promise);
const responseTime = require('superagent-response-time');
const { expect } = require('chai');

const urlBase = 'https://api.github.com';

describe('Given a github user', () => {
  describe('when gets all users', () => {
    let queryTime;
    let allUsers;

    before(() => {
      allUsers = agent
        .get(`${urlBase}/users`)
        .auth('token', process.env.ACCESS_TOKEN);

      const usersQuery = agent
        .get(`${urlBase}/users`)
        .auth('token', process.env.ACCESS_TOKEN)
        .use(responseTime((request, time) => {
          queryTime = time;
        })).then(() => 0); // this line is needed because this libray has issues

      return usersQuery;
    });

    it('then should have a quick reponse', () => {
      expect(queryTime).to.be.at.below(5000);
    });

    it('and should contains thirty users by default pagination', () =>
      allUsers.then(allUserResponse =>
        expect(allUserResponse.body.length).to.equal(30)));

    describe('when it filters the number of users to 10', () => {
      let tenUsersQuery;

      before(() => {
        tenUsersQuery = agent
          .get(`${urlBase}/users`)
          .auth('token', process.env.ACCESS_TOKEN)
          .query({ per_page: 10 });
      });

      it('then the filtered number users should be equals 10', () =>
        tenUsersQuery.then(tenFilteredUsers =>
          expect(tenFilteredUsers.body.length).to.equal(10)));
    });

    describe('when it filters the number of users to 100', () => {
      let oneHundredUsersQuery;

      before(() => {
        oneHundredUsersQuery = agent
          .get(`${urlBase}/users`)
          .auth('token', process.env.ACCESS_TOKEN)
          .query({ per_page: 100 });
      });

      it('then the filtered number users should be equals 100', () =>
        oneHundredUsersQuery.then(oneHundredFilteredUsers =>
          expect(oneHundredFilteredUsers.body.length).to.equal(100)));
    });
  });
});
