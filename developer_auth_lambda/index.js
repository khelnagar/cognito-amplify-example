var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken');

AWS.config.region = 'your-region';

exports.handler = function(event, context, callback) {
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    
    var auth_params = {
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
      ClientId: 'client-id', 
      UserPoolId: 'userpool-id',
      AuthParameters: {
        'USERNAME': event.username,
        'PASSWORD': event.password
      }
    };
    
    // this auth backend should be a developer backend auth but since this is not there,
    // we opt for authenticating user against user pool admin authentication as a practice example
    var auth_result = cognitoidentityserviceprovider.adminInitiateAuth(auth_params).promise();   
    
    var cognitoidentity = new AWS.CognitoIdentity({
      credentials: {
        accessKeyId: 'aws-account-key-id', 
        secretAccessKey:'aws-account-access-key'
      }
    });

    // getting openidtoken for the authenticated user and returning it in response
    auth_result.then(auth_data => {
        console.log(auth_data);
        const idToken = auth_data.AuthenticationResult.IdToken;
        let sub = jwt.decode(idToken).sub;
        // as using cognito as the developer authentication system, i used the sub to be the unique identifier
        var identity_params = {
          IdentityPoolId: 'identity-pool-id',
          Logins: {
            // provider name could be anything as long as same is set in the identity pool custom auth provider
            'your-alias.myinstance.com': sub, 
          },
        };
        
        cognitoidentity.getOpenIdTokenForDeveloperIdentity(identity_params, function(err, data) {
          if (err) {
            callback(err)
          } // an error occurred
          else {
            const response = {
                identityId: data.IdentityId,
                token : data.Token
            }
            console.log(response);
            callback(null, response)
          };         
        });
    }).catch(err => console.log(err))
};
