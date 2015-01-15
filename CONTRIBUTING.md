<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [Contribution Guidelines](#contribution-guidelines)
  - [Adding Code](#adding-code)
    - [Process](#process)
  - [Creating issues](#creating-issues)
    - [Bug Issues](#bug-issues)
    - [Feature Issues](#feature-issues)
    - [Assignees](#assignees)
    - [Milestones](#milestones)
    - [Labels](#labels)
    - [Some good ways to make sure it's not missed:](#some-good-ways-to-make-sure-its-not-missed)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Contribution Guidelines

Please, [behave yourself](https://github.com/gulpjs/gulp/blob/master/CONTRIBUTING.md#conduct).

## Adding Code
* Follow the style of the code already present. Your code should pass the specs laid out in `.jshintrc`, `.jscs.json` and `.editorconfig`. You can ensure it does so by running `npm i && npm run lint`.
* If you make an API change, please update `README.md`

### Process
1. Fork the Repo
2. Add a test for your change. This test should fail before your change is implemented and succeed after.
2. All tests should pass.
3. Send a pull request.

## Creating issues
GitHub issues can be treated like a massive, communal todo list. If you notice something wrong, toss an issue in and we'll get to it!

**TL;DR Put issues into the right milestone if available. Don't create new milestones or labels. Talk to the responsible person on a milestone before adding issues to a milestone that have a due date.**

### Bug Issues
* mark with the "bug" label
* The following things are helpful
    * screenshots with a description showing the problem.
    * js console or server logs
    * contact information of users who experienced this request
    * the time of the bug so that relevant logs can be found
* The following thins should always be included
    * the steps it would take to reproduce the issue
    * what happened when you followed those steps
    * what you expected to happen that didn't

### Feature Issues
Should be marked with the "enhancement" label

### Assignees
Assignees are responsible for completing an issue. Do not assign a person to an issue unless they agree to it. Generally, people should assign themselves.

### Milestones
* If your issue fits into a milestone please add it there. Issues with no milestone are fine – they'll be gone through periodically and assigned.
* Creation of new milestones is by group consensus only. Don't do it on your own.
* A milestone with a due date should have a "responsible person" listed in the description. That doesn't mean that person is the sole person to work on it, just that they're the one responsible for coordinating efforts around that chunk of work.
* → Once a milestone has a due date, only issues okay'd by the responsible person can be added. This ensures that a chunk of work can be delivered by the promised due date.

### Labels
* issues don't get the "prioritize this!" or "CRITICAL" unless they really apply. "I want this new feature now" does not qualify as important. Generally, these labels should only be applied by people setting up a batch of work. Abuse these labels and they'll be come meaningless.
* Creation of new labels is by group consensus. Don't do it on your own!

### Some good ways to make sure it's not missed:
* try to add any appropriate labels.
* If this is a browser bug, add the "browser label", and prefix your issue title with the browser version and the URL you encountered the problem on. e.g. `IE 9: /wisps/xxx can't click on the search input`
* screenshots are always handy
* If your issue is urgent, there's probably a milestone that it belongs in.
