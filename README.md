![Icon](src/icons/letter-r_64.png)

Resting is a rest client WebExtension actually available for Firefox.

It is a very young project under an heavy developement.

## Mission
The mission of Resting is to simplify daily work of developer in testing and analyzing HTTP/Rest requests.

Resting takes inspiration from Postman with the goal to be light and focused on the management of saved requests.

## Privacy
Data is yours.
Resting doesn't save in any servers data about the APIs you invoke or any other data about the usage of Resting.
Everything is store offline on your device, all the data is saved locally in the Indexed DB of your browser

## Roadmap

It' time to plan the next major version of Resting.

Please help me filling the following quick [survey](https://forms.gle/TotSJZc6EUpiX9kQA) (only 5 questions)

Any help is appreciated

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
* A cup of coffee: [paypal](https://www.paypal.me/owlcodesw) | [liberapay](https://liberapay.com/mirkoperillo)
* Star the project :star2:

## License

Resting is released under GPL v3 license after commit [117e15a33e97bc9c0905139ca527398e77e79620](https://github.com/mirkoperillo/resting/commit/117e15a33e97bc9c0905139ca527398e77e79620)

Resting has released under MIT license until [v1.0.2](https://github.com/mirkoperillo/resting/releases/tag/1.0.2)

### Why I changed license

I know Resting will never be a breakdown project, it is only a personal project and so the license change is only an ethical-political action.

I created Resting to solve my needs and to help users with needs like me. My intent is to create a little community of users and contributors around the project to grow it up and  so I want the project to stay free and accessible forever even when I will be no longer the main maintainer.
