import { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import { Image as ImageIcon, Download, Maximize2 } from 'lucide-react';

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [quality, setQuality] = useState(80);
  const [maintainRatio, setMaintainRatio] = useState(true);
  
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        setTargetWidth(img.width);
        setTargetHeight(img.height);
      };
      img.src = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setTargetWidth(val);
    if (maintainRatio && dimensions.width > 0) {
      setTargetHeight(Math.round(val * (dimensions.height / dimensions.width)));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setTargetHeight(val);
    if (maintainRatio && dimensions.height > 0) {
      setTargetWidth(Math.round(val * (dimensions.width / dimensions.height)));
    }
  };

  const handleProcess = () => {
    if (!originalUrl) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            setResultUrl(URL.createObjectURL(blob));
          }
        }, 'image/jpeg', quality / 100);
      }
    };
    img.src = originalUrl;
  };

  return (
    <div className="animate-fade-in" style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '16px' }}>Image Resizer & Compressor</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>Resize, compress & optimize for social media</p>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--color-border)' }}>
        {!file ? (
          <FileUploader onFileSelect={setFile} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', minWidth: 0 }}>
              <ImageIcon size={32} color="var(--color-secondary)" />
              <div>
                <div className="truncate" style={{ fontWeight: 600 }}>{file.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{dimensions.width}x{dimensions.height} px • {(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            </div>

            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Width (px)</label>
                <input type="number" value={targetWidth} onChange={handleWidthChange} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Height (px)</label>
                <input type="number" value={targetHeight} onChange={handleHeightChange} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)} />
              <span>Maintain Aspect Ratio</span>
            </label>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Quality ({quality}%)</label>
              <input type="range" min="1" max="100" value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>

            <button onClick={handleProcess} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Maximize2 size={20} /> Resize & Compress Image
            </button>

            {resultUrl && (
              <a href={resultUrl} download={`resized_${file.name}`} style={{ backgroundColor: 'var(--color-secondary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                <Download size={20} /> Download Result
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
