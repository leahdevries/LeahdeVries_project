
///////////////////////////////////
// Require Native Node.js Libraries
///////////////////////////////////

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var twitter = require('ntwitter');
var _ = require('underscore');

///////////////////////////////////
// Route our Assets
///////////////////////////////////

app.use('/assets/', express.static(__dirname + '/public/assets/'));
app.set('views', __dirname + '/src');
app.set('view engine' , 'jade');


///////////////////////////////////
// Setting up our default variables
///////////////////////////////////

// Twitter symbols array
var watchSymbols = ['$msft', '$intc', '$hpq', '$goog', '$nok', '$nvda', '$bac', '$orcl', '$csco', '$aapl', '$ntap', '$emc', '$t', '$ibm', '$vz', '$xom', '$cvx', '$ge', '$ko', '$jnj', '@google' ];

//Total number of tweets received
var watchList = {
    total: 0,
    symbols: {},
    tweets: []
};

//Setting the watch symbols to zero
_.each(watchSymbols, function(v) { watchList.symbols[v] = 0; });

///////////////////////////////////
// Route our Home Page
///////////////////////////////////
app.get('/', function(req, res){
  res.render('index', { data: watchList });
});


///////////////////////////////////
// Handle Socket Connection
///////////////////////////////////

io.on('connection', function(socket){
  console.log('A User Connected');
  io.emit('data', watchList);
});

///////////////////////////////////
// Twitter Credentials
///////////////////////////////////

var twit = new twitter({
    // consumer_key: [INSERT KEY HERE], 
    // consumer_secret: [INSERT KEY HERE],
    // access_token_key: [INSERT KEY HERE], 
    // access_token_secret: [INSERT KEY HERE]
});


///////////////////////////////////
// Twitter Stream
///////////////////////////////////

// Tell the twitter API to filter on the watchSymbols 
twit.stream('statuses/filter', { track: watchSymbols }, function(stream) {

  //Watching 'data' event for incomming tweets.
  stream.on('data', function(tweet) {

    //Indicate whether a symbol was actually mentioned.
    var claimed = false;

    //Validate tweet
    if (tweet.text !== undefined) {
      watchList.tweets.push(tweet);
      var text = tweet.text.toLowerCase();

      //Go through every symbol and see if it was mentioned.
      _.each(watchSymbols, function(v) {
          if (text.indexOf(v.toLowerCase()) !== -1) {
              watchList.symbols[v]++;
              claimed = true;
          }
      });

      //Increment the total counter/send the update to all the clients
      if (claimed) {
          //Increment total
          watchList.total++;

          //Send to all the clients
          io.emit('data', watchList);
      }
    }
  });
});

///////////////////////////////////
// Start Server
///////////////////////////////////

http.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = http.address();
  console.log("Server started at", addr.address + ":" + addr.port);
});
