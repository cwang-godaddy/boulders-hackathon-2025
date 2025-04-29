const CDP = require("chrome-remote-interface");
const { callGoCaas } = require("../service/index");

const URL =
  "https://godaddy.com/domainsearch/find?domainToCheck=hellwoeiruweoriuwoeiru.com";
const arrayOfApiResponses = [];
const arrayOfApiRequests = [];

async function example() {
  let client;
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
    await Page.navigate({ url: URL });
    await Page.loadEventFired();
  } catch (err) {
    console.error(err);
  } finally {
    if (client) {
      await client.close();
      await callGoCaas(arrayOfApiResponses);
      await callGoCaas(arrayOfApiRequests);
    }
  }
}

example();
