#!/bin/bash
# strict mode http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

function git_require_clean_work_tree(){
  # Update the index
  git update-index -q --ignore-submodules --refresh
  err=0

  # Disallow unstaged changes in the working tree
  if ! git diff-files --quiet --ignore-submodules --
  then
      echo >&2 "You have unstaged changes."
      git diff-files --name-status -r --ignore-submodules -- >&2
      err=1
  fi

  # Disallow uncommitted changes in the index
  if ! git diff-index --cached --quiet HEAD --ignore-submodules --
  then
      echo >&2 "Your index contains uncommitted changes."
      git diff-index --cached --name-status -r --ignore-submodules HEAD -- >&2
      err=1
  fi

  if [ $err = 1 ]
  then
      echo >&2 "Please commit or stash them."
      exit 1
  fi
}

function find_changelog_file(){
  # find the changelog file
  CHANGELOG=""
  if test "$CHANGELOG" = ""; then
    CHANGELOG=$(ls | egrep '^(change|history)' -i | head -n1)
    if test "$CHANGELOG" = ""; then
      CHANGELOG='CHANGELOG.md';
    fi
  fi
  echo $CHANGELOG
}

function find_last_git_tag(){
  echo $(git describe --abbrev=0 --tags)
}

# based on https://github.com/tj/git-extras/blob/master/bin/git-changelog
function generate_git_changelog(){
  GIT_LOG_OPTS="--no-merges"
  DATE=$(date +'%Y-%m-%d')
  HEAD='## '

  # get the commits between the most recent tag and the second most recent
  lasttag=$(find_last_git_tag)
  version=$(git describe --tags --abbrev=0 $lasttag 2>/dev/null)
  previous_version=$(git describe --tags --abbrev=0 $lasttag^ 2>/dev/null)
  if test -z "$version"; then
    head="$HEAD$DATE"
    changes=$(git log $GIT_LOG_OPTS --pretty="format:* %s%n" 2>/dev/null)
  else
    head="$HEAD$version | $DATE"
    changes=$(git log $GIT_LOG_OPTS --pretty="format:* %s%n" $previous_version..$version 2>/dev/null)
  fi

  CHANGELOG=$(find_changelog_file)

  # insert the changes after the header (assumes markdown)
  # this shells out to node b/c I couldn't figure out how to do it with awk
  tmp_changelog=/tmp/changelog
  node -e "console.log(require('fs').readFileSync(process.argv[1]).toString().replace(/(#.*?\n\n)/, '\$1' + process.argv.slice(2).join('\n') + '\n\n'))" $CHANGELOG $head $changes > $tmp_changelog

  # open the changelog in the editor for editing
  test -n "$EDITOR" && $EDITOR $tmp_changelog
  mv $tmp_changelog $CHANGELOG
}

function git_ammend_tag(){
  git add $(find_changelog_file)
  git commit --amend --no-edit --no-verify
  git tag $(find_last_git_tag) -f
}

function npm_release(){
  npm run prePublish && npm run gitPull && npm version $@ && generate_git_changelog && git_ammend_tag && npm run gitPush && npm publish
}
