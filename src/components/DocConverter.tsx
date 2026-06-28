import { useState } from 'react';
import FileUploader from './FileUploader';
import { FileDown, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DocConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'converting' | 'done' | 'error'>('idle');
  const [targetFormat, setTargetFormat] = useState<'pdf' | 'docx'>('pdf');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setStatus('idle');
    // Auto-detect target format
    if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setTargetFormat('docx');
    } else {
      setTargetFormat('pdf');
    }
  };

  const convertDocument = async () => {
    if (!file) return;
    setStatus('converting');
    setResultUrl(null);

    try {
      // 1. Request upload URL and create job
      const createRes = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetFormat, filename: file.name })
      });
      const { jobId, uploadUrl, uploadParameters, error } = await createRes.json();
      
      if (error) throw new Error(error);

      // 2. Upload file directly to CloudConvert storage
      const formData = new FormData();
      for (const key in uploadParameters) {
        formData.append(key, uploadParameters[key]);
      }
      formData.append('file', file);
      
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      if (!uploadRes.ok) throw new Error('Failed to upload file');

      // 3. Wait for conversion to finish
      const waitRes = await fetch(`/api/convert?jobId=${jobId}`);
      const waitData = await waitRes.json();
      
      if (waitData.error) throw new Error(waitData.error);
      
      setResultUrl(waitData.url);
      setStatus('done');
    } catch (error) {
      console.error(error);
      alert('Service is currently unavailable or the daily conversion limit has been reached. Please try again later.');
      setStatus('error');
    }
  };

  return (
    <div className="component-container" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <RefreshCw size={36} />
          Document Format Converter
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>
          High-fidelity PDF to DOCX and DOCX to PDF conversion.
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '32px', border: '1px solid var(--color-border)', minHeight: '300px' }} className="animate-fade-in">
        
        {/* Privacy Disclaimer for API Usage */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <AlertCircle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontWeight: 600, color: '#b45309', marginBottom: '4px' }}>Privacy Notice</h4>
            <p style={{ fontSize: '14px', color: '#92400e' }}>
              To ensure perfect formatting, documents converted using this tool are temporarily sent to a secure conversion server. They are deleted immediately after processing.
            </p>
          </div>
        </div>

        {!file && (
          <FileUploader 
            onFileSelect={handleFileSelect} 
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            title="Upload a PDF or DOCX"
            subtitle="Auto-detects format and converts to the opposite."
          />
        )}

        {file && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="file-info-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, width: '100%' }}>
                <FileText size={32} color="var(--color-secondary)" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="truncate" style={{ fontWeight: 600 }}>{file.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Converting to {targetFormat.toUpperCase()}</div>
                </div>
              </div>
            </div>

            {status === 'idle' && (
              <button onClick={convertDocument} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '16px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <RefreshCw size={20} /> Convert to {targetFormat.toUpperCase()}
              </button>
            )}

            {status === 'converting' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '32px 0' }}>
                <div className="animate-spin" style={{ color: 'var(--color-primary)' }}><RefreshCw size={40} /></div>
                <div style={{ fontWeight: 500, color: 'var(--color-secondary)' }}>Converting Document... This may take a few seconds.</div>
              </div>
            )}

            {status === 'done' && resultUrl && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#059669', backgroundColor: '#ecfdf5', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>
                  <CheckCircle2 size={24} /> Conversion successful!
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <a href={resultUrl} download={`converted.${targetFormat}`} style={{ backgroundColor: 'var(--color-secondary)', color: 'white', padding: '16px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flex: 1, minWidth: '200px', textDecoration: 'none' }}>
                    <FileDown size={20} /> Download {targetFormat.toUpperCase()}
                  </a>
                  <button onClick={() => setFile(null)} style={{ padding: '16px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, border: '1px solid var(--color-border)', flex: 1, minWidth: '200px', backgroundColor: 'transparent', cursor: 'pointer' }}>Convert Another</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
