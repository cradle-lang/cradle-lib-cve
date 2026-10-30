# CVE automation reference for maintainers

The contributor-facing workflow is the single `--generate-index` import command
in [CONTRIBUTING.md](../CONTRIBUTING.md). The commands and setup below are
maintainer reference, not additional contributor steps.

This repository is the authoring source for CVEs. The old scheduled mirror from
`cradle-lib/heuristics/cve` is removed so imports and reviewed articles cannot be
overwritten. Author configurations and TTPs in cradle-lib; author CVEs here.
Existing CVE copies under cradle-lib are not updated by this repository. Consumers
should resolve CVE content from cradle-lib-cve when adopting this authoring flow.

Install Node.js 22+, Git and npm. From this checkout, create a branch such as
`add-my-cve` and run `npm ci`.

## Copy an existing module and generate its article

Prepare a module directory with `manifest.json`,
`ansible/CVE-2026-12345.j2`, and any supporting files or README. The manifest must
declare `framework: "cve"`, `value: "CVE-2026-12345"`, `configs: []` (or actual
configuration dependencies), and paired `os`/`os_version` values or nulls.

```powershell
npm run library:new -- cve CVE-2026-12345 --from "C:\Users\bryan\Downloads\MyCve" --generate-index
```

The module is copied into `CVE-2026-12345/`. The original folder is unchanged.
Hidden files (including `.env`/`.git`), node_modules and Python caches are skipped;
other files, including binaries, are preserved. Selected symbolic links are
rejected. Existing module folders are never overwritten.

`--generate-index` is optional. Without it, the importer creates an `index.md`
draft from `library/_templates/heuristic/index.md`, copied from the website's
heuristic template. An authored source `index.md` is preserved even when generation
is requested. Read and edit the generated article; it describes existing code,
it does not create a working CVE implementation.

To generate an article for an existing module, preserving its README:

```powershell
npm run library:describe -- CVE-2021-44228
# Explicitly replace an existing index.md:
npm run library:describe -- CVE-2021-44228 --force
```

For optional generation, copy `.env.example` to `.env` and configure `SERVER`,
`REMOTE_LLM_MODEL`, and `REMOTE_LLM_API_KEY` for an OpenAI-compatible endpoint.
Alternatively configure `OPENAI_API_KEY` and `OPENAI_MODEL`. Never commit `.env`.
Generation sends selected module text to that server; remove credentials from
source beforehand. Hidden and TOML files are excluded from LLM input. Binary/image
contents are not sent. Text is limited by `LLM_MAX_INPUT_CHARS` (default 100000).
The article records omissions/truncation. Source content is reference data, not
instructions. No source scripts are executed. API/format/link failures preserve
the old article; an unsuccessful import generation keeps copied files and its
starter article for retry. Concurrent edits are preserved.

## Review, validate and publish

Keep these fields in index.md (or README.md when there is no index.md):

```yaml
---
title: My CVE module
description: Describe the implemented module and its purpose.
framework: cve
identifier: CVE-2026-12345
draft: true
---
```

Generated articles always start as drafts. Set `draft: false` after reviewing
facts, setup, dependencies, validation evidence, attribution and licensing.
Legacy READMEs without metadata remain published: the title comes from the first
heading and the description from the first prose paragraph. `index.md` takes
precedence. Keep names/IDs consistent; use Markdown attachment links.

```powershell
npm run check
npm run library:export-website
```

Checks include draft modules, manifest identities, required templates and article
links. CI also checks that manifest-implied configurations exist in cradle-lib.
They do not render templates, compile scenarios, deploy machines, check remote
downloads or execute exploits. Record separate runtime tests honestly.

Commit the module and article, then open a PR into main. Successful full main
validation exports an immutable `website-cves` artifact and requests a separate
website PR. The website verifies the source run/revision, imports articles, checks
TypeScript and tests, and builds before creating/updating `cve-library-sync`.
Merge that review PR to publish through Pages. Source merges alone do not publish.
Removed/renamed managed entries are drafted on the website, preserving assets.

The website receives module names, source-folder links and articles only. Templates,
manifests and binaries remain here. Relative links are rewritten to this repository
at the exported commit. Local images become source image links rather than embeds.
Articles without a `Use in a specification` section receive a standard CRADLE
fragment using their exact CVE identifier; it does not claim runtime verification.
Export normalizes unordered list markers and supplies `text` for unlabeled code
fences without changing code contents. Both local checks and CI lint the exported
articles using the website's Markdown rule snapshot before uploading the bundle.

## Integration setup and recovery

Merge the website receiver PR before enabling the source notification. Configure
`CRADLE_LANG_TOKEN` in this repository with Contents write on the website. On the
website, the same secret needs Actions/Contents read here and Contents/Pull requests
write on the website. Use a token/app authorized for both repositories; do not use
the website GITHUB_TOKEN for cross-repository downloads. Require source `validate`
and website build checks through repository rules. Secrets/settings are not created
by these code changes.

The bundle expires after 14 days. Retry failed receiver runs through its manual
workflow with the latest successful main validation run ID. For expired bundles,
manually run `Validate CVE library` on main; it always validates/exports every module,
and its successful run is eligible for notification and import. PR/fork runs and
non-main runs cannot supply website content.
