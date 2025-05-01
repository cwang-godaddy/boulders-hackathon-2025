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

const responseMatrix = [];
const RequestMatrix = [];

const splitArrayIntoChunks = (matrix, arr, chunkSize = 25) => {
  for (let i = 0; i < arr.length; i += chunkSize) {
    matrix.push(arr.slice(i, i + chunkSize));
  }
  return matrix;
};

const reqFilePath = `./data/${siteName}_req.json`;
const respFilePath = `./data/${siteName}_resp.json`;
const consoleStatement = `data security report for ${siteName}: `;

const writeToFile = (filePath, data) => {
  fs.writeFile(filePath, JSON.stringify(data), "utf8", () => {});
};

async function example() {
  const urlToTest = URLMappings[siteName];

  let client;

  if (fs.existsSync(reqFilePath) && fs.existsSync(respFilePath)) {
    console.log(`found data for ${siteName}, using existing data...`);
    const arrayOfApiRequests = JSON.parse(fs.readFileSync(reqFilePath, "utf8"));
    const arrayOfApiResponses = JSON.parse(
      fs.readFileSync(respFilePath, "utf8")
    );
    if (arrayOfApiRequests.length > 25) {
      console.log(`file has more than 25 requests, splitting into chunks...`);
      splitArrayIntoChunks(RequestMatrix, arrayOfApiRequests);
      console.log("Request ", consoleStatement);
      for (const array of RequestMatrix) {
        await callGoCaas(array);
      }
    } else {
      console.log("Request ", consoleStatement);
      await callGoCaas(arrayOfApiRequests);
    }
    if (arrayOfApiResponses.length > 25) {
      console.log(`file has more than 25 requests, splitting into chunks...`);
      splitArrayIntoChunks(responseMatrix, arrayOfApiResponses);
      console.log("Response ", consoleStatement);
      for (const array of responseMatrix) {
        await callGoCaas(array);
      }
    } else {
      console.log("Response ", consoleStatement);
      await callGoCaas(arrayOfApiResponses);
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

        writeToFile(respFilePath, arrayOfApiResponses);
        writeToFile(reqFilePath, arrayOfApiRequests);

        console.log("Response ", consoleStatement);
        await callGoCaas(arrayOfApiResponses);

        console.log("Request ", consoleStatement);
        await callGoCaas(arrayOfApiRequests);
      }
    }
  }
}

example();
