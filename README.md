This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

`npm install`
Installs all the dependencies required to run the app

`npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Full Application Experience

In order to run the application and see all the functionalities, you will need to create the below resources either using Amplify ([tutorial](https://dev.to/dabit3/the-complete-guide-to-user-authentication-with-the-amplify-framework-2inh)), or create them yourself in your AWS account.


1. User pool with an app client which enables sign in through Cognito hosted UI
2. A second app client which will be used solely for the purpose of passwordless authentication. In order for the passwordless flow to work, you need to uncomment the part in `FormPasswordless.js` to use this app client ID instead of the default one in `aws-exports.js`.
3. Lambda triggers for the passwordless authentication
	- `createAuthChallenge_passwordless`
	- `defineAuthChallenge_passwordless`
	- `verifyAuthchallenge_passwordless`
	- `preSignup_passwordless`
4. Identity pool with both user pool and custom developer as authentication providers. This is used to provide auth/unauth identities and issue temporary credentials for using AWS services
5. Two IAM roles for authenticated and unauthenticated user access to the app as in `identityPoolRoles`
6. Two DynamoDB tables which will be used as an example for auth/unauth user access to the app
7. Lambda function as a backend for the developer authentication flow as in `developer_auth_lambda`

## Updated Funtionalites

1. MFA TOTP authentication flow and setup for user
2. After signing in you will have an AWS Console session where you will interact with AWS services in the Console yourself!