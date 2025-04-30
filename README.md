# boulders-hackathon-2025



## Get Started:

Install Google Chrome (if not already on your computer)

Run this command in another terminal:
`/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --headless`; modifying the chrome path if necessary.

Run `npm ci` to generate node_modules

Add `auth_jomax.js` file within `/service` and export `auth_jomax`

Run `node src/index.js {optional-string}`; pass in optional param to specify the site to test. ('serp' is default). Options: 'fos', 'serp', 'businessName'
