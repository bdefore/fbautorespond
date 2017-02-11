const assert = require('assert');
const moment = require('moment');
const _ = require('lodash');

class Responder {
  constructor(options) {
    if (!options.api) {
      throw new Error('API instance not provided to Responder constructor');
    } else if (!options.response) {
      throw new Error('No response provided to Responder constructor');
    }
    this.threads = options.threads || {};
    this.api = options.api;
    this.response = options.response;
    this.log = options.log;
    this.forgetThreadsAfter = options.forgetThreadsAfter;
  }

  pruneOldThreads() {
    if (!this.forgetThreadsAfter) {
      return;
    }

    const now = moment();
    this.threads = _.pickBy(this.threads, value => value > now);
  }

  getThreadExpiryDate() {
    if (this.forgetThreadsAfter) {
      return moment().add(this.forgetThreadsAfter);
    }
    return moment('9999-12-30');
  }

  handleMessage(message) {
    assert(message.threadID, 'Invalid message, missing thread ID');
    assert(message.senderID, 'Invalid message, missing sender ID');
    this.pruneOldThreads();
    const thread = this.threads[message.threadID];
    if (!thread) {
      this.log.info('Received message in new thread:', message.threadID);
      this.log.verbose('Message:', message);
      this.api.sendMessage(this.response, message.threadID);
      this.threads[message.threadID] = this.getThreadExpiryDate();
    } else {
      this.log.verbose('Ignoring message in thread: ', message.threadID);
      this.log.verbose('Message: ', message);
    }
  }
}

exports.Responder = Responder;
