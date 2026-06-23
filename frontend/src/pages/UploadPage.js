import React, { useState, useRef, useCallback } from 'react';
import {
  Box, Container, Typography, Button, LinearProgress,
  Alert, Paper, Chip, Stack, Fade, CircularProgress,
  TextField, InputAdornment, IconButton, Collapse
} from '@mui/material';
import {
  CloudUpload, InsertDriveFile, PictureAsPdf, TableChart,
  AutoAwesome, CheckCircle, Error as ErrorIcon, Close,
  BarChart, AccountBalance, TrendingUp, Psychology, Key
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const FEATURES = [
  { icon: <BarChart />, label: 'KPI Dashboard', color: '#1565C0' },
  { icon: <AccountBalance />, label: 'P&L Analysis', color: '#00897B' },
  { icon: <TrendingUp />, label: 'Financial Charts', color: '#7B1FA2' },
  { icon: <Psychology />, label: 'AI Insights', color: '#E65100' },
];

export default function UploadPage({ onAnalysisComplete }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('');
  const [groqKey, setGroqKey] = useState(localStorage.getItem('groq_key') || '');
  const [showKey, setShowKey] = useState(false);
  const fileInputRef = useRef();

  const validateFile = (f) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'xlsx', 'xls'].includes(ext)) {
      return 'Only PDF and Excel (.xlsx, .xls) files are supported.';
    }
    if (f.size > 50 * 1024 * 1024) {
      return 'File must be under 50 MB.';
    }
    return null;
  };

  const handleFile = (f) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError('');
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setError('');

    if (groqKey) {
      localStorage.setItem('groq_key', groqKey);
    }

    const stages = [
      { msg: 'Uploading file...', pct: 15 },
      { msg: 'Extracting financial data...', pct: 35 },
      { msg: 'Calculating KPIs & ratios...', pct: 55 },
      { msg: 'Generating P&L statement...', pct: 70 },
      { msg: 'Running AI analysis...', pct: 85 },
      { msg: 'Preparing dashboard...', pct: 95 },
    ];

    let stageIdx = 0;
    const stageInterval = setInterval(() => {
      if (stageIdx < stages.length) {
        setStage(stages[stageIdx].msg);
        setProgress(stages[stageIdx].pct);
        stageIdx++;
      }
    }, 800);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(groqKey ? { 'X-Groq-Key': groqKey } : {}),
        },
      });

      clearInterval(stageInterval);
      setProgress(100);
      setStage('Analysis complete!');
      setTimeout(() => onAnalysisComplete(res.data), 500);
    } catch (err) {
      clearInterval(stageInterval);
      const msg = err.response?.data?.detail || err.message || 'Upload failed. Please try again.';
      setError(msg);
      setLoading(false);
      setProgress(0);
      setStage('');
    }
  };

  const fileExt = file?.name.split('.').pop().toLowerCase();

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #F5F7FA 0%, #EBF0FB 40%, #F0F9F6 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── HEADER ── Apple iOS / Material Design Premium ── */}
      <Box sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 40%, #2196F3 70%, #42A5F5 100%)',
        color: 'white',
        py: { xs: 2.8, md: 4 },
        px: 3,
        boxShadow: '0 8px 32px rgba(10,37,64,0.45)',
        /* glow left */
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-80%', left: '-8%',
          width: '50%', height: '260%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.055) 0%, transparent 68%)',
          pointerEvents: 'none',
        },
        /* glow right — green accent */
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-50%', right: '-4%',
          width: '42%', height: '220%',
          background: 'radial-gradient(ellipse, rgba(0,220,130,0.09) 0%, transparent 65%)',
          pointerEvents: 'none',
        },
      }}>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>

          {/* Row 1 — logo + title + live badge */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>

            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Logo */}
              <Box sx={{
                width: 50, height: 50,
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 2px 14px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.18)',
                flexShrink: 0,
              }}>
                <img src="/logo.png" alt="logo" style={{ width: 50, height: 50, objectFit: 'cover' }} />
              </Box>

              {/* Title */}
              <Box>
                <Typography sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.15rem', md: '1.4rem' },
                  fontFamily: '-apple-system, "SF Pro Display", "Plus Jakarta Sans", sans-serif',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.15,
                  color: '#FFFFFF',
                }}>
                  AI Financial Analyzer
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.8} mt={0.35}>
                  <Box sx={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#30D158',
                    boxShadow: '0 0 7px #30D158',
                    animation: 'blink 2.2s ease-in-out infinite',
                    '@keyframes blink': {
                      '0%,100%': { opacity: 1 },
                      '50%': { opacity: 0.3 },
                    },
                  }} />
                  <Typography sx={{
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.52)',
                    fontFamily: '-apple-system, "SF Pro Text", sans-serif',
                    letterSpacing: '0.15px',
                  }}>
                    Powered by Groq LLM
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            {/* Live badge — hidden on mobile */}
            <Box sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center', gap: 0.9,
              px: 1.8, py: 0.65,
              borderRadius: '30px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.13)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}>
              <Box sx={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#30D158',
                boxShadow: '0 0 8px #30D158',
                animation: 'blink 2.2s ease-in-out infinite',
              }} />
              <Typography sx={{
                fontSize: '0.70rem', fontWeight: 600,
                color: 'rgba(255,255,255,0.82)',
                fontFamily: '-apple-system, "SF Pro Text", sans-serif',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                Live Analysis
              </Typography>
            </Box>
          </Stack>

          {/* Thin divider */}
          <Box sx={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.11) 30%, rgba(255,255,255,0.11) 70%, transparent)',
            mb: 2,
          }} />

          {/* Row 2 — feature pills */}
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {FEATURES.map((f) => (
              <Box key={f.label} sx={{
                display: 'flex', alignItems: 'center', gap: 0.8,
                px: 1.5, py: 0.6,
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.11)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                transition: 'all 0.18s ease',
                cursor: 'default',
                '&:hover': {
                  background: 'rgba(255,255,255,0.13)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  transform: 'translateY(-1px)',
                },
              }}>
                {React.cloneElement(f.icon, { sx: { fontSize: 13, color: 'rgba(255,255,255,0.75)' } })}
                <Typography sx={{
                  fontSize: '0.74rem', fontWeight: 500,
                  color: 'rgba(255,255,255,0.78)',
                  fontFamily: '-apple-system, "SF Pro Text", sans-serif',
                  letterSpacing: '0.05px',
                }}>
                  {f.label}
                </Typography>
              </Box>
            ))}
          </Stack>

        </Container>
      </Box>
      {/* ── END HEADER ── */}

      {/* Main Content */}
      <Container maxWidth="md" sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
        {/* Groq API Key */}


        {/* Upload Zone */}
        <Paper
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !file && !loading && fileInputRef.current.click()}
          sx={{
            p: { xs: 4, md: 6 },
            mb: 3,
            borderRadius: 4,
            border: `2px dashed ${dragging ? '#1565C0' : file ? '#00897B' : '#C5D0E6'}`,
            background: dragging
              ? 'rgba(21,101,192,0.04)'
              : file
              ? 'rgba(0,137,123,0.04)'
              : 'rgba(255,255,255,0.8)',
            cursor: file || loading ? 'default' : 'pointer',
            transition: 'all 0.25s ease',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            '&:hover': !file && !loading ? { border: '2px dashed #1565C0', background: 'rgba(21,101,192,0.03)' } : {},
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />

          {!file ? (
            <Box>
              <Box sx={{
                width: 80, height: 80, borderRadius: '50%',
                background: dragging ? 'rgba(21,101,192,0.1)' : 'rgba(21,101,192,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 3,
                transition: 'all 0.2s',
                transform: dragging ? 'scale(1.1)' : 'scale(1)',
              }}>
                <CloudUpload sx={{ fontSize: 40, color: '#1565C0', opacity: dragging ? 1 : 0.7 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} mb={1}>
                {dragging ? 'Drop your file here' : 'Upload Financial Statement'}
              </Typography>
              <Typography color="text.secondary" mb={3}>
                Drag & drop or click to browse
              </Typography>
              <Stack direction="row" justifyContent="center" spacing={2}>
                <Chip
                  icon={<PictureAsPdf sx={{ fontSize: 16 }} />}
                  label="PDF"
                  variant="outlined"
                  sx={{ borderColor: '#E53935', color: '#E53935', fontWeight: 600 }}
                />
                <Chip
                  icon={<TableChart sx={{ fontSize: 16 }} />}
                  label="Excel (.xlsx)"
                  variant="outlined"
                  sx={{ borderColor: '#1565C0', color: '#1565C0', fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                Max file size: 50 MB
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{
                width: 72, height: 72, borderRadius: '16px',
                background: fileExt === 'pdf' ? 'rgba(229,57,53,0.1)' : 'rgba(21,101,192,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
              }}>
                {fileExt === 'pdf'
                  ? <PictureAsPdf sx={{ fontSize: 40, color: '#E53935' }} />
                  : <TableChart sx={{ fontSize: 40, color: '#1565C0' }} />
                }
              </Box>
              <Typography variant="h6" fontWeight={700} mb={0.5}>{file.name}</Typography>
              <Typography color="text.secondary" mb={2}>
                {(file.size / 1024).toFixed(1)} KB • {fileExt?.toUpperCase()}
              </Typography>
              {!loading && (
                <Button
                  size="small"
                  startIcon={<Close />}
                  onClick={(e) => { e.stopPropagation(); setFile(null); setError(''); }}
                  sx={{ color: 'text.secondary' }}
                >
                  Remove
                </Button>
              )}
            </Box>
          )}
        </Paper>

        {/* Error */}
        <Collapse in={!!error}>
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            onClose={() => setError('')}
            sx={{ mb: 3, borderRadius: 3 }}
          >
            {error}
          </Alert>
        </Collapse>

        {/* Progress */}
        <Collapse in={loading}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <CircularProgress size={20} thickness={5} />
              <Typography variant="body2" fontWeight={600} color="primary.main">{stage}</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8, borderRadius: 4,
                backgroundColor: 'rgba(21,101,192,0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #1565C0, #00897B)',
                  borderRadius: 4,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" mt={1} display="block" textAlign="right">
              {progress}%
            </Typography>
          </Paper>
        </Collapse>

        {/* CTA */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={!file || loading}
          onClick={handleUpload}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
          sx={{
            py: 1.8, fontSize: '1rem',
            background: 'linear-gradient(135deg, #1565C0 0%, #00897B 100%)',
            boxShadow: '0 6px 24px rgba(21,101,192,0.35)',
            '&:hover': { boxShadow: '0 8px 30px rgba(21,101,192,0.45)' },
            '&:disabled': { background: '#E0E0E0', boxShadow: 'none' },
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Financial Statement'}
        </Button>

        {/* Info Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 4 }}>
          {[
            { title: 'Supported Formats', items: ['Balance Sheet (PDF/Excel)', 'Income Statement', 'Cash Flow Statement', 'Annual Reports', 'Quarterly Filings'] },
            { title: 'What You Get', items: ['12+ Financial KPIs', 'Profit & Loss Statement', 'Interactive Charts', 'AI Recommendations', 'Exportable Reports'] },
          ].map((card) => (
            <Paper key={card.title} sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="primary.main">
                {card.title}
              </Typography>
              <Stack spacing={0.8}>
                {card.items.map((item) => (
                  <Stack key={item} direction="row" spacing={1} alignItems="center">
                    <CheckCircle sx={{ fontSize: 15, color: '#00897B' }} />
                    <Typography variant="caption" color="text.secondary">{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}