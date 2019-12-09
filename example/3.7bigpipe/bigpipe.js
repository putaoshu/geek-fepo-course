/***** BIGPIPE *****/

/**
 * NOTE: THIS FILE IS PART OF THE startup.js COMPILATION. REMEMBER TO UPDATE THE COMPILATION AFTER MODIFICATIONS!
 *
 * This our BigPipe implementation which is modelled after the Facebook BigPipe, which is described at:
 * http://www.facebook.com/notes/facebook-engineering/bigpipe-pipelining-web-pages-for-high-performance/389414033919
 */

var globalEval = function globalEval(src) {
    if (window.execScript) {
        window.execScript(src);
        return;
    }
    var fn = function() {
        window.eval.call(window,src);
    };
    fn();
};

/**
 * A single pagelet resource which currently can be a css file or a javascript file. Note that this excludes Javascript
 * executable code which is not stored here but inside the Pagelet class.
 */
var PageletResource = Class.create({

	/**
	 * Resource name: the filename without path
	 * @param file string
	 */
	name: null,

	/**
	 * Resource file with full path.
	 * @param name string
	 */
	file: null,

	/**
	 * Resource type: string "js" or "css"
	* @param type string
	*/
	type: null,

	/**
	 * State of this resource. The state is used to track if the resource has been loaded
	 * and later if all resources for a given pagelet has been loaded so that pagelet
	 * state can proceed.
	 *
	 * @param phase integer
	 */
	phase: 0, // States:
			// 0: not started.
			// 1: started loading
			// 2: loading done.

	/**
	 * Array of callbacks which will be called when this resource has been loaded.
	 * @param belongs Array
	 */
	belongs: null,

	initialize: function(file, name, type) {
		this.name = name;
		this.file = file;
		this.type = type;
		this.belongs = new Array();
		BigPipe.debug("Pagelet " + name + " created as type " + type + " with file ", file);
	},

	/**
	 * Attaches a callback to this resource. The callback will be called when this resource has been loaded.
	 * @param callback
	 */
	attachToPagelet: function(callback) {
		this.belongs.push(callback);
	},

	/**
	 * Starts loading this resource. Depending on the resource type (js|css) this will add a proper html
	 * tag to the end of the document which kicks the browser to start loading the resource.
	 *
	 * JS resources must contain a BigPipe.fileLoaded() call to notify bigpipe that the js file
	 * has been loaded and processed.
	 *
	 * {code}
	 * if (BigPipe != undefined) { BigPipe.fileLoaded("geodata_google.js"); }
	 * {code}
	 *
	 * TODO: CSS resources are tagged to be completed immediately after the css link tag has been inserted,
	 * but in the future a better way would be needed so that the actual load moment would be detected.
	 *
	 */
	startLoading: function() {
		if (this.phase != 0) {
			return;
		}
		BigPipe.debug("Started loading " + this.type + " resource:", this.file);
		if (this.type == 'css') {
			var ref = document.createElement('link');
			ref.setAttribute('rel', 'stylesheet');
			ref.setAttribute('type', 'text/css');
			ref.setAttribute('href', this.file);

			/*
			ref.observe('onload', function() {
				alert("moroo");
			});
			ref.onload = function() { alert("moroo"); };
			*/

			//$$('head').first().insert(ref);
			document.write('<li' + 'nk rel="stylesheet" type="text/css" href="' + this.file + '" />');

			this.phase = 1;
			this.onComplete();
		}

		if (this.type == 'js') {
			var js = document.createElement('script');
			js.setAttribute('type', 'text/javascript');
			js.setAttribute('src', this.file);
			$$('head').first().insert(js);
		}
	},

	/**
	 * Callback which is called when this resource has been loaded. On CSS files the startLoading does this
	 * and on JS files the BigPipe will do this.
	 *
	 * This will set state = 2 (resource has been loaded) and call all callbacks.
	 */
	onComplete: function() {
		if (this.phase == 2) {
			return;
		}
		this.phase = 2;
		this.belongs.each(function(x) {
			x(this);
		}.bind(this));
	}
});

/**
 * A single Pagelet. Pagelet is a set of data which is streamed from web server and placed into correct elements
 * in the html page as soon as each pagelet has been delivered to the browser.
 *
 * Pagelet has different execution phases which are executed in certain order (the orders [1,4] are
 * loosely the same as the <i>phases</i> of this Pagelet):
 *
 * -1) Pagelet placeholder printing. This happens in web server and it prints a <div id="{this.id}"></div>
 *
 * 0) Pagelet arrives to browser. This includes all pagelet data which has been rendered by the web server
 *
 * 1) CSS loading: BigPipe asks each CSS PageletResource to start loading. This will kick browser to start
 *    downloading the css resources. Currently BigPipe does not wait that these resources are loaded, but
 *    immediately continue to the next phase:
 *
 * 2) HTML Injecting. After all CSS resources which are needed by this Pagelet are loaded, the BigPipe
 *    will inject the HTML code to the placeholder div.
 *
 * 3) After ALL Pagelet are on phase 3 (eg. they're all on this step) the BigPipe will start to load
 *    the .js files which are needed by its pagelets.
 *
 * 4) After all js resources which are needed by a Pagelet are loaded, the BigPipe will execute the jsCode
 *    of the pagelet. This is done by evaluating with globalEval() call.
 */
var Pagelet = Class.create({

	/**
	 * String of javascript code
	 * @param jsCode string
	 */
	jsCode: null,

	/**
	 * Array of PageletResources which are needed by this Pagelet.
	 * @param cssResources Array
	 */
	cssResources: null,

	/**
	 * Array of PageletResources which are needed by this Pagelet.
	 * @param jsResources Array
	 * @param json
	 */
	jsResources: null,

	/**
	 * Id of this pagelet. This is also the id of the target object in the html page where the pagelet is injected.
	 * @param id string
	 */
	id: "",

	/**
	 * The html code of this pagelet which is injected into the div which id is this.id as the divs innerHTML.
	 * @param innerHTML string
	 */
	innerHTML: "",

	/**
	 * Stores the json data between initialize() and start()
	 * @param json
	 */
	json: null,

	phase: 0, // Phases:
		// 0: not started
		// 1: loading css resources
		// 2: css resources loaded, injecting innerHTML
		// 3: innerHTML injected
		// 4: related JS resources loaded and executed

	/**
	 * Initializes this pagelet. The json is directly the json data which the web server has transported
	 * to the browser via the BigPipe.onArrive() call.
	 * @param json
	 */
	initialize: function(json) {
		this.id = json.id;
		this.phase = 0;
		this.json = json;
		this.jsCode = json.js_code;
		this.cssResources = new Hash();
		this.jsResources = new Hash();
		this.innerHTML = json.innerHTML;

	},

	start: function() {
		this.json.css_files.each(function(x) {
			var cssResource = BigPipe.pageletResourceFactory(x, 'css');
			this.attachCssResource(cssResource);

		}.bind(this));

		this.json.js_files.each(function(x) {
			var jsResource = BigPipe.pageletResourceFactory(x, 'js');
			this.attachJsResource(jsResource);

		}.bind(this));


		this.cssResources.each(function(pair) {
			this.phase = 1;
			pair.value.startLoading();
		});

		// Check if we actually started to load any css files. if not, we can just skip ahead.
		if (this.phase == 0) {
			this.injectInnerHTML();
		}
		
	},

	/**
	 * Attaches a CSS resource to this Pagelet.
	 * @private
	 * @param resource
	 */
	attachCssResource: function(resource) {
		BigPipe.debug("Attaching CSS resource " + resource.file + " to pagelet " + this.id, null);
		resource.attachToPagelet(this.onCssOnload.bind(this));
		this.cssResources.set(resource.file, resource);
	},

	/**
	 * Attaches a JS resource to this Pagelet.
	 * @private
	 * @param resource
	 */
	attachJsResource: function(resource) {
		BigPipe.debug("Attaching JS resource " + resource.file + " to pagelet " + this.id, null);
		resource.attachToPagelet(this.onJsOnload.bind(this));
		this.jsResources.set(resource.file, resource);
	},

	/**
	 * Callback which is called from PageletResource when a javascript file has been loaded.
	 * If all js resources needed by this Pagelet are loaded then this function will proceed to the final
	 * phase and evaluate the possible jsCode.
	 *
	 * @param x PageletResource which has just been loaded.
	 */
	onJsOnload: function(x) {
		if (this.phase > 3) {
			return;
		}

		var allLoaded = true;
		this.jsResources.each(function(pair) {
			if (pair.value.phase != 2) {
				allLoaded = false;
			}
		});

		if (!allLoaded) {
			return;
		}

		if (this.jsResources.size() > 0) {
			BigPipe.debug("pagelet " + this.id + ": All JS resources are loaded");
		}

		if (this.jsCode && this.jsCode != "") {
			try {
			    BigPipe.debug("evaluating js code: ", this.jsCode);
				globalEval(this.jsCode);
			} catch (e) {
				BigPipe.debug("Error while evaluating " + x, e);
			}
		}

		this.phase = 4;
	},

	/**
	 * Callback which is called from PageletResource when a css file has been loaded.
	 * If all css resources needed by this Pagelet are loaded then this function will proceed to the next
	 * phase and inject the HTML code.
	 *
	 * @param x PageletResource which has just been loaded.
	 */
	onCssOnload: function(x) {
		BigPipe.debug("pagelet " + this.id + " got notified that CSS resource is loaded: ", x);
		var allLoaded = true;
		this.cssResources.each(function(pair) {
			if (pair.value.phase != 2) {
				allLoaded = false;
			}
		});

		if (!allLoaded) {
			return;
		}

		BigPipe.debug("all resources loaded", this);
		this.injectInnerHTML();
	},

	/**
	 * Injects the innerHTML code to the Pagelet div placeholder.
	 * @private
	 */
	injectInnerHTML: function() {
		this.phase = 2;
		var div = $(this.id);
		BigPipe.debug("injecting innerHTML to " + this.id, this);
		if (div != null && typeof this.innerHTML == "string" && this.innerHTML != "") {

			//alert("Injecting inner html: " + this.id);
			//div.innerHTML = this.innerHTML;
			div.update(this.innerHTML);
			
		}

		this.phase = 3;
		BigPipe.pageletHTMLInjected(this);
	}

});

/**
 * BigPipe main class.
 */
var BigPipe = {

	/**
	 * Map of all PageletResource objects. Resource name is used as the key and value is the PageletResource object
	 */
	pageletResources: new Hash(),

	/**
	 * Map of all Pagelet objects. Pagelet id is used as the key.
	 */
	pagelets: new Hash(),

	phase: 0, // States:
		// 0: pagelets coming
		// 1: last pagelet has been receivered
		// 2: started to load js files

	/**
	 * Global debugging valve for all BigPipe related stuff.
	 */
	debug_: true,


	/**
	 * Called by web server when Pagelet has been arrived to the browser. In practice the web server
	 * will render a <script>BigPipe.onArrive(...)</script> tag which executes this.
	 * @param data
	 */
	onArrive: function(data) {
		this.debug("Pagelet arrived: ", data);

		// The last pagelet will have the is_last property set to true. This will signal
		// that we can start loading javascript resources.
		if (data.is_last != undefined && data.is_last) {
			this.debug("This pagelet was last:", data);
			this.phase = 1;
		}

		var pagelet = new Pagelet(data);
		this.pagelets.set(pagelet.id, pagelet);
		pagelet.start();
	},

	/**
	 * Callback which is used from javascript resources to signal that the javascript file has been loaded.
	 * This must be done by placing following javascript code to the end of the .js file:
	 *
	 * {code}
	 * if (BigPipe != undefined) { BigPipe.fileLoaded("geodata.js"); }
	 * {/code}
	 *
	 * @public
	 * @param filename string Name of the javascript file without path.
	 */
	fileLoaded: function(filename) {
		var resource = this.pageletResources.get(filename);
		BigPipe.debug("js file loaded", filename);
		if (resource) {
			resource.onComplete();
		}

	},

	/**
	 * Task has reached state 3 which means that it's ready for js loading. This is a callback
	 * which is called from Pagelet.
	 * @protected Called from a Pagelet
	 * @param pagelet
	 */
	pageletHTMLInjected: function(pagelet) {
		var allLoaded = true;
		this.debug("pageletHTMLInjected", pagelet);
		this.pagelets.each(function(pair) {
			if (pair.value.phase < 3) {
				this.debug("pageletHTMLInjected pagelet still not loaded", pair.value);
				allLoaded = false;
			}
		}.bind(this));

		if (!allLoaded) {
			return;
		}


		if (this.phase == 1) {
			this.loadJSResources();
		}

	},

	/**
	 * Starts loading javascript resources.
	 * @private
	 */
	loadJSResources: function() {
		this.phase = 2;
		this.debug("Starting to load js resources...");
		var something_started = false;
		this.pageletResources.each(function(pair) {
			if (pair.value.type == 'js') {
				something_started = true;
				pair.value.startLoading();
			}
		});

		this.pagelets.each(function(pair) {
			if (pair.value.jsResources.size() == 0) {
			    pair.value.onJsOnload();
			}

		}.bind(this));

		if (!something_started) {
			this.debug("No js resources in page, moving forward...");
			this.pagelets.each(function(pair) {
				pair.value.onJsOnload();
			}.bind(this));
		}
	},

	debug: function(funcName, data) {
		if (BigPipe.debug_ && typeof console != 'undefined' && typeof console.log != 'undefined') {
			console.log('BigPipe.' + funcName, data);
		}
	},

	/**
	 * Returns a PageletResource from cache or creates new if the resource has not yet been created.
	 *
	 * @protected Called from Pagelet
	 * @param file string Filename of the resource. eg "/js/talk.js"
	 * @param type string type: "css" or "js"
	 * @return PageletResource
	 */
	pageletResourceFactory: function(file, type) {

		var re = new RegExp("(?:.*\/)?(.+js)");
		var m = re.exec(file);
		var name = file;
		if (m) {
			name = m[1];
		}

		var res = this.pageletResources.get(name);
		if (res == null) {
			res = new PageletResource(file, name, type);

			this.pageletResources.set(name, res);
		}

		return res;
	}


};

/***** /BIGPIPE *****/