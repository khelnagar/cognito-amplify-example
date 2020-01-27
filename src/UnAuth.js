import React, { useEffect } from 'react';

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
AWS.config.region = 'your-region';

var cognitoidentity = new AWS.CognitoIdentity({
});

function getCredentialsForUnAuth(identityId) {
  return cognitoidentity.getCredentialsForIdentity({IdentityId: identityId}).promise();
}

function getIdForUnAuth(pool) {
  return cognitoidentity.getId({IdentityPoolId: pool}).promise()
}

function getCredentials() {
  let identityId = localStorage.getItem('unAuthId');
  if (identityId) {
    var credentials = getCredentialsForUnAuth(identityId).then(data => {
      return {
        accessKeyId: data.Credentials.AccessKeyId, 
        secretAccessKey: data.Credentials.SecretKey,
        sessionToken: data.Credentials.SessionToken
      }
    });
    return credentials // promise object
  } else {
    let identityId = getIdForUnAuth('identity-pool-id').then(data => {
      // not to always generate a new unauth identity for same person
      localStorage.setItem('unAuthId', data.IdentityId); 
      return data.IdentityId
    });
    let credentials = identityId.then(id => {
      var credentialsPromise = getCredentialsForUnAuth(id).then(data => {
        return {
          accessKeyId: data.Credentials.AccessKeyId, 
          secretAccessKey: data.Credentials.SecretKey,
          sessionToken: data.Credentials.SessionToken
        }
      });
      return credentialsPromise
    });
    return credentials // promise object
  }
}

function scanData(credentials) {
  // console.log(credentials)
  
  var dynamodb = new AWS.DynamoDB({...credentials});    
  dynamodb.scan({TableName: "products" }, onScan);

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
            console.log(item)
          });
      }
  }
}

export default function UnAuth (props) {
  useEffect(() => {
    getCredentials().then(credentials => {
      scanData(credentials);
    })
  }, [])

  return (
    <div>
      Unauthenticated
    </div>
  )
}