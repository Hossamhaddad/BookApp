'use strict';
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');

const cors = require('cors');



const PORT = process.env.PORT || 4500;
const server = express();
server.use(cors());
server.use(express.static('./public'));
server.use(express.urlencoded({extended:true}));

// to tell the express, we want to use ejs template engine
server.set('view engine','ejs');

// localhost:3000/
server.get('/',(req,res)=>{
    res.render('pages/index');
})


/////////////// error handler
// server.use('*',(req,res)=>{
//     res.render('pages/error')
// })

server.get('/search',(req,res)=>{
    res.render('pages/searches/new.ejs')
})

server.post('/searches/new', searchHandler);

function searchHandler(req,res){
  let title=req.body.search
  let intitle=req.body.intitle
  let url;
  if(intitle!==undefined){
     url=`https://www.googleapis.com/books/v1/volumes?q=${title}+intitle:${title}&maxResults=10&startIndex=0` 
  }else{
     url=`https://www.googleapis.com/books/v1/volumes?q=${title}+inauthor:${title}&maxResults=10&startIndex=0` 
  }
  console.log(url);
 superagent.get(url)
 .then(books=>{
    let booksArray = books.body.items.map(book=> new Books(book));
    res.render('pages/searches/show', {books : booksArray});
    })
}
function Books(data){
    this.title=data.volumeInfo.title
    this.authors=data.volumeInfo.authors[0] || `author name isnt available`
    this.img=data.volumeInfo.imageLinks.thumbnail ||`https://i.imgur.com/J5LVHEL.jpg`
    this.description=data.volumeInfo.description|| `No avaialbe description`
}


server.listen(PORT,()=>{
  console.log(`Listening on PORT ${PORT}`);
})