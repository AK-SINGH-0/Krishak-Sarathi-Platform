const fs = require('fs');
const path = require('path');

const pages = [
  'Home', 'About', 'Services', 'VoiceAdvisor', 'AIAdvisor', 'Weather',
  'MarketPrices', 'CropLibrary', 'GovernmentSchemes', 'DiseaseDetection',
  'News', 'Contact', 'Login', 'Register', 'Profile', 'Notifications',
  'Settings', 'FAQ'
];

const basePath = path.join(__dirname, 'src', 'pages');

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

pages.forEach(page => {
  const pagePath = path.join(basePath, page);
  if (!fs.existsSync(pagePath)) {
    fs.mkdirSync(pagePath, { recursive: true });
  }

  const jsxContent = `import React from 'react';
import './${page}.css';

const ${page} = () => {
  return (
    <div className="container page-container ${page.toLowerCase()}-page">
      <div className="glass-panel p-8 mt-4">
        <h2>${page.replace(/([A-Z])/g, ' $1').trim()}</h2>
        <p>This is the ${page.replace(/([A-Z])/g, ' $1').trim()} page content.</p>
      </div>
    </div>
  );
};

export default ${page};
`;

  const cssContent = `.${page.toLowerCase()}-page {
  padding: 40px 0;
}
.p-8 { padding: 32px; }
.mt-4 { margin-top: 16px; }
`;

  fs.writeFileSync(path.join(pagePath, `${page}.jsx`), jsxContent);
  fs.writeFileSync(path.join(pagePath, `${page}.css`), cssContent);
});

console.log('Pages generated successfully!');
