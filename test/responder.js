/* global describe it */
const Responder = require('../lib/responder').Responder;
const sinon = require('sinon');
const moment = require('moment-parser');

require('chai').should();

function createResponder(options) {
  return new Responder({
    api: {
      sendMessage: options.sendMessage,
    },
    response: options.response,
    log: {
      info: () => {},
      verbose: () => {},
    },
    threads: options.threads,
    forgetThreadsAfter: options.forgetThreadsAfter,
  });
}

describe('Responder', () => {
  const response = 'Sorry, I don\'t use facebook any more';

  describe('Message handling', () => {
    it('should autorespond to messages in a new thread', () => {
      const threadId = 1;
      const sendMessage = sinon.spy();
      const responder = createResponder({
        response,
        sendMessage,
      });
      responder.handleMessage({
        threadID: threadId,
      });
      sendMessage.callCount.should.be.equal(1);
      sendMessage.calledWith(response, threadId).should.be.equal(true);
    });

    it('should ignore new messages in a known thread', () => {
      const threadId = 1;
      const sendMessage = sinon.spy();
      const threads = {};
      threads[threadId] = true;
      const responder = createResponder({
        response,
        sendMessage,
        threads,
      });
      responder.handleMessage({
        threadID: threadId,
      });
      sendMessage.callCount.should.be.equal(0);
    });
  });

  describe('Forgetting threads', () => {
    it('should not re-respond to known threads before a timeout if one is specified', () => {
      const threadId = 1;
      const sendMessage = sinon.spy();
      const responder = createResponder({
        response,
        sendMessage,
        forgetThreadsAfter: moment.parseDuration('1 day'),
      });
      responder.handleMessage({
        threadID: threadId,
      });
      responder.handleMessage({
        threadID: threadId,
      });
      sendMessage.callCount.should.be.equal(1);
      sendMessage.calledWith(response, threadId).should.be.equal(true);
    });

    it('should forget threads after a timeout if one is specified', () => {
      const threadId = 1;
      const sendMessage = sinon.spy();
      const responder = createResponder({
        response,
        sendMessage,
        forgetThreadsAfter: moment.parseDuration('0 days'),
      });
      responder.handleMessage({
        threadID: threadId,
      });
      responder.handleMessage({
        threadID: threadId,
      });
      sendMessage.callCount.should.be.equal(2);
      sendMessage.calledWith(response, threadId).should.be.equal(true);
    });
  });
});
