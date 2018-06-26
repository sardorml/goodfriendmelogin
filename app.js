const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config/database');
const User = require('./models/user');

mongoose.connect('mongodb://localhost/auth');


let db = mongoose.connection;

 db.once('open',function(){
 	console.log('Connected to db');
 });

 db.on('error', function(err){
 	console.log(err);
 });

let app = express();
const PORT = process.env.PORT || 8080;
app.use(bodyParser.urlencoded({extended: false}));

// DB schema


////////
var input;
var result;
var extra;
var one_third;
var for_each;
///////
var rem;
var whole;
//////
var nameholder;
//////

// Access control
/*
var checkAuth = function(req,res,next){
	if(req.isAuthenticated()){
		res.redirect('/home');
	}else{
		res.redirect('/error_login');
	}
}
*/
var calculate = function(input){
	if(input.number>1){
		if(input.amount < 5000){ // if less than 5000
			result = input.amount;
			for_each = 0;
		}
		else{
			one_third = input.amount/3;
			console.log('One third: ', one_third);
			if((one_third/(input.number-1))>10000){
				extra = one_third-(10000*(input.number-1));
				for_each = 10000;
				console.log('Extra Amount: ', extra);

				result = (2*one_third)+extra;
			}else{
				result = one_third*2; // Pay 2/3
				for_each = one_third/(input.number-1)
					
			}
		}
	}
	else{
		result = input.amount;
		for_each = 0;
	}
	input.result_for_each = Math.round(for_each*100)/100;
	input.amount = Math.round(result*100)/100;
	console.log('Number of people in the group: ', input.number);
	console.log('Total amount need to be paid by you: ', input.amount);
	console.log('Total amount need to be paid by other members: ', input.result_for_each);
}

var roundIt = function(input){
	if(input.result_for_each<10000 && input.result_for_each>1000){
		rem = input.result_for_each%1000;
		whole = input.result_for_each-rem;

		input.result_for_each = whole;
		input.amount = input.amount +((input.number-1)*rem)
		input.amount = Math.round(input.amount);
	}
}

app.set('view engine', 'ejs');

// Passport config

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Global User
app.get('*',function(req,res,next){
	res.locals.user = req.user || null;
	next();
});

app.get('/', function(req,res){
	res.render("login");
});
app.post('/login', function(req,res,next){
	nameholder = {'name':req.body.username};
	passport.authenticate('local',{
		successRedirect:'/home',
		failureRedirect:'/error_login',
	  })(req, res, next);
});
app.get('/reg', function(req,res){
	res.render("reg");
});

app.post('/reg', function(req,res){
	const name = req.body.name;
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	const password2 = req.body.password2;
	let newUser = new User({
		name: name,
		email: email,
		username: username,
		password: password
	});

	bcrypt.genSalt(10,function(err,salt){
		bcrypt.hash(newUser.password,salt,function(err,hash){
			if(err){
				console.log(err);
			}
			newUser.password = hash;
			newUser.save(function(err){
				if(err){
					console.log(err);
					return;
				}else{
					res.redirect('/login');
				}
			});
		})
	});
});
app.get('/error_login', function(req,res){
	res.render('error_login');
});
app.get('/logout', function(req,res){
	res.render("/");
});

app.get('/login', function(req,res){
	res.render('login');
});

app.get('/home', function(req,res){
	
	res.render('home',{user:nameholder});
});
app.get('/round', function(req,res){
	roundIt(input);
	res.render("results",{obj: input, user:nameholder});
});


app.post('/home', function(req,res){
	input = req.body;
	input.amount = parseFloat(input.amount);
	console.log('User input: ', input);
	if(input.amount){ // Check if input amount is number
		calculate(input);
		res.render('results',{obj: input,user:nameholder});
	}
	else res.render('error');	
});



app.listen(PORT, () => console.log('App is running on Port ', PORT));