var fs = require('fs');
var login = require("facebook-chat-api");
var argv = require('optimist')
    .usage('Auto-respond to Facebook messages.\n')
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
  var threads = {};
  api.listen(function callback(err, message) {
    if (err) {
      console.log(err);
    } else if (message.type == 'message') {
      var thread = threads[message.threadID] || {};
      if (!(message.senderID in thread)) {
	api.sendMessage({
	  body: argv.response
	}, message.threadID);
	thread[message.senderID] = true;
	threads[message.threadID] = thread;
      }
    }
  });
});
