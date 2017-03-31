/* global describe it */
const Responder = require('../lib/responder').Responder;
const sinon = require('sinon');
const moment = require('moment-parser');

require('chai').should();

function createResponder(options) {
  return new Responder({
    api: {
      sendMessage: options.sendMessage,
      getUserInfo: options.getUserInfo || ((ids, callback) => {
        callback(null, options.users);
      }),
    },
    response: options.response,
    log: {
      info: () => {},
      verbose: () => {},
      error: () => {},
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
        users: {
          1: {
            firstName: 'Jamie',
          },
        },
      });
      responder.handleMessage({
        threadID: threadId,
        senderID: 1,
      });
      sendMessage.callCount.should.be.equal(1);
      sendMessage.calledWith(response, threadId).should.be.equal(true);
    });

    it('should substitute the senders name in the message template', () => {
      const threadId = 1;
      const userId = 1;
      const sendMessage = sinon.spy();
      const responder = createResponder({
        response: 'Hello {{sender}}',
        sendMessage,
        users: {
          1: {
            firstName: 'Jamie',
          },
        },
      });
      responder.handleMessage({
        threadID: threadId,
        senderID: userId,
      });
      sendMessage.callCount.should.be.equal(1);
      sendMessage.calledWith('Hello Jamie', threadId).should.be.equal(true);
    });

    it('should ignore new messages in a known thread', () => {
      const threadId = 1;
      const userId = 1;
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
        senderID: userId,
      });
      sendMessage.callCount.should.be.equal(0);
    });

    it('should not repond when user info cannot be fetched', () => {
      const threadId = 1;
      const userId = 1;
      const sendMessage = sinon.spy();
      const getUserInfo = (ids, cb) => {
        cb(new Error('Error fetching user info'));
      };
      const responder = createResponder({
        response,
        sendMessage,
        getUserInfo,
      });
      responder.handleMessage({
        threadID: threadId,
        senderID: userId,
      });
      sendMessage.callCount.should.be.equal(0);
    });
  });

  describe('Forgetting threads', () => {
    it('should not re-respond to known threads before a timeout if one is specified', () => {
      const threadId = 1;
      const userId = 1;
      const sendMessage = sinon.spy();
      const responder = createResponder({
        response,
        sendMessage,
        forgetThreadsAfter: moment.parseDuration('1 day'),
        users: {
          1: {
            firstName: 'Jamie',
          },
        },
      });
      responder.handleMessage({
        threadID: threadId,
        senderID: userId,
      });
      responder.handleMessage({
        threadID: threadId,
        senderID: userId,
      });
      sendMessage.callCount.should.be.equal(1);
      sendMessage.calledWith(response, threadId).should.be.equal(true);
    });

    it('should forget threads after a timeout if one is specified', () => {
      const threadId = 1;
      const userId = 1;
      const sendMessage = sinon.spy();
      const responder = createResponder({
        response,
        sendMessage,
        forgetThreadsAfter: moment.parseDuration('0 days'),
        users: {
          1: {
            firstName: 'Jamie',
          },
        },
      });
      responder.handleMessage({
        threadID: threadId,
        senderID: userId,
      });
      responder.handleMessage({
        threadID: threadId,
        senderID: userId,
      });
      sendMessage.callCount.should.be.equal(2);
      sendMessage.calledWith(response, threadId).should.be.equal(true);
    });
  });
});
