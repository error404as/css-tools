
function fixPoint(arr){
	if(!document.getElementById('tofix').checked){
		return arr;
	}
	if(typeof arr === 'number'){
		return _fixPoint(arr);
	} else if( typeof arr === 'object'){
		return arr.map(function(n){ return _fixPoint(n); });
	}
	return arr;
}
function _fixPoint(n){
	var str = String(n);
	if(str.indexOf('.') !== -1){
		if(str.length - str.indexOf('.') > 4){
			return n.toFixed(3);
		}
	}
	return n;
}




[].forEach.call(document.querySelectorAll('.from input, .to input'), el => {
	el.addEventListener('focus', (e) => {
		e.target.select();
	});
});




document.querySelector('.b-hex2rgb-line .action').addEventListener('click', (e) => {
	var $p = document.querySelector('.b-hex2rgb-line'),
		color = $p.querySelector('.hex').value,
		rgb = c.hexToRgb(color);
	$p.querySelector('.rgb_line').value = rgb.join(',');
});
document.querySelector('.b-hex2cmyk-line .action').addEventListener('click', (e) => {
	var $p = document.querySelector('.b-hex2cmyk-line'),
		color = $p.querySelector('.hex').value,
		cmyk = c.hexToCMYK(color);
	$p.querySelector('.cmyk_line').value = cmyk.join(',');
});
document.querySelector('.b-rgb2hex-line .action').addEventListener('click', (e) => {
	var $p = document.querySelector('.b-rgb2hex-line'),
		val = $p.querySelector('.rgb_line').value.replace(/\s/g, '').split(',').map(function(itm){ return Number(itm) }),
		r = val[0],
		g = val[1],
		b = val[2];
	$p.querySelector('.hex').value = c.rgbToHex(r, g, b);
});
document.querySelector('.b-rgb2cmyk-line .action').addEventListener('click', (e) => {
	var $p = document.querySelector('.b-rgb2cmyk-line'),
		val = $p.querySelector('.rgb_line').value.replace(/\s/g, '').split(',').map(function(itm){ return Number(itm) }),
		r = val[0],
		g = val[1],
		b = val[2];
	$p.querySelector('.cmyk_line').value = c.rgbToCMYK(r, g, b).join(',');
});
document.querySelector('.b-rgb2hsv-line .action').addEventListener('click', (e) => {
	var $p = document.querySelector('.b-rgb2hsv-line'),
		val = $p.querySelector('.rgb_line').value.replace(/\s/g, '').split(',').map(function(itm){ return Number(itm) }),
		r = val[0],
		g = val[1],
		b = val[2];
	$p.querySelector('.hsv_line').value = c.rgbToHsv(r, g, b).join(',');
});




[].forEach.call(document.querySelectorAll('.clr-comparing .clr input'), el => {
	el.addEventListener('focus', (e) => {
		e.target.select();
	});
	el.addEventListener('input', (e) => {
		var val = e.target.value.replace(/\s*/g, '').replace('#','');

		if(val.indexOf('+') > 0){
			// plus func
			var _val = Number( val.substring(val.indexOf('+')+1) );
			if(isNaN(_val)){ this.className = 'error'; return; }
			val = val.substring(0, val.indexOf('+'));
			val = c.hexToRgb(val).map(function(n){ return (n + _val) > 255 ? 255 : (n + _val) });
			val = c.rgbToHex(val[0],val[1],val[2]).replace('#','');

		} else if(val.indexOf('-') > 0){
			// minus func
			var _val = Number( val.substring(val.indexOf('-')+1) );
			if(isNaN(_val)){ this.className = 'error'; return; }
			val = val.substring(0, val.indexOf('-'));
			val = c.hexToRgb(val).map(function(n){ return (n - _val) < 0 ? 0 : (n - _val); });
			val = c.rgbToHex(val[0],val[1],val[2]).replace('#','');

		}
		if(!c.hexToRgb(val)){ this.className = 'error'; return; } else { this.className = ''; }
		var $p = e.target.parentElement;
		$p.style.background = '#'+val;
		$p.querySelector('.hex').innerHTML = '#'+val;
		$p.querySelector('.rgb').innerHTML = c.hexToRgb(val).join(',');
	});
});



// http://jscolor.com/
[].forEach.call(document.querySelectorAll('.from'), el => {
	el.querySelector('input').addEventListener('keyup', (e) => {
		colorSpan(el);
	});
	colorSpan(el);
});
function colorSpan(el) {
	if(el.querySelector('.rgb_r')){
		var r = el.querySelector('.rgb_r').value*1,
			g = el.querySelector('.rgb_g').value*1,
			b = el.querySelector('.rgb_b').value*1;
		el.querySelector('.color').style.background = 'rgb('+r+','+g+','+b+')';
	} else if(el.querySelector('.rgb_line')){
		el.querySelector('.color').style.background = 'rgb('+el.querySelector('.rgb_line').value+')';
	} else {
		el.querySelector('.color').style.background = '#'+el.querySelector('input').value.replace('#','');
	}
}
[].forEach.call(document.querySelectorAll('#b-rgb2hex, #b-rgb2cmyk, #b-rgb2hsv'), el => {
	let val = el.value.split(',').map(el => Number(el));
	document.getElementById(el.id + '-h').value = c.rgbToHex(val[0],val[1],val[2]);
});
[].forEach.call(document.querySelectorAll('#b-rgb2hex-h, #b-rgb2cmyk-h, #b-rgb2hsv-h'), el => {
	el.addEventListener('change', (e) => {
		document.getElementById(el.id.replace('-h', '')).value = c.hexToRgb(e.target.value).join(',');
	});
});

