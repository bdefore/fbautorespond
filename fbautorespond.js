var fs = require('fs');
var login = require("facebook-chat-api");
var log = require('npmlog');
var argv = require('yargs')
    .usage('Auto-respond to Facebook messages.\n')
    .env('FB_AUTORESPOND')
    .describe('response', 'The response to send on new messages')
    .describe('email', 'The email address to login with')
    .describe('password', 'The password to authenticate with')
    .describe('relogin', 'An optional number of minutes to relogin after')
    .describe('log-level', '[error|warn|info|verbose] - defaults to info')
    .demand('email')
    .demand('response')
    .default('log-level', 'info')
    .check(function(argv) {
      log.level = argv.logLevel;
      return ['error', 'warn', 'info', 'verbose'].includes(argv.logLevel);
    })
    .argv;

function autorespond() {
  var stopListening;
  var logout;

  var stateFile = 'appstate.json';
  if (fs.existsSync(stateFile)) {
    delete argv.username, argv.password;
    argv.appState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } else if (!argv.password) {
    argv.password = require('readline-sync').question('Password? ', {
      hideEchoBack: true
    });
  }

  function stop(callback) {
    if (stopListening) {
      stopListening();
    }
    if (logout) {
      logout(callback);
    } else {
      callback();
    }
  }

  login(argv, function callback (err, api) {
    if (err) {
      log.error(err);
      process.exit(1);
    }
    fs.writeFileSync(stateFile, JSON.stringify(api.getAppState()));
    logout = api.logout;

    var threads = {};
    stopListening = api.listen(function callback(err, message) {
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
  return stop;
}

// The keep-alive parameter forces the script to re-login at a given
// interval: this is currently needed for long-running instances
// because of a bug in the underlying library we are using.
// https://github.com/Schmavery/facebook-chat-api/issues/202
if (argv['relogin']) {
  var i = 0;
  var timeout = argv['relogin'] * 60 * 1000;  // timeout in ms
  var stop = autorespond();

  setInterval(function() {
    log.info('Refreshing login ' + ++i * argv['relogin'] + ' minutes');
    stop(function() {
      stop = autorespond();
    });
  }, timeout);
} else {
  autorespond();
}
