/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(express.static('build'))
app.use(express.json())

app.use(cors())
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'))
app.use(morgan('tiny'))

const mongoose = require('mongoose')
const { response } = require('express')
const Person = require('./models/persons')

let persons = []

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/info', (req, res, next) => {
  let query = Person.find()
  query.count(function (error, count){
    if (error){
      unknownEndpoint
    } else {
      (res.send(`<h1>Phonebook has info for ${count} people </h1> <div>${new Date()}</div>`))
    }
  })
})

//Find with ID
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person){
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

//Delete
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(req.params.id, req.body, {
    new: false,
    runValidators: true,
    context: 'query'
  })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  console.log(body.name)
  if (body.name === '') {
    next({
      name: 'NoName'
    })
  } else if (body.number === '') {
    next({
      name : 'NoNumber'
    })
  } else if (persons.find(p => p.name === body.name)){
    next({
      name : 'NotUniqueName'
    })
  }

  const person = new Person ({
    runValidators: true,
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted ID' })
  } else if (error.name === 'NoName') {
    return res.status(400).send({ error: 'Name missing' })
  } else if (error.name === 'NoNumber'){
    return res.status(400).send({ error: 'Number missing' })
  } else if (error.name === 'NotUniqueName'){
    return res.status(400).send({ error: 'Name already exists' })
  } else if (error.name === 'ValidationError'){
    return res.status(400).json({ error : error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})