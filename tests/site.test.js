const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(projectRoot, file), "utf8");
const html = read("index.html");
const styles = read("styles.css");
const access = read("access.js");
const allPublicSource = [html, styles, access, read("script.js"), read("project.js")].join("\n");

assert.match(html, /id="access-gate"/);
assert.match(html, /meta name="robots" content="noindex, nofollow, noarchive"/);
assert.match(access, /crypto\.subtle\.digest\("SHA-256"/);
assert.match(access, /sessionStorage\.setItem/);
assert.match(styles, /\.hero\{height:100svh;min-height:680px/);
assert.doesNotMatch(allPublicSource, /by [A-Z][A-Z ]+TILE/);
assert.doesNotMatch(html, /https:\/\/[^\s"']*tile[^\s"']*\.jp/i);

console.log("site.test.js: access gate, branding, and standalone layout checks passed");
