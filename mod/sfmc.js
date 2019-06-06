var wsdlParser = require("wsdlrdr");
var post_request = require('./post_request');
var security = require('./security');
var soap = require('./soap');
var salesforce_auth = {
	token: null,
	expires: null
};


module.exports = {
	get_salesforce_token(){
		return new Promise((resolve, reject) => {
			if(!salesforce_auth.token || ((new Date()).getTime() - salesforce_auth.expires) >= 0){
				post_request({
					url: 'https://' + process.env.server_domain + '.auth.marketingcloudapis.com/v2/token',
					body: {
						'grant_type': 'client_credentials',
						'client_id': process.env.client_id,
						'client_secret': process.env.client_secret
					},
					headers: {
						'Content-Type': 'application/json'
					}
				})
				.then(r => {
						try{
							r = JSON.parse(r);
							salesforce_auth.token = r.access_token;
							salesforce_auth.expires = (new Date().getTime()) + (r.expires_in * 1000);
							resolve(r.access_token);
						}catch(err){
							console.log(err);
							reject(err);
						}
					});
			}else{
				resolve(salesforce_auth.token);
			}
		});
	},
	rest_request(c){
		console.log('https://' + process.env.server_domain + '.rest.marketingcloudapis.com' + c.url, c.body);
		return new Promise((resolve, reject) => {
			module.exports.get_salesforce_token()
			.then(token => post_request({
				url: 'https://' + process.env.server_domain + '.rest.marketingcloudapis.com' + c.url,
				body: c.body,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token
				}
			}))
			.then(r => {
				console.log('rest request result: ', r);
				try{
					r = JSON.parse(r);
					resolve(r instanceof Array == true);
				}catch(err){
					resolve(false);
				}
			}).catch(err => {
				console.error('rest request error: ', err);
			});
		});
	},
	log(c){
		return module.exports.rest_request({
			url: '/hub/v1/dataevents/key:' + process.env.log_DE + '/rowset',
			body: [{
				keys: {
					date: (new Date).toLocaleString()
				},
				values: {
					error: c.error,
					data: c.data
				}
			}]
		});
	}
};
