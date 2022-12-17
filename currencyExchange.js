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
app.use(express.static(__dirname + '/css'));

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

app.get("/exchange", (request, response) => {
    let variables = { portNumber: portNumber}
    response.render("exchange", variables)
});

app.get("/retrieve", (request, response) => {
    let variables = { portNumber: portNumber}
    response.render("retrieve", variables)
});


app.post("/convertion", (request, response1) => {
    const { from_curr, to_curr , amount} = request.body;


    fetch(`https://currency-exchange.p.rapidapi.com/exchange?from=${from_curr}&to=${to_curr}`, options)
        .then(response => response.json())
        .then(response => {

            const convertion = amount * response

            const total_convertion = {
                amount: amount,
                from_curr: from_curr,
                to_curr: to_curr,
                exchange_rate: response,
                convertion: convertion,
                portNumber: portNumber
            }

            async function addConvertionToDB() {
                try {
                    await client.connect();
                   
                    await addConvertion(client, databaseAndCollection, total_convertion);
            
                } catch (e) {
                    console.error(e);
                } finally {
                    await client.close();
                }
            }
            addConvertionToDB().catch(console.error);

            
            response1.render("convertion", total_convertion);
        })
        .catch(err => console.error(err));
});


app.post("/retrieveRate", (request, response) => {
    
    async function lookUpConvertionRate() {
        try {
            await client.connect();
                    const { from_curr, to_curr } = request.body;
                    const {exchange_rate}= await lookUpConvertionRateInDB(client, databaseAndCollection, from_curr, to_curr);
                    
                    console.log(exchange_rate)

                    const convertion = {
                        from_curr: from_curr,
                        to_curr: to_curr,
                        exchange_rate: exchange_rate,
                        portNumber: portNumber
                    }

                    response.render("retrieveRate", convertion)
                    
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }
    lookUpConvertionRate().catch(console.error);
});


async function addConvertion(client, databaseAndCollection, newConvertion) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newConvertion);
}

async function lookUpConvertionRateInDB(client, databaseAndCollection, from_curr, to_curr) {
    let filter = {from_curr : from_curr, to_curr: to_curr};
    const result = client.db(databaseAndCollection.db)
                    .collection(databaseAndCollection.collection)
                    .findOne(filter);
    return result;
}

app.listen(portNumber); 
console.log(`Webserver started and running at http://localhost:${portNumber}`);