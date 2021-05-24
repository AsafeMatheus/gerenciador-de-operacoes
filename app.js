const express = require('express')
const mongoose = require('mongoose')
const ejs = require('ejs')
const https = require('https')

const homePost = require('./src/home-post')
const secrets = require('./secrets.js')

const app = express()

app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({extended: true}))
app.use((req, res, next) => {
    if(!req.session) {
      return next();
    } 
})

app.set('view engine', 'ejs')

mongoose.connect('mongodb://localhost:27017/operationsDB', {useNewUrlParser: true})

const operationSchema = new mongoose.Schema({
    name: String,
    sourceCurrency: String,
    targetCurrency: String,
    originalValue: Number,
    convertedValue: Number,
    rate: Number,
    date: String
})

const Operations = new mongoose.model('operation', operationSchema) 

app.get('/', (req, res) => {
    Operations.find((err, allOperations) => {
        if (err){
            console.log(err)
        } else{
            let url = 'https://openexchangerates.org/api/latest.json?app_id=' + secrets.appId

            https.get(url, (response) => {
                if (response.statusCode == 200){
                    response.on('data', data => {
                        let apiData = JSON.parse(data)
                        var totalRate = 0

                        allOperations.forEach((element) => {
                            let elementCurrency = element.sourceCurrency
                            let elementRate = element.rate
                            console.log(elementCurrency)

                            let oneElementValueInDollar = apiData.rates.elementCurrency
                            let elementValueInDollar = Number(elementRate) / oneElementValueInDollar
            
                            console.log(oneElementValueInDollar)
                            totalRate += elementValueInDollar
                        })

                        res.render('home', {allOperations, totalRate: totalRate.toFixed(2)})
                    })
                }
            })
        }
    })
})

app.get('/cadastrar', (req, res) => {
    res.sendFile(__dirname + '/public/cadastrar.html')
})

homePost(app, Operations)

app.post('/cadastrar', (req, res) => {
    let currentDate = new Date()

    let date = currentDate.toLocaleDateString('pt-br')

    const newOperation = new Operations({
        name: req.body.name,
        sourceCurrency: req.body.sourceCurrency,
        targetCurrency: req.body.targetCurrency,
        originalValue: Number(req.body.originalValue),
        convertedValue: Number(req.body.convertedValue),
        rate: Number(req.body.rate),
        date: date
    })

    newOperation.save()

    res.redirect('/cadastrar')
})

app.listen(3000, () => {
    console.log('server is running on port 3000.')
})