"use strict";

const crypto_secure_random_digit = require("crypto-secure-random-digit");

var aws = require('aws-sdk');
var ses = new aws.SES({region: 'your-region'});

// Main handler
exports.handler = async (event = {}) => {
    // webclient made for passwordless auth only
    if (event.callerContext.clientId === 'client-id') {
        let secretLoginCode;
        if (!event.request.session || !event.request.session.length) {
            // you can create the user pool with email as username to restrict the userName to
            // be only valid email, for this flow to succeed
            var email = event.userName;
            let validEmail = validateEmail(email);
            console.log(`emailValid? ${validEmail}`);
            // don't spam non-existing users
            let userExists = !event.request.userNotFound;
            // This is a new auth session
            // Generate a new secret login code and text it to the user
            secretLoginCode = crypto_secure_random_digit.randomDigits(6).join('');
            if (userExists && validEmail) {
                await sendEmail(email, secretLoginCode).then(
                    data => console.log(`email sent: ${data}`)
                );
            }
        }
        else {
            // There's an existing session. Don't generate new digits but
            // re-use the code from the current session. This allows the user to
            // make a mistake when keying in the code and to then retry, rather
            // the needing to e-mail the user an all new code again.    
            const previousChallenge = event.request.session.slice(-1)[0];
            secretLoginCode = previousChallenge.challengeMetadata.match(/CODE-(\d*)/)[1];
        }

        // This is sent back to the client app
        event.response.publicChallengeParameters = { email: event.userName };
        // Add the secret login code to the private challenge parameters
        // so it can be verified by the "Verify Auth Challenge Response" trigger
        event.response.privateChallengeParameters = { secretLoginCode };
        // Add the secret login code to the session so it is available
        // in a next invocation of the "Create Auth Challenge" trigger
        event.response.challengeMetadata = `CODE-${secretLoginCode}`;
                        console.log(event)

    }
    return event;
};

async function sendEmail(email, secretLoginCode) {
    console.log(`sending email to ${email}`)
    var params = {
        Destination: { ToAddresses: [email] },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `<html><body><p>This is your secret login code:</p>
                           <h3>${secretLoginCode}</h3></body></html>`
                },
                Text: {
                    Charset: 'UTF-8',
                    Data: `Your secret login code: ${secretLoginCode}`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Your secret login code'
            }
        },
        Source: 'your-alias@amazon.com'
    }
    var request = ses.sendEmail(params);
    return request.promise()
}

function validateEmail(email) { 
   var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   return re.test(email);
}
