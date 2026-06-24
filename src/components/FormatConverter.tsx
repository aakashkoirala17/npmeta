import { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import { Image as ImageIcon, Download, FileJson } from 'lucide-react';

export default function FormatConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState('image/png');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleProcess = () => {
    if (!originalUrl) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            setResultUrl(URL.createObjectURL(blob));
          }
        }, targetFormat, 0.95);
      }
    };
    img.src = originalUrl;
  };

  const getExtension = (mimeType: string) => {
    switch (mimeType) {
      case 'image/jpeg': return 'jpg';
      case 'image/png': return 'png';
      case 'image/webp': return 'webp';
      default: return 'png';
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '16px' }}>Image Format Converter</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>Convert between WebP, PNG, JPEG & more</p>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--color-border)' }}>
        {!file ? (
          <FileUploader onFileSelect={setFile} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
              <ImageIcon size={32} color="var(--color-secondary)" />
              <div>
                <div style={{ fontWeight: 600 }}>{file.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Target Format</label>
              <select 
                value={targetFormat} 
                onChange={(e) => setTargetFormat(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'white' }}
              >
                <option value="image/jpeg">JPEG (.jpg)</option>
                <option value="image/png">PNG (.png)</option>
                <option value="image/webp">WebP (.webp)</option>
              </select>
            </div>

            <button onClick={handleProcess} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <FileJson size={20} /> Convert Format
            </button>

            {resultUrl && (
              <a href={resultUrl} download={`converted.${getExtension(targetFormat)}`} style={{ backgroundColor: 'var(--color-secondary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                <Download size={20} /> Download Result
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
