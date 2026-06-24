import React from 'react';
import { Shield, EyeOff, ServerOff } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="animate-fade-in" style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '16px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          We believe in absolute privacy. Our architecture ensures your images never leave your computer.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <div style={{ padding: '32px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <ServerOff size={40} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '8px' }}>Zero Server Uploads</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>We don't have servers that process your files. Every byte of image data stays on your local device.</p>
        </div>
        
        <div style={{ padding: '32px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <EyeOff size={40} color="var(--color-secondary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '8px' }}>No Tracking</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>We do not record what you upload or track the content of your images. What happens on your machine stays on your machine.</p>
        </div>
        
        <div style={{ padding: '32px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <Shield size={40} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '8px' }}>100% Client-Side</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>We utilize modern browser technologies like the HTML5 Canvas API to securely alter pixels completely within your browser environment.</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '16px' }}>What metadata do we remove?</h2>
        <ul style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginLeft: '24px', listStyleType: 'disc' }}>
          <li><strong>EXIF Data:</strong> Camera models, lens specifics, GPS locations, timestamps, and device identifiers.</li>
          <li><strong>IPTC & XMP:</strong> Author data, creator notes, software edit history.</li>
          <li><strong>C2PA Content Credentials:</strong> Adobe Firefly, Photoshop, and Content Authenticity Initiative provenance tags.</li>
          <li><strong>AI Generator Signatures:</strong> Metadata injected by DALL-E, Midjourney, Stable Diffusion, and other generative models.</li>
          <li><strong>Fingerprints:</strong> We subtly shift image data pixels by invisible amounts to fundamentally alter the image hash to circumvent aggressive tracking.</li>
        </ul>
      </div>
    </div>
  );
}
