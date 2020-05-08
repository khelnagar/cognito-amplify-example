import React, { useEffect, useState } from 'react';
import './App.css';
import { Auth, Hub } from 'aws-amplify';
import Form from './Form';
import FormPasswordless from './FormPasswordless';
import UnAuth from './UnAuth';
import AuthView from './Auth';
import Developer from './Developer';
import Google from './FederateGoogle';
import Facebook from './FederateFacebook';
import SetupMFA from './setupMFA';



function checkUser() {
  Auth.currentAuthenticatedUser()
    .then(user => console.log({ user }))
    .catch(err => console.log(err))
}

function signOut() {
  Auth.signOut()
    .then(data => console.log(data))
    .catch(err => console.log(err))
}

function App(props) {
  const [authState, setAuthState] = useState('loading');
  const [passwordlessState, setPasswordlessState] = useState(false);
  const [MFASetupState, setMFASetupState] = useState(false);
  
  useEffect(() => {
    Hub.listen('auth', (data) => {
      const { payload } = data
      console.log('A new auth event has happened: ' + payload.event, data)
       if (payload.event === 'signIn') {
         console.log('a user has signed in!')
         setAuthState('signedIn')
       }
       if (payload.event === 'signOut') {
         console.log('a user has signed out!')
         // don't update the state again after hostedUI redirects back, as it defaults to signIn when 
         // component renders, otherwise this will rerender the ui double.
         // unless the signOut was done on the same page without hostedUI redirect back.
         // this (true) condition has to change to listen for or spot whether redirect occured.
         if (true) setAuthState('signIn');
       }
    });

    console.log('component rendered');

    // check the current user when the App component is loaded
    Auth.currentAuthenticatedUser().then(user => {
      console.log(user);
      setAuthState('signedIn')
    }).catch(e => {
      console.log(e);
      setAuthState('signIn')
    });
  }, [])
      
  return (
    <div className="App">
      <header className="App-header">
      	{authState === 'loading' && <div>loading....</div>}
        {authState === 'signIn' &&
        	<div>
	        	<button onClick={() => Auth.federatedSignIn()}>Sign in with Cognito Hosted UI</button>
            <button onClick={() => setPasswordlessState(!passwordlessState)}>
              {passwordlessState ? 'Go with password' : 'Go Passwordless'}
            </button>
            <button onClick={() => setAuthState('guest')}>
              Continue as a guest
            </button>
            <button onClick={() => setAuthState('developer')}>
              Identity Pool Developer Federation
            </button>
            <button onClick={() => setAuthState('google')}>
              Identity Pool Google Federation
            </button>
            <button onClick={() => setAuthState('facebook')}>
              Identity Pool Facebook Federation
            </button>
            {passwordlessState ? <FormPasswordless /> : <Form />}
        	</div>
        }
        {authState === 'signedIn' && 
        	<div>
        		<button onClick={checkUser}>Check user</button>
        		<button onClick={signOut}>Sign out</button>
            <button onClick={() => setMFASetupState(!MFASetupState)}>
              {MFASetupState ? 'Back to Auth View' : 'Setup MFA'}
            </button>
            {MFASetupState ? <SetupMFA /> : <AuthView /> }
        	</div>
        }
        {authState === 'guest' &&
          <div>
            <button onClick={() => setAuthState('signIn')}>
              Login as a user
            </button>
            <UnAuth />
          </div>
        }
        {authState === 'developer' &&
          <div>
            <div>
              <button onClick={() => setAuthState('signIn')}>
                Login with Cognito
              </button>
            <Developer />
          </div>
          </div>
        }
        {authState === 'google' &&
          <div>
            <div>
              <button onClick={() => setAuthState('signIn')}>
                Login with Cognito User Pool
              </button>
            <Google />
          </div>
          </div>
        }
        {authState === 'facebook' &&
          <div>
            <div>
              <button onClick={() => setAuthState('signIn')}>
                Login with Cognito User Pool
              </button>
            <Facebook />
          </div>
          </div>
        }
      </header>
    </div>
  );
}

export default App;