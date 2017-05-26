//requiring modules
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

//twitter library
var Twitter = require('twitter');
//secret app keys
var secret = require('./secret.js');
//putting library and keys together
var client = new Twitter(secret);

//bringing in the markov chain
var markov = require('./markov.js');

//body parsing
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

///THE MEAT!!!!

app.get('/api/tweets/:user', function (req, res) {
	//username is taken from parameter
	var username = req.params.user;
	if (!username) {
		res.send("No user by that name.");
		return;
	}
	//define parameters
	var params = {
		screen_name: username,
		include_rts: false,
		count: 200,
		contributor_details: false,
		trim_user: true
	};

//get statuses from user timeline
	client.get('statuses/user_timeline', params, function (error, tweets, response) {
		if (!error) {
			//if there's not an error add tweets
			tweets = tweets.map(function (tweet) {
				//return text of tweet
				return tweet.text;
			});
			//send tweet at index to train
			for (var i = 0; i < tweets.length; i++) {
				markov.train(tweets[i]);
			}
			//send with a limit of 140
			res.send(markov.generate(140));
			tweets = {};
		} else {
			console.log(error);
			res.send("There was an error.");
		}
	});
	markov.reset();
});

// <!--
// 	  ____              _    _         ,__ __              _     
//   (|   \            | |  | |       /|  |  |            | |    
//    |    | __        | |  | |  _     |  |  |   __,   ,  | |    
//   _|    |/  \_|   | |/ \_|/  |/     |  |  |  /  |  / \_|/ \   
//  (/\___/ \__/  \_/|_/\_/ |__/|__/   |  |  |_/\_/|_/ \/ |   |_/
//                                                               -->
app.get('/api/tweets/mash', function (req, res) {
	//take first user
	var username1 = req.query.user1;
	//take second user
	var username2 = req.query.user2;
	if (!username1 || !username2) {
		res.send("No users by those names.");
		return;
	}
	if (username1 === username2) {
		res.send("Those are the same users!");
		return;
	}
	var params1 = {
		screen_name: username1,
		include_rts: false,
		count: 200,
		contributor_details: false,
		trim_user: true
	};
	var params2 = {
		screen_name: username2,
		include_rts: false,
		count: 200,
		contributor_details: false,
		trim_user: true
	};
	client.get('statuses/user_timeline', params, function (error, tweets, response) {
		if (!error) {
			tweets = tweets.map(function (tweet) {
				return tweet.text;
			});
			for (var i = 0; i < tweets.length; i++) {
				markov.train(tweets[i]);
			}
			
		} 
		client.get('statuses/user_timeline', params2, function(error, tweets, response){
			if (!error){
				tweets += (tweets.map(function(tweet){
					return tweet.text;
				}));
				for (var j=0; j<tweets.length;j++){
					markov.chain(tweets[j]);
				}
				res.send(markov.generate(140));
			}else{
				console.log(error);
				res.send('Oh no! An Error!');
			}
		});
	});
	markov.reset();
});


//get stuffs from the twitter
app.get("/api/tweet", function(req, res ){
	var user = req.query.user;
	var params ={
		screen_name: user,
		include_rts: false,
		count: 200,
		contributor_details:false,
		trim_user: true
	};

// get stuffs from the twitter
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (!error) {
			tweets = tweets.map(function(tweet) {
			return tweet.text;
			});
		}
		if("#tweet"){
			for(var i=0; i<tweets.length;i++){
				markov.train(tweets[i]);
			}
				res.send(markov.generate(140));
				markov.reset();
		}else {
			console.log(tweets);
			res.send("oops there was an error");
		}
	});
});


//public folder
app.use(express.static('public'));

//error handling
app.use(function (req, res) {
	res.status(404);
	res.send("404: File Not Found");
});
app.use(function (err, req, res, next) {
	console.log(err);
	res.status(500);
	res.send("500 Internal Server Error");
});

//server startup
app.listen(8008, function () {
	console.log("Server started at BOOB.");
});