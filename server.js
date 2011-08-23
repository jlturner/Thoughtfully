/*
	Thoughtfully App Server
	"A place to store your thoughts on the cloud."

	James Lawrence Turner,
	Last Edit: Aug 23, 2011
*/

/*
	API Documentation:
	
	Methods*:
		login
		signup
		thoughts
		thought
		add
		remove
	
	*all methods use HTTP POST requests
	
	Login:
		action:
			/login
		fields:
			username
			password
		description:
			Validates a username/password pair. Returns result:true/false,
			and an error message, if false.
			
	Signup:
		action:
			/signup
		fields:
			username
			password
			email
		description:
			Creates a new user. Password verification should be done client
			side. Email can be used for password recovery.
			
	Thoughts:
		action:
			/thoughts
		fields:
			username
			password
		description:
			Returns an array of thought ids for the given user. Credentials
			needed to keep all thoughts private.
			
	Thought:
		action:
			/thought
		fields:
			username
			password
			id
		description:
			Gets the details for the provided thought id. User id must validate
			and match the thought id to disallow outside access to thoughts
			
	Add:
		action:
			/add
		fields:
			username
			password
			text
			latitude
			longitude
		description:
			Creates a new thought entry for the user. Auto timestamped by the db.
			
	Remove:
		action:
			/remove
		fields:
			username
			password
			id
		description:
			Deletes the thought at the provided thought id.
*/

// required packages
var express = require("express");
var mysql = mysql = require('mysql');

// mysql vars
var mysqlUser = 'user';
var mysqlPassword = 'password';
var mysqlHost = 'xxxxxx.dotcloud.com';
var mysqlPort = 'xxxxx';
var mysqlDatabase = 'thoughtbank';

//  db tables
var usersTable = 'users';
var photosTable = 'thoughts';

// setup mysql
var sqlClient = mysql.createClient({user:mysqlUser,
password:mysqlPassword, port:mysqlPort, host:mysqlHost});
sqlClient.query('USE ' + mysqlDatabase);

// setup express app
var port = 9000;
var app = express.createServer();
app.configure(function(){
	app.use(express.bodyParser());
});
app.use(express.staticProvider(__dirname + '/public')); 

// API Methods
app.post("/login", function(req, res){
	var username = req.param("username");
	var password = req.param("password");
	
	sqlClient.query('SELECT username, password FROM users WHERE username = "' + username + '"' , function selectCb(err, results, fields)
    {
        if (err)
        {
            console.log("MySQL error: " + err.message);
            throw err;
        }
		else
		{
			if(results.length == 0)
			{
				res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
				res.write('{"action":"login","result":"false","error":"Username incorrect."}');
				res.end();
			}
			else
			{
				if(results[0].password != password)
				{
					res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
					res.write('{"action":"login","result":"false","error":"Password incorrect."}');
					res.end();
				}
				else
				{
					res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
					res.write('{"action":"login","result":"true"}');
					res.end();
				}
			}
		}
	}
});

app.post("/signup", function(req, res){
	
	var username = req.param("username");
	var password = req.param("password");
	var email = req.param("email");
	
	sqlClient.query('SELECT username FROM users WHERE username = "' + username + '"' , function selectCb(err, results, fields)
    {
        if (err)
        {
            console.log("MySQL error: " + err.message);
            throw err;
        }
		else
		{
			if(results.length == 0)
			{
				res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
				res.write('{"action":"signup","result":"false","error":"Username already taken."}');
				res.end();
			}
			else
			{
				sqlClient.query(
				        'INSERT INTO '+ 'users' +
				        ' SET username = ?'+
				        ', password = ?'+
				        ', email = ?',
				        [username,
				         password,
				         email],
				function selectCb(err2, results2, fields2)
				{
					if(err2)
					{
						console.log("MySQL error: " + err2.message);
			            throw err2;
					}
					else
					{
						res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
						res.write('{"action":"signup","result":"true"}');
						res.end();
					}
				}
			}
		}
	}
});

app.post("/thoughts", function(req, res){
	var username = req.param("username");
	var password = req.param("password");
	
	sqlClient.query('SELECT id, username, password FROM users WHERE username = "' + username + '"' , function selectCb(err, results, fields)
    {
        if (err)
        {
            console.log("MySQL error: " + err.message);
            throw err;
        }
		else
		{
			if(results.length == 0)
			{
				res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
				res.write('{"action":"thoughts","result":"false","error":"Username incorrect."}');
				res.end();
			}
			else
			{
				if(results[0].password != password)
				{
					res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
					res.write('{"action":"thoughts","result":"false","error":"Password incorrect."}');
					res.end();
				}
				else
				{
					sqlClient.query('SELECT id FROM thoughts WHERE user_id = "' + results[0].id , function selectCb(err2, results2, fields2)
				    {
				        if (err2)
				        {
				            console.log("MySQL error: " + err2.message);
				            throw err2;
				        }
						else
						{
							var thoughts = [];
							for(r in results2)
							{
								thoughts.push(results2[r].id);
							}
							res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
							res.write('{"action":"thoughts","result":"true","thoughts":' + JSON.stringify(thoughts)+'}');
							res.end();
						}
					}
				}
			}
		}
	}
});

app.post("/thought", function(req, res){
	var username = req.param("username");
	var password = req.param("password");
	var id = req.param("id");
	
	sqlClient.query('SELECT password FROM users WHERE username = "' + username + '"' , function selectCb(err, results, fields)
    {
        if (err)
        {
            console.log("MySQL error: " + err.message);
            throw err;
        }
		else
		{
			if(results.length == 0)
			{
				res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
				res.write('{"action":"thought","result":"false","error":"Username incorrect."}');
				res.end();
			}
			else
			{
				if(results[0].password != password)
				{
					res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
					res.write('{"action":"thought","result":"false","error":"Password incorrect."}');
					res.end();
				}
				else
				{
					sqlClient.query('SELECT * FROM thoughts WHERE id = '+ id , function selectCb(err2, results2, fields2)
				    {
				        if (err2)
				        {
				            console.log("MySQL error: " + err2.message);
				            throw err2;
				        }
						else
						{
							var thought = {};
							thought.id = results2[0].id;
							thought.timestamp = results2[0].timestamp;
							thought.text = results2[0].text;
							thought.latitude = results2[0].latitude;
							thought.longitude = results2[0].longitude;
							res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
							res.write('{"action":"thought","result":"true","thought":' + JSON.stringify(thought)+'}');
							res.end();
						}
					}
				}
			}
		}
	}
});

app.post("/add", function(req, res){
	var text = req.param("text");
	var latitude = req.param("latitude");
	var longitude = req.param("longitude");
	
	var username = req.param("username");
	var password = req.param("password");
	
	sqlClient.query('SELECT id password FROM users WHERE username = "' + username + '"' , function selectCb(err, results, fields)
    {
        if (err)
        {
            console.log("MySQL error: " + err.message);
            throw err;
        }
		else
		{
			if(results.length == 0)
			{
				res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
				res.write('{"action":"add","result":"false","error":"Username incorrect."}');
				res.end();
			}
			else
			{
				if(results[0].password != password)
				{
					res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
					res.write('{"action":"add","result":"false","error":"Password incorrect."}');
					res.end();
				}
				else
				{
					
					sqlClient.query(
					        'INSERT INTO '+ 'thoughts' +
					        ' SET user_id = ?'+
					        ', text = ?'+
							', latitude = ?'+
					        ', longitude = ?',
					        [results[0].id,
							 text,
					         latitude,
					         longitude],
						function selectCb(err2, results2, fields2)
					    {
					        if (err2)
					        {
					            console.log("MySQL error: " + err2.message);
					            throw err2;
					        }
							else
							{
								res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
								res.write('{"action":"add","result":"true"}');
								res.end();
							}
						});

				}
			}
		}
	}
});

app.post("/remove", function(req, res){
	var id = req.param("id");
	var username = req.param("username");
	var password = req.param("password");
	
	sqlClient.query('SELECT id password FROM users WHERE username = "' + username + '"' , function selectCb(err, results, fields)
    {
        if (err)
        {
            console.log("MySQL error: " + err.message);
            throw err;
        }
		else
		{
			if(results.length == 0)
			{
				res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
				res.write('{"action":"remove","result":"false","error":"Username incorrect."}');
				res.end();
			}
			else
			{
				if(results[0].password != password)
				{
					res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
					res.write('{"action":"remove","result":"false","error":"Password incorrect."}');
					res.end();
				}
				else
				{
					sqlClient.query('DELETE FROM thoughts WHERE id = '+ id + ' AND user_id = ' + results[0].id , function selectCb(err2, results2, fields2)
				    {
				        if (err2)
				        {
				            console.log("MySQL error: " + err2.message);
				            throw err2;
				        }
						else
						{
							res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
							res.write('{"action":"remove","result":"true"}');
							res.end();
						}
					}
				}
			}
		}
	}
});

// startup the server
app.listen(port);
console.log("Thoughtfully started on port %s", app.address().port);