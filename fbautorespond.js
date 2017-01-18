var fs = require('fs');
var login = require("facebook-chat-api");
var log = require('npmlog');
var argv = require('yargs')
    .usage('Auto-respond to Facebook messages.\n')
    .env('FB_AUTORESPOND')
    .describe('response', 'The response to send on new messages')
    .describe('email', 'The email address to login with')
    .describe('password', 'The password to authenticate with')
    .describe('restart', 'An optional number of minutes to restart after')
    .describe('log-level', '[error|warn|info|verbose] - defaults to info')
    .demand('email')
    .demand('response')
    .default('log-level', 'info')
    .check(function(argv) {
      return ['error', 'warn', 'info', 'verbose'].includes(argv.logLevel);
    })
    .argv;
if (!argv.password) {
  argv.password = require('readline-sync').question('Password? ', {
    hideEchoBack: true
  });
}

function autorespond() {
  var stateFile = 'appstate.json';
  if (fs.existsSync(stateFile)) {
    delete argv.username, argv.password;
    argv.appState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  }

  login(argv, function callback (err, api) {
    api.setOptions({
      logLevel: argv.logLevel
    });

    if (err) {
      log.error(err);
      process.exit(1);
    }
    fs.writeFileSync(stateFile, JSON.stringify(api.getAppState()));

    var threads = {};
    api.listen(function callback(err, message) {
      if (err) {
        log.warn(err);
      } else if (message.type == 'message') {
        var thread = threads[message.threadID] || {};
        if (!(message.senderID in thread)) {
          log.info('Received message from new sender: ', message.senderID);
          log.verbose('Message: ', message);
          api.sendMessage(argv.response, message.threadID);
          thread[message.senderID] = true;
          threads[message.threadID] = thread;
        } else {
          log.verbose('Ignoring message from known sender: ', message.senderID);
          log.verbose('Message: ', message);
        }
      }
    });
  });
}

// The keep-alive parameter forces the script to restart on at a given
// interval: this is currently needed for long-running instances because
// of a bug in the underlying library we are using.
// https://github.com/Schmavery/facebook-chat-api/issues/202
if (argv['restart']) {
  var fork = require('child_process').fork;
  var timeout = argv['restart'] * 60 * 1000;  // timeout in ms

  process.env['FB_AUTORESPOND_EMAIL'] = argv.email;
  process.env['FB_AUTORESPOND_PASSWORD'] = argv.password;
  process.env['FB_AUTORESPOND_RESPONSE'] = argv.response;
  process.env['FB_AUTORESPOND_LOG_LEVEL'] = argv.logLevel;

  var child = fork(argv['$0'], []);
  var i = 0;
  setInterval(function() {
    log.info('Restarting after ' + ++i * argv['restart'] + ' minutes');
    child.kill();
    child = fork(argv['$0'], []);
  }, timeout);

  child.on('close', (code, signal) => {
    if (code && !signal) {
      process.exit(code);
    }
  });
} else {
  autorespond();
}
