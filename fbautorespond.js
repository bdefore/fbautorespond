const fs = require('fs');
const log = require('npmlog');
const login = require('facebook-chat-api');
const readline = require('readline-sync');
const moment = require('moment-parser');
const Responder = require('./lib/responder').Responder;
const argv = require('yargs')
      .usage('Auto-respond to Facebook messages.\n')
      .env('FB_AUTORESPOND')
      .describe('response', 'The response to send on new messages')
      .describe('email', 'The email address to login with')
      .describe('password', 'The password to authenticate with')
      .describe('relogin', 'The number of minutes to relogin after')
      .describe('forget-threads-after', 'Time to wait before forgetting threads')
      .describe('log-level', '[error|warn|info|verbose] - defaults to info')
      .coerce('forget-threads-after', arg => moment.parseDuration(arg))
      .demand('email')
      .demand('response')
      .default('log-level', 'info')
      .check((args) => {
        log.level = args.logLevel;
        return ['error', 'warn', 'info', 'verbose'].includes(args.logLevel);
      })
      .argv;

function autorespond() {
  let stopListening;

  const stateFile = 'appstate.json';
  if (fs.existsSync(stateFile)) {
    delete argv.username;
    delete argv.password;
    argv.appState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } else if (!argv.password) {
    argv.password = readline.question('Password? ', {
      hideEchoBack: true,
    });
  }

  function stop(callback) {
    if (stopListening) {
      stopListening();
    }
    callback();
  }

  login(argv, (err, api) => {
    if (err) {
      log.error(err);
      process.exit(1);
    }
    fs.writeFileSync(stateFile, JSON.stringify(api.getAppState()));
    const responder = new Responder({
      api,
      log,
      response: argv.response,
    });
    stopListening = api.listen((listenErr, message) => {
      if (listenErr) {
        log.warn(listenErr);
      } else if (message.type === 'message') {
        responder.handleMessage(message);
      }
    });
  });
  return stop;
}

// The keep-alive parameter forces the script to re-login at a given
// interval: this is currently needed for long-running instances
// because of a bug in the underlying library we are using.
// https://github.com/Schmavery/facebook-chat-api/issues/202
if (argv.relogin) {
  let i = 0;
  const timeout = argv.relogin * 60 * 1000;  // timeout in ms
  let stop = autorespond();

  setInterval(() => {
    i += 1;
    log.info(`Refreshing login ${i * argv.relogin} minutes`);
    stop(() => {
      stop = autorespond();
    });
  }, timeout);
} else {
  autorespond();
}
