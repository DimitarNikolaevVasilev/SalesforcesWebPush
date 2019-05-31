function show_popup(c){
	var popup = $('#popup');
	if(!c.html){
		c.data = decodeURIComponent(c.data);
		popup.text(c.data);
	}else{
		popup.html(c.data);
	}

	if(c.class){
		popup.attr('class', c.class);
	}else{
		popup.attr('class', '');
	}

	popup.attr('data-hide_mouseup', c.hide_on_mouseout || '');
	popup.attr('data-hide_effect', c.effect || '');
	popup.css({display: 'block', left: 0, opacity: 0});
	movePopup();
	popup.attr('data-disable_movement', c.disable_movement || '');

	if(!c.effect){
		popup.css({opacity: 1});
	}else{
		popup.animate({opacity: 1});
	}
}
function hide_popup(){
	$('#popup').css('display', 'none');
}

(function(){
var popup = $('#popup');
popup.on('mouseleave', function(){
	if(popup.attr('data-hide_mouseup') == 'true'){
		if(0 && popup.attr('data-hide_effect') == 'true'){
			/*popup.animate({opacity: 0}, function(){
				popup.css({display: 'none'});
			}); */
		}else{
			popup.css({display: 'none'});
		}
	}
});


function cancel(e){
	e.stopPropagation();
	e.preventDefault();
}

function preview_image(image){
	image_loading.show();
	image_error.hide();
	preview.display = 'block';
	preview.setAttribute('src', image);
	preview.style.display = 'block';
	image_size_font.style.display = 'none';
}


var icon_link = document.getElementById('icon_link');
var input = document.getElementById('icon');
var preview = document.getElementById('image_preview');
var image_size_font = document.getElementById('image_size');
var error_div = document.getElementById('error_div');
var image_loading = $('#loading_image');
var image_error = $('#error_image');


$('#onclick_button').click(function(){
	$('#drop_down_onclick').toggle();
});
$('#message').keyup(function(){
	$('#message_rest_space').text(this.value.length + " carácteres");
	
});

$('.onclick_option').click(function(){
	var span = $(this).find('span');
	var menu_text = $('#menu_text_onclick');
	$('#drop_down_onclick').hide();
	menu_text.text(span.text());
	menu_text.attr('data-click_action', span.attr('data-click_action'));


	$('.slds-tabs_scoped__content').hide();
	var tab = $(this).attr('tabindex');
	if(tab != '-1')$('#onclick_tab_index' + tab).show();
});



$('#message_preview_button').click(function(){
	$('#message_preview').css('height', parseFloat($('#message').css('height'))).toggleClass('message_preview_show');
	this.innerHTML = (this.innerHTML == 'Vista previa' ?  'Ocultar vista previa' : 'Vista previa');
	$('#message').toggleClass('hide_message');
	message_preview();
});



preview.onload = function(){
	image_loading.hide();
}
preview.onerror = function(){
	image_loading.hide();
	image_error.show();
	preview.style.display = 'none';
}

icon_link.addEventListener('change', e => {
	var link = icon_link.value;
	error_div.innerHTML = '';
	if(link.match(/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/) != null){
		if(link.split(':')[0] != 'https'){
		    return error_div.innerHTML = 'El enlace de la imagen debe de ser HTTPS';	
		}
		preview_image(link);
	}else{
		preview.style.display = 'none';
		image_size_font.style.display = 'block';
	}
});

input.addEventListener('change', e => {
	preview_image();
});




$(document).ready(function(){
	var xMousePos = 0;
	var yMousePos = 0;
	var lastScrolledLeft = 0;
	var lastScrolledTop = 0;

	$(document).mousemove(function(event) {
		xMousePos = event.pageX;
		yMousePos = event.pageY;
		movePopup();
	})  

	$(window).scroll(function(event) {
		if(lastScrolledLeft != $(document).scrollLeft()){
			xMousePos -= lastScrolledLeft;
			lastScrolledLeft = $(document).scrollLeft();
			xMousePos += lastScrolledLeft;
		}
		if(lastScrolledTop != $(document).scrollTop()){
			yMousePos -= lastScrolledTop;
			lastScrolledTop = $(document).scrollTop();
			yMousePos += lastScrolledTop;
		}
		movePopup();
	});
	window.movePopup = function(){
		var popup = $('#popup');
		if(popup.attr('data-disable_movement') == 'true' && popup.css('opacity') != 0)return;
		var frame = {
			width: $(document).width(),
			height: $(document).height()
		}

		
		var width = parseInt(popup.css('width'));
		var height = parseInt(popup.css('height'));
		var left = xMousePos - width/2;
		var top = yMousePos - height - 10;

		if(xMousePos - lastScrolledLeft - width/2 <= 0){
			left = 0;
		}else if(xMousePos - lastScrolledLeft + width/2 + 2 >= frame.width){
			left = frame.width - width - 2;
		}

		popup.css({
			left: left,
			top: yMousePos - lastScrolledTop - height > 0 ? top : lastScrolledTop
		});
	}
 
});

})();
