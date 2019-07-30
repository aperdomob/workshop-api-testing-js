const agent = require('superagent');
const chai = require('chai');
const md5 = require('md5');

chai.use(require('chai-subset'));

const { expect, assert } = chai;

const urlBase = 'https://api.github.com';

describe('Given a user logged in github', () => {
  const username = 'aperdomob';

  describe(`when get ${username} user`, () => {
    let user;

    before(() => {
      const userQuery = agent.get(`${urlBase}/users/${username}`)
        .auth('token', process.env.ACCESS_TOKEN)
        .set('User-Agent', 'agent')
        .then((response) => {
          user = response.body;
        });

      return userQuery;
    });

    it('then the user should be loaded', () => {
      expect(user.name).to.equal('Alejandro Perdomo');
      expect(user.company).to.equal('PSL');
      expect(user.location).to.equal('Colombia');
    });

    describe('when get his repositories', () => {
      let repositories;
      let repository;
      const expectedRepository = 'jasmine-awesome-report';

      before(() => {
        const repositoriesQuery = agent.get(user.repos_url)
          .auth('token', process.env.ACCESS_TOKEN)
          .set('User-Agent', 'agent')
          .then((response) => {
            repositories = response.body;
            repository = repositories.find(repo => repo.name === expectedRepository);
          });

        return repositoriesQuery;
      });

      it(`then should have ${expectedRepository} repository`, () => {
        assert.exists(repository);
        expect(repository.full_name).to.equal('aperdomob/jasmine-awesome-report');
        expect(repository.private).to.equal(false);
        expect(repository.description).to.equal('An awesome html report for Jasmine');
      });

      describe('when download main branch', () => {
        const noExpectedMd5 = 'd41d8cd98f00b204e9800998ecf8427e';
        let zip;

        before(() => {
          const downloadQuery = agent.get(`${repository.svn_url}/archive/${repository.default_branch}.zip`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent')
            .buffer(true)
            .then((response) => {
              zip = response.text;
            });

          return downloadQuery;
        });

        it('then the repository should be downloaded', () => {
          expect(md5(zip)).to.not.equal(noExpectedMd5);
        });
      });

      describe('when get path file list', () => {
        const format = {
          name: 'README.md',
          path: 'README.md',
          sha: 'b9900ca9b34077fe6a8f2aaa37a173824fa9751d'
        };

        let files;
        let readme;

        before(() => {
          const readmeFileQuery = agent.get(`${repository.url}/contents`)
            .auth('token', process.env.ACCESS_TOKEN)
            .set('User-Agent', 'agent')
            .then((response) => {
              files = response.body;
              readme = files.find(file => file.name === 'README.md');
            });

          return readmeFileQuery;
        });

        it('then should have README.md file', () => {
          assert.exists(readme);
          expect(readme).containSubset(format);
        });

        describe('when get the file content', () => {
          const expectedMd5 = '0e62b07144b4fa997eedb864ff93e26b';
          let fileContent;

          before(() => {
            const downloadReadmeQuery = agent.get(readme.download_url)
              .then((response) => {
                fileContent = response.text;
              });

            return downloadReadmeQuery;
          });

          it('then the file should be downloaded', () => {
            expect(md5(fileContent)).to.equal(expectedMd5);
          });
        });
      });
    });
  });
});
