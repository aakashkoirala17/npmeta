import { useState } from 'react';
import FileUploader from './FileUploader';
import { EyeOff, Download, ScanText } from 'lucide-react';

export default function InvisibleWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [secretText, setSecretText] = useState('');
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const encodeWatermark = () => {
    if (!file || !secretText) return;
    
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Encode secret text into bits (end with a null character)
      const textToEncode = secretText + '\0';
      let bitIndex = 0;

      for (let i = 0; i < data.length; i += 4) { // Modify Red channel only
        if (bitIndex < textToEncode.length * 8) {
          const charCode = textToEncode.charCodeAt(Math.floor(bitIndex / 8));
          const bit = (charCode >> (7 - (bitIndex % 8))) & 1;
          
          // Clear LSB and set to our bit
          data[i] = (data[i] & ~1) | bit;
          bitIndex++;
        } else {
          break;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      
      // Must save as PNG to prevent lossy compression from destroying the watermark
      canvas.toBlob(blob => {
        if (blob) setResultUrl(URL.createObjectURL(blob));
      }, 'image/png');
      
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const decodeWatermark = () => {
    if (!file) return;
    
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let decodedStr = '';
      let currentChar = 0;
      let bitIndex = 0;

      for (let i = 0; i < data.length; i += 4) {
        const bit = data[i] & 1;
        currentChar = (currentChar << 1) | bit;
        bitIndex++;

        if (bitIndex === 8) {
          if (currentChar === 0) break; // Null terminator
          decodedStr += String.fromCharCode(currentChar);
          currentChar = 0;
          bitIndex = 0;
        }
      }

      setDecodedText(decodedStr || "No hidden watermark found.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const reset = () => {
    setFile(null);
    setResultUrl(null);
    setDecodedText(null);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '16px' }}>Invisible Watermark</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>Embed or decode hidden text in your photos (PNG only)</p>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button 
            onClick={() => { setMode('encode'); reset(); }}
            style={{ flex: 1, padding: '12px', fontWeight: 600, borderBottom: mode === 'encode' ? '3px solid var(--color-primary)' : '3px solid transparent' }}
          >
            Embed Watermark
          </button>
          <button 
            onClick={() => { setMode('decode'); reset(); }}
            style={{ flex: 1, padding: '12px', fontWeight: 600, borderBottom: mode === 'decode' ? '3px solid var(--color-secondary)' : '3px solid transparent' }}
          >
            Read Watermark
          </button>
        </div>

        {!file ? (
          <FileUploader onFileSelect={setFile} subtitle={mode === 'decode' ? 'Upload a PNG image to read watermark' : 'Upload an image to embed text'} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="file-info-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', minWidth: 0 }}>
              <div className="truncate" style={{ fontWeight: 600 }}>{file.name}</div>
              <button onClick={reset} style={{ color: 'var(--color-primary)' }}>Change</button>
            </div>

            {mode === 'encode' && !resultUrl && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Secret Text</label>
                  <input 
                    type="text" 
                    value={secretText} 
                    onChange={e => setSecretText(e.target.value)} 
                    placeholder="Enter text to hide..." 
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} 
                  />
                </div>
                <button onClick={encodeWatermark} disabled={!secretText} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px', opacity: secretText ? 1 : 0.5 }}>
                  <EyeOff size={20} /> Embed Secret Text
                </button>
              </>
            )}

            {mode === 'encode' && resultUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Watermark successfully embedded! The image must be saved as PNG to preserve the hidden bits.</p>
                <a href={resultUrl} download="watermarked.png" style={{ backgroundColor: 'var(--color-secondary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                  <Download size={20} /> Download PNG
                </a>
              </div>
            )}

            {mode === 'decode' && !decodedText && (
              <button onClick={decodeWatermark} style={{ backgroundColor: 'var(--color-secondary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <ScanText size={20} /> Extract Hidden Text
              </button>
            )}

            {mode === 'decode' && decodedText && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#166534', marginBottom: '12px' }}>Extraction Result</h3>
                <p style={{ fontSize: '16px', color: '#14532d', wordBreak: 'break-all' }}>{decodedText}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
