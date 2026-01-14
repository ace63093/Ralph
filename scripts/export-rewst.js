const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const indexPath = path.join(root, 'public', 'index.html');
const stylePath = path.join(root, 'public', 'styles.css');
const providerPath = path.join(root, 'public', 'provider.js');
const appPath = path.join(root, 'public', 'app.js');
const outputPath = path.join(root, 'dist', 'rewst-embed.html');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const styles = fs.readFileSync(stylePath, 'utf8');
const provider = fs.readFileSync(providerPath, 'utf8');
const app = fs.readFileSync(appPath, 'utf8');

const titleMatch = indexHtml.match(/<title>([^<]*)<\/title>/i);
const title = titleMatch ? titleMatch[1] : 'N-central Device Inactivity Dashboard';
const bodyMatch = indexHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let body = bodyMatch ? bodyMatch[1] : '';
body = body.replace(/<script[\s\S]*?<\/script>/gi, '');

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
${styles}
    </style>
    <script>
      window.DASH_CONFIG = window.DASH_CONFIG || {
        dataMode: "rewst",
        apiBaseUrl: "",
        rewstWebhookUrl: "",
        defaultOrgUnitId: ""
      };
    </script>
  </head>
  <body>
${body}
    <script>
${provider}

${app}
    </script>
  </body>
</html>
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html, 'utf8');

console.log(`Wrote ${outputPath}`);
