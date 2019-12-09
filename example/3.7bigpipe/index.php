<?php
	header("Cache-Control: no-cache, must-revalidate"); 
	header("Expires: Sat, 26 Jul 2018 05:00:00 GMT"); 
	header("Pragma: no-cache");
	header("Content-Type: text/html");

	require_once('browser.php');
	require_once('h_bigpipe.inc');
	require_once('h_pagelet.inc');

	$use_padding = true;

	if (isset($_REQUEST['disable_padding'])) {
	   $use_padding = false;
	}

	function test_delayed_rendering($msg){
		global $use_padding;
		usleep(100000); // 100 ms
	        $padding = '';
		if ($use_padding) {
		        for ($i = 0; $i < 8192; $i++) { $padding .= ' '; }
		}
		return "$msg <!-- $padding -->\n";
	}

	function test_simple_replace($msg){
		global $use_padding;
		$padding = '';
		if ($use_padding) {
		        for ($i = 0; $i < 8192; $i++) { $padding .= ' '; }
		}
		return "$msg <!-- $padding --><br>\n";
	}
?>

<!DOCTYPE>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>BigPipe example</title>
<script type="text/javascript" src="bigpipe_base.js"></script>
<script type="text/javascript" src="bigpipe.js"></script>
</head>
<body>
	<h1 id="header">BigPipe test</h1>

	<h2>1、增加文本</h2>
	<?php
		echo new Pagelet("content_replace", 'test_simple_replace', 10, array('Ok 1'));
	?>

	<h2>2、延时30s</h2>
	<?php
	for ($i = 0; $i < 30; $i++) {
		$pagelet = new Pagelet("counter$i", "test_delayed_rendering", 10, array($i));
		$pagelet->use_span = true;
		echo $pagelet;
	}
	$pagelet = new Pagelet("delayed_done", "test_simple_replace", 10, array('Ok 2'));
	$pagelet->use_span = true;
	echo $pagelet;
	?>

	<h2>3、增加内联js片断</h2>
	<?php
	$pagelet = new Pagelet('inline_javascript_test');
	$pagelet->add_content('<div id="javascript_inline_test">-</div>');
	$pagelet->add_javascript_code("$('javascript_inline_test').innerHTML = 'Ok 3';");
	echo $pagelet;
	?>			  


	<h2>4、增加js文件和内联js片断</h2>
	<div id="external_js2">-</div>
	<?php
	$pagelet = new Pagelet('external_javascript_test2');
	$pagelet->add_javascript('test2.js');
	$pagelet->add_javascript_code("test2('external_js2', 'Ok 4');");
	echo $pagelet;

	$pagelet = new Pagelet('final_ok');
	$pagelet->add_javascript_code("$('header').innerHTML = 'All done';", 12);
	echo $pagelet;

echo "</body>\n";
BigPipe::render();
