# Security Policy

QuestPad is a personal, single-family project. There's no bug bounty
program, but responsible disclosure is welcome.

## Reporting a vulnerability

Please do **not** open a public GitHub issue for security reports. Instead:

- Use GitHub's [private vulnerability reporting](https://github.com/madmmas/questpad/security/advisories/new)
  for this repo, or
- Open an issue titled "Security contact needed" with no details, and the
  maintainer will follow up to arrange a private channel.

## Scope notes

This app is designed to store a child's submitted work and images. If you
find a way to access another user's data, bypass the PIN-based auth, or
leak secrets (API keys, database credentials) through the app, that's a
valid report even if it seems minor.

## Supported versions

This project doesn't yet have tagged releases — treat `main` as the only
supported version.
