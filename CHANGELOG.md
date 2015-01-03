# Changelog

## 1.4.0
* Updated aliasify to support `jsx` files.

## 1.3.0
* `path.join` should no longer be required for cross-platform use.

## 1.2.0
* better relative path handling

## 1.1.1
* Tests now pass on windows again

## 1.1.0
* Adds ability to filter out files from aliasing

## 1.0.0
* Reworked options so that `src` and `cwd` shouldn't conflict.
* Leaned more heavily on `path` for probably windows compatibility.
* now works with other extensions (e.g. `hbs`)

## 0.1.6
Enhancement: now aliases with and without the `.js` extension. Allows for `require('a.js')` and `require('a')`, which are equivalent.

## 0.1.5
Bug fix: it was possible to not actually transform the bundle.

## 0.1.4
Initial release. Docs complete, tests pass, and module structure in place. This was my first use of gulp, so there's a lot of 0.0.* commits while I worked out the release process.

## 0.0.0
Init
