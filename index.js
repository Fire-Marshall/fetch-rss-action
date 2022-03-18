const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
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
  const { errorCode, errorMessage, result } = res.data;

  const entries = result
    .map((item) => {
      const link =
        item.contentType === 'URL'
          ? item.contentURL.replace(/\?.+/, '')
          : `https://wap.gamersky.com/news/Content-${item.contentId}.html`;
      return `
  <entry>
    <title>${item.title}</title>
    <link href="${link}" rel="alternate"/>
    <id>${link}</id>
    <updated>${new Date(item.updateTime)}</updated>
    <author><name>${item.authorName}</name></author>
    <summary type="html">
      <![CDATA[<img src="${item.thumbnailURLs[0]}" />]]>
    </summary>
  </entry>`;
    })
    .join('')
    .trim();

  return `
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>游民星空</title>
  <link href="https://www.gamersky.com/" rel="alternate"/>
  <updated>${new Date().toISOString()}</updated>
  <id>https://www.gamersky.com/</id>
  ${entries}
</feed>
`;
}

async function fetch2cycd() {
  const res = await axios({
    method: 'get',
    url: 'http://www.2cycd.com/forum.php?mod=forumdisplay&fid=43&filter=author&orderby=dateline',
    responseType: 'text',
    // responseEncoding: 'gbk',
  });
  const matches = res.data.matchAll(
    /<tbody id="normalthread_(\d+?)"[\s\S]+?class="s xst">(.+?)<\/a>[\s\S]+?c="1">(.+?)<\/a>[\s\S]+?<span title="(.+?)">[\s\S]+?<\/tbody>/g
  );
  const result = [...matches];

  const entries = result
    .map((item) => {
      const link = `http://www.2cycd.com/forum.php?mod=viewthread&tid=${item[1]}`;
      return `
  <entry>
    <title>${item[2]}</title>
    <link href="${link}" rel="alternate"/>
    <id>${link}</id>
    <updated>${new Date(item[4])}</updated>
    <author><name>${item[3]}</name></author>
    <summary type="html">
      <![CDATA[<p>item[2]</p>]]>
    </summary>
  </entry>`;
    })
    .join('')
    .trim();

  return `
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>二次元虫洞</title>
  <link href="http://www.2cycd.com/" rel="alternate"/>
  <updated>${new Date().toISOString()}</updated>
  <id>http://www.2cycd.com/</id>
  ${entries}
</feed>
`;
}

try {
  fetchGamersky().then((feed) => core.setOutput('gamersky', feed));
  fetch2cycd().then((feed) => core.setOutput('Tcycd', feed));

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
