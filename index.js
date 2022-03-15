const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function fetchGamersky() {
  const res = await axios({
    method: 'post',
    url: 'https://appapi2.gamersky.com/v5/getAppNewsList',
    data: {
      osVersion: '5.1.1',
      os: 'android',
      request: {
        order: 'timeDesc',
        pageSize: 30,
        pageIndex: 1,
        topicIds: '2',
      },
    },
  });
  console.log(res);
}

try {
  fetchGamersky();

  /* // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = new Date().toTimeString();
  core.setOutput('time', time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`); */
} catch (error) {
  core.setFailed(error.message);
}
