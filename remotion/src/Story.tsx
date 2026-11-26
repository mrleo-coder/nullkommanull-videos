import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, CalculateMetadataFunction} from 'remotion';
import {BG, ACC, SOFT, HEAD, BODY, TEXT, GREEN} from './theme';

// Sentences carry times in seconds (from the TTS step). Words wrapped in *stars* are vocab highlights.
export type StoryProps = {title: string; badge: string; outroTitle?: string; sentences: {text: string; start: number; end: number}[];
  vocab: {de: string; hint: string}[]; question: string; total: number};

export const storyMeta: CalculateMetadataFunction<StoryProps> = ({props}) => ({durationInFrames: Math.ceil(props.total * 30)});

const Rich: React.FC<{t: string; active: boolean}> = ({t, active}) => (
  <>{t.split(/(\*[^*]+\*)/).map((p, i) => p.startsWith('*')
    ? <span key={i} style={{color: active ? ACC : '#c9b45a', fontWeight: 800}}>{p.slice(1, -1)}</span>
    : <span key={i}>{p}</span>)}</>);

export const Story: React.FC<StoryProps> = ({title, badge, outroTitle = 'NEUE WÖRTER', sentences, vocab, question}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  const storyEnd = sentences[sentences.length - 1].end;
  let cur = sentences.findIndex(s => t >= s.start && t < s.end + 0.35);
  if (cur < 0) cur = t < sentences[0].start ? 0 : sentences.length - 1;
  // Smooth scroll: each sentence block is measured approximately by char count.
  const lineH = 78, charsPerLine = 30;
  const heights = sentences.map(s => Math.ceil(s.text.replace(/\*/g, '').length / charsPerLine) * lineH + 34);
  const offsets = heights.reduce<number[]>((a, h, i) => [...a, (a[i - 1] ?? 0) + (i ? heights[i - 1] : 0)], []).map((_, i) => heights.slice(0, i).reduce((x, y) => x + y, 0));
  const target = (i: number) => offsets[i] + heights[i] / 2;
  const s0 = sentences[cur];
  const prog = cur > 0 ? interpolate(t, [s0.start - 0.25, s0.start + 0.25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const y = cur > 0 ? target(cur - 1) + (target(cur) - target(cur - 1)) * prog : target(0);
  const titleIn = spring({frame: f, fps, config: {damping: 14}});
  const endT = t - storyEnd - 0.4;
  const outro = endT > 0 ? spring({frame: Math.round(endT * fps), fps, config: {damping: 14}}) : 0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 20%, #1d2350, ${BG} 70%)`}}>
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', transform: `translateY(${(1 - titleIn) * -60}px)`, opacity: titleIn * (1 - outro)}}>
        <div style={{display: 'inline-block', padding: '6px 26px', borderRadius: 30, background: GREEN, color: BG, fontFamily: BODY, fontSize: 32}}>{badge}</div>
        <div style={{fontFamily: HEAD, fontSize: 92, color: '#fff', marginTop: 18, padding: '0 60px', lineHeight: 1.05}}>{title}</div>
      </div>
      <div style={{position: 'absolute', top: 470, bottom: 260, left: 0, right: 0, overflow: 'hidden', opacity: 1 - outro,
        maskImage: 'linear-gradient(transparent, black 18%, black 82%, transparent)', WebkitMaskImage: 'linear-gradient(transparent, black 18%, black 82%, transparent)'}}>
        <div style={{position: 'absolute', left: 80, right: 80, top: 595 - y}}>
          {sentences.map((s, i) => (
            <div key={i} style={{height: heights[i], fontFamily: TEXT, fontWeight: 700, fontSize: 56, lineHeight: `${lineH}px`,
              color: i === cur ? '#fff' : SOFT, opacity: i === cur ? 1 : i < cur ? 0.45 : 0.3, transition: 'none'}}>
              <Rich t={s.text} active={i === cur} />
            </div>))}
        </div>
      </div>
      {outro > 0 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: 70, transform: `scale(${0.9 + 0.1 * outro})`, opacity: outro}}>
          <div style={{fontFamily: HEAD, fontSize: 80, color: ACC, marginBottom: 30}}>{outroTitle}</div>
          {vocab.map((v, i) => (
            <div key={i} style={{width: '100%', background: '#ffffff12', borderRadius: 28, padding: '22px 34px', marginBottom: 20}}>
              <div style={{fontFamily: BODY, fontSize: 50, color: '#fff'}}>{v.de}</div>
              <div style={{fontFamily: TEXT, fontSize: 38, color: SOFT, marginTop: 4}}>{v.hint}</div>
            </div>))}
          <div style={{fontFamily: BODY, fontSize: 44, color: '#fff', textAlign: 'center', marginTop: 40, lineHeight: 1.3}}>{question} 💬</div>
        </AbsoluteFill>)}
    </AbsoluteFill>);
};
