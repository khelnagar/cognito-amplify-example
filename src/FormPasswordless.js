import React, { useState, useReducer } from 'react'
import Amplify, { Auth } from 'aws-amplify';

// if you want to use a different app client for the passwordless sign in you can override the amplify config
// and use the client made for passwordless only.
// the app client id can be set as a condition in the Lambda triggers Define/Create/Verify auth challange to only
// run the code when the passwordless flow is used becasue triggers are universal to the user pool.

// Amplify.configure({
//   Auth: {
//     // region: "us-east-1",
//     // userPoolId: 'userpool-id',
//     userPoolWebClientId: 'passwordless-app-client-id',
//   }
// });

const initialFormState = {
  username: '', email: '', confirmationCode: ''
}

function getRandomString(bytes: number) {
  const randomValues = new Uint8Array(bytes);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues).map(intToHex).join('');
}

function intToHex(nr: number) {
  return nr.toString(16).padStart(2, '0');
}

function reducer(state, action) {
  switch(action.type) {
    case 'updateFormState':
      return {
        ...state, [action.e.target.name]: action.e.target.value
      }
    default:
      return state
  }
}

async function signUp({ email }, updateFormType) {
  try {
    const params = {
      username: email,
      password: getRandomString(30),
      attributes: {
        email
      }
    };
    await Auth.signUp(params);
    console.log('sign up success!')
    updateFormType('signIn')
  } catch (err) {
    console.log('error signing up..', err)
  }
}

async function confirmSignUp({ confirmationCode }, cognitoUser) {
  // console.log(confirmationCode, cognitoUser)
  try {
    await Auth.sendCustomChallengeAnswer(cognitoUser, confirmationCode);

    // It we get here, the answer was sent successfully,
    // but it might have been wrong (1st or 2nd time)
    // So we should test if the user is authenticated now
    try {
        // This will throw an error if the user is not yet authenticated:
        await Auth.currentSession();
    } catch {
        console.log('Apparently the user did not enter the right code');
    }

    console.log('confirm sign up success!')
    // updateFormType('confirmSignUp')
  } catch (err) {
    console.log('error signing up..', err)
  }
}

async function signIn({ username }, updateFormType, updateCognitoUser) {
  try {
    let cognitoUser = await Auth.signIn(username);
    updateCognitoUser(cognitoUser)
    console.log('sign in success!')
    updateFormType('confirmSignUp')
  } catch (err) {
    console.log('error signing up..', err)
  }
}

export default function Form() {
  const [formType, updateFormType] = useState('signIn')
  const [cognitoUser, updateCognitoUser] = useState('')
  const [formState, updateFormState] = useReducer(reducer, initialFormState)
  function renderForm() {
    switch(formType) {
      case 'signUp':
        return (
          <SignUp
            signUp={() => signUp(formState, updateFormType)}
            updateFormState={e => updateFormState({ type: 'updateFormState', e })}
          />
        )
      case 'confirmSignUp':
        return (
          <ConfirmSignUp
            confirmSignUp={() => confirmSignUp(formState, cognitoUser)}
            updateFormState={e => updateFormState({ type: 'updateFormState', e })}
          />
        )
      case 'signIn':
        return (
          <SignIn
            signIn={() => signIn(formState, updateFormType, updateCognitoUser)}
            updateFormState={e => updateFormState({ type: 'updateFormState', e })}
          />
        )
      default:
        return null
    }
  }
  

  return (
    <div>
      <div>
        {renderForm(formState)}
      </div>
      {
        formType === 'signUp' && (
          <p style={styles.footer}>
            Already have an account? <span
              style={styles.anchor}
              onClick={() => updateFormType('signIn')}
            >Sign In</span>
          </p>
        )
      }
      {
        formType === 'signIn' && (
          <p style={styles.footer}>
            Need an account? <span
              style={styles.anchor}
              onClick={() => updateFormType('signUp')}
            >Sign Up</span>
          </p>
        )
      }
    </div>
  )
}

function SignUp(props) {
  return (
    <div style={styles.container}>
      <input 
        name='username'
        onChange={e => {e.persist();props.updateFormState(e)}}
        style={styles.input}
        placeholder='username'
      />
      <input 
        name='email'
        onChange={e => {e.persist();props.updateFormState(e)}}
        style={styles.input}
        placeholder='email'
      />
      <button onClick={props.signUp} style={styles.button}>
        Sign Up
      </button>
    </div>
  )
}

function SignIn(props) {
  return (
    <div style={styles.container}>
      <input 
        name='username'
        onChange={e => {e.persist();props.updateFormState(e)}}
        style={styles.input}
        placeholder='username'
      />
      <button style={styles.button} onClick={props.signIn}>
        Sign In
      </button>
    </div>
  )
}

function ConfirmSignUp(props) {
  return (
    <div style={styles.container}>
      <input
        name='confirmationCode'
        placeholder='Confirmation Code'
        onChange={e => {e.persist();props.updateFormState(e)}}
        style={styles.input}
      />
      <button onClick={props.confirmSignUp} style={styles.button}>
        Confirm Sign In
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 150,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    height: 45,
    marginTop: 8,
    width: 300,
    maxWidth: 300,
    padding: '0px 8px',
    fontSize: 16,
    outline: 'none',
    border: 'none',
    borderBottom: '2px solid rgba(0, 0, 0, .3)'
  },
  button: {
    backgroundColor: '#006bfc',
    color: 'white',
    width: 316,
    height: 45,
    marginTop: 10,
    fontWeight: '600',
    fontSize: 14,
    cursor: 'pointer',
    border:'none',
    outline: 'none',
    borderRadius: 3,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, .3)',
  },
  footer: {
    fontWeight: '600',
    padding: '0px 25px',
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.6)'
  },
  anchor: {
    color: '#006bfc',
    cursor: 'pointer'
  }
}