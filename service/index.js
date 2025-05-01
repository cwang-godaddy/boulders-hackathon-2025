const fetch = require("node-fetch");
const { auth_jomax } = require("./auth_jomax"); // Assuming you have the auth_jomax stored in a separate file

async function callGoCaas(arrayOfApiData) {
  const url = "https://caas.api.godaddy.com/v1/prompts";
  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    cookie: auth_jomax,
  };

  const body = JSON.stringify({
    prompt: `
        Want to find any security issues in webpage's network api calls or assets (ending in .js or .css).
        Here is the network data of the webpage: ${JSON.stringify(arrayOfApiData)}.
        This is a public website, in which users are not required to log in.
        Based on modern webpage security standards (MDN for reference https://developer.mozilla.org/en-US/docs/Web/Security) and these godaddy security standards:
          1. should not have shopperId with a corresponding value in api url queries (Here is an example: shopperId=1086622).
          2. POST requests should not have prompts within the postData
        List the url, the reason for security concern, the severity level (critical, moderate, or low), and the confidence level (in %).
        List up to 10 concerns. Only list out urls with found security issues; only show those with a confidence level > 60%.
    `,
    provider: "openai_chat",
    providerOptions: {
      model: "gpt-3.5-turbo",
    },
  });

  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} error calling api ${body}`);
  }

  const { data } = await res.json();

  console.log(data.value);
}

module.exports.callGoCaas = callGoCaas;
