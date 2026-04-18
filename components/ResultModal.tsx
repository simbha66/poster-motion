"use client";

import React from 'react';

interface ResultModalProps {
  imageSrc: string | null;
  optimizedPrompt: string;
  onClose: () => void;
  onRemix: () => void;
  onRegenerate: () => void;
}

export default function ResultModal({ imageSrc, optimizedPrompt, onClose, onRemix, onRegenerate }: ResultModalProps) {
  if (!imageSrc) return null;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `postermotion-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div 
      className="modal-overlay" 
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
      }}
    >
      <div className="glass-panel" style={{ width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', border: 'none', color: '#a0aab5', fontSize: '1.5rem', cursor: 'pointer' }}>
          ✕
        </button>
        
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column' }}>
          <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem', marginTop: 0 }}>Your Poster is Ready!</h2>
          <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', minHeight: '300px' }}>
            <img src={imageSrc} alt="Generated Poster" style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
        </div>
        
        <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#a0aab5', marginTop: 0, marginBottom: '0.5rem' }}>Optimized Prompt Used</h3>
            <p style={{ fontSize: '0.9rem', color: '#e0e2e5', margin: 0, maxHeight: '200px', overflowY: 'auto' }}>{optimizedPrompt}</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: 'auto' }}>
            <button className="submit-btn" onClick={handleDownload} style={{ margin: 0 }}>
              Download Poster
            </button>
            
            <button 
              onClick={onRegenerate}
              className="submit-btn"
              style={{ background: 'rgba(255,255,255,0.1)', boxShadow: 'none', margin: 0 }}
            >
              Regenerate Variation
            </button>
            <button 
              onClick={onRemix}
              className="submit-btn"
              style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none', margin: 0, color: '#a0aab5' }}
            >
              Remix (Edit Inputs)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
