import React, { useState, useReducer } from 'react';

// Load the AWS SDK for Node.js
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

const initialFormState = {
  username: '', password: ''
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

async function getUserIdToken(url, credentials) {
    // make the request to api gateway > lambda
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
    return await response.json();
}

async function signIn({ username, password }) {
  try {
    // calll lambda function thru api gateway with the username and password
    let apiEndpoint = 'https://00jg1sy3rd.execute-api.us-east-1.amazonaws.com/prod/developer-auth';
    let credentials = {
      username: username,
      password: password
    };

    getUserIdToken(apiEndpoint, credentials).then((response) => {
      let identityId = response.identityId;
      let token = response.token;

      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:ab0fd5fa-1842-4732-82a6-be503fea4037',
        IdentityId: identityId,
        Logins: { 
          'cognito-identity.amazonaws.com': token
        },
      });

      // use aws services
      scanData();
    });
    console.log('sign in success!')
  } catch (err) {
    console.log('error signing up..', err)
  }
}

export default function Developer() {
  const [formType] = useState('signIn')
  const [formState, updateFormState] = useReducer(reducer, initialFormState)
  function renderForm() {
    switch(formType) {
      case 'signIn':
        return (
          <SignIn
            signIn={() => signIn(formState)}
            updateFormState={e => updateFormState({ type: 'updateFormState', e })}
          />
        )
      default:
        return null
    }
  }

  return (
       <div>
        {renderForm(formState)}
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
      <input
        type='password'
        name='password'
        onChange={e => {e.persist();props.updateFormState(e)}}
        style={styles.input}
        placeholder='password'
      />
      <button style={styles.button} onClick={props.signIn}>
        Sign In
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
