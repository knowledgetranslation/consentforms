# Consent Forms

## Installing locally

1. Download the repo
2. cd into the repo
3. npm install
4. cd into the build folder
5. npm install && bower install

Note: You'll need a running instance of mongo running on your local server and you'll need to add an account to the system.

## Setting up an initial account

2. run node . debug
3. Access http://localhost:1234/register
4. Setup an account
5. Add ensureLoggedIn back to the routes.

## Deploying to production

1. cd into the repo
2. Duplicate config.json.template to config.json
3. Update the appropriate values in config.json
4. gulp
  - This gulp default task includes restarting pm2 on the production server


