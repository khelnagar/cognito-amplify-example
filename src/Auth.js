import React, { useEffect } from 'react';
import { Auth } from 'aws-amplify';

var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';

function scanData() {
    var dynamodb = new AWS.DynamoDB({region: 'us-east-1'});    
    dynamodb.scan({TableName: "products"}, onScan);

    function onScan(err, data) {
        if (err) {
        	console.log(err)
        } else {
            // Print all the movies
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
}

export default function AuthView(props) {
  useEffect(() => {
  	Auth.currentAuthenticatedUser()
  	.then(user => {
  		let token = user.signInUserSession.idToken.jwtToken;
      let userPoolId = user.pool.userPoolId;
  		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  		  IdentityPoolId: 'us-east-1:ab0fd5fa-1842-4732-82a6-be503fea4037',
  		  Logins: { // optional tokens, used for authenticated login
  		      [`cognito-idp.us-east-1.amazonaws.com/${userPoolId}`]: token
  		  }
  		});
    	scanData();
  	})
  	.catch(err => console.log(err))
  }, [])

  return (
    <div>
      Authenticated
    </div>
  )
}