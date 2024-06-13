const express = require('express')
const app = express()
var cors = require('cors')
const {connectToDb,getDb} = require('./server')
app.use(cors());
const path = require('path');
// const rootDir = require('../util/terminal.js')

app.set('view engine', 'ejs'); //view engine이 사용할 Template Engine
app.set('test', path.join(__dirname, 'views')); // Template가 있는 디렉토리

app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

let db
connectToDb((err) => {
    if(!err)
    {
        app.listen(3000, () =>{
            console.log("app listening on port 3000")
        })
        db = getDb()//connectToDb(=mongodb://localhost:27017/Board)의 연결이 끝난 이후에, 그 안의 데이터베이스를 꺼내와야 에러X
    }
})

app.get('/write', (req,res) =>{
    res.render(path.join(__dirname, '..', 'views', 'write.ejs'))
})

app.post('/write', function(req,res){
    db.collection('Time_post')
        .insertOne({"_id" : new Date().getTime(), "title" : req.body.title, "content" : req.body.content})
    res.json({ok:true})
})

app.get('/modify_write', (req,res) =>{
    res.render(path.join(__dirname, '..','views', 'modify_write.ejs'), {_id : Id, title : Title, content : Content})
})

let Id = "NULL"
let Title = "NULL"
let Content = "NULL"
app.post('/modify_write', function(req,res){
    Id = req.body._id
    Title = req.body.title
    Content = req.body.content
    res.redirect('/modify_write');
})

app.get('/', (req,res) =>{
    let arr = []
    db.collection("Time_post")
        .find()
        .forEach(event => arr.push(event))
        .then(()=>{
            res.render(path.join(__dirname, '..', 'views', 'main.ejs'),{db : arr})
        })
})

app.post('/Delete', function(req, res){
    let _id = JSON.parse(req.body._id);
    let title = req.body.title;
    let content = req.body.content;

    db.collection('Time_post')
        .deleteOne({"_id" : _id})
        .then(() => {
            db.collection('Time_post')
                .insertOne({"_id" : _id, "title" : title, "content" : content})
                .then(() => {
                    console.log("Data deleted and inserted successfully");
                })
                .catch(err => {
                    console.error("Error inserting data:", err);
                    res.status(500).send("Error inserting data");
                });
        })
        .catch(err => {
            console.error("Error deleting data:", err);
            res.status(500).send("Error deleting data");
        });
});

