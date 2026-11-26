import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence, CalculateMetadataFunction} from 'remotion';
import {BG, ACC, RED, GREEN, HEAD, BODY} from './theme';

export type FehlerProps = {hook: string[]; levels: {word: string; odd: string; at: number}[]; cta: string};
const COLS = 4, ROWS = 10, PLAY = 180, REVEAL = 60, LVL = PLAY + REVEAL, HOOK = 45, CTA = 90;
export const fehlerMeta: CalculateMetadataFunction<FehlerProps> = ({props}) => ({durationInFrames: HOOK + LVL * props.levels.length + CTA});
const LABELS = ['LEICHT', 'MITTEL', 'SCHWER', 'PROFI', 'GENIE'], COLORS = [GREEN, ACC, RED, '#b46bff', '#ff8a3d'];

const Grid: React.FC<{l: FehlerProps['levels'][0]; reveal: number; blur?: number}> = ({l, reveal, blur = 0}) => {
  const len = Math.max(l.word.length, l.odd.length), fs = len > 9 ? 36 : len > 8 ? 40 : 44;
  const cw = 250, ch = 104, x0 = (1080 - cw * COLS) / 2, y0 = 430, r = Math.floor(l.at / COLS), c = l.at % COLS;
  return (
    <AbsoluteFill style={{filter: blur ? `blur(${blur}px)` : undefined}}>
      {Array.from({length: COLS * ROWS}).map((_, i) => {
        const odd = i === l.at, dim = reveal > 0 && !odd ? interpolate(reveal, [0, 1], [1, 0.25]) : 1;
        return <div key={i} style={{position: 'absolute', left: x0 + (i % COLS) * cw, top: y0 + Math.floor(i / COLS) * ch, width: cw, height: ch,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BODY, fontSize: fs, color: odd && reveal > 0 ? RED : '#fff', opacity: dim}}>{odd ? l.odd : l.word}</div>;
      })}
      {reveal > 0 && <div style={{position: 'absolute', left: x0 + c * cw - 6, top: y0 + r * ch + 8, width: cw + 12, height: ch - 16, border: `8px solid ${RED}`,
        borderRadius: 60, transform: `scale(${interpolate(reveal, [0, 1], [2.5, 1])})`, opacity: reveal, boxShadow: `0 0 40px ${RED}`}} />}
    </AbsoluteFill>);
};

const Timer: React.FC<{f: number}> = ({f}) => {
  const left = Math.max(0, PLAY - f), secs = Math.ceil(left / 30), R = 70, C = 2 * Math.PI * R, col = secs <= 2 ? RED : ACC;
  const pulse = 1 + 0.08 * Math.max(0, 1 - (f % 30) / 8);
  return <div style={{position: 'absolute', left: 450, top: 1530, width: 180, height: 180, transform: `scale(${pulse})`}}>
    <svg width={180} height={180}><circle cx={90} cy={90} r={R} stroke="#ffffff22" strokeWidth={14} fill="none" />
      <circle cx={90} cy={90} r={R} stroke={col} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - left / PLAY)} transform="rotate(-90 90 90)" /></svg>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontSize: 90, color: col}}>{secs}</div></div>;
};

const Level: React.FC<{l: FehlerProps['levels'][0]; n: number}> = ({l, n}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const inS = spring({frame: f, fps, config: {damping: 12}}), rv = f >= PLAY ? spring({frame: f - PLAY, fps, config: {damping: 14}}) : 0;
  const okS = f >= PLAY + 15 ? spring({frame: f - PLAY - 15, fps, config: {damping: 10}}) : 0;
  return <AbsoluteFill style={{background: BG}}>
    <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', transform: `scale(${inS})`}}>
      <div style={{fontFamily: HEAD, fontSize: 120, color: '#fff'}}>LEVEL {n + 1}</div>
      <div style={{display: 'inline-block', marginTop: 10, padding: '8px 30px', borderRadius: 40, fontFamily: BODY, fontSize: 38, background: COLORS[n], color: BG}}>{LABELS[n]}</div></div>
    <Grid l={l} reveal={rv} />
    {f < PLAY ? <Timer f={f} /> : <div style={{position: 'absolute', top: 1540, width: '100%', textAlign: 'center', transform: `scale(${okS})`, fontFamily: HEAD, fontSize: 76, color: GREEN}}>RICHTIG: {l.word.toUpperCase()} ✅</div>}
  </AbsoluteFill>;
};

export const Fehler: React.FC<FehlerProps> = ({hook, levels, cta}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), s = spring({frame: f, fps, config: {damping: 9}});
  const ce = f - HOOK - levels.length * LVL, a = spring({frame: ce, fps}), b = spring({frame: ce - 12, fps}), c = spring({frame: ce - 24, fps});
  return <AbsoluteFill style={{background: BG}}>
    <Sequence durationInFrames={HOOK}><AbsoluteFill><Grid l={levels[0]} reveal={0} blur={14} />
      <AbsoluteFill style={{background: '#0f1226bb', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div style={{transform: `scale(${s}) rotate(-3deg)`}}>
          <div style={{fontFamily: HEAD, fontSize: 150, color: ACC, lineHeight: 1}}>{hook[0]}</div>
          {hook.slice(1).map((h, i) => <div key={i} style={{fontFamily: HEAD, fontSize: 110, color: '#fff', lineHeight: 1.1}}>{h}</div>)}
        </div></AbsoluteFill></AbsoluteFill></Sequence>
    {levels.map((l, i) => <Sequence key={i} from={HOOK + i * LVL} durationInFrames={LVL}><Level l={l} n={i} /></Sequence>)}
    <Sequence from={HOOK + levels.length * LVL}><AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 60}}>
      <div style={{fontFamily: HEAD, fontSize: 120, color: '#fff', transform: `scale(${a})`, lineHeight: 1.05}}>WIE VIELE<br />HAST DU?</div>
      <div style={{fontFamily: HEAD, fontSize: 170, color: ACC, transform: `scale(${b})`, margin: '20px 0'}}>{Array.from({length: levels.length + 1}, (_, i) => i).join(' · ')}</div>
      <div style={{fontFamily: BODY, fontSize: 48, color: '#fff', transform: `scale(${c})`}}>{cta}</div></AbsoluteFill></Sequence>
  </AbsoluteFill>;
};
