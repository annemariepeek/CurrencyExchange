const http = require("http");
const express = require("express"); 
const app = express(); 
const path = require("path");
const bodyParser = require("body-parser");
const statusCode = 200;
let fs = require("fs");
process.stdin.setEncoding("utf8");
require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') }) 

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));

const portNumber = 5001;
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};
const { MongoClient, ServerApiVersion } = require('mongodb');
const { rawListeners } = require("process");
const uri = `mongodb+srv://${userName}:${password}@cluster0.tyfa3jx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': '241a3b148amsh1e651014125753cp187754jsnda2279db4735',
        'X-RapidAPI-Host': 'currency-exchange.p.rapidapi.com'
    }
};


app.get("/", (request, response) => {
    let variables = { portNumber: portNumber}
    response.render("index", variables)
});


app.post("/exchange", (request, repsponse) => {
    const { from_curr, to_curr , amount} = request.body;


    fetch('https://currency-exchange.p.rapidapi.com/exchange?from=${from_curr}&to=${to_curr}&q=1.0', options)
        .then(response => response.json())
        .then(response => 
            
            
            console.log(response)
            
            // const variables = {
            //     exchange_rate: rawListeners,
            //     convertion: convertion
            // }
            // )
        .catch(err => console.error(err));
});


app.listen(portNumber); 