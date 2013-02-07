(function(window, document, undefined) {
	// PlankJS

	var trimRegexp = /^[\s\uFEFF]+|[\s\uFEFF]+$/g, 
		selectorRegExp = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, // Detects IDs, Tagnames and classNames
		globalIdentifier = "Plank" + (+new Date());

	var ArrayProto = Array.prototype, ObjProto = Object.prototype,
		FuncProto = Function.prototype, StringProto = String.prototype;
	var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;
    var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeTrim		   = StringProto.trim;

    var isUnderscoreAvailable = !!window._; // Underscore or Lo-Dash

	// From UnderscoreJS
    var breaker = {}; // Only breaker === breaker will result in true

	var each = isUnderscoreAvailable && _.each ? _.each : function(obj, iterator, context) {
		if (obj == null) return;
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, l = obj.length; i < l; i++) {
				if (iterator.call(context, obj[i], i, obj) === breaker) return;
			}
		} else {
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					if (iterator.call(context, obj[key], key, obj) === breaker) return;
				}
			}
		}
	};

	var trim = function (str) {
		if (str == null) return "";
		if (nativeTrim && str.trim === nativeTrim) {
			return str.trim();
		} else {
			return str.replace(trimRegexp,'');
		}
	};

	var any = isUnderscoreAvailable && _.any ? _.any : function (obj, iterator, context) {
	    iterator || (iterator = function() {});
	    var result = false;
	    if (obj == null) return result;
	    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
	    each(obj, function(value, index, list) {
			if (result || (result = iterator.call(context, value, index, list))) return breaker;
	    });
	    return !!result;
	};

	var contains = isUnderscoreAvailable && _.contains ? _.contains : function (list, search) {
	    if (list == null) return false;
	    if (nativeIndexOf && list.indexOf === nativeIndexOf) return list.indexOf(search) != -1;
	    return any(list, function(value) {
			return value === search;
	    });
	};

	var result = function (val, context) {return typeof val === "function" ? val.apply(context, slice.call(arguments, 2)) : val};

	var ongoingNumber = (function() {
		var i = 0;
		return function () {
			return i++;
		}
	})();

	var isHTMLElement = (function () {
		if ("HTMLElement" in window) {
			// Voilà. Quick and easy. And reliable.
			return function (el) {return el instanceof HTMLElement;};
		} else if ((document.createElement("a")).constructor) {
			// We can access an element's constructor. So, this is not IE7
			var ElementConstructors = {}, nodeName;
			return function (el) {
				return el && typeof el.nodeName === "string" &&
					 (el instanceof ((nodeName = el.nodeName.toLowerCase()) in ElementConstructors 
					 	? ElementConstructors[nodeName] 
					 	: (ElementConstructors[nodeName] = (document.createElement(nodeName)).constructor)))
			}
		} else {
			// Not that reliable, but we don't seem to have another choice. Probably IE7
			return function (el) {
				return typeof el === "object" && el.nodeType === 1 && typeof el.nodeName === "string";
			}
		}
	});

	var getElement = function (el) {
		if (el) {
			if (isHTMLElement(el)) {
				return el;
			} else if (el instanceof P) {
				return el.element;
			} else if ("nodeName" in el[0] && isHTMLElement(el[0])) {
				// This is an Array, a NodeList, a jQuery-object, or the like
				return el[0];
			}
		}
	};

	var getElementsByClassName = (function () {
		var d = document;
		if (d.getElementsByClassName) {
			return d.getElementsByClassName;
		} else if (d.querySelectorAll) {
			return function (className) {
				return d.querySelectorAll("." + className);
			};
		// From Eike Send https://gist.github.com/2299607
		} else if (d.evaluate) { // IE6, IE7
			return function (className) {
		    	var pattern = ".//*[contains(concat(' ', @class, ' '), ' " + className + " ')]",
		    		elements = d.evaluate(pattern, d, null, 0, null), results = [];
		    	while ((i = elements.iterateNext())) {
		    		results.push(i);
		    	}
		    	return results;
			}
	    }
	    return function (className) {
	    	var elements = d.getElementsByTagName("*"), pattern = new RegExp("(^|\\s)" + className + "(\\s|$)")
	    		i = 0, l = elements.length, results = [];
	    	for (; i < l; i++) {
		    	if ( pattern.test(elements[i].className) ) {
		    		results.push(elements[i]);
		    	}
		    }
	    	return results;
	    }
	})();

	function NodeCache() {
		this.IDs = {};
		this.ClassNames = {};
		this.Tagnames = {};
		this.selectors = {};
	}
	NodeCache.prototype = {
		get: function (selector, updateCache) {
			if (typeof selector === "string") {
				if (selector in this.selectors) {
					return this.selectors[selector];
				} else {
					var match = selectorRegExp.exec(selector), result;
					if (match) {
						if (match[1]) {
							// The Selector is an ID
							if (!updateCache && match[1] in this.IDs) {
								result = this.IDs[match[1]];
							} else {
								result = this.IDs[match[1]] = [document.getElementById(match[1])];
							}
						} else if (match[2]) {
							// The Selector is a Tagname
							if (!updateCache && match[2] in this.Tagnames) {
								result = this.Tagnames[match[2]];
							} else {
								result = this.Tagnames[match[2]] = document.getElementsByTagName(match[2]);
							}
						} else if (match[3]) {
							// The Selector is a ClassName
							if (!updateCache && match[3] in this.ClassNames) {
								result = this.classNames[match[3]];
							} else {
								result = this.ClassNames[match[3]] = getElementsByClassName(match[3]);
							}
						}
					} else {
						result = document.querySelectorAll(selector);
					}
					return this.selectors[selector] = result;
				}
			}
		}
	}

	function MetaData() {
		this.identifier = globalIdentifier + ongoingNumber();
		this.caches = [];
	}
	MetaData.prototype = {
		getCache: function (el) {
			if (el && (el.nodeType === 1 || el === el.window)) {
				if (globalIdentifier in el) {
					return this.caches[el[globalIdentifier]];
				} else {
					var index = this.caches.length, cache = {};
					el[globalIdentifier] = index;
					return this.caches[index] = cache;
				}
			}
		},
		getValue: function (el, key) {
			var cache = this.getCache(el);
			if (cache) {
				return key ? cache[key] : cache;
			}
		},
		setValue: function (el, key, value) {
			var cache = this.getCache(el);
			if (cache) {
				cache[key] = value;
			}
			return value;
		},
		contains: function (el, key) {
			var cache = this.getCache(el);
			if (cache) {
				return key in cache;
			}
		}
	}

	var PNodeCache = new NodeCache(), // For faster DOM-Access this Cache stores every selector which was used once together with its result 
		PInternalCache = new MetaData(), // Retrieved Offsets, width, height,... whatever can be cached here
		PCustomCache = new MetaData(); // To seperate the internal cache from the cache the user can use, we have two DOM-based caches

	var P = function (el, noCache) {
		if (!(this instanceof P)) {
			return new P(el);
		}
		this.set(el, noCache);
	};
	P.prototype = {
		set: function (el, noCache) {
			switch (typeof el) {
				case "string": this.element = P.find(el)[0]; break;
				case "object": 
					if (el instanceof Node && el.nodeType === 1) {
						this.element = el;
					} else if (el instanceof NodeList) {
						this.element = el[0];
					} else if (el instanceof P) {
						this.element = P.get();
					} else if (window.jQuery && el instanceof window.jQuery) {
						this.element = el[0];
					} break;
			}
		},
		get: function () {
			return this.element;
		}
	};

	P.noCache = false;

	var isCacheDisabled = function () {
		return P.noCache || (this instanceof P) ? this.noCache : false;
	};

	P.getAttr = function (el, attr) {
		if (attr && (el = P.getElement(el))) {
			return el.getAttribute(attr);
		}
	};

	P.setAttr = function (el, name, value) {
		if (name && (el = P.getElement(el))) {
			var obj = typeof name === "object" ? obj : {name:value};
			each(obj, function (v,n) {
				el.setAttribute(n,result(v, el, el.getAttribute(n)));
			})
		}
	};

	P.attr = function (el, name, value) {
		return P[(value ? "set" : "get") + "Attr"](el,name,value);
	};

	P.create = function (tagname, attr) {
		var el = document.createElement(tagname);
		if (attr) {
			P.setAttr(el, attr);
		}
		return el;
	};

	P.getElement = getElement;

	P.find = function (selector, noCache) {
		return PNodeCache.get(selector, noCache);
	};

	P.size = function (el, noCache) {
		var s = {"width": 0, "height": 0};

		if ((el = P.getElement(el))) {
			if (noCache || P.isCacheDisabled() || !PInternalCache.contains(el, "size")) {
				s = PInternalCache.setValue(el, "size", {
					"width": P.width(el, noCache),
					"height": P.height(el, noCache)
				});
			} else {
				s = PInternalCache.getValue(el, "size");
			}
		}
	};

	P.width = function (el, noCache) {
		var w = 0;
		if ((el = P.getElement(el))) {
			if (noCache || P.isCacheDisabled() || !PInternalCache.contains(el, "width")) {
				w = PInternalCache.setValue(el, "width", el.offsetWidth);
			} else {
				w = PInternalCache.getValue(el, "width");
			}
		}
		return w;
	};

	P.height = function (el, noCache) {
		var h = 0;
		if ((el = P.getElement(el))) {
			if (noCache || P.isCacheDisabled() || !PInternalCache.contains(el, "height")) {
				h = PInternalCache.setValue(el, "height", el.offsetHeight);
			} else {
				h = PInternalCache.getValue(el, "height");
			}
		}
		return h;
	};

	P.offset = function (el, noCache) {
		var offset = {"top": NaN, "left": NaN};
		if ((el = P.getElement(el))) {
			if (noCache || P.isCacheDisabled() || !PInternalCache.contains(el, "offset")) {
				var top = 0, left = 0, parent = el;
				while (parent) {
					top += parent.offsetTop;
					left += parent.offsetLeft;
					parent = parent.offsetParent;
				}
				offset = PInternalCache.setValue(el, "offset", {"top": top, "left": left});
			} else {
				offset = PInternalCache.getValue(el, "offset");
			}
		}
		return offset;
	};

	P.meta = function (el, key, val) {
		if ((el = P.getElement(el))) {
			if (val === undefined) {
				return PCustomCache.getValue(el, key);
			} else {
				return PCustomCache.setValue(el, key, val);
			}
		}
	};

	P.append = function (el, otherEl) {
		if ((el = P.getElement(el)) && (otherEl = P.getElement(otherEl))) {
			el.appendChild(otherEl);
		}
	};

	P.appendTo = function (el, otherEl) {
		if ((el = P.getElement(el)) && (otherEl = P.getElement(otherEl))) {
			otherEl.appendChild(el);
		}
	};

	P.prepend = function (el, otherEl) {
		if ((el = P.getElement(el)) && (otherEl = P.getElement(otherEl))) {
			el.insertBefore(otherEl, el.firstChild);
		}
	};

	P.prependTo = function (el, otherEl) {
		if ((el = P.getElement(el)) && (otherEl = P.getElement(otherEl))) {
			otherEl.insertBefore(el, otherEl.firstChild);
		}
	};

	P.addClass = function (el, className) {
		if (typeof className === "string" && (el = P.getElement(el))) {
			if ("classList" in el && el.classList.add) {
				return el.classList.add(className);
			} else {
				var names = el.classNames || "", regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
				if (!regexp.test(names)) {
					el.classNames = names + " " + className;
				}
			}
		}
	};

	P.hasClass = function (el, className) {
		if (typeof className === "string" && (el = P.getElement(el))) {
			if ("classList" in el && el.classList.contains) {
				return el.classList.contains(className);
			} else {
				return (new RegExp("(^|\\s)" + className + "(\\s|$)")).test(el.className);
			}
		}
	};

	P.removeClass = function (el, className) {
		if (typeof className === "string" && (el = P.getElement(el))) {
			if ("classList" in el && el.classList.remove) {
				return el.classList.remove(className);
			} else {
				var names = el.classNames || "", regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
				el.classNames = trim(names.replace(b, " "));
			}
		}
	};

	P.on = (function () {
		if (document.addEventListener) {
			return function (el, type, fn) {
				if (el && el.nodeName || el === window) {
					var events = PInternalCache.getValue(el, "events") || PInternalCache.setValue(el, "events", {});
					if (!events[type]) {
						events[type] = [];
					}
					events[type].push(fn);
					el.addEventListener(type, fn, false);
				}
			}
		} else {
			return function (el, type, fn) {
				if (el && el.nodeName || el === window) {
					var events = PInternalCache.getValue(el, "events") || PInternalCache.setValue(el, "events", {});
					if (!events[type]) {
						events[type] = [];
					}
					events[type].push(fn);
					el.attachEvent("on" + type, function () { return fn.call(el, window.event); });
				}
			}
		}
	})();

	P.off = (function () {
		if (document.removeEventListener) {
			return function (el, type, fn) {
				if (el && el.nodeName || el === window) {
					var events = {};
					if (type && fn) {
						events[type] = [fn];
					} else if (type && !fn) {
						var storedEvents = PInternalCache.getValue(el, "events");
						if (storedEvents && storedEvents[type]) {
							events[type] = storedEvents[type];
						}
					} else if (!type && !fn) {
						events = PInternalCache.getValue(el, "events");
					}
					each(events, function (callbacks, t) {
						each(callback, function(c) {
							try {el.removeEventListener(t,c);} catch(e) {}
						});
					});
				}
			}
		} else {
			return function (el, type, fn) {
				if (el && el.nodeName || el === window) {
					var events = {};
					if (type && fn) {
						events[type] = [fn];
					} else if (type && !fn) {
						var storedEvents = PInternalCache.getValue(el, "events");
						if (storedEvents && storedEvents[type]) {
							events[type] = storedEvents[type];
						}
					} else if (!type && !fn) {
						events = PInternalCache.getValue(el, "events");
					}
					each(events, function (callbacks, t) {
						each(callback, function(c) {
							try {el.detachEvent("on" + t,c);} catch(e) {}
						});
					});
				}
			}
		}
	})();

	var key, retValue = "meta offset height width size find ";
	for (var key in P) {
		if (P.hasOwnProperty(key) && key !== "prototype") {
			(function (key) {
				P.prototype[key] = (retValue.indexOf(key + " ") > -1)
				? function () {return P[key].apply(this, this.element, slice.call(arguments));}
				: function () {P[key].apply(this, this.element, slice.call(arguments)); return this;};
			})(key);
		}
	}

	window.Plank = P;
})(window, window.document);