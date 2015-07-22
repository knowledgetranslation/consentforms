# Consent Forms

## Installing locally

1. Download the repo
2. cd into the repo
3. npm install
4. cd into the build folder
5. npm install && bower install

Note: You'll need a running instance of mongo running on your local server and you'll need to add an account to the system.

## Setting up an initial account

1. Open index.js and remove ensureLoggedIn from the following two routes:
  - app.get("/register"
  - app.post("/register"
2. run node .
3. Access http://localhost:1234/register
4. Setup an account
5. Add ensureLoggedIn back to the routes.
6. run node .

## Deploying to production

1. cd into the repo
2. Duplicate config.json.template to config.json
3. Update the appropriate values in config.json
4. gulp


