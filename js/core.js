var Helpers = (function() {
    function deleteComments(css) {
        // delete multyline /* comments */
        var i, len;
        css = css.split('/*');
        if(css.length > 1){
            for(i = 0, len = css.length; i < len; i+=1){
                if(css[i].indexOf('*/')>0){
                    css[i] = css[i].substring(css[i].indexOf('*/') + 2);
                }
            }
        }
        return css.join('');
    }

    function valueAnimation(str) {
        try {
            let arr = str.split('}');
            arr = arr.filter(el => el).map(el => {
                let parts = el.split('{');
                let props = parts[1].split(';').map(e => e.trim()).filter(e => e).join('; ');
                return `${parts[0].trim()} { ${props}; }`
            });
            return arr;
        } catch(e){
            console.log(e);
            return str;
        }
    }

    function parseSelector(str) {
        try {
            let selectors = str.substr(0, str.indexOf('{')).trim();
            selectors = selectors.split(',').map(el => el.trim());
            let values = str.substring(str.indexOf('{')+1, str.indexOf('}')).trim();
            values = values.split(';').filter(el => el).map(el => el.trim()+';');
            return {
                type: 'selector',
                name: selectors,
                value: values,
            }
        } catch(e){
            console.log(e);
            return str;
        }
    }

    function parseMedia(str) {
        try {
            let rule = str.substr(0, str.indexOf('{'));
            str = str.substring(str.indexOf('{')+1, str.length-1);
            if(rule.indexOf('@media') !== 0){
                if(rule.indexOf('keyframes') !== -1){
                    str = valueAnimation(str);
                } else {
                    str = str.trim();
                }
                return {
                    type: 'custom',
                    name: rule.trim(),
                    value: str,
                }
            }
            return {
                type: 'media',
                name: rule.trim(),
                value: parseCSS(str.trim()),
            }
        } catch(e){
            console.log(e);
            return str;
        }
    }

    function prepareCSS(css) {
        return deleteComments(css).replace(/\n/g, '');
    }

    function splitCSS(css) {
        let arr = [];
        let str_m = '';
        let inMedia = 0; // logic for possible nested @media
        // stop 'while' in 10s any way
        let tm = new Date().getTime();
        while(css.length && (new Date().getTime() - tm) < 10000){
            let str = css.substr(0, css.indexOf('}')+1).trim();
            if(str.indexOf(';') !== -1 && str.indexOf(';') < str.indexOf('{')){
                // remove extra lines
                // e.g. @charset "UTF-8";
                str = str.substr(str.indexOf(';')+1).trim();
            }
            if(str.indexOf('@') === 0 && str.indexOf('@font-face') !== 0){ inMedia++; }
            if(str.indexOf('}') === 0){ inMedia--; }

            // if selectors ended, stop 'while'
            css = css.indexOf('}') === -1 ? '' : css.substr(css.indexOf('}')+1);

            if(inMedia){
                str_m += str; // collect whole @media content, don't push
            } else {
                arr.push( str_m + str );
                str_m = '';
            }
        }
        arr = arr.filter(el => el); // remove empty strings
        return arr;
    }

    function parseCSS(css){
        let result = prepareCSS(css); // string, lingle_line && not_comments
        result = splitCSS(result); // array of selectors/media

        result = result.map(el => {
            if(el.indexOf('@') === 0){
                return parseMedia(el);
            } else {
                return parseSelector(el);
            }
        });
        return result;
    }


    return {
        parse: parseCSS,
        predictCompexity: (str) => {
            return str.replace(/-/g, '').replace(/::/g, ':').replace(/[\w\d\s]/g, '').length;
        },
        sortAZ: (n1, n2) => {
            if(n1 === n2) { return 0; }
            if(n1 > n2) { return 1; } else { return -1; }
        },
    }
})();
