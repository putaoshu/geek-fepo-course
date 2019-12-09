<?php

/**
 * Main class for BigPipe rendering.
 */
class BigPipe {
	/**
	 * Two dimension array which contains each pagelet definition.
	 *  - First key is the pagelet priority
	 *  - First value is an array:
	 *      - Key is the pagelet id (also the target id in html document)
	 *      - Value is a Pagelet
	 *
	 * Using this kind of two dimension array allows us to sort the pagelets by priority and retain
	 * the order within same priority.
	 */
	private static $pagelets = array();

	/**
	 * @var int Amount of pagelets inside $pagelets array
	 */
	private static $pagelet_count = 0;

	/**
	 * Is the BigPipe enabled or not.
	 */
	private static $enabled = null;

	/**
	 * The topmost controller which ever tries to call us. This is used to
	 * prevent misbehaviour when using nested controllers.
	 */
	private static $top_controller = null;

	/**
	 * Javascript snippets which are appended on bigpipe rendering when bigpipe is disabled. This
	 * will trigger their execution only after dom has been loaded.
	 * @var array
	 */
	private static $javascripts = array();


	/**
	 * Checks if we should enable BigPipe or not.
	 *
	 * This uses h_browser.inc to parse user agent string and pessimistically enable it only
	 * if we can be sure that its supported.
	 *  
	 * @static
	 * @return bool
	 */
	private static function check_for_enabling() {

		// Allow any user to always force bigpipe to on if he really wants
		if (isset($_REQUEST['bigpipe'])) {
			return (bool) $_REQUEST['bigpipe'];
		}

		// The feature must be present so that we can even start thinking of enabling bigpipe
		if (function_exists('feature_present') && !feature_present('bigpipe')) {
			return false;
		}

		// Disable if viewer is a bot (like google bot)
		if (self::is_bot()) {
			return false;
		}


		//
		// Use the Browser.php from Chris Schuld (http://chrisschuld.com/) to detect
		// proper browsers which are known to support bigpipe without any problems.
		//

		$browser = new Browser();
		if ($browser->getBrowser() == Browser::BROWSER_FIREFOX && $browser->getVersion() >= 2) {
			return true;
		}

		if ($browser->getBrowser() == Browser::BROWSER_OPERA && $browser->getVersion() >= 10) {
			return true;
		}

		if ($browser->getBrowser() == Browser::BROWSER_IE && $browser->getVersion() >= 7) {
			return true;
		}

		if ($browser->getBrowser() == Browser::BROWSER_CHROME && $browser->getVersion() >= 4) {
			return true;
		}

		// Disable if we aren't sure that we can support all bigpipe features
		return false;
	}

	/**
	 * Returns if BigPipe rendering is enabled.
	 *
	 * @static
	 * @return bool
	 */
	public static function is_enabled() {
		if (self::$enabled === null) {
			self::$enabled = self::check_for_enabling();
		}
		return self::$enabled;
	}

	public static function disable() {
		self::$enabled = false;
	}

	/**
	 * Adds a pagelet to BigPipe rendering
	 * @param  $id string id inside document. This will be used to identify a div container where the pagelet is delivered
	 * @param Pagelet $pagelet
	 * @return void
	 */
	public static function add_pagelet($id, Pagelet $pagelet) {
		self::$pagelets[$pagelet->priority][$id] = $pagelet;
		self::$pagelet_count++;
	}

	/**
	 * If your codebase contains multiple hierarchical controllers where each controller
	 * calls bigpipe startup and render functions you can use this function
	 * to make sure that they not called in the inner controllers.
	 *
	 * Simply call BigPipe::register_controller($this); in the beginning of all your controllers and
	 * BigPipe::render($this); at the end, the render will only take place when $this is the same
	 * than the first registered controller.
     *
	 * @static
	 * @param  $controller
	 * @return void
	 */
	public static function register_controller($controller) {
		if (self::$top_controller == null) {
			self::$top_controller = $controller;
		}
	}

	/**
	 * Renders all pagelets in queue.
	 * @return void
	 */
	public static function render($calling_controller = null) {

		// Prevent misbehaviour when using nested controllers.
		if ($calling_controller != null && self::$top_controller != $calling_controller) {
			return;
		}

		// BigPipe is disabled so dump the javascripts out
		if (!self::$enabled) {
			foreach (self::$javascripts as $source) {
				echo self::source($source);
			}
			return;
		}

		if ($_REQUEST['bigpipe'] == 2) {
			return;
		}

		// Flush all previously rendered stuff out so browser will display it.
		flush();

		// This is used to mark lap time when all high priority pagelets have been rendered
		$timer_stopped = false;

		// These two are used to count when we are rendering the last pagelet
		$i = 0;


		if (!self::$pagelet_count) {
			return;
		}
		
		// Sort all pagelets according to their priority (highest priority => rendered first)
		ksort(self::$pagelets);
		self::$pagelets = array_reverse(self::$pagelets);

		foreach (self::$pagelets as $priority => $container) {
			foreach ($container as $id => $pagelet) {
				$data = $pagelet->render_data();

				if (++$i >= self::$pagelet_count) {
					$data['is_last'] = true;
				}
				self::print_single_response($data);

				// Use global Measure item to mark a "lap" when we have rendered all high-priority items
				if ($pagelet->priority < 10 && !$timer_stopped) {
					global $global_meas;
					if ($global_meas) {
						$global_meas->lap('~');
						$timer_stopped = true;
					}
				}
			}
		}

		self::$enabled = false;
		echo '</html><!--html end tag from bigpipe renderer-->';
		flush();

	}

	/**
	 * Prints a single pagelet out and flushes it.
	 * @param  $data
	 * @return void
	 */
	private static function print_single_response($data) {
		static $uniq_counter = 0;
		$uniq_counter++;
		echo '<script id="' . $data['id'] . '_' . $uniq_counter . '">';
		echo 'BigPipe.onArrive(';
		if (class_exists('JSON')) {
			echo JSON::encode($data);
		} else {
			echo json_encode($data);
		}
		echo ');';
		echo "</script>\n";
		flush();
	}

	/**
	 * Detect bots from user agent string
	 * @param  $user_agent
	 * @return int
	 */
	public static function is_bot() {
		$user_agent = $_SERVER['HTTP_USER_AGENT'];

		//if no user agent is supplied then assume it's a bot
		if($user_agent == "") {
			return true;
		}

		//array of bot strings to check for
		$bot_strings = Array(  "google",     "bot",
			"yahoo",     "spider",
			"archiver",   "curl",
			"python",     "nambu",
			"twitt",     "perl",
			"sphere",     "PEAR",
			"java",     "wordpress",
			"radian",     "crawl",
			"yandex",     "eventbox",
			"monitor",   "mechanize",
			"facebookexternal"
		);

		foreach($bot_strings as $bot) {
			if(strpos($user_agent,$bot) !== false) {
				return true;
			}
		}

		return false;
	}


	public static function add_domloaded($source) {
		self::$javascripts[] = "try { $source } catch (ex) { if (typeof console == 'object') { console.log(ex); } if (typeof logError == 'function') { if (typeof ex == 'object') { logError(ex.name + ': ' + ex.message, ex.fileName, ex.lineNumber, ex.stack); } else { logError(ex, 'Exception', 0); } } }";

	}

	/**
	 * Get JavaScript source as HTML
	 *
	 * @param   string  $source
	 * @return  string
	 */
	public static function source($source) {
		return "<script type=\"text/javascript\">\n//<![CDATA[\n" . $source . "\n//]]>\n</script>";
	}
}
