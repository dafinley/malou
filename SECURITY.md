# Security policy

Molou is a static, client-side educational app — it does not collect data, persist user input server-side, or expose privileged APIs. The attack surface is therefore small. We still take reports seriously.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security reports.

Instead, report privately via one of:

- GitHub Security Advisories: open a draft advisory on this repository.
- Email the maintainers at the address listed in the repository profile.

Include:

- A description of the issue and the impact you believe it has.
- Reproduction steps or a minimal proof of concept.
- Your name and whether you would like public credit.

We aim to acknowledge reports within 72 hours and to ship a fix or mitigation within 30 days for issues we accept.

## Supported versions

Only the `main` branch is supported. There are no LTS releases of Molou.

## Out of scope

- Vulnerabilities in third-party dependencies for which an upstream advisory already exists — please report those upstream first and notify us only if Molou is materially affected.
- Issues that require physical access to a user's device.
- Reports against forks or copies of Molou that are not maintained by this project.
