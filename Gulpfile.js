// Require our dependencies
const autoprefixer = require( 'autoprefixer' );
const babel = require( 'gulp-babel' );
const browserSync = require( 'browser-sync' );
const cheerio = require( 'gulp-cheerio' );
const concat = require( 'gulp-concat' );
const csslint = require('gulp-csslint' );
const cssnano = require( 'gulp-cssnano' );
const del = require( 'del' );
const eslint = require( 'gulp-eslint' );
const gulp = require( 'gulp' );
const gutil = require( 'gulp-util' );
const globbing = require( 'gulp-css-globbing' );
const imagemin = require( 'gulp-imagemin' );
const mqpacker = require( 'css-mqpacker' );
const notify = require( 'gulp-notify' );
const plumber = require( 'gulp-plumber' );
const postcss = require( 'gulp-postcss' );
const reload = browserSync.reload;
const rename = require( 'gulp-rename' );
const sass = require( 'gulp-sass' );
const sassLint = require( 'gulp-sass-lint' );
const sort = require( 'gulp-sort' );
const sourcemaps = require( 'gulp-sourcemaps' );
const svgmin = require( 'gulp-svgmin' );
const svgstore = require( 'gulp-svgstore' );
const uglify = require( 'gulp-uglify' );
const wpPot = require( 'gulp-wp-pot' );

// Set assets paths.
const paths = {
	'css': [ 'assets/css/*.css', '!*.min.css' ],
	'icons': 'assets/img/svg-icons/*.svg',
	'images': [ 'assets/img/*', '!assets/img/*.svg', 'docs/assets/img/**/*' ],
	'php': [ './*.php', './**/*.php' ],
	'sass': 'assets/sass/**/*.scss',
	'concat_scripts_admin': 'assets/js/src/admin/*.js',
	'concat_scripts_front_end': 'assets/js/src/front-end/*.js',
	'scripts': [ 'assets/js/*.js', '!assets/js/*.min.js' ]
};

/**
 * Handle errors and alert the user.
 */
function handleErrors () {
	const args = Array.prototype.slice.call( arguments );

	notify.onError( {
		'title': 'Task Failed [<%= error.message %>',
		'message': 'See console.',
		'sound': 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
	} ).apply( this, args );

	gutil.beep(); // Beep 'sosumi' again.

	// Prevent the 'watch' task from stopping.
	this.emit( 'end' );
}

/**
 * Delete wp-message-inserter-plugin-admin.css and wp-message-inserter-plugin-admin.min.css before we minify and optimize
 */
gulp.task( 'clean:styles', () =>
	del( [ 'assets/css/wp-message-inserter-plugin-admin.css', 'assets/css/wp-message-inserter-plugin-admin.min.css', 'assets/css/wp-message-inserter-plugin-front-end.css', 'assets/css/wp-message-inserter-plugin-front-end.min.css' ] )
);

/**
 * Compile Sass and run stylesheet through PostCSS.
 *
 * https://www.npmjs.com/package/gulp-sass
 * https://www.npmjs.com/package/gulp-postcss
 * https://www.npmjs.com/package/gulp-autoprefixer
 * https://www.npmjs.com/package/css-mqpacker
 */
gulp.task( 'postcss', [ 'clean:styles' ], () =>
	gulp.src( 'assets/sass/*.scss', paths.css )

		// Deal with errors.
		.pipe( plumber( {'errorHandler': handleErrors} ) )

		// Wrap tasks in a sourcemap.
		.pipe( sourcemaps.init() )

			// glob files together
			.pipe(globbing({
		        // Configure it to use SCSS files
		        extensions: ['.scss']
		    }))

			// Compile Sass using LibSass.
			.pipe( sass( {
				'errLogToConsole': true,
				'outputStyle': 'expanded' // Options: nested, expanded, compact, compressed
			} ) )

			// Parse with PostCSS plugins.
			.pipe( postcss( [
				autoprefixer( {
					'browsers': [ 'last 2 version' ]
				} ),
				mqpacker( {
					'sort': true
				} )
			] ) )

		// Create sourcemap.
		.pipe( sourcemaps.write() )

		// Create wp-message-inserter-plugin-admin.css.
		.pipe( gulp.dest( 'assets/css/' ) )
		.pipe( browserSync.stream() )
);

/**
 * Minify and optimize wp-message-inserter-plugin-admin.css.
 *
 * https://www.npmjs.com/package/gulp-cssnano
 */
gulp.task( 'cssnano', [ 'postcss' ], () =>
	gulp.src( 'assets/css/wp-message-inserter-plugin-admin.css' )
		.pipe( plumber( {'errorHandler': handleErrors} ) )
		.pipe( cssnano( {
			'safe': true // Use safe optimizations.
		} ) )
		.pipe( rename( 'wp-message-inserter-plugin-admin.min.css' ) )
		.pipe( gulp.dest( 'assets/css' ) )
		.pipe( browserSync.stream() )
);

/**
 * Minify and optimize wp-message-inserter-plugin-admin.css.
 *
 * https://www.npmjs.com/package/gulp-cssnano
 */
gulp.task( 'cssnano-frontend', [ 'postcss' ], () =>
	gulp.src( 'assets/css/wp-message-inserter-plugin-front-end.css' )
		.pipe( plumber( {'errorHandler': handleErrors} ) )
		.pipe( cssnano( {
			'safe': true // Use safe optimizations.
		} ) )
		.pipe( rename( 'wp-message-inserter-plugin-front-end.min.css' ) )
		.pipe( gulp.dest( 'assets/css' ) )
		.pipe( browserSync.stream() )
);

/**
 * Delete the svg-icons.svg before we minify, concat.
 */
gulp.task( 'clean:icons', () =>
	del( [ 'assets/img/svg-icons.svg' ] )
);

/**
 * Minify, concatenate, and clean SVG icons.
 *
 * https://www.npmjs.com/package/gulp-svgmin
 * https://www.npmjs.com/package/gulp-svgstore
 * https://www.npmjs.com/package/gulp-cheerio
 */
gulp.task( 'svg', [ 'clean:icons' ], () =>
	gulp.src( paths.icons )

		// Deal with errors.
		.pipe( plumber( {'errorHandler': handleErrors} ) )

		// Minify SVGs.
		.pipe( svgmin() )

		// Add a prefix to SVG IDs.
		.pipe( rename( {'prefix': 'icon-'} ) )

		// Combine all SVGs into a single <symbol>
		.pipe( svgstore( {'inlineSvg': true} ) )

		// Clean up the <symbol> by removing the following cruft...
		.pipe( cheerio( {
			'run': function ( $, file ) {
				$( 'svg' ).attr( 'style', 'display:none' );
				$( '[fill]' ).removeAttr( 'fill' );
				$( 'path' ).removeAttr( 'class' );
			},
			'parserOptions': {'xmlMode': true}
		} ) )

		// Save svg-icons.svg.
		.pipe( gulp.dest( 'assets/img/' ) )
		.pipe( browserSync.stream() )
);

/**
 * Optimize images.
 *
 * https://www.npmjs.com/package/gulp-imagemin
 */
gulp.task( 'imagemin', () =>
	gulp.src( paths.images, {base: "./"} )
		.pipe( plumber( {'errorHandler': handleErrors} ) )
		.pipe( imagemin( {
			'optimizationLevel': 5,
			'progressive': true,
			'interlaced': true
		} ) )
		.pipe( gulp.dest("./") )
);

/**
 * Concatenate and transform JavaScript.
 *
 * https://www.npmjs.com/package/gulp-concat
 * https://github.com/babel/gulp-babel
 * https://www.npmjs.com/package/gulp-sourcemaps
 */
gulp.task( 'concat-admin', () =>
	gulp.src( paths.concat_scripts_admin )

		// Deal with errors.
		.pipe( plumber(
			{'errorHandler': handleErrors}
		) )

		// Start a sourcemap.
		.pipe( sourcemaps.init() )

		// Convert ES6+ to ES2015.
		.pipe( babel( {
			presets: [ 'env' ]
		} ) )

		// Concatenate partials into a single script.
		.pipe( concat( 'wp-message-inserter-plugin-admin.js' ) )

		// Append the sourcemap to wp-message-inserter-plugin-admin.js.
		.pipe( sourcemaps.write() )

		// Save wp-message-inserter-plugin-admin.js
		.pipe( gulp.dest( 'assets/js' ) )
		.pipe( browserSync.stream() )
);
gulp.task( 'concat-front-end', () =>
	gulp.src( paths.concat_scripts_front_end )

		// Deal with errors.
		.pipe( plumber(
			{'errorHandler': handleErrors}
		) )

		// Start a sourcemap.
		.pipe( sourcemaps.init() )

		// Convert ES6+ to ES2015.
		.pipe( babel( {
			presets: [ 'env' ]
		} ) )

		// Concatenate partials into a single script.
		.pipe( concat( 'wp-message-inserter-plugin-front-end.js' ) )

		// Append the sourcemap to wp-message-inserter-plugin-front-end.js.
		.pipe( sourcemaps.write() )

		// Save wp-message-inserter-plugin-front-end.js
		.pipe( gulp.dest( 'assets/js' ) )
		.pipe( browserSync.stream() )
);

/**
  * Minify compiled JavaScript.
  *
  * https://www.npmjs.com/package/gulp-uglify
  */
gulp.task( 'uglify', [ 'concat-admin', 'concat-front-end' ], () =>
	gulp.src( paths.scripts )
		.pipe( rename( {'suffix': '.min'} ) )
		.pipe( uglify( {
			'mangle': false
		} ) )
		.pipe( gulp.dest( 'assets/js' ) )
);

/**
 * Delete the theme's .pot before we create a new one.
 */
gulp.task( 'clean:pot', () =>
	del( [ 'languages/wp-message-inserter-plugin.pot' ] )
);

/**
 * Scan the plugin and create a POT file.
 *
 * https://www.npmjs.com/package/gulp-wp-pot
 */
gulp.task( 'wp-pot', [ 'clean:pot' ], () =>
	gulp.src( paths.php )
		.pipe( plumber( {'errorHandler': handleErrors} ) )
		.pipe( sort() )
		.pipe( wpPot( {
			'domain': 'wp-message-inserter-plugin',
			'package': 'wp-message-inserter-plugin',
		} ) )
		.pipe( gulp.dest( 'languages/wp-message-inserter-plugin.pot' ) )
);

/**
 * Sass linting.
 *
 * https://www.npmjs.com/package/sass-lint
 */
gulp.task( 'sass:lint', () =>
	gulp.src( [
		'assets/sass/**/*.scss',
		'!node_modules/**'
	] )
		.pipe( sassLint() )
		.pipe( sassLint.format() )
		.pipe( sassLint.failOnError() )
);

/**
 * CSS linting.
 *
 * https://www.npmjs.com/package/gulp-csslint
 */
gulp.task( 'css:lint', () =>
	gulp.src( [
		'assets/css/**/*.css',
		'!assets/css/**/*.min.css'
	] )
		.pipe( csslint() )
    	.pipe( csslint.formatter() )
);

/**
 * JavaScript linting.
 *
 * https://www.npmjs.com/package/gulp-eslint
 */
gulp.task('js:lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['**/*.js','!node_modules/**', '!**.min.js'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint({
        	fix: true
        }))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

/**
 * Process tasks and reload browsers on file changes.
 *
 * https://www.npmjs.com/package/browser-sync
 */
gulp.task( 'watch', function () {

	// Kick off BrowserSync.
	browserSync( {
		'open': false,             // Open project in a new tab?
		'injectChanges': true,     // Auto inject changes instead of full reload.
		'proxy': 'testing.dev',    // Use http://largo.com:3000 to use BrowserSync.
		'watchOptions': {
			'debounceDelay': 1000  // Wait 1 second before injecting.
		}
	} );

	// Run tasks when files change.
	gulp.watch( paths.icons, [ 'icons' ] );
	gulp.watch( paths.sass, [ 'styles' ] );
	gulp.watch( paths.scripts, [ 'scripts' ] );
	gulp.watch( paths.concat_scripts, [ 'scripts' ] );
	gulp.watch( paths.php, [ 'markup' ] );
} );

/**
 * Create individual tasks.
 */
gulp.task( 'markup', browserSync.reload );
gulp.task( 'i18n', [ 'wp-pot' ] );
gulp.task( 'icons', [ 'svg' ] );
gulp.task( 'scripts', [ 'uglify' ] );
gulp.task( 'styles', [ 'cssnano', 'cssnano-frontend' ] );
gulp.task( 'lint', [ 'sass:lint', 'js:lint' ] );
gulp.task( 'default', [ 'i18n', 'icons', 'styles', 'scripts', 'imagemin'] );
