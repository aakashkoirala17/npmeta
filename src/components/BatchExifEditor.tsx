import { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import { Save, Download } from 'lucide-react';
// @ts-ignore
import piexif from 'piexifjs';

export default function BatchExifEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  const [artist, setArtist] = useState('');
  const [copyright, setCopyright] = useState('');
  const [software, setSoftware] = useState('');

  useEffect(() => {
    if (file && file.type === 'image/jpeg') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const base64 = e.target?.result as string;
          const exifObj = piexif.load(base64);
          if (exifObj['0th']) {
            setArtist(exifObj['0th'][piexif.ImageIFD.Artist] || '');
            setCopyright(exifObj['0th'][piexif.ImageIFD.Copyright] || '');
            setSoftware(exifObj['0th'][piexif.ImageIFD.Software] || '');
          }
        } catch (err) {
          console.warn('Could not read EXIF data');
        }
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  const handleProcess = () => {
    if (!file) return;
    if (file.type !== 'image/jpeg') {
      alert("EXIF editing is only supported for JPEG files in this tool.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const base64 = e.target?.result as string;
        const exifObj = { "0th": {}, "Exif": {}, "GPS": {}, "Interop": {}, "1st": {} };
        
        if (artist) (exifObj['0th'] as any)[piexif.ImageIFD.Artist] = artist;
        if (copyright) (exifObj['0th'] as any)[piexif.ImageIFD.Copyright] = copyright;
        if (software) (exifObj['0th'] as any)[piexif.ImageIFD.Software] = software;

        const exifBytes = piexif.dump(exifObj);
        const newData = piexif.insert(exifBytes, base64);
        
        // Convert base64 to blob
        fetch(newData)
          .then(res => res.blob())
          .then(blob => setResultUrl(URL.createObjectURL(blob)));
          
      } catch (err) {
        console.error(err);
        alert('Error writing EXIF data.');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '16px' }}>Batch EXIF Editor</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>Edit, remove & add photo metadata (JPEG only)</p>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--color-border)' }}>
        {!file ? (
          <FileUploader onFileSelect={setFile} accept="image/jpeg" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="file-info-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', minWidth: 0 }}>
              <div className="truncate" style={{ fontWeight: 600 }}>{file.name}</div>
              <button onClick={() => { setFile(null); setResultUrl(null); }} style={{ color: 'var(--color-primary)' }}>Change</button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Artist / Creator</label>
                <input type="text" value={artist} onChange={e => setArtist(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Copyright</label>
                <input type="text" value={copyright} onChange={e => setCopyright(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Software</label>
                <input type="text" value={software} onChange={e => setSoftware(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
              </div>
            </div>

            <button onClick={handleProcess} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Save size={20} /> Save Metadata
            </button>

            {resultUrl && (
              <a href={resultUrl} download={`edited_${file.name}`} style={{ backgroundColor: 'var(--color-secondary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px', textDecoration: 'none', marginTop: '16px' }}>
                <Download size={20} /> Download Edited JPEG
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
