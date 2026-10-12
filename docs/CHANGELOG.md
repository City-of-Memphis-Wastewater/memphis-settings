# Changelog

All notable changes to this project will be documented in this file.

The format is (read: strives to be) based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.0.6] – 2026-10-12

### Added:

- Add CLI help svg script and asset, with reference in README.
- Documentation regarding asymmetry between .env default placement and directory argument behavior, versus nested appDir argument behavior.

### Changed:

- Consolidated bootstrap functions into centralized src/bootstrap.ts.
- Change bootstrap function references in src/index.ts.
- Remove old bootstrap.ts files like src/lib/memphis-env/bootstrap.ts, etc.


---

## [0.0.5] – 2026-10-9

### Changed:

- Enhance documentation in CLI help and README.

---

## [0.0.4] – 2026-10-9

### Changed:

- CLI now supports --dir flag for env sub command and --app-dir for secret and config sub commands.

### Added:

- Tests
