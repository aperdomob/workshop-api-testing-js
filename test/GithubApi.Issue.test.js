const agent = require('superagent-promise')(require('superagent'), Promise);
const { expect } = require('chai');

const urlBase = 'https://api.github.com';

describe('Given an authenticate github user', () => {
  let user;

  before(() => {
    const userRequest = agent.get(`${urlBase}/user`)
      .auth('token', process.env.ACCESS_TOKEN)
      .set('User-Agent', 'agent')
      .then((response) => {
        user = response.body;
      });

    return userRequest;
  });

  it('then should have repositories', () => {
    expect(user.public_repos).to.be.above(0);
  });

  describe('when get all repositories', () => {
    let firstRepository;

    before(() => {
      const repositoriesRequest = agent.get(user.repos_url)
        .auth('token', process.env.ACCESS_TOKEN)
        .set('User-Agent', 'agent')
        .then((response) => {
          const { body } = response;
          firstRepository = body.shift();
        });

      return repositoriesRequest;
    });

    it('then should have some repository', () => {
      expect(firstRepository).to.not.equal(undefined);
    });

    describe('when create a new issue', () => {
      const newIssue = { title: 'this is an example about an issue' };
      const updateIssue = { body: 'add a body' };
      let issue;

      before(() => {
        const newIssueRequest = agent.post(`${urlBase}/repos/${user.login}/${firstRepository.name}/issues`, newIssue)
          .auth('token', process.env.ACCESS_TOKEN)
          .set('User-Agent', 'agent')
          .then((response) => {
            issue = response.body;
          });

        return newIssueRequest;
      });

      it('then the issue should be created', () => {
        expect(issue.id).to.not.equal(undefined);
        expect(issue.title).to.equal(newIssue.title);
        expect(issue.body).to.equal(null);
      });

      describe('when modify an issue', () => {
        let modifiedIssue;

        before(() => {
          const modifiedIssueQuery = agent.patch(`${urlBase}/repos/${user.login}/${firstRepository.name}/issues/${issue.number}`, updateIssue)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent')
            .then((response) => {
              modifiedIssue = response.body;
            });

          return modifiedIssueQuery;
        });

        it('then add the body', () => {
          expect(modifiedIssue.title).to.equal(newIssue.title);
          expect(modifiedIssue.body).to.equal(updateIssue.body);
        });
      });
    });
  });
});
