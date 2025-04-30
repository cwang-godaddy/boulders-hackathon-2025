const CDP = require("chrome-remote-interface");
const { callGoCaas } = require("../service/index");
const fs = require("fs");

const URLMappings = {
  fos: "https://godaddy.com",
  serp: "https://godaddy.com/domainsearch/find?domainToCheck=hellwoeiruweoriuwoeiru.com",
  businessName: "https://www.godaddy.com/domainsearch/businessname",
};

const arrayOfApiResponses = [];
const arrayOfApiRequests = [];

const args = process.argv.slice(2);
const siteName = args[0] || serp;

const matrix = [];

const splitArrayIntoChunks = (arr, chunkSize = 50) => {
  for (let i = 0; i < arr.length; i += chunkSize) {
    matrix.push(arr.slice(i, i + chunkSize));
  }
  return matrix;
};

async function example() {
  const filePath = `./data/${siteName}.json`;
  const urlToTest = URLMappings[siteName];

  let client;
  if (fs.existsSync(filePath)) {
    const arrayOfApiRequests = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (arrayOfApiRequests.length > 50) {
      splitArrayIntoChunks(arrayOfApiRequests);
      for (const array of matrix) {
        await callGoCaas(array);
      }
    } else {
      await callGoCaas(arrayOfApiRequests);
    }
  } else {
    try {
      // connect to endpoint
      client = await CDP();
      // extract domains
      const { Network, Page } = client;

      // setup handlers
      Network.requestWillBeSent((params) => {
        if (params.request.method === "POST") {
          arrayOfApiRequests.push({
            url: params.request.url,
            postData: params.request.postData,
            headers: params.request.headers,
          });
        } else {
          arrayOfApiRequests.push({
            url: params.request.url,
            headers: params.request.headers,
          });
        }
      });

      Network.responseReceived((params) => {
        arrayOfApiResponses.push({
          url: params.response.url,
          headers: params.response.headers,
        });
      });

      // enable events then start!
      await Network.enable();
      await Page.enable();
      await Page.navigate({ url: urlToTest });
      await Page.loadEventFired();
    } catch (err) {
      console.error(err);
    } finally {
      if (client) {
        await client.close();

        fs.writeFile(
          filePath,
          JSON.stringify(arrayOfApiResponses),
          "utf8",
          () => {}
        );

        await callGoCaas(arrayOfApiRequests);
      }
    }
  }
}

example();
