/*
	Thoughtfully App Server
	"A place to store your thoughts on the cloud."

	James Lawrence Turner,
	Last Edit: Sep 3, 2011
*/

/*
	See http://thoughtfully-think.dotcloud.com/api.html for API documentation.
*/

// required packages
var express = require("express");
var mysql = mysql = require('mysql');

// mysql vars
var mysqlUser = 'root';
var mysqlPassword = 'FK7cMz3gXp0loE2xJX2R';
var mysqlHost = 'thoughtfully-think.dotcloud.com';
var mysqlPort = '13877';
var mysqlDatabase = 'thoughtbank';

//  db tables
var usersTable = 'users';
var photosTable = 'thoughts';

// setup mysql
var sqlClient = mysql.createClient({user:mysqlUser,
password:mysqlPassword, port:mysqlPort, host:mysqlHost});
sqlClient.query('USE ' + mysqlDatabase);

// setup express app
var port = 8080;
var app = express.createServer();

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


// API Methods
app.post("/login", function(req, res)
{
	if(req.body.username &&
		req.body.password)
	{
		var username = req.body.username;
		var password = req.body.password;
	
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
					res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
					res.write('{"action":"login","result":"false","error":"Username incorrect."}');
					res.end();
				}
				else
				{
					if(results[0].password != password)
					{
						res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
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
		});
	}
	else
	{
		var missingParameters = "";
		if(!req.body.username) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " username";
		if(!req.body.password) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " password";
		res.writeHead(400, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
		res.write('{"action":"login","result":"false","error":"Missing parameters:'+missingParameters+'"}');
		res.end();
	}
});

app.post("/signup", function(req, res)
{
	if(req.body.email &&
		req.body.username &&
		req.body.password)
	{
		var username = req.body.username;
		var password = req.body.password;
		var email = req.body.email;
	
		sqlClient.query('SELECT username FROM users WHERE username = "' + username + '"' , function selectCb(err, results, fields)
	    {
	        if (err)
	        {
	            console.log("MySQL error: " + err.message);
	            throw err;
	        }
			else
			{
				if(results.length != 0)
				{
					res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
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
							res.writeHead(201, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
							res.write('{"action":"signup","result":"true"}');
							res.end();
						}
					});
				}
			}
		});
	}
	else
	{
		var missingParameters = "";
		if(!req.body.username) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " username";
		if(!req.body.password) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " password";
		if(!req.body.email) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " email";
		res.writeHead(400, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
		res.write('{"action":"signup","result":"false","error":"Missing parameters:'+missingParameters+'"}');
		res.end();
	}
});

app.post("/thoughts", function(req, res)
{
	if(req.body.username &&
		req.body.password)
	{
		var username = req.body.username;
		var password = req.body.password;
	
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
					res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
					res.write('{"action":"thoughts","result":"false","error":"Username incorrect."}');
					res.end();
				}
				else
				{
					if(results[0].password != password)
					{
						res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
						res.write('{"action":"thoughts","result":"false","error":"Password incorrect."}');
						res.end();
					}
					else
					{
						sqlClient.query('SELECT id FROM thoughts WHERE user_id = ' + results[0].id , function selectCb(err2, results2, fields2)
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
						});
					}
				}
			}
		});
	}
	else
	{
		var missingParameters = "";
		if(!req.body.username) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " username";
		if(!req.body.password) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " password";
		res.writeHead(400, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
		res.write('{"action":"thoughts","result":"false","error":"Missing parameters:'+missingParameters+'"}');
		res.end();
	}
});

app.post("/fullthoughts", function(req, res)
{
	if(req.body.username &&
		req.body.password)
	{
		var username = req.body.username;
		var password = req.body.password;
	
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
					res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
					res.write('{"action":"thoughts","result":"false","error":"Username incorrect."}');
					res.end();
				}
				else
				{
					if(results[0].password != password)
					{
						res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
						res.write('{"action":"thoughts","result":"false","error":"Password incorrect."}');
						res.end();
					}
					else
					{
						sqlClient.query('SELECT * FROM thoughts WHERE user_id = ' + results[0].id , function selectCb(err2, results2, fields2)
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
									var thought = {};
									thought.id = results2[r].id;
									thought.timestamp = results2[r].timestamp;
									thought.text = results2[r].text;
									thought.latitude = results2[r].latitude;
									thought.longitude = results2[r].longitude;
									thoughts.push(thought);
								}
								res.writeHead(200, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
								res.write('{"action":"fullthoughts","result":"true","thoughts":' + JSON.stringify(thoughts)+'}');
								res.end();
							}
						});
					}
				}
			}
		});
	}
	else
	{
		var missingParameters = "";
		if(!req.body.username) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " username";
		if(!req.body.password) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " password";
		res.writeHead(400, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
		res.write('{"action":"thoughts","result":"false","error":"Missing parameters:'+missingParameters+'"}');
		res.end();
	}
});

app.post("/thought", function(req, res)
{
	if(req.body.id &&
		req.body.username &&
		req.body.password)
	{
		var username = req.body.username;
		var password = req.body.password;
		var id = req.body.id;
	
		sqlClient.query('SELECT id, password FROM users WHERE username = "' + username + '"' , function selectCb(err, results, fields)
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
					res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
					res.write('{"action":"thought","result":"false","error":"Username incorrect."}');
					res.end();
				}
				else
				{
					if(results[0].password != password)
					{
						res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
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
								if(results2.length == 0)
								{
									res.writeHead(404, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
									res.write('{"action":"thought","result":"false","error":"Thought not found."}');
									res.end();
								}
								else
								{
									if(results2[0].user_id != results[0].id)
									{
										res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
										res.write('{"action":"thought","result":"false","error":"Thought does not belong to user '+ username +'."}');
										res.end();
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
						});
					}
				}
			}
		});
	}
	else
	{
		var missingParameters = "";
		if(!req.body.username) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " username";
		if(!req.body.password) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " password";
		if(!req.body.id) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " id";
		res.writeHead(400, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
		res.write('{"action":"thought","result":"false","error":"Missing parameters:'+missingParameters+'"}');
		res.end();
	}
});

app.post("/add", function(req, res)
{
	if(req.body.text &&
		req.body.latitude &&
		req.body.longitude &&
		req.body.username &&
		req.body.password)
	{
		var text = req.body.text;
		var latitude = req.body.latitude;
		var longitude = req.body.longitude;
	
		var username = req.body.username;
		var password = req.body.password;
	
		sqlClient.query('SELECT id, password FROM users WHERE username = "' + username + '"' , function selectCb(err, results, fields)
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
					res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
					res.write('{"action":"add","result":"false","error":"Username incorrect."}');
					res.end();
				}
				else
				{
					if(results[0].password != password)
					{
						res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
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
									res.writeHead(201, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
									res.write('{"action":"add","result":"true"}');
									res.end();
								}
							});

					}
				}
			}
		});
	}
	else
	{
		var missingParameters = "";
		if(!req.body.username) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " username";
		if(!req.body.password) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " password";
		if(!req.body.text) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " text";
		if(!req.body.latitude) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " latitude";
		if(!req.body.longitude) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " longitude";
		res.writeHead(400, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
		res.write('{"action":"add","result":"false","error":"Missing parameters:'+missingParameters+'"}');
		res.end();
	}
});

app.post("/remove", function(req, res)
{
	if(req.body.id &&
		req.body.username &&
		req.body.password)
	{
		var id = req.body.id;
		var username = req.body.username;
		var password = req.body.password;
	
		sqlClient.query('SELECT id, password FROM users WHERE username = "' + username + '"' , function selectCb(err, results, fields)
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
					res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
					res.write('{"action":"remove","result":"false","error":"Username incorrect."}');
					res.end();
				}
				else
				{
					if(results[0].password != password)
					{
						res.writeHead(403, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
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
						});
					}
				}
			}
		});
	}
	else
	{
		var missingParameters = "";
		if(!req.body.username) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " username";
		if(!req.body.password) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " password";
		if(!req.body.id) missingParameters = missingParameters + (missingParameters.length != 0 ? "," : "") + " id";
		res.writeHead(400, {"Content-Type": "application/json",'Access-Control-Allow-Origin' : '*'});
		res.write('{"action":"remove","result":"false","error":"Missing parameters:'+missingParameters+'"}');
		res.end();
	}
});

// startup the server
app.listen(port);
console.log("Thoughtfully started on port %s", app.address().port);