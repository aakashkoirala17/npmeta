const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove unused React import
  content = content.replace(/import\s+React\s*,\s*\{/g, 'import {');
  content = content.replace(/import\s+React\s+from\s+['"]react['"];?\n?/g, '');
  
  // Fix FileUploader specific
  if (filePath.endsWith('FileUploader.tsx')) {
    content = content.replace(/import\s*\{\s*useRef\s*,\s*useState\s*,\s*DragEvent\s*,\s*ChangeEvent\s*\}\s*from\s*'react';/, "import { useRef, useState } from 'react';\nimport type { DragEvent, ChangeEvent } from 'react';");
  }

  // Fix DiffTool specific
  if (filePath.endsWith('DiffTool.tsx')) {
    content = content.replace(/useState,\s*useEffect,\s*useRef/, 'useState');
    content = content.replace(/const canvasRef = useRef<HTMLCanvasElement>\(null\);/, '');
  }

  // Fix BatchExifEditor specific
  if (filePath.endsWith('BatchExifEditor.tsx')) {
    content = content.replace(/,\s*Edit3/, '');
    content = content.replace(/if \(artist\) exifObj\['0th'\]\[piexif.ImageIFD.Artist\] = artist;/, "if (artist) (exifObj['0th'] as any)[piexif.ImageIFD.Artist] = artist;");
    content = content.replace(/if \(copyright\) exifObj\['0th'\]\[piexif.ImageIFD.Copyright\] = copyright;/, "if (copyright) (exifObj['0th'] as any)[piexif.ImageIFD.Copyright] = copyright;");
    content = content.replace(/if \(software\) exifObj\['0th'\]\[piexif.ImageIFD.Software\] = software;/, "if (software) (exifObj['0th'] as any)[piexif.ImageIFD.Software] = software;");
  }

  fs.writeFileSync(filePath, content);
}

const dir = './src';
const componentsDir = './src/components';

const files = [
  path.join(dir, 'App.tsx'),
  path.join(componentsDir, 'BatchExifEditor.tsx'),
  path.join(componentsDir, 'CredentialsChecker.tsx'),
  path.join(componentsDir, 'DiffTool.tsx'),
  path.join(componentsDir, 'FileUploader.tsx'),
  path.join(componentsDir, 'FormatConverter.tsx'),
  path.join(componentsDir, 'HowItWorks.tsx'),
  path.join(componentsDir, 'ImageResizer.tsx'),
  path.join(componentsDir, 'InvisibleWatermark.tsx'),
  path.join(componentsDir, 'Privacy.tsx'),
  path.join(componentsDir, 'PrivacyAnalyzer.tsx')
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    processFile(f);
  }
});

