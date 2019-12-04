Resting is a rest client WebExtension actually available for Firefox.

It is a very young project under an heavy developement.

## Mission
The mission of Resting is to simplify daily work of developer in testing and analyzing HTTP/Rest requests.

Resting takes inspiration from Postman with the goal to be light and focused on the management of saved requests.

## Roadmap

The road to v1.0.0

- [ ] Load multiple bookmarks in tabs [#42](https://github.com/mirkoperillo/resting/issues/42) 
- [x] Import/export saved bookmarks [#87](https://github.com/mirkoperillo/resting/issues/87)
- [x] Import from HAR format [#51](https://github.com/mirkoperillo/resting/issues/51)
- [x] Add Oauth 2.0 authentication [#81](https://github.com/mirkoperillo/resting/issues/81)
- [x] Add JWT authentication [#83](https://github.com/mirkoperillo/resting/issues/83)

Actually working on [v0.15.0](https://github.com/mirkoperillo/resting/projects/6)

## Quickstart

### Official release

Actually Resting is released only for Mozilla Firefox.
You can install it here [here](https://addons.mozilla.org/en-US/firefox/addon/resting?src=external-github)

### Test development version 

You can install Resting from the source code following these instructions:

1. `git clone https://github.com/mirkoperillo/resting.git`
2. `cd resting/scripts && ./build-unsigned.sh`
3. Go to the addons page in Firefox and click `Install Add-on From File`

### Setup a development environment

**Requirement**: You need Firefox Dev Edition.

1. `git clone https://github.com/mirkoperillo/resting.git`
2. Open Firefox Dev Edition
3. Visit url `about:debugging`
4. Load temporary Addon
5. Navigate your filesystem and select the manifest file in the addon
6. The addon is loaded in the toolbar


## Tech Stack
* Knockout.js 3.x: MVVM framework
* Bootstrap 3.x: UI framework
* highlight.js: response highlighter
* localforage: storage manager
* JQuery 3.x:  essentially used to perform http requests

## Principles
Project tries to follow these principles:
* KISS and YAGNI trying to maintain project light in code and libraries
* Keep the focus on result: the development cycle is composed by two steps: the first takes deliberately technological debt to ship features in a quick way, the second applies a phase of refactor to maintain the code clean.

The project follows the semantic versioning

## Contribution

* Use it! :smiley:
* Signal a bug
* Suggest a new feature or an improvement of an existing one
* This project is community friendly: put a :+1: on a feature or an improvement. Issues with a lot of votes will be put on the top of the todo stack 
* A cup of coffee: [paypal](https://www.paypal.me/mirkoperillo) | [liberapay](https://liberapay.com/mirkoperillo)
* Star the project :star2:

## License

Resting is under MIT license
