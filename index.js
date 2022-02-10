const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(cors())

morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'));
app.use(morgan('tiny'))

let persons = [
    {
    id: 1,
    name: "Ardelli",
    number: "123456"},

    {
    id: 2,
    name: "Arttuuna",
    number: "788536"},

    {
    id: 3,
    name: "Amarillo",
    number: "324234"}
]

 

const makeId = () => {
    const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}


app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    luku = persons.length
    res.send(`<h1>Phonebook has info for ${luku} people </h1> <div>${new Date()}</div>`)

})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }

})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name) {
        return res.status(400).json({
            error: 'no name'
        }) 
    } else if (!body.number) {
        return res.status(400).json({
            error: 'no number'
        })
    } else if (persons.find(p => p.name === body.name)){
        return res.status(400).json({
            error: 'name not unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: makeId()
    }

    persons = persons.concat(person)

    res.json(person)
})   


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})