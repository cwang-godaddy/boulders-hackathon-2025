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
    prompt: `We want to make sure there are not security issues in our network api calls. Here is the  data ${JSON.stringify(
      arrayOfApiData
    )}. This is a public website, in which users are not required to log in. Based on modern webpage security standards, can you highlight any security concerns?  If there are concerns, tell us which url and why`,
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
