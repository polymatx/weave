# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.0.x   | ✓         |

Until we reach 1.0, only the latest published minor will receive security fixes.

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Email the maintainer at the address listed on the GitHub profile
([@polymatx](https://github.com/polymatx)). Please include:

- A clear description of the issue
- Reproduction steps
- The version of `@polymatx/weave*` (or commit SHA) affected
- Any suggested fix or mitigation

You should expect an acknowledgement within 72 hours and a remediation plan
within 7 days. We will credit reporters in the changelog unless they ask to
remain anonymous.

## Scope

In scope:

- The `@polymatx/weave`, `@polymatx/weave-mcp`, and `@polymatx/weave-ui`
  packages and their published artefacts on npm.
- The local trace UI shipped with `@polymatx/weave-ui`.
- The example apps under `examples/`.

Out of scope:

- Vulnerabilities in upstream packages — please report those upstream.
- LLM-prompted bypasses of intended behavior. These are application concerns,
  not library vulnerabilities, unless they arise from a defect in weave itself.
- Issues that require a malicious local user with write access to the host.

## Disclosure

Once a fix is published and users have had a reasonable window to upgrade
(typically 14 days), we will publish a brief advisory on the repository's
Security tab summarizing the issue and the fix.
