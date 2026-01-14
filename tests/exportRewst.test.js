const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

test('export script produces single-file HTML with inline assets', () => {
  execSync('node scripts/export-rewst.js', { stdio: 'inherit' });
  const outputPath = path.join(__dirname, '..', 'dist', 'rewst-embed.html');
  const content = fs.readFileSync(outputPath, 'utf8');
  assert.ok(content.includes('<style>'));
  assert.ok(content.includes('window.DASH_CONFIG'));
  assert.ok(content.includes('<script>'));
  assert.ok(!content.includes('styles.css'));
});
