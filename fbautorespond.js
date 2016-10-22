var fs = require('fs');
var login = require("facebook-chat-api");
var argv = require('yargs')
    .usage('Auto-respond to Facebook messages.\n')
    .env('FB_AUTORESPOND')
    .describe('response', 'The response to send on new messages')
    .describe('email', 'The email address to login with')
    .describe('password', 'The password to authenticate with')
    .demand('email')
    .demand('response')
    .argv;
if (!argv.password) {
  argv.password = require('readline-sync').question('Password? ', {
    hideEchoBack: true
  });
}

login(argv, function callback (err, api) {
  if(err) {
    return console.error(err);
  }

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
