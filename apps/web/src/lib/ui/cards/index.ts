import type { Component } from 'svelte';
import type { Item } from '$lib/content/types';
import type { IntroItem } from '$lib/engine/session';
import CardIntro from './CardIntro.svelte';
import CardMcq from './CardMcq.svelte';
import CardCase from './CardCase.svelte';
import CardPair from './CardPair.svelte';
import CardCloze from './CardCloze.svelte';
import CardRecall from './CardRecall.svelte';
import CardTrueFalse from './CardTrueFalse.svelte';

export type { AnswerResult, CardProps } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cardFor(item: Item | IntroItem): Component<any> {
  switch (item.type) {
    case 'intro': return CardIntro;
    case 'mcq': return CardMcq;
    case 'case': return CardCase;
    case 'pair': return CardPair;
    case 'cloze': return CardCloze;
    case 'recall': return CardRecall;
    case 'truefalse': return CardTrueFalse;
  }
}
