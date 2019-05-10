(function(){
	'use strict';
	var connection = new Postmonger.Session();
	var payload = {};
	var lastStepEnabled = false;
	var steps = [ 
		{ "label": "Defina su mensaje", "key": "step1" }
	];
	var currentStep = steps[0].key;
	var heroku_url = "https://webpushnodejstest.herokuapp.com";


	$(window).ready(onRender);

	connection.on('initActivity', initialize);

	connection.on('clickedNext', onClickedNext);
	connection.on('clickedBack', onClickedBack);
	connection.on('gotoStep', onGotoStep);

	function onRender() {
		connection.trigger('ready');
		connection.trigger('requestTokens');
		connection.trigger('requestEndpoints');
	}


	function generate_id(payload, callback){
		var id = ( Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(3, 10)).slice(0,20);
		$.ajax({
			type: 'POST',
			url: heroku_url + "/message_exists",
			data: `{"id": "${id}"}`,
			dataType: 'json',
			contentType: 'application/json',
			success: function(r){
				if(r.exists)return generate_id(payload);
				payload['metaData'].data.message_id = id;
				payload.configurationArguments.save.url = heroku_url + "/save?" + Object.entries(payload['metaData'].data).map(e => e.join('=')).join('&');
				callback();
			}
		}).fail((err) => {
			console.error(err);
		});
	}


	function initialize (data) {
		console.log('initialize', data);

		if (data) payload = data;


		var title, message, icon, onclick = false;
		var hasInArguments = Boolean(
			payload['arguments'] &&
			payload['arguments'].execute &&
			payload['arguments'].execute.inArguments &&
			payload['arguments'].execute.inArguments.length > 0
		);

		var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};
		var d = payload['metaData'].data;


		$('#title').val(d.title);
		$('#message').val(d.message);
		if(d.onclick){
			try{
				var onclick = JSON.parse(d.onclick);
				$('#click_event').val(onclick.action);
				if(onclick.action == 'open_url'){
					$('#url').val(onclick.url);
				}
			}catch(err){}
		}

		if(d.icon){
			var preview = $('#image_preview');
			preview.attr('src', d.icon);
			preview.css('display', 'block');
			$('#icon_link').val(d.icon);
			$('#image_size').css('display','none');
		}
	}

	function onClickedNext () {
		save();
	}

	function onClickedBack () {
		console.log('clickedBack');
		connection.trigger('prevStep');
	}

	function onGotoStep (step) {
		connection.trigger('ready');
	}


	function save() {
		var title = $('#title').val();
		var message = $('#message').val();
		var icon = $('#icon_link').val();
		var onclick = {
			action: $('#click_event').val()
		}

		if(onclick.action == 'open_url'){
			onclick.url = $('#url').val();
		}

		payload.name = name;

		payload['metaData'].data = {
			"onclick": JSON.stringify(onclick),
			"title": title,
			"message": message,
			"icon": icon
		};

		generate_id(payload, function(){
			payload['arguments'].execute.inArguments = [{
				"message_id": payload['metaData'].data.message_id,
				"contact_key": "{{Contact.Key}}",
				"endpoint": "{{Contact.Attribute.webpush_subscriptions.endpoint}}",
				"p256dh": "{{Contact.Attribute.webpush_subscriptions.p256dh}}",
				"auth": "{{Contact.Attribute.webpush_subscriptions.auth}}"
			}];
			payload['metaData'].isConfigured = true;
			connection.trigger('updateActivity', payload);
		});
	}

})();



