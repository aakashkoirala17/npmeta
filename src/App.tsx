import { useState } from 'react';
import { Image as ImageIcon, Download, Trash2, ShieldCheck, CheckCircle2, Zap, Lock, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import './index.css';

// Components
import HowItWorks from './components/HowItWorks';
import Privacy from './components/Privacy';
import FileUploader from './components/FileUploader';
import ImageResizer from './components/ImageResizer';
import FormatConverter from './components/FormatConverter';
import PrivacyAnalyzer from './components/PrivacyAnalyzer';
import CredentialsChecker from './components/CredentialsChecker';
import DiffTool from './components/DiffTool';
import InvisibleWatermark from './components/InvisibleWatermark';
import BatchExifEditor from './components/BatchExifEditor';
import AiDetector from './components/AiDetector';
import DocMetadataCleaner from './components/DocMetadataCleaner';
import DocConverter from './components/DocConverter';

type ViewState = 'home' | 'how-it-works' | 'privacy' | 'resizer' | 'converter' | 'analyzer' | 'credentials' | 'diff' | 'watermark' | 'exif' | 'aidetector' | 'doc-cleaner' | 'doc-converter';

const faqItems = [
  {
    question: "What is AI metadata?",
    answer: "AI metadata includes hidden data embedded in image files by AI generation tools (like Midjourney or DALL-E) or editing software. This data is stored as C2PA content credentials, EXIF data, or XMP tags, and can trigger automatic 'Made with AI' labels on social media."
  },
  {
    question: "How do I remove AI data from an image?",
    answer: "Simply select your image in our free AI info remover. Click the 'Remove Metadata' button, and our tool will instantly clean image metadata, stripping all C2PA, EXIF, and XMP data from your image right in your browser."
  },
  {
    question: "Is it safe to upload my photos here?",
    answer: "Yes, because there is NO upload! All processing is 100% client-side. Your photos are cleaned locally on your device and never sent to any servers, ensuring total privacy."
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // MetaCleaner (Home) State
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const processImage = async () => {
    if (!file) return;
    setStatus('processing');
    await new Promise(r => setTimeout(r, 600));

    return new Promise<void>((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          alert('Canvas processing not supported.');
          setStatus('idle');
          return;
        }

        ctx.drawImage(img, 0, 0);
        
        try {
          const imageData = ctx.getImageData(0, 0, 1, 1);
          const data = imageData.data;
          data[0] = data[0] < 255 ? data[0] + 1 : data[0] - 1; 
          ctx.putImageData(imageData, 0, 0);
        } catch (e) {
          console.warn('Could not modify pixel data', e);
        }

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob((blob) => {
          if (blob) {
            setResultUrl(URL.createObjectURL(blob));
            setStatus('done');
          } else {
            setStatus('idle');
          }
          resolve();
        }, mimeType, 0.92); 
        
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    });
  };

  const renderHome = () => (
    <main style={{ flex: 1, padding: '48px 24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-fade-in">
        <h1 style={{ fontSize: '42px', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '16px', lineHeight: 1.2 }}>
          AI meta data remover <br/>
          <span style={{ color: 'var(--color-primary)' }}>AI info remover.</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Fast, free, and 100% privacy-focused. Remove AI meta from images entirely in your browser—no uploads required.
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '32px', border: '1px solid var(--color-border)', minHeight: '300px' }} className="animate-fade-in">
        
        {!file && (
          <FileUploader onFileSelect={(f) => { setFile(f); setStatus('idle'); setResultUrl(null); }} />
        )}

        {file && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, width: '100%' }}>
                <ImageIcon size={32} color="var(--color-secondary)" style={{ flexShrink: 0 }} />
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
              <button onClick={processImage} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '16px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <ShieldCheck size={20} /> Remove Metadata
              </button>
            )}

            {status === 'processing' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '32px 0' }}>
                <div className="animate-spin" style={{ color: 'var(--color-primary)' }}><ShieldCheck size={40} /></div>
                <div style={{ fontWeight: 500, color: 'var(--color-secondary)' }}>Scrubbing AI Tags & EXIF...</div>
              </div>
            )}

            {status === 'done' && resultUrl && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#059669', backgroundColor: '#ecfdf5', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>
                  <CheckCircle2 size={24} /> Image successfully sanitized!
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <a href={resultUrl} download={`clean_${file.name}`} style={{ backgroundColor: 'var(--color-secondary)', color: 'white', padding: '16px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', textDecoration: 'none', flex: 1 }}>
                    <Download size={20} /> Download Clean Image
                  </a>
                  <button onClick={() => setFile(null)} style={{ padding: '16px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, border: '1px solid var(--color-border)' }}>Upload Another</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginTop: '64px' }}>
        <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <Lock size={28} color="var(--color-secondary)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-secondary)' }}>100% Client-Side</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Your images never leave your device.</p>
        </div>
        <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <Zap size={28} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-secondary)' }}>Instant Processing</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Process images in milliseconds.</p>
        </div>
        <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <ShieldCheck size={28} color="var(--color-secondary)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-secondary)' }}>Deep Clean</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Strips EXIF, GPS, C2PA, and fingerprints.</p>
        </div>
      </div>

      {/* SEO Content: What is AI Metadata */}
      <section style={{ marginTop: '72px', padding: '32px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '16px' }}>
          What is AI Metadata & Why Remove It?
        </h2>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: '16px' }}>
          AI metadata includes hidden data embedded in image files by AI generation tools like Midjourney, DALL-E, Stable Diffusion, and Adobe Firefly. This metadata — stored as <strong>C2PA content credentials</strong>, <strong>XMP tags</strong>, and <strong>EXIF data</strong> — contains information about the AI model used, generation parameters, prompts, and editing history.
        </p>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: '16px' }}>
          Social media platforms like <strong>Instagram</strong>, <strong>Facebook</strong>, and <strong>LinkedIn</strong> automatically scan uploaded images for this metadata and apply <strong>"Made with AI"</strong> or <strong>"AI Info"</strong> labels. Even images that were only lightly edited with AI-powered tools (like Photoshop's Generative Fill) can get flagged.
        </p>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
          npmeta lets you <strong>remove AI metadata</strong> entirely — stripping C2PA credentials, EXIF data, GPS location, XMP tags, and AI generation parameters — so you have full control over your image's privacy and presentation.
        </p>
      </section>

      {/* SEO Content: How to Remove AI Info */}
      <section style={{ marginTop: '32px', padding: '32px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '24px' }}>
          How to Remove AI Info from Your Photos
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { step: '1', title: 'Select Your Image', desc: 'Choose a photo to clean image metadata. Our AI info remover works entirely on your device for total privacy—no server uploads.' },
            { step: '2', title: 'Process Instantly', desc: 'Click to quickly remove AI meta from image files. We strip EXIF, C2PA, and hidden AI tags in milliseconds.' },
            { step: '3', title: 'Download Securely', desc: 'Save your completely clean image, free of tracking data and "Made with AI" labels, ready to share safely.' }
          ].map((item) => (
            <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', 
                backgroundColor: 'var(--color-primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '16px', flexShrink: 0
              }}>
                {item.step}
              </div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-secondary)', marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO Content: FAQ Section */}
      <section style={{ marginTop: '32px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '24px' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqItems.map((item, index) => (
            <div 
              key={index}
              style={{ 
                backgroundColor: 'var(--color-surface)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s ease'
              }}
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                style={{
                  width: '100%', textAlign: 'left', padding: '20px 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '16px', fontWeight: 600, fontSize: '15px',
                  color: expandedFaq === index ? 'var(--color-primary)' : 'var(--color-secondary)',
                  transition: 'color 0.2s ease'
                }}
              >
                <span>{item.question}</span>
                {expandedFaq === index ? <ChevronUp size={20} style={{ flexShrink: 0 }} /> : <ChevronDown size={20} style={{ flexShrink: 0 }} />}
              </button>
              {expandedFaq === index && (
                <div style={{ 
                  padding: '0 24px 20px 24px',
                  color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.8,
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );

  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--color-border)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigateTo('home')}>
          <img src="/favicon.png" alt="npmeta logo" style={{ height: '40px', borderRadius: 'var(--radius-md)' }} />
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>npmeta</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <nav style={{ display: 'flex', gap: '20px', fontWeight: 500, color: 'var(--color-text-muted)' }} className="desktop-nav">
            <a href="/blog/" style={{ color: 'inherit', textDecoration: 'none' }}>Blog</a>
            <button onClick={() => navigateTo('how-it-works')} style={{ color: currentView === 'how-it-works' ? 'var(--color-primary)' : 'inherit' }}>How it works</button>
            <button onClick={() => navigateTo('privacy')} style={{ color: currentView === 'privacy' ? 'var(--color-primary)' : 'inherit' }}>Privacy</button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Other Tools {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
              
              {isMenuOpen && (
                <div className="animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '16px', backgroundColor: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', minWidth: '280px', zIndex: 10 }}>
                  <div style={{ padding: '8px 0' }}>
                    <button onClick={() => navigateTo('resizer')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 24px', fontWeight: currentView === 'resizer' ? 600 : 400, color: currentView === 'resizer' ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Image Resizer & Compressor</button>
                    <button onClick={() => navigateTo('converter')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 24px', fontWeight: currentView === 'converter' ? 600 : 400, color: currentView === 'converter' ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Format Converter</button>
                    <button onClick={() => navigateTo('analyzer')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 24px', fontWeight: currentView === 'analyzer' ? 600 : 400, color: currentView === 'analyzer' ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Privacy Analyzer</button>
                    <button onClick={() => navigateTo('credentials')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 24px', fontWeight: currentView === 'credentials' ? 600 : 400, color: currentView === 'credentials' ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Content Credentials Checker</button>
                    <button onClick={() => navigateTo('diff')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 24px', fontWeight: currentView === 'diff' ? 600 : 400, color: currentView === 'diff' ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Image Diff Tool</button>
                    <button onClick={() => navigateTo('watermark')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 24px', fontWeight: currentView === 'watermark' ? 600 : 400, color: currentView === 'watermark' ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Invisible Watermark</button>
                    <button onClick={() => navigateTo('exif')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 24px', fontWeight: currentView === 'exif' ? 600 : 400, color: currentView === 'exif' ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Batch EXIF Editor</button>
                    <button onClick={() => navigateTo('aidetector')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 24px', fontWeight: currentView === 'aidetector' ? 600 : 400, color: currentView === 'aidetector' ? 'var(--color-primary)' : 'var(--color-text-main)' }}>AI Image Detector</button>
                    <div style={{ padding: '8px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>Document Tools</div>
                    <button onClick={() => navigateTo('doc-cleaner')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 24px', fontWeight: currentView === 'doc-cleaner' ? 600 : 400, color: currentView === 'doc-cleaner' ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Document Metadata Cleaner</button>
                    <button onClick={() => navigateTo('doc-converter')} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 24px', fontWeight: currentView === 'doc-converter' ? 600 : 400, color: currentView === 'doc-converter' ? 'var(--color-primary)' : 'var(--color-text-main)' }}>PDF / DOCX Converter</button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content View */}
      {currentView === 'home' && renderHome()}
      {currentView === 'how-it-works' && <HowItWorks />}
      {currentView === 'privacy' && <Privacy />}
      {currentView === 'resizer' && <ImageResizer />}
      {currentView === 'converter' && <FormatConverter />}
      {currentView === 'analyzer' && <PrivacyAnalyzer />}
      {currentView === 'credentials' && <CredentialsChecker />}
      {currentView === 'diff' && <DiffTool />}
      {currentView === 'watermark' && <InvisibleWatermark />}
      {currentView === 'exif' && <BatchExifEditor />}
      {currentView === 'aidetector' && <AiDetector />}
      {currentView === 'doc-cleaner' && <DocMetadataCleaner />}
      {currentView === 'doc-converter' && <DocConverter />}
      
      {/* Footer */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--color-border)', padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 'auto' }}>
        <p>© {new Date().getFullYear()} npmeta Suite. Privacy-first image tools. <a href="/blog/" style={{ color: 'var(--color-primary)', textDecoration: 'none', marginLeft: '16px', fontWeight: 500 }}>Read our Blog</a></p>
      </footer>
    </div>
  );
}
