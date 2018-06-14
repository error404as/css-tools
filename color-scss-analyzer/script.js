function fcolor(name, arr) {
	let result = arr.filter(el => el.name === name);
	if(result.length && (result[0].rgb || result[0].value.indexOf('#') === 0)){
		return result[0].rgb ? result[0].rgb : hexToRgb(result[0].value);
	}
	return null;
}
function resolveUnresolved(colors) {
	// simple assignments e.g.  $gray: $red;
	colors.forEach(function(c,i,a) {
		if(!c.rgb){
			a[i].rgb = fcolor(c.value, a);
		}
	});
	// +/- operators e.g.  $gray: $red - 100;
	colors.forEach(function(c,i,a) {
		if(!c.rgb){
			if(c.value.indexOf(' - ') !== -1 || c.value.indexOf(' + ') !== -1){
				let parts = c.value.split(' ').map(el => el.trim()).filter(el => el);
				let partsValue = null;
				for(let i = 0, len = parts.length; i < len; i++){
					if(parts[i].indexOf('$') === 0){
						partsValue = fcolor(parts[i], a);
						if(!partsValue) return
					} else if(parts[i] === '-' && !isNaN(parts[i+1])){
						partsValue = partsValue.map(el => el - Number(parts[i+1]));
						i++;
					} else if(parts[i] === '+' && !isNaN(parts[i+1])){
						partsValue = partsValue.map(el => el + Number(parts[i+1]));
						i++;
					}
				}
				a[i].rgb = partsValue;
			}
		}
	});
	return colors;
}

function hexToRgb(hex) {
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16)
	] : null;
}


function parseSCSS(raw) {
	var colors = raw.split('\n').filter((i) => i.indexOf('$') === 0);
	// normal hex values
	colors.forEach(function(c,i,a) {
		var name = c.split(':')[0].trim();
		var value = c.split(':')[1].split(';')[0].trim();
		a[i] = {
			name,
			value,
			rgb: value.indexOf('#') === 0 ? hexToRgb(value) : null
		};
	});

	// iterations to resolve math/assignments
	for(let i = 0; i < 5; i++){
		console.log(i+1 + ' - Not resolved: '+colors.filter(el => !el.rgb).length)
		colors = resolveUnresolved(colors);
		if(!colors.filter(el => !el.rgb).length){
			console.log('Resolved in '+(i+1)+' iterations!');
			break;
		}
	}
	if(colors.filter(el => !el.rgb).length){
		console.log('Some colors are not resolved:');
		console.log(colors.filter(el => !el.rgb));
	}

	colors.forEach(function(c,i,a) {
		a[i].rgb = rgbNormalize(c.rgb);
	});

	return colors;
}

function rgbNormalize(arr) {
	if(!Array.isArray(arr)){ return arr; }
	return arr.map(el => {
		if(el > 255) { return 255; }
		if(el < 0) { return 0; }
		return el;
	})
}

function applyCompare(val) {
	val = hexToRgb(val);
	if(val){
		document.getElementById('result').setAttribute('style', 'background: rgb('+val.join(',')+');');
	} else {
		document.getElementById('result').setAttribute('style', '');
	}
}
function cancelCompare() {
	document.getElementById('compare').value = '';
	document.getElementById('result').setAttribute('style', '');
}

function renderColors() {
	let colors = parseSCSS( document.getElementById('colors').value );
	document.getElementById('result').innerHTML = colors.map(el => {
		if(el.rgb) {
			return `<div class="box" style="background: rgb(${el.rgb.join(',')});">
				<div class="info">
					<span>${el.name}:</span> <span>${el.value}</span><br>
					<span>rgb(${el.rgb.join(', ')})</span>
				</div>
			</div>`
		} else {
			return `<div class="box error">
				<div class="info">
					<span>Error parsing value for:</span><br>
					<span>${el.name}: ${el.value}</span>
				</div>
			</div>`
		}
	}).join('');	
}

renderColors();
document.getElementById('btn_show').addEventListener('click', function() {
	renderColors();
});
document.getElementById('compare_do').addEventListener('click', function() {
	applyCompare( document.getElementById('compare').value.trim() );
});
document.getElementById('compare').addEventListener('keydown', function(e) {
	if(e.keyCode === 13){
		applyCompare( e.target.value.trim() );
	}
});
document.getElementById('compare_cancel').addEventListener('click', function() {
	cancelCompare();
});





