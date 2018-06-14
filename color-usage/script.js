
function checkCode(code) { // String css => Object colors
	var parsed = Helpers.parse(code);
	var selectors = getSelectorsOnly(parsed);
	selectors = filterRulesWithColors(selectors);
	return colorsUsage(selectors);
}

function getSelectorsOnly(arr) {
	let result = [];
	arr.forEach(el => {
		if(el.type === 'selector'){
			result = result.concat(el)
		} else if(el.type === 'media'){
			result = result.concat(getSelectorsOnly(el.value));
		}
	});
	return result;
}
function filterRulesWithColors(arr) {
	let result = [];
	arr.forEach(el => {
		let wColors = el.value.filter(el => el.indexOf('#') !== -1);
		if(wColors.length){
			result.push({
				path: el.name,
				prop: wColors,
			});
		}
	});
	return result;
}
function colorsUsage(arr) {
	let result = {};
	arr.forEach(sel => {
		sel.prop.forEach(el => {
			let prop = el.split(':')[0].trim();
			while(el.indexOf('#') !== -1){
				let clr = clrFromProp(el);
				el = el.replace(clr, '');
				if(result[clr]){
					result[clr].uses.push({
						path: sel.path,
						prop,
					});
					continue;
				}

				let rgb = c.hexToRgb(clr);
				if(!rgb){
					console.log('Error parsing to RGB: ', clr); continue;
				}
				let hsl = c.rgbToHsl(rgb);
				if(!rgb){
					console.log('Error parsing to HSL: ', clr); continue;
				}

				result[clr] = {
					value: clr,
					rgb,
					hsl,
					uses: [
						{
							path: sel.path,
							prop: prop,
						}
					]
				};
			}
		});
	});
	return result;
}
function clrFromProp(str) {
	let clr = str.substr(str.indexOf('#'));
	let pos = [ clr.indexOf(' '), clr.indexOf(';') ].filter(el => el !== -1);
	if(pos.length){
		clr = clr.substr(0, Math.min.apply(null, pos));
	}
	return clr;
}

function sortedColors() {
	let arr = Object.keys(parsedColors).map(el => parsedColors[el]);
	switch (sortingType) {
		case 'type1':
			arr = sorting.type1(arr);
			break;
		case 'type2':
			arr = sorting.type2(arr);
			break;
		case 'type3':
			arr = sorting.type3(arr);
			break;
		case 'type4':
			arr = sorting.type4(arr);
			break;
	
		default:
			arr = sorting.byCount(arr);
			break;
	}
	return arr;
}
function renderColors() {
	let html = '';
	sortedColors().forEach(el => {
		html += `<div class="item" tabindex="0" data-value="${el.value}" style="background: ${el.value};">
			${el.value} (${el.uses.length})
		</div>`;
	});
	document.getElementById('colors').innerHTML = html;
	document.getElementById('c-count').innerHTML = Object.keys(parsedColors).length;
}


let sorting = {
	type1: (arr) => {
		const blackTreshold = 20;
		arr.sort((a, b) => a.hsl[0] - b.hsl[0]);
		
		let otherArr = arr.filter(c => c.hsl[1] > blackTreshold);
		let blackArr = arr.filter(c => c.hsl[1] < blackTreshold);
		blackArr.sort((a, b) => a.hsl[2] - b.hsl[2]);
		blackArr.forEach(el=> {
			if(el.hsl[2] < 33) { el.dark = true; }
		});
		blackArr.sort((a, b) => a.hsl[2] - b.hsl[2]);

		arr = blackArr.concat(otherArr);

		return arr;
	},
	type2: (arr) => {
		return arr.sort((n1,n2) => {
			return (0.33*n1.rgb[0] + 0.5*n1.rgb[1] + 0.16*n1.rgb[2]) - (0.33*n2.rgb[0] + 0.5*n2.rgb[1] + 0.16*n2.rgb[2]);
		});
	},
	type3: (arr) =>{
		return arr.sort((n1,n2) =>{
			return (0.2126*n1.rgb[0] + 0.7152*n1.rgb[1] + 0.0722*n1.rgb[2]) - (0.2126*n2.rgb[0] + 0.7152*n2.rgb[1] + 0.0722*n2.rgb[2]);
		});
	},
	type4: (arr) => {
		return arr.sort((n1,n2) => {
			return (0.299*n1.rgb[0] + 0.587*n1.rgb[1] + 0.114*n1.rgb[2]) - (0.299*n2.rgb[0] + 0.587*n2.rgb[1] + 0.114*n2.rgb[2]);
		});
	},
	byCount: (arr) => {
		return arr.sort((n1,n2) => n2.uses.length - n1.uses.length);
	},
};


let sortingType = 'type1';
let parsedColors = checkCode(document.getElementById('css').value);

function activeClass(el) {
	document.querySelector('#sorting .active').className = '';
	el.className = 'active';
}
document.getElementById('sorting-1').addEventListener('click', function() {
	sortingType = 'type1';
	activeClass(this);
	renderColors();
});
document.getElementById('sorting-2').addEventListener('click', function() {
	sortingType = 'type2';
	activeClass(this);
	renderColors();
});
document.getElementById('sorting-3').addEventListener('click', function() {
	sortingType = 'type3';
	activeClass(this);
	renderColors();
});
document.getElementById('sorting-4').addEventListener('click', function() {
	sortingType = 'type4';
	activeClass(this);
	renderColors();
});
document.getElementById('sorting-count').addEventListener('click', function() {
	sortingType = 'type-count';
	activeClass(this);
	renderColors();
});

document.getElementById('action').addEventListener('click', function() {
	document.getElementById('sorting').style.display = 'block';
	renderColors();
});
document.getElementById('css').addEventListener('change', function() {
	parsedColors = checkCode(document.getElementById('css').value);
});


document.getElementById('colors').addEventListener('click', function(e) {
	if(e.target.className === 'item'){
		let clr = parsedColors[e.target.getAttribute('data-value')];
		console.log(clr);
		let props = {};
		let selectors = [];
		clr.uses.forEach(el => {
			if(props[el.prop]){
				props[el.prop]++;
			} else {
				props[el.prop] = 1;
			}
			selectors = selectors.concat(el.path);
		});
		let selestors2 = {};
		selectors.forEach(el => { selestors2[el] = 1; });
		popupOpen({
			hex: clr.value,
			rgb: clr.rgb,
			props: Object.keys(props).map(el => [el, props[el]]).sort((a,b) => b[1] - a[1]),
			sels: Object.keys(selestors2),
		})
	}
});
document.getElementById('popup-details').addEventListener('click', function(e) {
	if(e.target === e.currentTarget || e.target.className === 'close'){
		popupClose();
	}
});
function popupOpen(data) {
	let html = `<div class="color-popup">
		<button class="close"></button>
		<div class="color">
			<i style="background:${data.hex};"></i>
			${data.hex}&nbsp;&nbsp;&nbsp;rgb(${data.rgb.join(', ')})
		</div>
		<div class="line">As property:
			<div class="list">${data.props.map(r => `<div>${r[0]} (${r[1]})</div>`).join('')}</div>
		</div>
		<div class="line">In selectors (${data.sels.length}):
			<div class="list">${data.sels.map(s => `<div>${s}</div>`).join('')}</div>
		</div>
	</div>`;
	document.getElementById('popup-details').innerHTML = html;
	document.getElementById('popup-details').className = 'opened';
	document.body.classList.add('popup-opened');
}
function popupClose() {
	document.body.classList.remove('popup-opened');
	document.getElementById('popup-details').className = '';
}
