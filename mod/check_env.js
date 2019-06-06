module.exports = function(){
	var missing = false;
	[
		'SH256_KEY',
		'username',
		'password',
		'server_domain',
		'bitly_auth',
		'bitly_url',
		'bityl_user',
		'client_id',
		'client_secret',
		'log_DE'
	].forEach(d => {
		if(!process.env[d]){
			missing = true;
			console.error(d + ' environment variable is missing');
		}
	});
	if(missing)process.exit(1);
}