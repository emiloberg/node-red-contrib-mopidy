var gulp			= require('gulp');
var del				= require('del');
var babel			= require('gulp-babel');
var runSequence		= require('run-sequence');
var debug			= require('gulp-debug');
var mergeStream		= require('merge-stream');
var watch			= require('gulp-watch');

var options = {
	destination: './mopidy',
	es6source: ['src/*.js', 'src/**/*.js'],
	nonJSResources: 'src/*.html',
};


gulp.task('build', function(callback) {
	runSequence('_build-clean',
		['_move-resources', '_compile_es'],
		callback);
});

gulp.task('watch', function() {
	watch(options.es6source)
		.pipe(debug({title: 'Compiling:      '}))
		.pipe(babel({
			stage: 1
		}))
		.pipe(gulp.dest(options.destination));

	watch(options.nonJSResources)
		.pipe(debug({title: 'Moving Resource:'}))
		.pipe(gulp.dest(options.destination));
});

gulp.task('_build-clean', function() {
	return del([options.destination]);
});

gulp.task('_compile_es', function() {
	return gulp.src(options.es6source)
		.pipe(debug({title: 'Compiling:      '}))
		.pipe(babel({
			stage: 1
		}))
		.pipe(gulp.dest(options.destination));
});

gulp.task('_move-resources', function() {
	return gulp.src(options.nonJSResources)
		.pipe(debug({title: 'Moving Resource:'}))
		.pipe(gulp.dest(options.destination));
});
