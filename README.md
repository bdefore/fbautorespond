# fbautorespond

A simple script to auto-respond to Facebook messages.

## Description

I don't use Facebook but many of my friends do.  I wanted a way to let my friends know that I would not receive their messages unless they sent them some other way.

This script allows you to set up a simple auto-responder that will be sent when a new conversation is started with you on Facebook messenger.

## Usage

To configure the the script to run locally:

- Ensure you have `node.js` installed on your host machine.
- Checkout the repository or download the [source](https://github.com/jkp/fbautorespond/archive/master.zip)
- From the project directory run `npm install`.

Then, command line usage is as follows:

```
$ node fbautorespond.js
Auto-respond to Facebook messages.

Options:
  --response  The response to send on new messages                    [required]
  --email     The email address to login with                         [required]
  --password  The password to authenticate with
```

### Two-factor login

Two-factor login is not implemented right now though it [is supported[(https://github.com/Schmavery/facebook-chat-api/blob/master/DOCS.md#login) by the underlying library I use to interact with Facebook so it shouldn't be too hard to handle it if needed.  Feel free to submit a pull-request if you have the time to make it work.

## Hosting

The script is [Dockerized](https://hub.docker.com/r/jamiekp/fbautorespond/) for easy deployment on a server somewhere. You can configure the script by setting the following environment variables:

* `FB_AUTORESPOND_RESPONSE`
* `FB_AUTORESPOND_EMAIL`
* `FB_AUTORESPOND_PASSWORD`

## Credits

- All the heavy lifting is done using the [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api) module.
