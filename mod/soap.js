const fs = require('fs');
const post = require('./post_request');

var soap = {};
['get_value'].forEach(d => {
	soap[d] = String(fs.readFileSync('./soap/' + d + '.xml'));
});
module.exports = {
	data: soap,
	post_request(body){
		return post({
			url: "https://" + process.env.server_domain + ".soap.marketingcloudapis.com/Service.asmx",
			body: body,
			headers: {
				"Content-Type": "text/xml"
			}
		});
	}
};