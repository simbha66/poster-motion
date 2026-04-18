"use client";

import React, { useState, useEffect } from 'react';
import ResultModal from '../components/ResultModal';
import ProgressBar from '../components/ProgressBar';

export default function Home() {
  const [step, setStep] = useState<1 | 2>(1);
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("Tamil");
  const [ratio, setRatio] = useState("16:9");

  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ imageSrc: string | null, optimizedPrompt: string }>({ imageSrc: null, optimizedPrompt: "" });

  const ratios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
  const indianLangs = ["Tamil", "Telugu", "Hindi", "Kannada", "Malayalam", "Bengali", "Marathi", "Gujarati", "Punjabi", "Urdu"];

  useEffect(() => {
    const saved = localStorage.getItem('postermotion-draft');
    if (saved) setPrompt(saved);
  }, []);

  const handleOptimizePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('action', 'optimize');
      formData.append('prompt', prompt);
      formData.append('language', language);
      formData.append('ratio', ratio);

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setOptimizedPrompt(data.optimizedPrompt);
        setStep(2);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!optimizedPrompt.trim()) return;

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('action', 'generateImg');
      formData.append('optimizedPrompt', optimizedPrompt);
      formData.append('ratio', ratio);

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setResult({ imageSrc: data.image, optimizedPrompt: optimizedPrompt });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main>
      <div className="glass-panel">
        <div className="deco-blob-1 animate-blob" />
        <div className="deco-blob-2 animate-blob animation-delay-2000" />

        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1>Poster<span className="gradient-text">Motion</span></h1>
          <p>Create professional marketing posters from text in seconds. Powered by Google Gemini 2.0 Flash.</p>

          {step === 1 && (
            <form onSubmit={handleOptimizePrompt} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label>Description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    localStorage.setItem('postermotion-draft', e.target.value);
                  }}
                  placeholder="Create a Marketing Flyer for a Beauty Parlour Showing its 50% Offers..."
                />
                <div style={{ textAlign: 'right', marginTop: '0.25rem', fontSize: '0.8rem', color: '#a0aab5' }}>
                  {prompt.length > 0 ? `${prompt.trim().split(/\s+/).length} / 200 words` : 'Please enter a description'}
                </div>
              </div>

              <div className="grid-cols-2">
                <div>
                  <label>Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <optgroup label="Indian Languages">
                      {indianLangs.map(l => <option key={l} value={l}>{l}</option>)}
                    </optgroup>
                    <optgroup label="International">
                      <option value="English">English</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label>Aspect Ratio</label>
                  <div className="ratio-container">
                    {ratios.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRatio(r)}
                        className={`ratio-btn ${ratio === r ? 'active' : ''}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={!prompt.trim() || isGenerating}
              >
                {isGenerating ? 'Optimizing Prompt...' : 'Optimize Prompt'}
              </button>

              {isGenerating && <div style={{ marginTop: '1rem' }}><ProgressBar /></div>}
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleGenerateImage} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label>Step 2: Review & Edit Optimized Prompt</label>
                <textarea
                  value={optimizedPrompt}
                  onChange={(e) => setOptimizedPrompt(e.target.value)}
                  style={{ minHeight: '200px' }}
                />
                <div style={{ textAlign: 'right', marginTop: '0.25rem', fontSize: '0.8rem', color: '#a0aab5' }}>
                  Feel free to edit this before rendering the final image.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className="submit-btn"
                  style={{ background: '#2a2e35', boxShadow: 'none' }}
                  onClick={() => setStep(1)}
                  disabled={isGenerating}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!optimizedPrompt.trim() || isGenerating}
                >
                  {isGenerating ? 'Generating Poster...' : 'Generate Poster'}
                </button>
              </div>

              {isGenerating && <div style={{ marginTop: '1rem' }}><ProgressBar /></div>}
            </form>
          )}

        </div>
      </div>

      {result.imageSrc && (
        <ResultModal
          imageSrc={result.imageSrc}
          optimizedPrompt={result.optimizedPrompt}
          onClose={() => setResult({ imageSrc: null, optimizedPrompt: "" })}
          onRemix={() => {
            setResult({ imageSrc: null, optimizedPrompt: "" });
            setStep(1);
          }}
          onRegenerate={() => handleGenerateImage(new Event('submit') as any)}
        />
      )}
    </main>
  );
}
