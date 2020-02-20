import React, { useEffect, useState } from 'react';
import './App.css';
import { Auth } from 'aws-amplify';
import QRCode from 'qrcode.react';


function showQRCode(setMFACode) {
  // user must be authenticated to setup the MFA preference
  Auth.currentAuthenticatedUser().then(user => {
    console.log(user);
    Auth.setupTOTP(user).then((code) => {
      // You can directly display the `code` to the user or convert it to a QR code to be scanned.
      // E.g., use following code sample to render a QR code with `qrcode.react` component:
      let issuer = user.pool.userPoolId;
      let username = user.username;
      const str = "otpauth://totp/AWSCognito:"+ username + "?secret=" + code + "&issuer=" + issuer;
      setMFACode(str); // handler to component state
      console.log(str);
    }); 
  }).catch(e => {
    console.log(e);
  });
}
  
function enterCode(setMFAState) {
  let challengeAnswer = prompt('Enter the six digit code from Google authenticator');
  Auth.currentAuthenticatedUser().then(user => {
    Auth.verifyTotpToken(user, challengeAnswer).then((data) => {
      console.log(data)
      // don't forget to set TOTP as the preferred MFA method
      Auth.setPreferredMFA(user, 'TOTP');
      setMFAState('done');
    }).catch( e => {
      // Token is not verified
      console.log(e)
      alert('Wrong code, try again or generate new QR code');
    });
  });
}

function SetupMFA(props) {
  const [MFAState, setMFAState] = useState(null);
  const [MFACode, setMFACode] = useState(null);
  
  useEffect(() => {
    // check the current user MFA setup when the App component is loaded
    Auth.currentAuthenticatedUser().then(user => {
      if (user.preferredMFA === 'SOFTWARE_TOKEN_MFA') {
        setMFAState('done');
        console.log('MFA is already setup!');
      }
    })
  }, [])
      
  return (
    <div className="App">
      <br/>
      <br/>
        { MFAState === 'done' && <div>MFA is already setup!<br/><br/></div>}
        <button onClick={() => showQRCode(setMFACode)}>Start setting up MFA (generate QR code)</button>
        { MFACode &&
          <div>
            1. Download Google authenticator on your mobile, then scan this QR code.<br/>
            2. Enter the generated six digit code by clicking button below
            <br/><br/><br/>
            <QRCode value={MFACode}/>
            <br/><br/><br/>
            <button onClick={() => enterCode(setMFAState)}>Enter six digits code</button>
          </div> 
      }
    </div>
  );
}

export default SetupMFA;