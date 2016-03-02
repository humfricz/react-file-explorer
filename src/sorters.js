let config = (function () {
	var getLocale = function (lang) {
		var locale = '';
		switch (lang) {
        case 'english':
            locale = 'aàâäåæbcdeéèêëfghiïîjklmnoôöøpqrsßtuûüvwxyÿz';
			break;
		case 'swedish':
            locale = 'aàâæbcdeéèêëfghiïîjklmnoôpqrsßtuûvwxyÿüzåäöø';
			break;
		case 'norwegian':
            locale = 'aàâbcdeéèêëfghiïîjklmnoôpqrsßtuûvwxyÿüzæäøöå';
			break;
		case 'german':
            locale = 'aàâäåæbcdeéèêëfghiïîjklmnoôöøpqrsßtuûüvwxyÿz';
			break;
		case 'dutch':
            locale = 'àâäåaæbcdeéèêëfghiïîjklmnoôöøpqrsßtuûüvwxyÿz';
			break;
		case 'danish':
            locale = 'aàâbcdeéèêëfghiïîjklmnoôpqrsßtuûvwxyÿüzæäøöå';
			break;
		case 'french':
            locale = 'aàâäåæbcçdeéèêëfghiïîjklmnñoôöøpqrsßtuûüvwxyÿz';
			break;
		}
		return locale;
	};
    return {
        locale: getLocale
    };

}());

export function letterSort(models, fieldName) {
    var locale = config.locale('english'),
        localeObj = {},

    _populateLocale = function () {
        var i,
            lst = locale.split('');

        for (i = 0; i < lst.length; i += 1) {
            localeObj[locale[i]] = i;
        }
    },

    _charCmp = function _charCmp(a, b) {
        //Find index from locale and sort
        var iA = localeObj[a],
            iB = localeObj[b];

        if (iA === undefined || iB === undefined) {
            if (iB !== undefined) {
                return a > 'a';
            }
            if (iA !== undefined) {
                return 'a' > b;
            }
            return a > b;
        }
        return iA > iB;
    },

    _localeCmp = function (wordA, wordB) {
        //http://stackoverflow.com/questions/3630645/how-to-compare-utf-8-strings-in-javascript
        var pos = 0,
            min = Math.min(wordA.length, wordB.length);

        while (wordA.charAt(pos) === wordB.charAt(pos) && pos < min) {
            pos += 1;
        }
        return _charCmp(wordA.charAt(pos), wordB.charAt(pos)) ? 1 : -1;
    },

    _naturalSort = function (a, b) {
        //http://web.archive.org/web/20140623113442/http://code.google.com/p/js-naturalsort/source/browse/trunk/naturalSort.js

        var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
            dateRe = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
            hexRe = /^0x[0-9a-f]+$/i,
            startNumbersRe = /^0/,

            // chunk/tokenize
            // chunkA = x.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').replace(/ /g, '\0').split('\0'),
            // chunkB = y.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').replace(/ /g, '\0').split('\0'),
            chunkA = a.replace(re, '\0$1\0').split('\0'),
            chunkB = b.replace(re, '\0$1\0').split('\0'),

            // numeric, hex or date detection
            chunkDateA = parseInt(a.match(hexRe), 10) || (chunkA.length !== 1 && a.match(dateRe) && Date.parse(a)),
            chunkDateB = parseInt(b.match(hexRe), 10) || (chunkDateA && b.match(dateRe) && Date.parse(b)) || null,

            chunkItemA, chunkItemB,
            nanA, nanB,
            maxLen = 0,
            cItem, chunkLenA, chunkLenB;

        // first try and sort Hex codes or Dates
        if (chunkDateB) {
            if (chunkDateA < chunkDateB) {
                return -1;
            }
            else if (chunkDateA > chunkDateB) {
                return 1;
            }
        }

        chunkLenA = chunkA.length;
        chunkLenB = chunkB.length;
        maxLen = Math.max(chunkLenA, chunkLenB);

        // natural sorting through split numeric strings and default strings
        for (cItem = 0; cItem < maxLen; cItem += 1) {

            // find floats not starting with '0', string or 0 if not defined (Clint Priest)
            chunkItemA = !(chunkA[cItem] || '').match(startNumbersRe) &&
                                parseInt(chunkA[cItem], 10) || parseFloat(chunkA[cItem]) ||

                                chunkA[cItem] || '0';
            chunkItemB = !(chunkB[cItem] || '').match(startNumbersRe) &&
                                parseInt(chunkB[cItem], 10) ||  parseFloat(chunkB[cItem]) ||
                                chunkB[cItem] || '0';

            nanA = isNaN(chunkItemA);
            nanB = isNaN(chunkItemB);

            // handle numeric vs string comparison - number < string - (Kyle Adams)
            if (nanA !== nanB) {
                return nanA ? 1 : -1;
            }

            // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
            else if (typeof chunkItemA !== typeof chunkItemB) {
                chunkItemA += '';
                chunkItemB += '';
            }
            //if (typeof(chunkItemA) === typeof ('') && typeof(chunkItemB) === typeof ('')) {

            //If only strings
            if (nanA && nanB) {
                if (chunkItemA !== chunkItemB) {
                    return _localeCmp(chunkItemA, chunkItemB);
                }
            }

            if (chunkItemA < chunkItemB) {
                return -1;
            } else if (chunkItemA > chunkItemB) {
                return 1;
            }
            // else { //compare two ints"
            //     chunkItemA = chunkA[cItem];
            //     chunkItemB = chunkB[cItem];
            //     // else { //if padded with zeros, 0002 > 002
            //     if (chunkItemA.length < chunkItemB.length) {
            //         return -1;
            //     } else if (chunkItemA.length > chunkItemB.length) {
            //         return 1;
            //     } else {

            //         if (chunkLenA < chunkLenB) { //if padded with 0s 0001 > 001A
            //             return -1;
            //         } else if (chunkLenA > chunkLenB) {
            //             return 1;
            //         }
            //     }
            //     // }
            // }
        }
        return 0;
    },

    _cmpLetters = function (attr) {
        _populateLocale();

        return function (a, b) {
            var nameA = a[attr],
                nameB = b[attr],
                objA,
                objB,
                cmpVal;

            switch (attr) {
            case 'file_name':
                objA = a.sortOrder;
                objB = b.sortOrder;
                if (objA !== objB) {
                    return (objA < objB) ? -1 : (objA > objB) ? 1 : 0;
                }
                break;
            case 'modified_by_text':
                if (nameA === nameB) {
                    objA = a.modified_time;
                    objB = b.modified_time;
                    if (objA !== objB) {
                        return (objA < objB) ? -1 : (objA > objB) ? 1 : 0;
                    }
                }
                break;
            }

            nameA = nameA.toLowerCase();
            nameB = nameB.toLowerCase();

            if (nameA === nameB) {
                cmpVal =  0;
            }
            else {
                if (nameA.length > 100) {
                    nameA = nameA.substr(0, 50);
                }
                if (nameB.length > 100) {
                    nameB = nameB.substr(0, 50);
                }
                cmpVal = _naturalSort(nameA, nameB);
            }
            return cmpVal;
        };
    };

    return models.sort(_cmpLetters(fieldName));
};

export function numberSort(models, fieldName) {
    var compareNumbers = function (a, b) {
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        },
        _cmpNumbers = function (attr) {
            return function (a, b) {
                var numA = a[attr],
                    numB = b[attr];
                return compareNumbers(numA, numB);
            };
        };

    return models.sort(_cmpNumbers(fieldName));
};
