// Require our dependencies
const autoprefixer = require("autoprefixer");
const babel = require("gulp-babel");
const browserSync = require("browser-sync").create();
const concat = require("gulp-concat");
const cssnano = require("cssnano");
const eslint = require("gulp-eslint");
const fs = require("fs");
const gulp = require("gulp");
const iife = require('gulp-iife');
const packagejson = JSON.parse(fs.readFileSync("./package.json"));
const mqpacker = require("css-mqpacker");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require("gulp-sass-glob");
const sort = require("gulp-sort");
const gulpStylelint = require("gulp-stylelint");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const wpPot = require("gulp-wp-pot");

// Some config data for our tasks
const config = {
	styles: {
		admin: "assets/sass/" + packagejson.name + "-admin.scss",
		front_end: "assets/sass/" + packagejson.name + "-front-end.scss",
		srcDir: "assets/sass/*.scss",
		dest: "assets/css",
		lint_dest: "assets/sass/"
	},
	scripts: {
		admin: "./assets/js/src/admin/**/*.js",
		admin_lint: "./assets/js/src/admin/",
		front_end: "./assets/js/src/front-end/**/*.js",
		front_end_lint: "./assets/js/src/front-end/",
		uglify: ["assets/js/*.js", "!assets/js/*.min.js"],
		dest: "./assets/js"
	},
	languages: {
		src: [
			"./**/*.php",
			"!.git/*",
			"!.svn/*",
			"!bin/**/*",
			"!node_modules/*",
			"!release/**/*",
			"!vendor/**/*"
		],
		dest: "./languages/" + packagejson.name + ".pot"
	},
	browserSync: {
		active: false,
		localURL: "mylocalsite.local"
	}
};

function adminstyles() {
	return gulp
		.src(config.styles.admin, { allowEmpty: true })
		.pipe(sourcemaps.init()) // Sourcemaps need to init before compilation
		.pipe(sassGlob()) // Allow for globbed @import statements in SCSS
		.pipe(sass()) // Compile
		.on("error", sass.logError) // Error reporting
		.pipe(
			postcss([
				mqpacker({
					sort: true
				}),
				autoprefixer(),
				cssnano({
					safe: true // Use safe optimizations.
				}) // Minify
			])
		)
		.pipe(
			rename({
				// Rename to .min.css
				suffix: ".min"
			})
		)
		.pipe(sourcemaps.write()) // Write the sourcemap files
		.pipe(gulp.dest(config.styles.dest)) // Drop the resulting CSS file in the specified dir
		.pipe(browserSync.stream());
}

function adminsasslint() {
  return gulp.src(config.styles.admin)
    .pipe(gulpStylelint({
      fix: true
    }))
    .pipe(gulp.dest(config.styles.lint_dest));
}

function frontendsasslint() {
  return gulp.src(config.styles.front_end)
    .pipe(gulpStylelint({
      fix: true
    }))
    .pipe(gulp.dest(config.styles.lint_dest));
}

function frontendstyles() {
	return gulp
		.src(config.styles.front_end, { allowEmpty: true })
		.pipe(sourcemaps.init()) // Sourcemaps need to init before compilation
		.pipe(sassGlob()) // Allow for globbed @import statements in SCSS
		.pipe(sass()) // Compile
		.on("error", sass.logError) // Error reporting
		.pipe(
			postcss([
				mqpacker({
					sort: true
				}),
				autoprefixer(),
				cssnano({
					safe: true // Use safe optimizations.
				}) // Minify
			])
		)
		.pipe(
			rename({
				// Rename to .min.css
				suffix: ".min"
			})
		)
		.pipe(sourcemaps.write()) // Write the sourcemap files
		.pipe(gulp.dest(config.styles.dest)) // Drop the resulting CSS file in the specified dir
		.pipe(browserSync.stream());
}

function adminscripts() {
	return gulp
		.src(config.scripts.admin)
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ["@babel/preset-env"]
			})
		)
		.pipe(concat(packagejson.name + "-admin.js")) // Concatenate
		.pipe(sourcemaps.write())
		.pipe(eslint())
		.pipe(iife({
	      useStrict: false,
	      params: ['$'],
	      args: ['jQuery']
	    }))
		.pipe(gulp.dest(config.scripts.dest))
		.pipe(browserSync.stream());
}

function frontendscripts() {
	return gulp
		.src(config.scripts.front_end)
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ["@babel/preset-env"]
			})
		)
		.pipe(concat(packagejson.name + "-front-end.js")) // Concatenate
		.pipe(sourcemaps.write())
		.pipe(eslint())
		.pipe(iife({
	      useStrict: false,
	      params: ['$'],
	      args: ['jQuery']
	    }))
		.pipe(gulp.dest(config.scripts.dest))
		.pipe(browserSync.stream());
}

function adminscriptlint() {
	return gulp
		.src(config.scripts.admin)
		.pipe(eslint({fix:true}))
		.pipe(eslint.format())
		.pipe(gulp.dest(config.scripts.admin_lint))
		// Brick on failure to be super strict
		//.pipe(eslint.failOnError());
};

function frontendscriptlint() {
	return gulp
		.src(config.scripts.front_end)
		.pipe(eslint({fix:true}))
		.pipe(eslint.format())
		.pipe(gulp.dest(config.scripts.front_end_lint))
		// Brick on failure to be super strict
		//.pipe(eslint.failOnError());
};

function uglifyscripts() {
	return (
		gulp
			.src(config.scripts.uglify)
			.pipe(uglify()) // Minify + compress
			.pipe(
				rename({
					suffix: ".min"
				})
			)
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(config.scripts.dest))
			.pipe(browserSync.stream())
	);
}

// Generates translation file.
function translate() {
	return gulp
		.src(config.languages.src)
		.pipe(
			wpPot({
				domain: packagejson.name,
				package: packagejson.name
			})
		)
		.pipe(gulp.dest(config.languages.dest));
}

// Injects changes into browser
function browserSyncTask() {
	if (config.browserSync.active) {
		browserSync.init({
			proxy: config.browserSync.localURL
		});
	}
}

// Reloads browsers that are using browsersync
function browserSyncReload(done) {
	browserSync.reload();
	done();
}

// Watch directories, and run specific tasks on file changes
function watch() {
	gulp.watch(config.styles.srcDir, styles);
	gulp.watch(config.scripts.admin, adminscripts);

	// Reload browsersync when PHP files change, if active
	if (config.browserSync.active) {
		gulp.watch("./**/*.php", browserSyncReload);
	}
}

// define complex tasks
const lint = gulp.series(adminsasslint, frontendsasslint, adminscriptlint, frontendscriptlint);
const styles = gulp.series(adminstyles, frontendstyles);
const scripts = gulp.series(adminscripts, frontendscripts, uglifyscripts);
const build = gulp.series(lint, gulp.parallel(styles, scripts, translate));

// export tasks
exports.styles = styles;
exports.scripts = scripts;
exports.lint = lint;
exports.translate = translate;
exports.watch = watch;
exports.build = build;
exports.default = build;
