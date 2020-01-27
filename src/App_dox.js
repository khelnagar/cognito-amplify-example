import React, { Component } from 'react';
import Amplify from '@aws-amplify/auth';
import Auth from '@aws-amplify/auth';
import {Hub} from '@aws-amplify/core';
// import OAuthButton from './OAuthButton';
import awsconfig from './aws-exports'; // your Amplify configuration
import './App.css';


Amplify.configure(awsconfig);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authState: 'loading',
      authData: null,
      authError: null
    }

    // this.signOut = this.signOut.bind(this);
   
    // let the Hub module listen on Auth events
    Hub.listen('auth', (data) => {
        switch (data.payload.event) {
            case 'signIn':
                console.log('Hub login success')
                this.setState({authState: 'signedIn', authData: data.payload.data});
                break;
            case 'signIn_failure':
                console.log('Hub login failed')
                this.setState({authState: 'signIn', authData: null, authError: data.payload.data});
                break;
            case 'signOut':
              console.log('Hub logout')
              // this.setState({authState: 'signIn', authData: null});
              break;
            default:
                break;
        }
    });    
  }

  componentDidMount() {
    console.log('on component mount');
    // check the current user when the App component is loaded
    Auth.currentAuthenticatedUser().then(user => {
      console.log(user);
      this.setState({authState: 'signedIn'});
    }).catch(e => {
      console.log(e);
      this.setState({authState: 'signIn'});
    });
  };

  render() {
    const { authState, authData } = this.state;
    // console.log(authData)
    return (
      <div className="App">
        {authState === 'loading' && (<div>loading...</div>)}
        {authState === 'signedIn' && <button onClick={() => Auth.signOut()}>Sign out</button>}
        {authState === 'signIn' && <button onClick={() => Auth.federatedSignIn()}>Sign in with Cognito Hosted UI</button>}
      </div>
    );
  }
}

export default App;