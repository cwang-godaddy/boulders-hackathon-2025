const fetch = require('node-fetch');
const { auth_jomax } = require('./auth_jomax'); // Assuming you have the auth_jomax stored in a separate file

async function callGoCaas(input = '') {
    const url = 'https://caas.api.godaddy.com/v1/prompts';
    const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'cookie': auth_jomax
    };
    const body = JSON.stringify({
        prompt: `what's your name ${input}`,
        provider: "openai_chat",
        providerOptions: {
            model: "gpt-3.5-turbo"
        }
    });

    const res = await fetch(url, {
        method: 'POST',
        headers,
        body
    })

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status} error calling api ${body}`);
    }

    const { data } = await res.json();

    console.log(data.value);
}

callGoCaas();