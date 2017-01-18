var fs = require('fs');
var login = require("facebook-chat-api");
var argv = require('yargs')
    .usage('Auto-respond to Facebook messages.\n')
    .env('FB_AUTORESPOND')
    .describe('response', 'The response to send on new messages')
    .describe('email', 'The email address to login with')
    .describe('password', 'The password to authenticate with')
    .describe('restart', 'An optional number of minutes to restart after')
    .demand('email')
    .demand('response')
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
    if (err) {
      console.error(err);
      process.exit(1);
    }
    fs.writeFileSync(stateFile, JSON.stringify(api.getAppState()));

    api.setOptions({
      forceLogin: true,
      logLevel: "warn"
    });

    var threads = {};
    api.listen(function callback(err, message) {
      if (err) {
        console.log(err);
      } else if (message.type == 'message') {
        var thread = threads[message.threadID] || {};
        if (!(message.senderID in thread)) {
          console.log('Received message from new sender: ', message);
          api.sendMessage(argv.response, message.threadID);
          thread[message.senderID] = true;
          threads[message.threadID] = thread;
        } else {
          console.log('Ignoring message from known sender: ', message);
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

  var child = fork(argv['$0'], []);
  var i = 0;
  setInterval(function() {
    console.log('Restarting after ' + ++i * argv['restart'] + ' minutes');
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
