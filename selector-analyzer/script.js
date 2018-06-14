
function checkCode(code) {
	var parsed = Helpers.parse(code);
	var selectors = getSelectorsOnly(parsed);
	var popular = getPopularSelectors(selectors);

	var maxSpace = 0;
	var maxSpaceEl = [];
	var maxCompx = 0;
	var maxCompxEl = [];
	selectors.forEach(el => {
		let len = el.split(' ').length;
		if(len > maxSpace){
			maxSpace = len;
			maxSpaceEl = [ el ];
		} else if(len === maxSpace){
			maxSpaceEl.push(el);
		}

		let compx = Helpers.predictCompexity(el);
		if(compx > maxCompx){
			maxCompx = compx;
			maxCompxEl = [ el ];
		} else if(compx === maxCompx){
			maxCompxEl.push(el);
		}
	});

	let details = [];
	details.push('<strong>Rules in CSS:</strong> ' + selectors.length);
	details.push('<strong>Max selector length:</strong> ' + maxSpace + '<br>' + maxSpaceEl.join('<br>'));
	details.push('<strong>Potentially most complex:</strong><br> ' + maxCompxEl.join('<br>'));
	document.querySelector('.result-info').innerHTML = details.map(el => `<p>${el}</p>`).join('');

	document.getElementById('sel-all').value = selectors.join('\n');
	document.getElementById('sel-popular').value = popular.map(el => el[0]+': '+el[1]).join('\n');

	document.querySelector('.results').className = 'results';
}


function getSelectorsOnly(arr) {
	let result = [];
	arr.forEach(el => {
		if(el.type === 'selector'){
			result = result.concat(el.name)
		} else if(el.type === 'media'){
			result = result.concat(getSelectorsOnly(el.value));
		}
	});
	return result;
}
function getPopularSelectors(arr) {
	let obj = {};
	arr.forEach(el => {
		let parts = el.split(' ');
		parts.forEach(el => {
			if(obj[el]){
				obj[el]++;
			} else {
				obj[el] = 1;
			}
		});
	});
	let result = [];
	for(let itm in obj){
		result.push( [itm, obj[itm]] );
	}
	result.sort((a,b) => b[1] - a[1]);
	return result;
}

document.getElementById('action').addEventListener('click', function() {
	checkCode(document.getElementById('css').value);
});

