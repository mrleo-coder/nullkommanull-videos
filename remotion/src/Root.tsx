import React from 'react';
import {Composition} from 'remotion';
import {Story, storyMeta, StoryProps} from './Story';
import {Fehler, fehlerMeta, FehlerProps} from './Fehler';

export const Root = () => (
  <>
    <Composition id="Story" component={Story} fps={30} width={1080} height={1920} durationInFrames={300}
      defaultProps={{title: 'Test', badge: 'TEST', sentences: [{text: 'Hallo.', start: 0, end: 1}], vocab: [], question: '?', total: 10} as StoryProps}
      calculateMetadata={storyMeta} />
    <Composition id="Fehler" component={Fehler} fps={30} width={1080} height={1920} durationInFrames={300}
      defaultProps={{hook: ['NUR 1 %', 'FINDET ALLE', '3 FEHLER 👀'], levels: [{word: 'Brötchen', odd: 'Brötchem', at: 22}], cta: 'Schreib’s in die Kommentare 💬'} as FehlerProps}
      calculateMetadata={fehlerMeta} />
  </>
);
