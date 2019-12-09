<?php

/**
 * $Log: h_pagelet.inc,v $
 *
 *
 */


class Pagelet {

	/**
	 * Unique id for this pagelet. This will also be used as the corresponding html element id.
	 *
	 * @var string
	 */
	private $id;

	/**
	 * Function callback which the render function calls
	 * @var callback
	 */
	private $callback = null;

	/**
	 * Priority. The pagelets are rendered in descending priority order (highest priority first)
	 * @var int
	 */
	public $priority;

	private $arguments = null;

	private $content = '';

	/**
	 * List of css files which this pagelet needs
	 * @var array
	 */
	private $css_files = array();

	/**
	 * List of javascript files which this pagelet needs
	 * @var array
	 */
	private $javascript_files = array();

	/**
	 * Javacsript code (wihtout <script></script> tags) which this pagelet executes
	 * @var string
	 */
	private $javascript_code = '';


	/**
	 * In case bigpipe is disabled the callback is called immediately and the results are stored in
	 * this variable to be used later in __toString() call.
	 * @var mixed
	 */
	private $bypass_container = null;

	/**
	 * Tells if the placeholder is done with a <div /> or a <span /> tag. True if span
	 * @var boolean
	 */
	public $use_span = false;


	/**
	 * Constructor. Creates the pagelet.
	 *
	 * If bigipe is disabled the callback is called immediately.
	 * and called later
	 * @param string $id  Unique id for this pagelet. This will also be used as the corresponding html element id.
	 * @param callback $callback  PHP style function callback which the render function calls
	 * @param int $priority
	 * @param $arguments
	 * @return void
	 */
	public function __construct($id, $callback = null, $priority = 10, $arguments = null) {
		$this->id = $id;
		$this->callback = $callback;
		$this->arguments = $arguments;

		BigPipe::add_pagelet($id, $this);

		$this->priority = $priority;

		// Execute callback immediately if bigpipe is disabled
		if (!BigPipe::is_enabled()) {
			$this->bypass_container = $this->execute_callback();
		}
	}

	public function add_css($file) {
		$this->css_files[] = $file;
	}

	public function add_content($str) {
		$this->content .= $str;
	}

	public function add_javascript($file) {
		if (BigPipe::is_enabled()) {
			$this->javascript_files[] = $file;
		} else {
			ViewPage::instance()->add_javascript_footer($file);
		}
	}

	public function add_javascript_code($code) {
		$this->javascript_code .= $code;
	}

	protected function execute_callback() {
		if ($this->callback != null) {
			if ($this->arguments == null) {
				$ret = call_user_func($this->callback);
			} else {
				$ret = call_user_func_array($this->callback, $this->arguments);
			}
		}

		return $ret;
	}

	protected function get_content() {
		if ($this->bypass_container == null) {
			$ret = $this->execute_callback();
		} else {
			$ret = $this->bypass_container;
		}

		$data = array();

		if ($ret instanceof ViewBox) {
			$data['js_code'] = $ret->get_javascript();
			$data['innerHTML'] = $ret->get_content(false);
		} else {
			$data['innerHTML'] = '' . $ret;
		}

		$data['innerHTML'] .= $this->content;
		return $data;

	}


	public function render_data() {
		//Logger::debug("Rendering pagelet: " . $this->id);
		$data = $this->get_content();
		//Logger::debug("content: " . print_r($data, 1));
		$data['id'] = $this->id;
		$data['css_files'] = $this->css_files;
		$data['js_files'] = $this->javascript_files;
		$data['js_code'] .= $this->javascript_code;

		return $data;
	}

	public function __toString() {
		if (BigPipe::is_enabled()) {
		   	if ($this->use_span) {
				return '<span id="' . $this->id . '"></span>';
			} else {			
				return '<div id="' . $this->id . '"></div>';
			}
		} else {

			$data = $this->get_content();
			$str = $data['innerHTML'];
			if ($data['js_code']) {
				//$str .= '<script type="text/javascript" id="js_' . $this->id . '">' . $data['js_code'] . '</script>';
				BigPipe::add_domloaded($data['js_code']);
			}

			return $str;
		}
	}

}

