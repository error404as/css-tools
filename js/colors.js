// http://www.javascripter.net/faq/hextorgb.htm
const c = {
	hexToRgb: function(hex) { // String hex
		try {
			const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});

			let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? [
				parseInt(result[1], 16),
				parseInt(result[2], 16),
				parseInt(result[3], 16)
			] : null;
		} catch(e){
			console.log(e);
			return null;
		}
	},
	rgbToHex: function(r, g, b){
		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	},
	rgbToHsl: function(c){  // Array [r, g, b]
		try {
			let r = c[0]/255;
			let g = c[1]/255;
			let b = c[2]/255;
			let max = Math.max(r, g, b);
			let min = Math.min(r, g, b);
			let h;
			let s;
			let l = (max + min) / 2;

			if(max == min){
				h = s = 0; // achromatic
			} else {
				let d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch(max){
					case r: h = (g - b) / d + (g < b ? 6 : 0); break;
					case g: h = (b - r) / d + 2; break;
					case b: h = (r - g) / d + 4; break;
				}
				h /= 6;
			}
			return new Array(h * 360, s * 100, l * 100);
		} catch (e) {
			console.log(e);
			return null;
		}
	},
	hexToCMYK: function (hex) {
		var computedC = 0;
		var computedM = 0;
		var computedY = 0;
		var computedK = 0;

		hex = (hex.charAt(0)=="#") ? hex.substring(1,7) : hex;

		if (hex.length != 6) {
			alert ('Invalid length of the input hex value!');   
			return; 
		}
		if (/[0-9a-f]{6}/i.test(hex) != true) {
			alert ('Invalid digits in the input hex value!');
			return; 
		}

		var r = parseInt(hex.substring(0,2),16); 
		var g = parseInt(hex.substring(2,4),16); 
		var b = parseInt(hex.substring(4,6),16); 

		// BLACK
		if (r == 0 && g == 0 && b == 0) {
			computedK = 1;
			return [0,0,0,1];
		}

		computedC = 1 - (r/255);
		computedM = 1 - (g/255);
		computedY = 1 - (b/255);

		var minCMY = Math.min(computedC, Math.min(computedM, computedY));

		computedC = (computedC - minCMY) / (1 - minCMY) ;
		computedM = (computedM - minCMY) / (1 - minCMY) ;
		computedY = (computedY - minCMY) / (1 - minCMY) ;
		computedK = minCMY;

		return fixPoint([computedC, computedM, computedY, computedK]);
	},
	rgbToCMYK: function (r,g,b) {
		var computedC = 0;
		var computedM = 0;
		var computedY = 0;
		var computedK = 0;

		//remove spaces from input RGB values, convert to int
		var r = parseInt( (''+r).replace(/\s/g,''),10 ); 
		var g = parseInt( (''+g).replace(/\s/g,''),10 ); 
		var b = parseInt( (''+b).replace(/\s/g,''),10 ); 

		if ( r==null || g==null || b==null || isNaN(r) || isNaN(g)|| isNaN(b) ) {
			alert ('Please enter numeric RGB values!');
			return;
		}
		if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {
			alert ('RGB values must be in the range 0 to 255.');
			return;
		}

		// BLACK
		if (r == 0 && g == 0 && b == 0) {
			computedK = 1;
			return [0,0,0,1];
		}

		computedC = 1 - (r/255);
		computedM = 1 - (g/255);
		computedY = 1 - (b/255);

		var minCMY = Math.min(computedC,
			Math.min(computedM,computedY));
		computedC = (computedC - minCMY) / (1 - minCMY) ;
		computedM = (computedM - minCMY) / (1 - minCMY) ;
		computedY = (computedY - minCMY) / (1 - minCMY) ;
		computedK = minCMY;

		return fixPoint([computedC, computedM, computedY, computedK]);
	},
	rgbToHsv: function (r,g,b) {
		var computedH = 0;
		var computedS = 0;
		var computedV = 0;

		//remove spaces from input RGB values, convert to int
		var r = parseInt( (''+r).replace(/\s/g,''),10 ); 
		var g = parseInt( (''+g).replace(/\s/g,''),10 ); 
		var b = parseInt( (''+b).replace(/\s/g,''),10 ); 

		if ( r==null || g==null || b==null || isNaN(r) || isNaN(g)|| isNaN(b) ) {
			alert ('Please enter numeric RGB values!');
			return;
		}
		if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {
			alert ('RGB values must be in the range 0 to 255.');
			return;
		}
		r = r/255; g=g/255; b=b/255;
		var minRGB = Math.min(r,Math.min(g,b));
		var maxRGB = Math.max(r,Math.max(g,b));

		// Black-gray-white
		if (minRGB == maxRGB) {
			computedV = minRGB;
			return [0,0,computedV];
		}

		// Colors other than black-gray-white:
		var d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
		var h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
		computedH = 60*(h - d/(maxRGB - minRGB));
		computedS = (maxRGB - minRGB)/maxRGB;
		computedV = maxRGB;
		return fixPoint([computedH, computedS, computedV]);
	}
};
