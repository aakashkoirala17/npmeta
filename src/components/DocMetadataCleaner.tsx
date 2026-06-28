import { useState } from 'react';
import FileUploader from './FileUploader';
import { FileText, ShieldCheck, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export default function DocMetadataCleaner() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const cleanPdf = async (fileBuffer: ArrayBuffer) => {
    const pdfDoc = await PDFDocument.load(fileBuffer);
    
    // Clear standard PDF metadata
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');
    
    // Remove modification/creation dates
    pdfDoc.setCreationDate(new Date(0));
    pdfDoc.setModificationDate(new Date(0));

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  };

  const cleanDocx = async (fileBuffer: ArrayBuffer) => {
    const zip = await JSZip.loadAsync(fileBuffer);
    
    // Minimal core.xml structure to replace the original
    const minimalCoreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"></cp:coreProperties>`;

    // Minimal app.xml structure to replace the original
    const minimalAppXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"></Properties>`;

    // Overwrite metadata files if they exist
    if (zip.file('docProps/core.xml')) {
      zip.file('docProps/core.xml', minimalCoreXml);
    }
    if (zip.file('docProps/app.xml')) {
      zip.file('docProps/app.xml', minimalAppXml);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  };

  const processFile = async () => {
    if (!file) return;
    setStatus('processing');

    try {
      const fileBuffer = await file.arrayBuffer();
      let blob: Blob;

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        blob = await cleanPdf(fileBuffer);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx')) {
        blob = await cleanDocx(fileBuffer);
      } else {
        throw new Error("Unsupported file format");
      }

      setResultUrl(URL.createObjectURL(blob));
      setStatus('done');
    } catch (error) {
      console.error(error);
      alert('Failed to process document. Please ensure it is a valid PDF or DOCX file.');
      setStatus('idle');
    }
  };

  return (
    <div className="component-container" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <FileText size={36} />
          Document Metadata Cleaner
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>
          Securely remove personal information and metadata from PDF and DOCX files. 100% Client-Side.
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '32px', border: '1px solid var(--color-border)', minHeight: '300px' }} className="animate-fade-in">
        {!file && (
          <FileUploader 
            onFileSelect={(f) => { setFile(f); setStatus('idle'); setResultUrl(null); }} 
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            title="Drop a PDF or DOCX file"
            subtitle="Files are processed locally and never uploaded."
          />
        )}

        {file && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="file-info-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, width: '100%' }}>
                <FileText size={32} color="var(--color-secondary)" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="truncate" style={{ fontWeight: 600 }}>{file.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>
              {status === 'idle' && (
                <button onClick={() => setFile(null)} style={{ color: 'var(--color-text-muted)' }}><Trash2 size={20} /></button>
              )}
            </div>

            {status === 'idle' && (
              <button onClick={processFile} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '16px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <ShieldCheck size={20} /> Clean Document
              </button>
            )}

            {status === 'processing' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '32px 0' }}>
                <div className="animate-spin" style={{ color: 'var(--color-primary)' }}><ShieldCheck size={40} /></div>
                <div style={{ fontWeight: 500, color: 'var(--color-secondary)' }}>Scrubbing Document Metadata...</div>
              </div>
            )}

            {status === 'done' && resultUrl && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#059669', backgroundColor: '#ecfdf5', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>
                  <CheckCircle2 size={24} /> Document successfully sanitized!
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <a href={resultUrl} download={`clean_${file.name}`} style={{ backgroundColor: 'var(--color-secondary)', color: 'white', padding: '16px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', textDecoration: 'none', flex: 1, minWidth: '200px' }}>
                    <Download size={20} /> Download Clean Document
                  </a>
                  <button onClick={() => setFile(null)} style={{ padding: '16px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, border: '1px solid var(--color-border)', flex: 1, minWidth: '200px' }}>Scan Another</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
