# [Apps Launcher - Chrome extension](https://chrome.google.com/webstore/detail/apps-launcher/ijmgkhchjindcjamnckoiahagecjnkdc)

> *Launch Chrome apps using a fancy popup. Reorder them as you like.*

![alt Apps Launcher extension screenshot](https://lh3.googleusercontent.com/SOvqm3KxGS-uonXKorAS8LUiqQqw_T936_8I-BJBSVFYF-rDnxpooqCIp2eg71Kkte9JzOchRA=s640-h400-e365-rw)

## Features
- googlish look
- drag'n'drop apps reordering
- keyboard navigation - arrows + enter to launch + delete to uninstall
- icon color customization
- set launcher width and apps per row number
- app labels on and off

## Install

From [Chrome WebStore](https://chrome.google.com/webstore/detail/apps-launcher/ijmgkhchjindcjamnckoiahagecjnkdc)

## Place it on the desktop

I don't know whether it's a bug or feature in Chrome, however @brandoncomputer found a way to launch Chrome extension's window like a standalone app [#49](https://github.com/gregolsky/chrome-app-launcher/issues/49). To do so one needs to run Chrome with `--app` switch like this:

`/path/to/google-chrome --app="chrome-extension://ijmgkhchjindcjamnckoiahagecjnkdc/popup.html"`

So under Unix-like OS you could use the following script:
```sh
#!/bin/bash
`which google-chrome` --app="chrome-extension://ijmgkhchjindcjamnckoiahagecjnkdc/popup.html"
```

And on Windows one needs to create a shortcut LNK file running Chrome with the above parameter.

## Build

```
$ npm install
$ gulp
```
