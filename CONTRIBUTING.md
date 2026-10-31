# Add a CVE module

From a configured cradle-lib-cve checkout, import your existing module and generate
its documentation with one command:

```powershell
npm run library:new -- cve CVE-2026-12345 --from "C:\path\to\MyCve" --generate-index
```

Replace the example CVE ID and source folder with your own. The source folder
contains your working module: its matching `manifest.json`,
`ansible/CVE-2026-12345.j2`, and any supporting files or README.

The command copies the module into `CVE-2026-12345/`, leaves your original folder
unchanged, and writes `index.md` using the
[website heuristic template](https://github.com/cradle-lang/cradle-lang.github.io/blob/main/library/_templates/heuristic/index.md).
The generator's portable copy is `library/_templates/heuristic/index.md` in this
repository. It fills in the CVE identity automatically and uses your README,
manifest and implementation to describe the module. It does not generate or test
the implementation. An existing authored `index.md` is preserved; existing module
folders are never overwritten.

Review the generated article, correct any unsupported claims and complete
attribution/licensing. Generated articles start with `draft: true`; set
`draft: false` when the article is ready to appear on the website. Submit the
complete module folder, including `index.md`, in a PR to this repository.

After validation and source merge, automation prepares a separate website review
PR. The website receives only `index.md` and the module-folder link, along with
internal identity/provenance metadata. Implementation templates, manifests,
scripts and binaries stay in cradle-lib-cve. Relative article links point back to
the source commit. Website publication follows website PR merge and deployment.

Selected module text is sent to the configured LLM server to generate the article;
remove credentials from source before importing. Hidden files are excluded from
import, and binary/image contents are not sent to the generator.

Maintainer setup, validation, recovery and LLM configuration are documented in
[the automation reference](./docs/automation.md).

## Documentation quality

Run `npm run docs:check` before submitting. It checks Markdown and MDX using the
same `.markdownlint.json` rules as the website, including new unstaged documents.
Ignored/generated files and CI dependency checkouts are excluded. Errors identify
the file, line and rule; fix the source rather than weakening the rules.

GitHub exposes a separate **Docs Quality / markdownlint** check on PRs, main pushes
and manual runs. `npm run check` also runs it before validation and website export,
so documentation-quality failures prevent the automated website handoff.
