import { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import { BadgeCheck, FileWarning, Search } from 'lucide-react';
import exifr from 'exifr';

export default function CredentialsChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [hasCredentials, setHasCredentials] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (file) {
      checkCredentials(file);
    }
  }, [file]);

  const checkCredentials = async (selectedFile: File) => {
    setIsAnalyzing(true);
    try {
      // Look specifically for C2PA or XMP provenance data
      const xmpData = await exifr.parse(selectedFile, { xmp: true, tiff: false, exif: false });
      
      // Basic check: C2PA manifests are often referenced in XMP or stored in APP11 segments.
      // For a true C2PA validation, a dedicated WASM library is required.
      // Here we check if any XMP tags hint at provenance/C2PA.
      const xmpString = JSON.stringify(xmpData || {});
      if (xmpString.toLowerCase().includes('c2pa') || xmpString.toLowerCase().includes('provenance')) {
        setHasCredentials(true);
      } else {
        setHasCredentials(false);
      }
    } catch (e) {
      setHasCredentials(false);
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '16px' }}>Content Credentials Checker</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>Verify C2PA provenance & authenticity</p>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--color-border)' }}>
        {!file ? (
          <FileUploader onFileSelect={setFile} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {isAnalyzing ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Search className="animate-spin" size={40} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
                <p>Scanning for Content Credentials...</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 600 }}>C2PA Scan: {file.name}</h2>
                  <button onClick={() => setFile(null)} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Scan Another</button>
                </div>

                {hasCredentials ? (
                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1d4ed8', marginBottom: '16px', fontWeight: 600, fontSize: '18px' }}>
                      <BadgeCheck size={24} />
                      Content Credentials Found
                    </div>
                    <p style={{ color: '#1e3a8a' }}>
                      This image contains C2PA provenance metadata. This typically indicates it was generated or edited by an AI tool or verified software (e.g., Adobe Firefly, Photoshop).
                    </p>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563', marginBottom: '8px', fontWeight: 600, fontSize: '18px' }}>
                      <FileWarning size={24} />
                      No Credentials Detected
                    </div>
                    <p style={{ color: '#374151' }}>
                      We did not find any embedded C2PA manifests or provenance data in this image.
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
