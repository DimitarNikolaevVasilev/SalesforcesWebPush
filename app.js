console.log("Loading...");

//require('./mod/check_env')();

const security = require('./mod/security');
const post = require('./mod/post_request');
var parse_data_ext = require('./mod/parse_data_ext');
var sfmc = require('./mod/sfmc')
var port = process.env.PORT || 3000;

var app = require('./mod/server');

app.post(/(publish|validate|save)/, security.check_token, (req, res) => {
	res.status(200).end();
});

app.post('/execute', security.check_token, (req,res) => {
	console.log('EXECTURE BODY: ', req.rawBody, req.body);
	var datos = req.body.inArguments[0];
	var keys = Object.keys(datos);
	var c = 0;
	function parse(){
		parse_data_ext(datos[keys[c]]).then(r => {
			datos[keys[c]] = r;
			if(c == keys.length - 1){
				res.status(200).end();
				return console.log('FINAL DATA: ', datos);
			}
			c++;
			parse();
		}).catch(err => {
			sfmc.log(err.error && err.data ? err : {error: JSON.stringify(err)});
			res.status(200).end();
			console.log('PARSE ERROR' + JSON.stringify(err));
		});
	}
	parse();
});


app.post('/short', (req, res) => {
	var long_url = req.body.long_url;
	console.log(long_url);
	post({
		url: process.env.bitly_url,
		body: {
			user: process.env.bityl_user,
			longUrl: long_url
		},
		headers: {
			'Authorization': 'Basic ' + process.env.bitly_auth,
			'Content-Type': 'application/json'
		}
	}).then((body, response) => {
		var data = JSON.parse(body);
		console.log(data);
		res.json({url: data.data.url});
	}).catch(err => {
		console.log(err);
		res.json({error: err.message});
	});
});

app.post('/send_message', (req, res) => {
	var data = req.body;
	post({
		url: 'https://rest.nexmo.com/sms/json',
		body: {
			api_key: process.env.nexmo_api_key,
			api_secret: process.env.nexmo_secret,
			to: data.to,
			from: 'Minsait',
			text: data.message
		},
		headers: {
			'Content-Type': 'application/json'
		}
	}).then((body, response) => {
/*{
    "message-count": "1",
    "messages": [{
        "to": "",
        "message-id": "140000002AE2CFB3",
        "status": "0",
        "remaining-balance": "1.03220000",
        "message-price": "0.06890000",
        "network": "21401"
    }]
}*/

		console.log(body);
		console.log(response);
		res.end(JSON.stringify({success: true}));
	}).catch(err => {
		console.log(err);
		res.end(JSON.stringify({error: err.message}));
	})
});



var server = app.listen(port, () => {
	console.log('Server is listening on port ', port);
});