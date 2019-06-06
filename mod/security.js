var jwt = require('jsonwebtoken');

module.exports = {
	check_token(req, res, next){
		jwt.verify(req.rawBody, process.env.SH256_KEY, (err, decoded) => {
			if(err){
				res.end('{"error": "incorrect_token"}');
				return console.log(err);
			}
			req.body = decoded;
			next();
		});
	}
}
