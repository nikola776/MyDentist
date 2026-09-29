// Ordered deck manifest. Diagram *bodies* live as pre-rendered, CLI-validated
// SVGs in ./assets (regenerate with `npm run render`); this file only defines
// the order, titles, captions and audience of each slide.

export interface Slide {
  id: string;
  title: string;
  caption: string;
  /** Audience hint shown as a chip in the top bar. */
  audience: 'Non-technical' | 'Technical';
  svg: string;
}

export const slides: Slide[] = [];
