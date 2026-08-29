import { useState, useCallback } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../lib/api';

const STATS = [
  { val: '98.2%', label: 'ACCURACY' },
  { val: '1,248', label: 'SCANS DONE' },
  { val: '0.8%',  label: 'ERROR RATE' },
];

const CAPS = ['Caries Detection', 'Bone Loss', 'Treatment Plan', 'FDI Mapping'];

export default function AIScannerPage() {
  const { lang, isAr } = useLanguage();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [symptom, setSymptom] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(f => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  }, [handleFile]);

  const analyze = useCallback(async (demo = false) => {
    setLoading(true); setResult(null);
    try {
      const fd = new FormData();
      if (file && !demo) fd.append('xray', file);
      if (symptom) fd.append('symptoms', symptom);
      if (demo) fd.append('demo', 'true');
      const data = await api.analyze(fd);
      setResult(data.results);
    } catch (err) { setResult({ error: err.message }); }
    finally { setLoading(false); }
  }, [file, symptom]);

  return (
    <div className="ai-page">
      {/* ── Hero band ── */}
      <div className="ai-hero-band" style={{ textAlign: 'center', padding: '80px 32px 56px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(78,204,163,.1)', border: '1px solid rgba(78,204,163,.25)', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700, color: 'var(--teal)', marginBottom: 24, letterSpacing: 2, textTransform: 'uppercase' }}>
          🔬 {isAr ? 'ذكاء التشخيص' : 'DIAGNOSTIC INTELLIGENCE'}
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, letterSpacing: 3, lineHeight: 1, marginBottom: 16 }}>
          {isAr ? 'فحص بانورامي بالذكاء الاصطناعي' : <>PANORAMIC <span style={{ color: 'var(--teal)' }}>AI SCAN</span></>}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
          {isAr
            ? 'نظام فحص متطور لصور الأشعة وتحديد تموضع الأسنان بدقة ٩٨.٢٪ مع ترقيم FDI التلقائي.'
            : 'Advanced tooth detection and X-ray analysis powered by machine learning. Get instant diagnostics and FDI-notation mapping with 98.2% accuracy.'}
        </p>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, color: 'var(--teal)', letterSpacing: 2 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main two-column ── */}
      <div className="sec ai-2col">
        {/* Left: upload panel */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Upload zone */}
          <div
            className={`ai-upload-zone${dragOver ? ' drag-over' : ''}`}
            style={{ minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById('xray-input').click()}
          >
            {preview ? (
              <img src={preview} alt="X-Ray" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, objectFit: 'contain' }}  referrerPolicy="no-referrer"/>
            ) : (
              <>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
                <h3 style={{ marginBottom: 6 }}>{isAr ? 'قم برفع صورة الأشعة' : 'Upload X-Ray'}</h3>
                <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.6 }}>
                  {isAr ? 'اسحب وأفلت صورة الأشعة هنا أو اضغط للتصفح' : 'Drop X-ray, OPG, or intraoral image\nor click to browse'}
                </p>
                <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['JPEG', 'PNG', 'DICOM', 'TIFF'].map(fmt => (
                    <span key={fmt} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', background: 'var(--b2)', borderRadius: 5, color: 'var(--text3)', letterSpacing: 1 }}>{fmt}</span>
                  ))}
                </div>
              </>
            )}
            <input id="xray-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          </div>

          {/* Analyze buttons */}
          <div style={{ padding: '16px 20px', display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={() => analyze(false)} disabled={loading || (!file && !symptom)} style={{ flex: 1 }}>
              {loading ? (isAr ? '🔬 جاري التحليل…' : '🔬 Analyzing…') : (isAr ? '▶ بدء التحليل' : '▶ Analyze')}
            </button>
            <button className="btn-outline" onClick={() => analyze(true)} disabled={loading}>
              {isAr ? '▶ عرض تجريبي' : '▶ Start Demo'}
            </button>
          </div>

          {/* Symptoms input */}
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
              {isAr ? 'أو قم بوصف الأعراض' : 'OR DESCRIBE SYMPTOMS'}
            </div>
            <textarea
              placeholder={isAr ? 'مثال: المريض يعاني من حساسية في الضرس العلوي الأيسر…' : 'e.g. Patient has sensitivity in upper left molar, dark spot visible on buccal surface…'}
              value={symptom}
              onChange={e => setSymptom(e.target.value)}
              rows={4}
              style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 10, padding: 12, color: 'var(--text)', fontSize: 12, fontFamily: 'Inter,sans-serif', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        </div>

        {/* Right: results panel */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 16, padding: 24, minHeight: 400 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>
            ANALYSIS RESULTS
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div className="ai-loading-spin" style={{ fontSize: 40 }}>🔬</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 12 }}>{isAr ? 'جاري التحليل…' : 'Analyzing your X-ray…'}</div>
            </div>
          )}

          {!loading && !result && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
              <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, maxWidth: 260 }}>
                {isAr ? 'يرجى رفع ملف الأشعة أو تشغيل الفحص التجريبي لتلقي تشخيص مقترح.' : 'Upload a dental X-ray or use the demo scan to receive AI-powered analysis with treatment recommendations.'}
              </p>
              {/* Capability tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}>
                {CAPS.map(c => (
                  <span key={c} style={{ fontSize: 11, padding: '4px 12px', border: '1px solid var(--b2)', borderRadius: 20, color: 'var(--text3)' }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {!loading && result?.error && (
            <div style={{ color: '#f87171', fontSize: 13 }}>⚠️ {result.error}</div>
          )}

          {!loading && result && !result.error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {result.accuracy && (
                <div style={{ background: 'rgba(78,204,163,.08)', border: '1px solid rgba(78,204,163,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>
                  🎯 {isAr ? 'دقة التشخيص:' : 'Accuracy:'} {result.accuracy}
                </div>
              )}
              {result.findings?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 10 }}>{isAr ? 'النتائج' : 'Findings'}</div>
                  {result.findings.map((f, i) => (
                    <div key={i} style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.15)', borderRadius: 9, padding: '10px 12px', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, background: 'rgba(239,68,68,.2)', color: '#f87171', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>Tooth {f.tooth}</span>
                        <span style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>{Math.round((f.confidence || 0) * 100)}% conf.</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{f.issue}</div>
                    </div>
                  ))}
                </div>
              )}
              {result.normal?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>{isAr ? 'نتائج طبيعية' : 'Normal Findings'}</div>
                  {result.normal.map((n, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text2)', padding: '4px 0' }}>
                      <span style={{ color: '#22c55e' }}>✓</span> {n}
                    </div>
                  ))}
                </div>
              )}
              {result.treatmentPlan?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{isAr ? 'خطة العلاج' : 'Treatment Plan'}</div>
                  {result.treatmentPlan.map((tp, i) => (
                    <div key={i} style={{ background: 'var(--b2)', borderRadius: 8, padding: '8px 12px', marginBottom: 6, fontSize: 12, color: 'var(--text2)' }}>
                      {tp.treatment || tp}
                    </div>
                  ))}
                </div>
              )}
              {result.recommendations && (
                <div style={{ background: 'rgba(59,130,246,.07)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 9, padding: '12px 14px', fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
                  💡 {result.recommendations}
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ marginTop: 20, padding: '10px 12px', background: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.12)', borderRadius: 8, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
            ⚠️ {isAr ? 'إبراء ذمة طبي: هذا النظام أداة مساعدة فقط، ويجب تأكيد جميع النتائج من قبل طبيب أسنان مرخص.' : 'Medical Disclaimer: DentalShark AI is a clinical support tool. All diagnoses must be confirmed by a licensed dental professional.'}
          </div>
        </div>
      </div>
    </div>
  );
}
