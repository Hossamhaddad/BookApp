'use strict';
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');

const cors = require('cors');

const pg = require('pg');


const PORT = process.env.PORT || 4500;
const server = express();
server.use(cors());
server.use(express.static('./public'));
server.use(express.urlencoded({ extended: true }));

// to tell the express, we want to use ejs template engine
server.set('view engine', 'ejs');
const client = new pg.Client(process.env.DATABASE_URL);

server.get('/', (req, res) => {
  let SQL='SELECT * FROM books;'
  client.query(SQL)
  .then(book=>{

    res.render('pages/index',{selectedBooks:book.rows,NumberofBooks:book.rowCount });
  })
})


/////////////// error handler
// server.use('*',(req,res)=>{
//     res.render('pages/error')
// })

server.get('/search', (req, res) => {
    res.render('pages/searches/new.ejs')
})

server.post('/searches/new', searchHandler);

function searchHandler(req, res) {
    //   let title=req.body.search
    //   let intitle=req.body.intitle
    let url;
    if (req.body.radioType === 'title') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}+intitle:${req.body.search}&projection=full`
    } else if (req.body.radioType === 'author') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}+inauthor:${req.body.search}&projection=full`
    }
    // console.log(url);
    superagent.get(url)
        .then(books => {
            // console.log(books);
            let booksArray = books.body.items.map(book => {
                return new Books(book)
            })
            console.log(booksArray);
            res.render('pages/searches/show', { books: booksArray });
        })
}
function Books(data) {
    this.title = data.volumeInfo.title ? data.volumeInfo.title : 'no title available'
    this.authors = data.volumeInfo.authors[0] ? data.volumeInfo.authors[0] : 'not available'
    this.img = data.volumeInfo.imageLinks.smallThumbnail ? data.volumeInfo.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg'
    this.description = data.volumeInfo.description ? data.volumeInfo.description : 'No avaialbe description'
    this.isbn=data.volumeInfo.industryIdentifiers[0].type+data.volumeInfo.industryIdentifiers[0].identifier
}
client.connect()
.then()
server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
})


server.post('/addbook',bookhandles);

function bookhandles(req,res){
let SQL=`INSERT INTO books (image_url,title,authors,description,isbn) VALUES ($1,$2,$3,$4,$5)RETURNING id;`;
let values=req.body;
let safeVlues=[values.img,values.title,values.authors,values.description,values.isbn];
client.query(SQL,safeVlues)
.then(results=>{
    console.log(results.id);
    res.redirect( '/');
})
}
server.get('/books/:id', booksDetails);

function booksDetails (req,res){
 let value=[req.params.id];
 console.log(value);
 let SQL=`SELECT * FROM books WHERE id=$1;`;
 client.query(SQL,value)
 .then(result=>{
     console.log(result)
    res.render('pages/books/show.ejs',{booksDetails:result.rows})
 })
 
}
