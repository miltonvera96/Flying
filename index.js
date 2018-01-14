
var mongoose = require('mongoose');
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var wait     = require('wait.for');
var firebase = require("firebase");
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Initialize Firebase
  var config = {
    apiKey: "AIzaSyAUYmyOpoN6XwA_RyT_FrLFb7R8u5gzE5E",
    authDomain: "flying-f8b33.firebaseapp.com",
    databaseURL: "https://flying-f8b33.firebaseio.com",
    projectId: "flying-f8b33",
    storageBucket: "",
    messagingSenderId: "972757238319"
  };
  firebase.initializeApp(config);

// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/flying";
//
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var query = { address: /^S/ };
//   db.collection("airports").find({}, {'country': true}).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });

// mongodb_data.distinct("airportID", {"country":destino}, function(err, docs){ });

var mongojs = require('mongojs');
var mongodb = mongojs('mongodb://localhost:27017/flying');
var mongodb_data = mongodb.collection('airports');
var mongodb_data2 = mongodb.collection('routes');
var mongodb_data3 = mongodb.collection('airlines');

var paises;
mongodb_data.distinct("country", {}, (function(err, docs){
        if(err){
            return console.log(err);
        }
        if(docs){
            paises = docs;
        }
   })
);

app.set('view engine', 'ejs');

app.get('/', function(req, res){

  res.render('formulario', {
    data : paises,
    rutas : []
  });

});


function handleGet(req, res){

  var respuesta = req.body;
  var origen = respuesta.origen;
  var destino = respuesta.destino;
  var stops = parseInt(respuesta.tipo);

  var sAirports;
  var dAirports;

  var destinos = wait.forMethod(mongodb_data, "distinct", "airportID", {"country":destino});
  var origenes = wait.forMethod(mongodb_data, "distinct", "airportID", {"country":origen});
  var rutas1 = wait.forMethod(mongodb_data2, "distinct", "airlineID", {"sAirportID":{$in:origenes}, "dAirportID":{$in:destinos}, "stops":stops});

  var rutas2 = wait.forMethod(mongodb_data3, "find", {"airlineID" : {$in: rutas1}});
  console.log(rutas2);

 res.render('formulario', {
   data : paises,
   rutas : rutas2
 });

 }

app.post('/find', urlencodedParser,function(req,res){
      wait.launchFiber(handleGet, req, res); //handle in a fiber, keep node spinning
} );

app.use(express.static(__dirname + '/'));

var server = app.listen(port, function(){
    console.log('Servidor web iniciado on port ' + port);
});
