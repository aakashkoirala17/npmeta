import React from 'react';
import { UploadCloud, Layers, Cpu, Download } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="animate-fade-in" style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '16px' }}>
          How It Works
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Our 4-step process removes all AI traces from your images — entirely in your browser.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Step 1 */}
        <div style={{ display: 'flex', gap: '24px', backgroundColor: 'var(--color-surface)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'rgba(0, 56, 147, 0.05)', padding: '16px', borderRadius: '50%', color: 'var(--color-secondary)' }}>
              <UploadCloud size={32} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '8px' }}>1. Upload Your Image</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Your image is loaded directly into your browser's memory using the HTML5 File API. No network transmission occurs — everything stays strictly on your device.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: 'flex', gap: '24px', backgroundColor: 'var(--color-surface)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'rgba(220, 20, 60, 0.05)', padding: '16px', borderRadius: '50%', color: 'var(--color-primary)' }}>
              <Layers size={32} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>2. Canvas Processing</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              The image is re-rendered internally on a hidden canvas. This fundamentally reconstructs the image pixels and automatically strips all hidden files, EXIF, IPTC, XMP metadata, and AI-specific signatures.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ display: 'flex', gap: '24px', backgroundColor: 'var(--color-surface)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'rgba(0, 56, 147, 0.05)', padding: '16px', borderRadius: '50%', color: 'var(--color-secondary)' }}>
              <Cpu size={32} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '8px' }}>3. Pixel Modification</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Our algorithm applies a microscopic change to pixel values (±1 RGB) that is invisible to the human eye but completely resets the image's digital fingerprint or hash.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div style={{ display: 'flex', gap: '24px', backgroundColor: 'var(--color-surface)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'rgba(220, 20, 60, 0.05)', padding: '16px', borderRadius: '50%', color: 'var(--color-primary)' }}>
              <Download size={32} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>4. Download Clean Image</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              The processed image is encoded as a fresh file with optimized compression. All metadata traces are eliminated permanently while maintaining full visual fidelity.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
