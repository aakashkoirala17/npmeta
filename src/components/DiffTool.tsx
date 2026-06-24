import { useState } from 'react';
import FileUploader from './FileUploader';
import { SplitSquareHorizontal, Download } from 'lucide-react';

export default function DiffTool() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  
  const handleProcess = () => {
    if (!file1 || !file2) return;
    setIsProcessing(true);

    const img1 = new Image();
    const img2 = new Image();
    
    let loaded = 0;
    const checkLoaded = () => {
      loaded++;
      if (loaded === 2) performDiff();
    };

    img1.onload = checkLoaded;
    img2.onload = checkLoaded;

    img1.src = URL.createObjectURL(file1);
    img2.src = URL.createObjectURL(file2);

    const performDiff = () => {
      const width = Math.max(img1.width, img2.width);
      const height = Math.max(img1.height, img2.height);

      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      const resultCanvas = document.createElement('canvas');

      canvas1.width = width; canvas1.height = height;
      canvas2.width = width; canvas2.height = height;
      resultCanvas.width = width; resultCanvas.height = height;

      const ctx1 = canvas1.getContext('2d')!;
      const ctx2 = canvas2.getContext('2d')!;
      const ctxRes = resultCanvas.getContext('2d')!;

      // Draw original images
      ctx1.drawImage(img1, 0, 0);
      ctx2.drawImage(img2, 0, 0);

      const data1 = ctx1.getImageData(0, 0, width, height).data;
      const data2 = ctx2.getImageData(0, 0, width, height).data;
      
      const resultImageData = ctxRes.createImageData(width, height);
      const resData = resultImageData.data;

      // Nepal Red: #DC143C (220, 20, 60)
      for (let i = 0; i < data1.length; i += 4) {
        const rDiff = Math.abs(data1[i] - data2[i]);
        const gDiff = Math.abs(data1[i+1] - data2[i+1]);
        const bDiff = Math.abs(data1[i+2] - data2[i+2]);
        const aDiff = Math.abs(data1[i+3] - data2[i+3]);

        if (rDiff > 0 || gDiff > 0 || bDiff > 0 || aDiff > 0) {
          // Highlight diff in Nepal Red
          resData[i] = 220;     // R
          resData[i+1] = 20;    // G
          resData[i+2] = 60;    // B
          resData[i+3] = 255;   // Alpha
        } else {
          // Keep original pixel but faded (grayscale/opacity)
          resData[i] = data1[i];
          resData[i+1] = data1[i+1];
          resData[i+2] = data1[i+2];
          resData[i+3] = 50; // faded
        }
      }

      ctxRes.putImageData(resultImageData, 0, 0);
      
      resultCanvas.toBlob((blob) => {
        if (blob) {
          setResultUrl(URL.createObjectURL(blob));
        }
        setIsProcessing(false);
      }, 'image/png');
    };
  };

  const reset = () => {
    setFile1(null);
    setFile2(null);
    setResultUrl(null);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '48px 24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '16px' }}>Image Diff Tool</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>Pixel-level image comparison</p>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--color-border)' }}>
        
        {!resultUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h3 style={{ marginBottom: '12px', fontWeight: 600, color: 'var(--color-secondary)' }}>Image 1 (Base)</h3>
                {!file1 ? <FileUploader onFileSelect={setFile1} title="Upload Base Image" subtitle="" /> : (
                  <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <strong>{file1.name}</strong> selected.
                    <button onClick={() => setFile1(null)} style={{ display: 'block', margin: '8px auto 0', color: 'var(--color-primary)', textDecoration: 'underline' }}>Change</button>
                  </div>
                )}
              </div>
              
              <div>
                <h3 style={{ marginBottom: '12px', fontWeight: 600, color: 'var(--color-secondary)' }}>Image 2 (Compare)</h3>
                {!file2 ? <FileUploader onFileSelect={setFile2} title="Upload Image to Compare" subtitle="" /> : (
                  <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <strong>{file2.name}</strong> selected.
                    <button onClick={() => setFile2(null)} style={{ display: 'block', margin: '8px auto 0', color: 'var(--color-primary)', textDecoration: 'underline' }}>Change</button>
                  </div>
                )}
              </div>
            </div>

            {file1 && file2 && (
              <button 
                onClick={handleProcess} 
                disabled={isProcessing}
                style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px', opacity: isProcessing ? 0.7 : 1 }}
              >
                <SplitSquareHorizontal size={20} /> {isProcessing ? 'Comparing Pixels...' : 'Generate Diff'}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-secondary)' }}>Diff Result</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Differences are highlighted in red. Matching pixels are faded.</p>
            
            <div style={{ backgroundColor: '#f0f0f0', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'center' }}>
              <img src={resultUrl} alt="Diff result" style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <a href={resultUrl} download="diff_result.png" style={{ backgroundColor: 'var(--color-secondary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', justifyContent: 'center', flex: 1, gap: '8px', textDecoration: 'none' }}>
                <Download size={20} /> Download Diff Image
              </a>
              <button onClick={reset} style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontWeight: 600 }}>Start Over</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
