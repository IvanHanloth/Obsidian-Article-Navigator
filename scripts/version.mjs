// Single source of truth for keeping the plugin version in sync across files.
//
// Usage:
//   node scripts/version.mjs check <tag>      Verify every file matches <tag>; exit 1 on mismatch.
//   node scripts/version.mjs apply <version>  Write <version> into every file (in place).
//
// The version may be passed as an argument, or via the TAG / GITHUB_REF_NAME env vars.
// A leading "v" is stripped so both "1.2.3" and "v1.2.3" are accepted; the canonical
// form (no "v") is what gets written to the files and used for comparison — this matches
// the Obsidian requirement that the git tag equals manifest.json "version" exactly.

import { readFileSync, writeFileSync } from "node:fs";
import process from "process";

const PKG = "package.json";
const MANIFEST = "manifest.json";
const VERSIONS = "versions.json"; // map of { pluginVersion: minAppVersion }, not a "version" field

function readJson(path) {
	const raw = readFileSync(path, "utf8");
	return { raw, data: JSON.parse(raw) };
}

// Preserve the file's existing indentation and line endings so diffs stay minimal.
function detectIndent(raw) {
	const m = raw.match(/^([ \t]+)/m);
	if (!m) return "\t";
	return m[1].includes("\t") ? "\t" : m[1].length;
}

function writeJson(path, raw, data) {
	const eol = raw.includes("\r\n") ? "\r\n" : "\n";
	let out = JSON.stringify(data, null, detectIndent(raw));
	if (eol === "\r\n") out = out.replace(/\n/g, "\r\n");
	if (raw.endsWith("\n")) out += eol;
	writeFileSync(path, out);
}

function normalizeVersion(input) {
	if (!input || !input.trim()) {
		throw new Error("A version/tag is required (pass it as an argument or via $TAG).");
	}
	const v = input.trim().replace(/^v/, "");
	const semver = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
	if (!semver.test(v)) {
		throw new Error(`Invalid version "${input}" — expected semver like 1.2.3 or 1.2.3-beta.1`);
	}
	return v;
}

function check(tag) {
	const version = normalizeVersion(tag);
	const errors = [];

	const pkg = readJson(PKG);
	if (pkg.data.version !== version) {
		errors.push(`${PKG}: version is "${pkg.data.version}", expected "${version}"`);
	}

	const manifest = readJson(MANIFEST);
	if (manifest.data.version !== version) {
		errors.push(`${MANIFEST}: version is "${manifest.data.version}", expected "${version}"`);
	}

	const versions = readJson(VERSIONS);
	if (!(version in versions.data)) {
		errors.push(`${VERSIONS}: no entry for "${version}" (run "apply" to add it)`);
	}

	if (errors.length > 0) {
		console.error(`✖ Version check failed for tag "${version}":`);
		for (const e of errors) console.error(`    - ${e}`);
		process.exit(1);
	}
	console.log(`✔ Version check passed: ${PKG}, ${MANIFEST}, ${VERSIONS} all match tag "${version}".`);
}

function apply(input) {
	const version = normalizeVersion(input);

	const pkg = readJson(PKG);
	pkg.data.version = version;
	writeJson(PKG, pkg.raw, pkg.data);

	const manifest = readJson(MANIFEST);
	const { minAppVersion } = manifest.data;
	manifest.data.version = version;
	writeJson(MANIFEST, manifest.raw, manifest.data);

	const versions = readJson(VERSIONS);
	versions.data[version] = minAppVersion;
	writeJson(VERSIONS, versions.raw, versions.data);

	console.log(`✔ Set version to "${version}" in ${PKG}, ${MANIFEST}, ${VERSIONS}.`);
}

function main() {
	const [, , mode, arg] = process.argv;
	const tag = arg ?? process.env.TAG ?? process.env.GITHUB_REF_NAME;

	try {
		switch (mode) {
			case "check":
				check(tag);
				break;
			case "apply":
				apply(tag);
				break;
			default:
				console.error("Usage: node scripts/version.mjs <check|apply> <version>");
				process.exit(1);
		}
	} catch (err) {
		console.error(`✖ ${err.message}`);
		process.exit(1);
	}
}

main();
