<?php
/**
 * Automatically loads the specified file.
 *
 */


// Start with composer autoload
if ( file_exists( dirname( WP_MESSAGE_INSERTER_FILE ) . '/vendor/autoload.php' ) ) {
	require_once dirname( WP_MESSAGE_INSERTER_FILE ) . '/vendor/autoload.php';
}

/**
 * Enable autoloading of plugin classes
 * @param $class_name
 */
spl_autoload_register(
	function ( $class_name ) {

		// Only autoload classes from this plugin
		if ( 'WP_Message_Inserter' !== $class_name && 0 !== strpos( $class_name, 'WP_Message_Inserter_' ) ) {
			return;
		}

		// wpcs style filename for each class
		$file_name = 'class-' . str_replace( '_', '-', strtolower( $class_name ) );

		// create file path
		$file = dirname( WP_MESSAGE_INSERTER_FILE ) . '/php/' . $file_name . '.php';

		// If a file is found, load it
		if ( file_exists( $file ) ) {
			require_once( $file );
		}

	}
);
