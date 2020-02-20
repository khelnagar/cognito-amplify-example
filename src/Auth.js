import React, { useEffect } from 'react';
import { Auth } from 'aws-amplify';

var AWS = require('aws-sdk');
AWS.config.region = 'your-region';

function scanData() {
    // var dynamodb = new AWS.DynamoDB({region: 'your-region'});    
    // dynamodb.scan({TableName: "products"}, onScan);

    // function onScan(err, data) {
    //     if (err) {
    //     	console.log(err)
    //     } else {
    //         // Print all the movies
    //         data.Items.forEach(function(item) {
    //           dynamodb.getItem({
    //             TableName: "prices", 
    //             Key: { "product_name": { S: item.product_name.S}}
    //           }, function(err, data) {
    //             if (!err) item['price'] = data.Item.price;
    //           })
    //         	console.log(item);
    //         });
    //     }
    // }

    Auth.currentCredentials()
    .then(credentials => {
      var dynamodb = new AWS.DynamoDB({
        region: 'your-region', 
        credentials: Auth.essentialCredentials(credentials)
      });

      dynamodb.scan({TableName: "products"}, onScan);

      function onScan(err, data) {
          if (err) {
            console.log(err)
          } else {
              data.Items.forEach(function(item) {
                dynamodb.getItem({
                  TableName: "prices", 
                  Key: { "product_name": { S: item.product_name.S}}
                }, function(err, data) {
                  if (!err) item['price'] = data.Item.price;
                })
                console.log(item);
              });
          }
      }
    })
}

function generateConsoleURL() {
  // Make the call to obtain credentials
  // const credPromise = () => {
  //   return new Promise((res, rej) => {
  //     AWS.config.credentials.get(function () {
  //       // Credentials will be available when this function is called.
  //       var accessKeyId = AWS.config.credentials.accessKeyId;
  //       var secretAccessKey = AWS.config.credentials.secretAccessKey;
  //       var sessionToken = AWS.config.credentials.sessionToken;

  //       let credentials = {
  //         sessionId:  accessKeyId,
  //         sessionKey:  secretAccessKey,
  //         sessionToken: sessionToken
  //       };

  //       res(credentials);
  //     })
  //   })
  // };

  // const urlPromise = credPromise().then(cred => {
  //   let credentialsURLEncoded = encodeURIComponent(JSON.stringify(cred));
  //   // signin.aws.amazon.com/federation endpoint does not allow cors request 
  //   // so offloaded the cors ability on api gateway
  //   const url = `https://00jg1sy3rd.execute-api.us-east-1.amazonaws.com/prod/session-token?Action=getSigninToken&SessionDuration=9000&Session=${credentialsURLEncoded}`;
    
  //   const signinUrl = fetch(url)
  //   .then((response) => {
  //     return response.json();
  //   })

  //   return signinUrl // promise object
  // });

  const urlPromise = Auth.currentCredentials().then(cred => {
    let credentials = {
      sessionId:  cred.accessKeyId,
      sessionKey:  cred.secretAccessKey,
      sessionToken: cred.sessionToken
    };
    let credentialsURLEncoded = encodeURIComponent(JSON.stringify(credentials));
    // signin.aws.amazon.com/federation endpoint does not allow cors request 
    // so offloaded the cors ability on api gateway
    const url = `https://api-id.execute-api.us-east-1.amazonaws.com/prod/session-token?Action=getSigninToken&SessionDuration=9000&Session=${credentialsURLEncoded}`;
    
    const signinUrl = fetch(url)
    .then((response) => {
      return response.json();
    })
  
    return signinUrl // promise object
  });

  return urlPromise;
}

export default function AuthView(props) {
  const [urlState, setUrlState] = useState('');

  useEffect(() => {
  	Auth.currentAuthenticatedUser()
  	.then(user => {
  		// let token = user.signInUserSession.idToken.jwtToken;
      // let userPoolId = user.pool.userPoolId;
  		// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  		//   IdentityPoolId: 'identity-pool-id',
  		//   Logins: { // optional tokens, used for authenticated login
  		//       [`cognito-idp.your-region.amazonaws.com/${userPoolId}`]: token
  		//   }
  		// });

      // interacting with aws services using aws credentials
      scanData();

      // generating aws console url using aws credentials
      generateConsoleURL().then(data => {
        const consoleURL = `https://signin.aws.amazon.com/federation?Action=login&Issuer=https%3A%2F%2Fexample.com&Destination=https%3A%2F%2Fus-east-1.console.aws.amazon.com&SigninToken=${data.SigninToken}`;
        setUrlState(consoleURL);
      });
  	})
  	.catch(err => console.log(err))
  }, [])

  return (
    <div>
      Authenticated
      <br/>
      <br/>
      <a href={urlState} target="_blank" rel="noopener noreferrer" >
        Login to AWS Console
      </a>
    </div>
  )
}