const lab5 = require('./routes/lab5')
const individualAssignmentDB = require('./routes/individualAssignmentDB')

const express = require('express')
const app = express()
const port = process.env.PORT||5000

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/COMP4537/labs/5', lab5);
app.use('/COMP4537/labs/individualAssignmentDB', individualAssignmentDB);

app.use(express.static('static'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})