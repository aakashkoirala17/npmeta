import { useState } from 'react';
import FileUploader from './FileUploader';
import { Bot, Search, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import exifr from 'exifr';

export default function AiDetector() {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{
    score: number; // 0 to 100
    evidence: string[];
    generator?: string;
  } | null>(null);

  const handleProcess = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsScanning(true);
    setResult(null);
    
    // Artificial delay for UX
    await new Promise(r => setTimeout(r, 1500));

    try {
      const evidence: string[] = [];
      let score = 0;
      let generatorName = '';

      // Parse ALL metadata (EXIF, IPTC, XMP)
      const data = await exifr.parse(selectedFile, { xmp: true, iptc: true, exif: true });
      
      if (data) {
        // Convert all metadata to a single lowercase string for easy keyword matching
        const metadataString = JSON.stringify(data).toLowerCase();

        // Detection Logic
        if (metadataString.includes('midjourney')) {
          score = 100;
          generatorName = 'Midjourney';
          evidence.push('Found "Midjourney" signature in metadata parameters.');
        } else if (metadataString.includes('dall-e') || metadataString.includes('dall·e')) {
          score = 100;
          generatorName = 'OpenAI DALL-E';
          evidence.push('Found OpenAI/DALL-E signature in metadata.');
        } else if (metadataString.includes('stable diffusion') || metadataString.includes('sdxl')) {
          score = 100;
          generatorName = 'Stable Diffusion';
          evidence.push('Found Stable Diffusion generation parameters in metadata.');
        } else if (metadataString.includes('comfyui') || metadataString.includes('automatic1111')) {
          score = 100;
          generatorName = 'Stable Diffusion (Local)';
          evidence.push('Found Stable Diffusion UI footprint (ComfyUI / Automatic1111).');
        } else if (metadataString.includes('firefly') || metadataString.includes('adobe generate')) {
          score = 100;
          generatorName = 'Adobe Firefly';
          evidence.push('Found Adobe Firefly / AI Generation XMP tags.');
        } else if (metadataString.includes('c2pa')) {
          // Broad check for Content Credentials which usually indicate AI
          score = 85;
          generatorName = 'Unknown AI (C2PA Signed)';
          evidence.push('Found C2PA cryptographic signature commonly used by AI generators.');
        }

        // Check Software tag specifically
        if (data.Software && typeof data.Software === 'string') {
          const sw = data.Software.toLowerCase();
          if (sw.includes('ai') && !generatorName) {
            score = Math.max(score, 75);
            evidence.push(`Software tag indicates AI: "${data.Software}"`);
          }
        }
      }

      if (score === 0) {
        evidence.push('No known AI generation signatures found in metadata.');
        evidence.push('Note: If metadata was stripped, the image could still be AI-generated.');
      }

      setResult({ score, evidence, generator: generatorName || undefined });
    } catch (error) {
      console.error(error);
      setResult({
        score: 0,
        evidence: ['Could not parse metadata or file format is unsupported.', 'If metadata was stripped, the image could still be AI-generated.']
      });
    }

    setIsScanning(false);
  };

  return (
    <div className="component-container" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Bot size={36} />
          AI Image Detector
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>
          Instantly detect AI-generated images using deep metadata analysis. 100% Client-Side.
        </p>
      </div>

      {!file ? (
        <FileUploader 
          onFileSelect={handleProcess} 
          title="Upload image to detect AI"
          subtitle="Analyzes EXIF, XMP, and generation parameters locally"
        />
      ) : (
        <div className="animate-fade-in">
          {isScanning ? (
            <div style={{ textAlign: 'center', padding: '64px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
              <Search size={48} className="animate-spin" style={{ color: 'var(--color-primary)', margin: '0 auto 24px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-main)' }}>Scanning Image Metadata...</h2>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>Looking for AI generation signatures and prompt parameters...</p>
            </div>
          ) : result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="file-info-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, width: '100%' }}>
                  <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="truncate" style={{ fontWeight: 600 }}>{file.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <button onClick={() => setFile(null)} style={{ backgroundColor: 'transparent', color: 'var(--color-primary)', fontWeight: 600, border: '1px solid var(--color-primary)', padding: '8px 16px', borderRadius: 'var(--radius-md)' }}>
                  Scan Another
                </button>
              </div>

              {/* Result Card */}
              <div style={{ 
                padding: '32px', 
                borderRadius: 'var(--radius-lg)', 
                backgroundColor: result.score > 80 ? 'rgba(220, 20, 60, 0.05)' : result.score > 0 ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                border: `2px solid ${result.score > 80 ? 'var(--color-primary)' : result.score > 0 ? '#f59e0b' : '#10b981'}`
              }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  {result.score > 80 ? (
                    <AlertTriangle size={64} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
                  ) : (
                    <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 16px' }} />
                  )}
                  
                  <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                    {result.score}% AI Probability
                  </h2>
                  <p style={{ fontSize: '18px', fontWeight: 600, color: result.score > 80 ? 'var(--color-primary)' : 'var(--color-text-muted)', marginTop: '8px' }}>
                    {result.score > 80 ? `Highly likely generated by AI (${result.generator})` : result.score > 0 ? 'Possible AI Generation or Manipulation' : 'No AI Metadata Detected'}
                  </p>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={20} />
                    Analysis Evidence
                  </h3>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {result.evidence.map((ev, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px', color: 'var(--color-text-muted)' }}>
                        <AlertCircle size={18} style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: '2px' }} />
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
