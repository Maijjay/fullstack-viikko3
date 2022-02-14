/* eslint-disable no-undef */
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type : String,
    minlength : 3,
    required : true
  },
  number: {
    type : String,
    minlength : 8,
    validate: {
      validator: function(v) {
        return /\d{2}-\d{6}/.test(v) || /\d{3}-\d{5}/.test(v)
      },
      message: props => `${props.value} is not a valid number`

    },
    required : [true, 'Phone number is missing']
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)