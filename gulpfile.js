var gulp = require('gulp');

var sftp = require('gulp-sftp');
var runSequence = require('run-sequence');
var GulpSSH = require("gulp-ssh");

var fs = require("fs");
var osenv = require("osenv");
var config = require("./config.json");

var configSSH = {
  host: config.sftp.host,
  port: 22,
  username: config.sftp.username,
  privateKey: fs.readFileSync(osenv.home() + '/.ssh/id_rsa')
}

var gulpSSH = new GulpSSH({
  ignoreErrors: false,
  sshConfig: configSSH
});

gulp.task('sftp', function() {
  return gulp.src(["./build/**/*", "./build/.bowerrc", "!./build/node_modules/**/*", "!./build/public/bower_components/**/*"])
    .pipe(sftp({
      host: config.sftp.host,
      remotePath: config.sftp.path,
      user: config.sftp.username
    }));
});

gulp.task('cleanRemote', function() {
  return gulpSSH
    .shell([
      'rm -rf ' + config.sftp.path + '/*'
    ]);
});

gulp.task('stopPM2', function() {
  return gulpSSH
    .shell([
      'cd ' + config.sftp.path,
      'pm2 stop .'
    ]);
});

gulp.task('loadModules', function() {
  return gulpSSH
    .shell([
      'cd ' + config.sftp.path,
      'npm install',
      'bower install'
    ]);
});

gulp.task('startPM2', function() {
  return gulpSSH
    .shell([
      'cd ' + config.sftp.path,
      'pm2 start .'
    ]);
});

gulp.task('default', function(callback) {
  runSequence("stopPM2", "cleanRemote", "sftp", "loadModules", "startPM2", callback);
});