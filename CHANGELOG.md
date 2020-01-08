# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]

### Added
- set `stripTrailingSlash: true` on hapi’s `server.options.router`

### Changed
- update `hapi-request-utilities` dependency: `from 1.2.1 to 1.3.0`
  - adding [`request.has()`](https://superchargejs.com/docs/master/request-utilities#-code-request-has-keys-code-) and [`request.filled()`](https://superchargejs.com/docs/master/request-utilities#-code-request-filled-keys-code-) methods

### Removed
- deleted `handlebars-helper` due to security concerns


## [1.0.0-beta0.1](https://github.com/supercharge/framework/compare/v1.0.0-beta0...v1.0.0-beta0.1) - 2019-02-23

### Changed
- move required packages from `devDependencies` to `dependencies` (`package.json`)
- set publish config in `package.json` to public (required for scoped packages)


## 1.0.0-beta0 - 2019-02-23

First beta release :rocket: :tada:
