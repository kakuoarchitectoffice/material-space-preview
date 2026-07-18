const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const styles = read("styles.css");
const access = read("access.js");
const demoData = read("demo-data.js");
const app = read("script.js");
const adminHtml = read("admin.html");
const admin = read("admin.js");

assert.match(html, /id="access-gate"/);
assert.match(html, /noindex,nofollow,noarchive/);
assert.match(access, /crypto\.subtle\.digest\("SHA-256"/);
assert.doesNotMatch(access, /const\s+(PASSWORD|PASSPHRASE)\s*=/);
assert.match(styles, /--warm-white:#f3f0ea/);
assert.match(styles, /--glass-dark:rgba\(42,36,31,\.72\)/);
assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
assert.match(app, /const FAVORITES_STORAGE_KEY = "tiles-space-favorites"/);
assert.match(app, /const SAMPLE_CART_STORAGE_KEY = "tiles-space-sample-cart"/);
assert.match(app, /class JsonStorageRepository/);
assert.match(app, /class DemoProjectRepository/);
assert.match(app, /async function submitSampleRequest\(formData\)/);
assert.match(app, /return \{ success: true/);
assert.match(app, /status === "published"/);
assert.match(app, /DEMO TILE \/ 正式商品選定前/);
assert.doesNotMatch([app, demoData].join("\n"), /HT-[A-Z0-9-]+/);
assert.match(demoData, /window\.TileSpaceData = \{ products, rooms, projects \}/);
assert.match(app, /const \{ products, rooms, projects \} = window\.TileSpaceData/);
assert.match(app, /ROOM/);
assert.match(app, /MATERIAL/);
assert.match(app, /STORY/);
assert.match(app, /data-trace/);
assert.match(app, /data-toggle-favorite/);
assert.match(app, /data-add-sample/);
assert.match(adminHtml, /admin\.js/);
assert.match(admin, /sessionStorage\.setItem\(SESSION_KEY, "demo-admin"\)/);
assert.match(admin, /indexedDB\.open/);
assert.match(admin, /data-trace-editor/);
assert.match(admin, /dragstart/);
assert.match(admin, /published/);
assert.match(admin, /本番認証ではありません/);

["quiet-arrival.png", "quiet-lounge.png", "quiet-courtyard.png"].forEach((file) => {
  const stat = fs.statSync(path.join(root, "assets", "images", file));
  assert.ok(stat.size > 500_000, `${file} should be a generated high-quality room image`);
});
["tile-travertine.jpg", "tile-deep-stone.jpg", "tile-craft-clay.jpg", "tile-soft-limestone.jpg"].forEach((file) => {
  assert.ok(fs.statSync(path.join(root, "assets", file)).size > 100_000, `${file} should be a real tile surface image`);
});

console.log("site.test.js: showroom routes, repositories, admin demo, safe product data, and assets passed");
