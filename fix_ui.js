const fs = require('fs');
const path = require('path');

// 1. Update index.css
let css = fs.readFileSync('src/index.css', 'utf8');
css += `
/* Responsive Utilities */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: block;
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    gap: 16px;
    padding: 16px !important;
  }
  .desktop-nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px !important;
  }
  main > div, .animate-fade-in > div {
    padding: 16px !important;
  }
  h1 {
    font-size: 28px !important;
  }
  .responsive-grid {
    grid-template-columns: 1fr !important;
  }
  .file-info-container {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 8px !important;
  }
}
`;
fs.writeFileSync('src/index.css', css);

// 2. Fix App.tsx
let appStr = fs.readFileSync('src/App.tsx', 'utf8');
appStr = appStr.replace(/<div style=\{\{ display: 'flex', alignItems: 'center', gap: '16px' \}\}>/g, "<div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, width: '100%' }}>");
appStr = appStr.replace(/<div style=\{\{ fontWeight: 600 \}\}>\{file\.name\}<\/div>/g, "<div className=\"truncate\" style={{ fontWeight: 600 }}>{file.name}</div>");
fs.writeFileSync('src/App.tsx', appStr);

// 3. Fix other components
const components = ['BatchExifEditor.tsx', 'CredentialsChecker.tsx', 'DiffTool.tsx', 'FormatConverter.tsx', 'ImageResizer.tsx', 'InvisibleWatermark.tsx', 'PrivacyAnalyzer.tsx'];
components.forEach(c => {
  let p = path.join('src/components', c);
  if (!fs.existsSync(p)) return;
  let str = fs.readFileSync(p, 'utf8');
  
  // Fix grid layouts to use .responsive-grid
  str = str.replace(/style=\{\{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' \}\}/g, 'className="responsive-grid" style={{ display: \'grid\', gridTemplateColumns: \'1fr 1fr\', gap: \'24px\' }}');
  
  // Fix filename container to allow truncation
  str = str.replace(/<div style=\{\{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var\(--color-bg\)', borderRadius: 'var\(--radius-md\)' \}\}>/g, '<div style={{ display: \'flex\', alignItems: \'center\', gap: \'16px\', padding: \'16px\', backgroundColor: \'var(--color-bg)\', borderRadius: \'var(--radius-md)\', minWidth: 0 }}>');
  str = str.replace(/<div style=\{\{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var\(--color-bg\)', borderRadius: 'var\(--radius-md\)' \}\}>/g, '<div className="file-info-container" style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'space-between\', padding: \'16px\', backgroundColor: \'var(--color-bg)\', borderRadius: \'var(--radius-md)\', minWidth: 0 }}>');
  
  // Apply truncate to filename
  str = str.replace(/<div style=\{\{ fontWeight: 600 \}\}>\{file\.name\}<\/div>/g, '<div className="truncate" style={{ fontWeight: 600 }}>{file.name}</div>');
  str = str.replace(/<h2 style=\{\{ fontSize: '20px', fontWeight: 600 \}\}>Analysis Results for \{file\.name\}<\/h2>/g, '<h2 className="truncate" style={{ fontSize: \'20px\', fontWeight: 600, maxWidth: \'100%\' }}>Analysis Results for {file.name}</h2>');
  str = str.replace(/<h2 style=\{\{ fontSize: '20px', fontWeight: 600 \}\}>C2PA Scan: \{file\.name\}<\/h2>/g, '<h2 className="truncate" style={{ fontSize: \'20px\', fontWeight: 600, maxWidth: \'100%\' }}>C2PA Scan: {file.name}</h2>');

  fs.writeFileSync(p, str);
});

