"""Build one Short from a spec JSON.  Usage: python3 scripts/make_video.py specs/2026-11-26.json out/2026-11-26.mp4"""
import json, os, re, subprocess, sys, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = os.path.join(ROOT, 'assets/voice/de-thorsten-low.onnx')
BROWSER = ['--browser-executable=/usr/bin/google-chrome', '--chrome-mode=chrome-for-testing']

def run(cmd, **kw):
    subprocess.run(cmd, check=True, **kw)

def dur(p):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).decode())

def tts(text, out):
    run(['piper', '-m', VOICE, '--length_scale', '1.1', '-f', out], input=text.encode(), stderr=subprocess.DEVNULL)

def render(comp, props, out):
    pf = out + '.props.json'
    json.dump(props, open(pf, 'w'), ensure_ascii=False)
    tmp = out[:-4] + '.tmp.mp4'
    run(['npx', 'remotion', 'render', 'remotion/src/index.ts', comp, tmp, f'--props={pf}', '--crf=18', '--log=error'] + BROWSER, cwd=ROOT)
    os.replace(tmp, out); os.remove(pf)

def story(spec, out, tmp):
    gap, t0 = 0.45, 0.0
    parts, sents = [], []
    # Title is read first, then each sentence.
    items = [spec['title']] + spec['sentences']
    for i, s in enumerate(items):
        w = os.path.join(tmp, f's{i}.wav'); tts(re.sub(r'\*', '', s), w); d = dur(w)
        if i > 0: sents.append({'text': s, 'start': round(t0, 3), 'end': round(t0 + d, 3)})
        parts.append((w, d)); t0 += d + (gap if i else 0.8)
    total = t0 + 6.5
    # Concatenate voice with silences in between.
    inputs, filt = [], ''
    pos = 0.0
    for i, (w, d) in enumerate(parts):
        inputs += ['-i', w]; ms = int(pos * 1000)
        filt += f'[{i}]adelay={ms}|{ms}[a{i}];'; pos += d + (gap if i else 0.8)
    filt += ''.join(f'[a{i}]' for i in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,apad,atrim=0:{total},loudnorm=I=-15[o]'
    audio = os.path.join(tmp, 'voice.wav')
    run(['ffmpeg', '-y', '-loglevel', 'error'] + inputs + ['-filter_complex', filt, '-map', '[o]', '-ar', '48000', '-ac', '2', audio])
    video = os.path.join(tmp, 'v.mp4')
    render('Story', {'title': spec['title'], 'badge': spec['badge'], 'outroTitle': spec.get('outroTitle', 'NEUE WÖRTER'), 'sentences': sents, 'vocab': spec['vocab'],
                     'question': spec['question'], 'total': total}, video)
    return video, audio, total

def fehler(spec, out, tmp):
    n = len(spec['levels']); total = 1.5 + 8 * n + 3
    tick, ding, whoosh = (os.path.join(tmp, x) for x in ('tick.wav', 'ding.wav', 'whoosh.wav'))
    run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=f=1400:d=0.05,afade=t=out:st=0.01:d=0.04,volume=0.6', tick])
    run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=f=880:d=0.6', '-f', 'lavfi', '-i', 'sine=f=1320:d=0.6', '-filter_complex',
         '[1]adelay=90|90[b];[0][b]amix=2,afade=t=out:st=0.05:d=0.55,volume=1.6', ding])
    run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anoisesrc=d=0.5:c=pink:a=0.5,highpass=f=800,afade=t=in:d=0.25,afade=t=out:st=0.25:d=0.25', whoosh])
    ev = [(whoosh, 0)]
    for L in range(n):
        s = 1.5 + 8 * L
        ev += [(tick, s + k) for k in range(6)] + [(ding, s + 6), (whoosh, s + 8)]
    inputs, filt = [], ''
    for i, (f, t) in enumerate(ev):
        inputs += ['-i', f]; ms = int(t * 1000); filt += f'[{i}]adelay={ms}|{ms}[a{i}];'
    filt += ''.join(f'[a{i}]' for i in range(len(ev))) + f'amix=inputs={len(ev)}:normalize=0,apad,atrim=0:{total}[o]'
    audio = os.path.join(tmp, 'sfx.wav')
    run(['ffmpeg', '-y', '-loglevel', 'error'] + inputs + ['-filter_complex', filt, '-map', '[o]', '-ar', '48000', '-ac', '2', audio])
    video = os.path.join(tmp, 'v.mp4')
    render('Fehler', {'hook': spec['hook'], 'levels': spec['levels'], 'cta': spec.get('cta', 'Schreib’s in die Kommentare 💬')}, video)
    return video, audio, total

if __name__ == '__main__':
    spec = json.load(open(sys.argv[1])); out = os.path.abspath(sys.argv[2]); os.makedirs(os.path.dirname(out), exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        video, audio, total = (story if spec['type'] == 'story' else fehler)(spec, out, tmp)
        tmpout = out[:-4] + '.part.mp4'
        run(['ffmpeg', '-y', '-loglevel', 'error', '-i', video, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', tmpout])
        os.replace(tmpout, out)
    print(f'{out}  {total:.1f}s')
