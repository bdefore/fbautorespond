# fbautorespond

A simple script to auto-respond to Facebook messages.

## Description

I don't use Facebook but many of my friends do.  I wanted a way to let
my friends know that I would not receive their messages unless they
sent them some other way.

This script allows you to set up a simple auto-responder that will be sent 
when a new conversation is started with you on Facebook messenger.

## Usage

Command line usage is as follows:

```
$ node fbautorespond.js
Auto-respond to Facebook messages.

Options:
  --response  The response to send on new messages                    [required]
  --email     The email address to login with                         [required]
  --password  The password to authenticate with
```

## Hosting

The script is [Dockerized](https://hub.docker.com/r/jamiekp/fbautorespond/)
for easy deployment on a server somewhere. You can configure the script by 
setting the following environment variables:

* `FB_AUTORESPOND_RESPONSE`
* `FB_AUTORESPOND_EMAIL`
* `FB_AUTORESPOND_PASSWORD`

## Credits

- All the heavy lifting is done using the
[facebook-chat-api](https://github.com/Schmavery/facebook-chat-api) module.
