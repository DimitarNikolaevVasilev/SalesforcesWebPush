
	'use strict';
	var connection = new Postmonger.Session();
	var payload = {};
	var lastStepEnabled = false;
	var steps = [ 
		{ "label": "Defina su mensaje", "key": "step1" }
	];
	var currentStep = steps[0].key;
	var heroku_url = "https://webpushnodejstest.herokuapp.com";
	var custom_param_reg = /\%\%([a-zA-Z_]+) *\(((?: *"[a-zA-Z0-9_,' ]+", *)*(?:"[a-zA-Z0-9_,' ]+" *))\)\%\%/g;


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
			data: JSON.stringify({"id": id}),
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


	function gui_set_click_action(action){
		var tab, text;
		switch(action){
			case 'open_url':
				tab = 1;
				text = 'Abrir enlace';
			break;
			case '':
				tab = -1;
				text = 'No hacer nada';
			break;
		}

		var menu_text = $('#menu_text_onclick');

		menu_text.text(text);
		menu_text.attr('data-click_action', action);
		$('.slds-tabs_scoped__content').hide();
		if(tab != -1)$('#onclick_tab_index' + tab).show();
	}

	function make_args(d){
		var arg = d.split('",');
		for(let i = 0;i < arg.length;i++){
			arg[i] = arg[i].trim();
			arg[i] = (i != arg.length - 1 ? arg[i].slice(1) : arg[i].slice(1, arg[i].length - 1));
		}
		return arg;
	}
	function lookup_custom_functions(data){
		var match, f;
		match = custom_param_reg.exec(data);
		
		while(match != null){
			var args = make_args(match[2]);
			if(match[1] == 'get'){
				if(args.length == 2){
					f = sf_attr(args[0], args[1]);
				}else if(args.length == 5){
					f = `%%${match[1]}("${args[1]}","${args[2]}","${args[4]}","${sf_attr(args[0], args[3])}")%%`;
				}else{
					f = match[0];
				}
				data = data.replace(match[0], f);
			}
			match = custom_param_reg.exec(data);
		}
		return data;
	}

	function sf_attr(de, attr){
		return `{{Contact.Attribute.${de}.${attr}}}`;
	}

	function message_preview(){
		var message = $('#message').val();
		var container = $('#message_preview');

		container.html('');
		custom_param_reg.lastIndex = 0;
		var lastIndex, index;


		function create_font(d){
			return $(`<font>${d}</font>`);
		}
		function create_div(full, prop, css_class_popup, css_class){
			full = full.substring(2, full.length - 2);
			return $(`
				<div class="de_custom_prop ${css_class || ''}" onmouseover="show_popup({data:'${encodeURIComponent(full)}', class:'${css_class_popup}'})" onmouseout="hide_popup()">
					<div class="de_custom_prop_data">${prop}</div>
				</div>`);
		}


		do{
			lastIndex = custom_param_reg.lastIndex;
			var match = custom_param_reg.exec(message);
			index = match ? match.index : message.length;

			container.append(create_font(message.substring(lastIndex, index)));
			
			if(!match || match[1] != 'get')continue;
			var args = make_args(match[2]);
			
			if(args.length == 2){
				container.append(create_div(match[0], args[1], 'de_custom_prop_popup'));
			}else{
				container.append(create_div(match[0], args[2], 'de_custom_prop_comp_popup', 'de_custom_prop_comp'));
			}
		}while(match != null);
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
				gui_set_click_action(onclick.action);
				if(onclick.action == 'open_url'){
					$('#url').val(onclick.url);
				}
			}catch(err){}
		}

		if(d.icon){
			var preview = $('#image_preview');
			$('#loading_image').show();
			$('#error_image').hide();
			preview.attr('src', d.icon);
			preview.css('display', 'block');
			$('#icon_link').val(d.icon);
			$('#image_size').css('display','none');
		}

		$('#message').keyup(function(){
			var b = $('#message_preview_button');
			custom_param_reg.lastIndex = 0;
			if(custom_param_reg.exec(this.value) != null){
				b.show();
			}else{
				b.hide();
			}
		});
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
		if($('#error_div').html().length)return connection.trigger('ready');
		var title = $('#title').val();
		var message = $('#message').val();
		var icon = $('#icon_link').val();
		var onclick = {
			action: $('#menu_text_onclick').attr('data-click_action')
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



