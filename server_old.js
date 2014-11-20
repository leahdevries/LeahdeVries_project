
// Require Native Node.js Libraries
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var twitter = require('ntwitter');
var _ = require('underscore');

// Route our Assets
app.use('/assets/', express.static(__dirname + '/public/assets/'));
app.set('views', __dirname + '/src');
app.set('view engine' , 'jade');

// Twitter symbols array
var watchSymbols = ['$msft', '$intc', '$hpq', '$goog', '$nok', '$nvda', '$bac', '$orcl', '$csco', '$aapl', '$ntap', '$emc', '$t', '$ibm', '$vz', '$xom', '$cvx', '$ge', '$ko', '$jnj'];

//This structure will keep the total number of tweets received and a map of all the symbols and how many tweets received of that symbol
var watchList = {
    total: 0,
    symbols: {}
};

//Set the watch symbols to zero.
_.each(watchSymbols, function(v) { watchList.symbols[v] = 0; });

// Route our Home Page
app.get('/', function(req, res){
  res.render('index', { data: watchList });
   // res.render('index', watchList);
});

// Handle Socket Connection
io.on('connection', function(socket){
  console.log('A User Connected');
  io.emit('data', watchList);
});

//Twitter component
var t = new twitter({
    consumer_key: 'tE1mQjKYv6CtJRcsvauOOCkCo', 
    consumer_secret: 'n1TfXkYI4GLIn21dAA7E9iIlvF8TANDdU34TRTbhAT6mJIaR3B',
    access_token_key: '565989536-dyQWsqolaVa013AX3tX1Xee4QY2hcYORIHqjTIHK', 
    access_token_secret: 'cZgGyLwixYnpTcVfFhteeF3BR3Wxb8NwiGrFUz5a5k0ak'
});

//Tell the twitter API to filter on the watchSymbols 
t.stream('statuses/filter', { track: watchSymbols }, function(stream) {

  //We have a connection. Now watch the 'data' event for incomming tweets.
  stream.on('data', function(tweet) {

    //This variable is used to indicate whether a symbol was actually mentioned.
    var claimed = false;

    //Make sure it was a valid tweet
    if (tweet.text !== undefined) {

      //We're gunna do some indexOf comparisons and we want it to be case agnostic.
      var text = tweet.text.toLowerCase();

      //Go through every symbol and see if it was mentioned. If so, increment its counter and
      //set the 'claimed' variable to true to indicate something was mentioned so we can increment
      //the 'total' counter!
      _.each(watchSymbols, function(v) {
          if (text.indexOf(v.toLowerCase()) !== -1) {
              watchList.symbols[v]++;
              claimed = true;
          }
      });

      //If something was mentioned, increment the total counter and send the update to all the clients
      if (claimed) {
          //Increment total
          watchList.total++;

          //Send to all the clients
          // sockets.sockets.emit('data', watchList);
          io.emit('data', watchList);
      }
    }
  });
});

// Start Server
http.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = http.address();
  console.log("Server started at", addr.address + ":" + addr.port);
});
