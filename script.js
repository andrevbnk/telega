const express = require("express");
const session = require('express-session');
const app = express();
const path = require('path');
const http = require('http');

const cookieParser = require('cookie-parser');
const MongoClient = require("mongodb").MongoClient;
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const jsonParser = express.json();


const url = "mongodb+srv://mor_ozzy:a4047946@cluster0-fmmbl.mongodb.net/test?retryWrites=true&w=majority";


mongoose.connect(url, {
useUnifiedTopology: true,
useNewUrlParser: true,
})
.then(() => console.log('DB Connected!'))
.catch(err => {
console.log(`DB Connection Error: ${err.message}`);
});

const mongoClient = new MongoClient(url, {
    useUnifiedTopology: true
});

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname+'/'));

// app.use(session({
//     secret: '=-)',
//     resave: true,
//     saveUninitialized: true,
//     cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 },
//     store: new MongoStore({
//         mongooseConnection: mongoose.connection,     
//         collections: 'sessions', 
//         url: url,
//       }),
//     proxy: true,
//   }));

mongoClient.connect((err, client) => {
    if (err) return console.log(err);
    const dbClient = client;
    app.locals.collection = client.db("bank").collection("users");   
    app.listen(3000,'25.47.80.62', function () {
        console.log("Сервер ожидает подключения...");
    });
});




app.post('/balance',jsonParser,(req,res)=>{
    if (!req.body) return res.sendStatus(400);
    const collection = req.app.locals.collection;
    const id = req.body.id;
    const bank = req.body.bank;

    const name = ["Kolia","Vlad","Kkirilo","Andrey","Alex","Nastya"];
    let person_data = {
        "bank":bank,
        "name":name[Math.floor(Math.random() * (6 - 1) + 1)],
        "accounts":{
            "id":id,
            "balance":Math.floor(Math.random()*100+1),
            "creditLimit":Math.floor(Math.random()*1000+1000),
            "cashType":"UAN"
        }
    };
    

    const check_id = new Promise((result,rej)=>{
        collection.findOne(
            {"id": id,}, 
            (err, users) => {
            if (err) {
                return console.log(err);
            }
            console.log(users,"  find_one");
            result(users);
            return users;
            // res.send(JSON.stringify(users));
        });
    });

    check_id.then(result=>{
        if(result){
            if(result.token[bank]){
                // console.log(result.token[bank],"  token");
                console.log(person_data);
                res.send(JSON.stringify(person_data));
            }
            else{
                console.log(bank,"  token false");
                res.send(JSON.stringify(new Error("Token empty")));
            }
        }
        else{
            console.log(id," id");
            res.send(JSON.stringify(new Error("Id not found")));
        }
    });
});

app.post('/test',jsonParser,(req,res)=>{
    if (!req.body) return res.sendStatus(400);

    const collection = req.app.locals.collection;
    // console.log(req.body);
    const id = req.body.id;
    const token = req.body.token;

    const check_id = new Promise((result,rej)=>{
        collection.findOne(
            {"id": id,}, 
            (err, users) => {
            if (err) {
                return console.log(err);
            }
            console.log(users,"  find_one");
            result(users);
            return users;
            // res.send(JSON.stringify(users));
        });
    });
    
   
    check_id.then(result=>{
        console.log(result,"   res check_id");
        if(result){
            console.log("upate");
            collection.update(
                {"id": id,},
                {"id":id,"token": token},
                {upsert: true},
                (err, users) => {
                    if (err) {
                        return console.log(err);
                    }
                    res.send(JSON.stringify(users));
                    // return users;
                });
            }
        else if(!result){
            console.log("insert");
            collection.insertOne(
                {"id": id,"token":token?token:''}, 
                (err, users) => {
                if (err) {
                    return console.log(err);
                }
                res.send(JSON.stringify(users));
                // return users;
            });
        }
    }); 
});
