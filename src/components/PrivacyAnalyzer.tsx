import { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import { AlertTriangle, CheckCircle, Search } from 'lucide-react';
import exifr from 'exifr';

export default function PrivacyAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (file) {
      analyzeFile(file);
    }
  }, [file]);

  const analyzeFile = async (selectedFile: File) => {
    setIsAnalyzing(true);
    try {
      // Parse a wide range of metadata
      const data = await exifr.parse(selectedFile, {
        tiff: true,
        xmp: true,
        icc: true,
        iptc: true,
        exif: true,
        gps: true
      });
      setMetadata(data || {});
    } catch (e) {
      console.error(e);
      setMetadata({});
    }
    setIsAnalyzing(false);
  };

  const hasRisks = metadata && Object.keys(metadata).length > 0;

  return (
    <div className="animate-fade-in" style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '16px' }}>Image Privacy Analyzer</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>Scan photos for hidden data & risks</p>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--color-border)' }}>
        {!file ? (
          <FileUploader onFileSelect={setFile} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {isAnalyzing ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Search className="animate-spin" size={40} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
                <p>Analyzing image for hidden metadata...</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Analysis Results for {file.name}</h2>
                  <button onClick={() => setFile(null)} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Scan Another</button>
                </div>

                {hasRisks ? (
                  <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#be123c', marginBottom: '16px', fontWeight: 600, fontSize: '18px' }}>
                      <AlertTriangle size={24} />
                      Privacy Risks Detected
                    </div>
                    <p style={{ color: '#881337', marginBottom: '16px' }}>
                      We found hidden metadata in this image. This could include your camera model, location, or editing history.
                    </p>
                    
                    <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', padding: '16px', maxHeight: '300px', overflowY: 'auto', border: '1px solid #fecdd3' }}>
                      <pre style={{ margin: 0, fontSize: '13px', color: '#4c1d95', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {JSON.stringify(metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#15803d', marginBottom: '8px', fontWeight: 600, fontSize: '18px' }}>
                      <CheckCircle size={24} />
                      No Metadata Found
                    </div>
                    <p style={{ color: '#166534' }}>
                      This image appears to be clean. We couldn't detect any EXIF, GPS, or other hidden metadata tags.
                    </p>
                  </div>
                )}
              </>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
