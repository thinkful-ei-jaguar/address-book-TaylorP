require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helemt = require('helmet');
const { NODE_ENV, API } = require('./config');
const uuid = require('uuid/v4')

const app = express();

const morganOption = NODE_ENV === 'production'
? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(cors());
app.use(helemt());
app.use(express.json());

const addresses = [];

const handleDeleteAddress = (req, res)=>{
  const { userId } = req.params;
  const index = addresses.findIndex(u=> u.id === userId);

  if(index === -1){
    return res.status(404).send('Address not found');
  }
  addresses.splice(index, 1);
  res.send('Address deleted');
}

const handlePostAddress = (req, res, next) =>{
  const { firstName, lastName, address1, address2, city, state, zip } = req.body;

  if(!firstName) {
    return res
      .status(400)
      .send('Username Required');
  }
  if(!lastName) {
    return res
      .status(400)
      .send('Password Required');
  }
  if(!address1) {
    return res
      .status(400)
      .send('Favorite Club Required');
  }
  if(!city) {
    return res.status(400).send('City Required');
  }
  if(!state) {
    return res.status(400).send('State Required');
  }
  if(!zip) {
    return res.status(400).send('Zip Code Required');
  }
  if(state.length!==2) {
    return res.status(400).send('Please use 2 character state code')
  }
  if(zip.length!==5) {
    return res.status(400).send('Invalid, please provide a 5-digit Zip code')
  }
  
  const id = uuid();
  const newAddress = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip: Number(zip)
  }

  addresses.push(newAddress);
  res.send('All Validation Passes')
}

const validateToken = (req, res, next) =>{
  const authToken = req.get('Authorization');
  console.log('authToken: ', authToken, 'API: ',API);
  if(!authToken || authToken.split(' ')[1] !== API) {
    return res.status(401).json({ error: 'You can\'t sit with us!' })
  }
  next();
}

app.get('/address', (req, res, next)=>{
  res.json(addresses);
});

app.post('/address', validateToken, handlePostAddress);

app.delete('/address/:userId', validateToken, handleDeleteAddress)

app.use((error, req, res, next)=>{
  let response;
  if(NODE_ENV === 'production'){
    response = { error: 'Internal Service Error' }
  }
  else {
    console.log(error)
    response = {message: error.message, error}
  }
  res.status(500).json(response);
});

module.exports = app;