import { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import { Image as ImageIcon, Download, Scissors, Droplets } from 'lucide-react';
import { getEmbeddedAlphaMap } from '../core/alphaMaps';
import { detectWatermarkConfig } from '../core/watermarkConfig';

export default function GeminiLogoRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [activeMethod, setActiveMethod] = useState<string>('');

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
      };
      img.src = url;
      setProcessingState('idle');
      setResultUrl(null);
      setActiveMethod('');
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // OpenCV code removed. Replaced by pure math approach in processImage

  const processImage = (method: 'blur' | 'crop' | 'smart') => {
    if (!originalUrl) return;
    setProcessingState('processing');

    const img = new Image();
    img.onload = () => {
      setTimeout(() => { // delay for UI
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (method === 'crop') {
          // Remove the strict 96px cap to handle high-res images
          const cropHeight = Math.max(48, Math.floor(img.height * 0.1));
          canvas.width = img.width;
          canvas.height = img.height - cropHeight;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              setResultUrl(URL.createObjectURL(blob));
              setProcessingState('done');
            }
          }, file?.type || 'image/jpeg', 0.95);
          
        } else if (method === 'blur') {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Remove the strict 120px cap
          const size = Math.max(60, Math.floor(img.width * 0.15));
          const x = img.width - size;
          const y = img.height - size;

          ctx.filter = 'blur(15px)';
          ctx.drawImage(canvas, x, y, size, size, x, y, size, size);
          ctx.filter = 'none';

          canvas.toBlob((blob) => {
            if (blob) {
              setResultUrl(URL.createObjectURL(blob));
              setProcessingState('done');
            }
          }, file?.type || 'image/jpeg', 0.95);
          
        } else if (method === 'smart') {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const config = detectWatermarkConfig(img.width, img.height);
          const wmSize = config.logoSize;
          const marginRight = config.marginRight;
          const marginBottom = config.marginBottom;

          // Resolve alpha map variant correctly
          const mapKey = (config as any).alphaVariant ? `${wmSize}-${(config as any).alphaVariant}` : wmSize;
          const alphaMap = getEmbeddedAlphaMap(mapKey);
          if (alphaMap) {
             const xStart = Math.max(0, img.width - wmSize - marginRight);
             const yStart = Math.max(0, img.height - wmSize - marginBottom);
             
             // Only process if it fits
             if (xStart >= 0 && yStart >= 0) {
                 const imageData = ctx.getImageData(xStart, yStart, wmSize, wmSize);
                 const data = imageData.data;
                 
                 for (let i = 0; i < wmSize * wmSize; i++) {
                     const alpha = alphaMap[i];
                     if (alpha > 0 && alpha < 1) {
                         const rIdx = i * 4;
                         const gIdx = i * 4 + 1;
                         const bIdx = i * 4 + 2;
                         
                         data[rIdx] = Math.max(0, Math.min(255, Math.round((data[rIdx] - alpha * 255) / (1 - alpha))));
                         data[gIdx] = Math.max(0, Math.min(255, Math.round((data[gIdx] - alpha * 255) / (1 - alpha))));
                         data[bIdx] = Math.max(0, Math.min(255, Math.round((data[bIdx] - alpha * 255) / (1 - alpha))));
                     }
                 }
                 ctx.putImageData(imageData, xStart, yStart);
             }
          }

          canvas.toBlob((blob) => {
            if (blob) {
              setResultUrl(URL.createObjectURL(blob));
              setProcessingState('done');
            }
          }, file?.type || 'image/jpeg', 0.95);
        }
      }, 50);
    };
    img.src = originalUrl;
  };

  return (
    <div className="animate-fade-in" style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '16px' }}>Gemini Logo Remover</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>Advanced AI-powered watermark removal using OpenCV WebAssembly</p>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--color-border)' }}>
        {!file ? (
          <FileUploader onFileSelect={setFile} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', minWidth: 0, width: '100%' }}>
              <ImageIcon size={32} color="var(--color-secondary)" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="truncate" style={{ fontWeight: 600 }}>{file.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{dimensions.width}x{dimensions.height} px • {(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            </div>

            {processingState === 'idle' && (
              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <button 
                  onClick={() => { setActiveMethod('Smart Reverse Alpha'); processImage('smart'); }} 
                  style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: `2px solid var(--color-primary)`, padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}>
                  <ImageIcon size={28} style={{ color: 'white' }} />
                  <span>Smart Remove</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>Perfect Math Reversal</span>
                </button>
                <button onClick={() => { setActiveMethod('Blur Area'); processImage('blur'); }} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-secondary)', border: '2px solid var(--color-border)', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                  <Droplets size={28} style={{ color: 'var(--color-primary)' }} />
                  <span>Blur Logo</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 400 }}>Maintains image size</span>
                </button>
                <button onClick={() => { setActiveMethod('Crop'); processImage('crop'); }} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-secondary)', border: '2px solid var(--color-border)', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                  <Scissors size={28} style={{ color: 'var(--color-primary)' }} />
                  <span>Crop Bottom</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 400 }}>Crops the bottom edge</span>
                </button>
              </div>
            )}

            {processingState === 'processing' && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)' }}>
                <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '16px' }}>
                  <ImageIcon size={32} color="var(--color-primary)" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '8px' }}>Processing Image</h3>
                <p>Applying {activeMethod} mathematically...</p>
              </div>
            )}

            {processingState === 'done' && resultUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <img src={resultUrl} alt="Processed result" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <a href={resultUrl} download={`cleaned_${file.name}`} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', textDecoration: 'none', flex: 1 }}>
                    <Download size={20} /> Download Image
                  </a>
                  <button onClick={() => setFile(null)} style={{ padding: '16px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, border: '1px solid var(--color-border)' }}>Start Over</button>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '8px' }}>
                  Note: This removes the visible watermark. The invisible SynthID watermark embedded by Google may still remain.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
