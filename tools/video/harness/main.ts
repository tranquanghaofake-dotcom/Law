// Mount một cảnh theo hash: #<cảnh>?<json props>. Dùng bởi scripts/capture.mjs.
import '../../../apps/web/src/app.css';
import { mount } from 'svelte';
import StreakCard from '$lib/art/StreakCard.svelte';
import StreakIgnite from '$lib/art/StreakIgnite.svelte';
import Portrait from '$lib/art/Portrait.svelte';
import BookCover from '$lib/art/BookCover.svelte';
import BookSpine from '$lib/art/BookSpine.svelte';
import SubjectArt from '$lib/art/SubjectArt.svelte';
import MemoIcon from '$lib/art/MemoIcon.svelte';
import Vignette from '$lib/art/Vignette.svelte';
import { lookFor } from '$lib/game/looks';
import { DEFAULT_AVATAR } from '$lib/game/wardrobe';
import { POSTS } from '$lib/game/career';
import { shelfOf } from '$lib/ui/shelves';
import { coverTitle } from '$lib/ui/bookCover';
import { cardFor } from '$lib/ui/cards';
import datCoc from '../../../packages/content/data/concepts/dan-su-2/dat-coc.json';

const [name, raw] = decodeURIComponent(location.hash.slice(1)).split('?');
const p = raw ? JSON.parse(raw) : {};
const target = document.getElementById('app')!;
document.body.dataset.ready = '0';

const wrap = (w: number) => { target.style.width = `${w}px`; return target; };

switch (name) {
  case 'card':
    mount(StreakCard, { target: wrap(p.w ?? 856), props: { count: p.count, longest: p.longest ?? p.count } });
    break;
  case 'ignite':
    target.style.cssText = 'display:block;width:100vw;height:100vh';
    mount(StreakIgnite, { target, props: { count: p.count, longest: p.longest ?? p.count, onclose: () => {} } });
    break;
  case 'portrait': {
    const post = POSTS.find((x) => x.id === p.post) ?? null;
    mount(Portrait, { target: wrap(p.w ?? 420), props: { avatar: { ...DEFAULT_AVATAR, outfit: lookFor(post?.id ?? null).outfit }, look: lookFor(post?.id ?? null), title: post?.title ?? 'Công dân', tier: post?.tier ?? null, celebrate: !!p.celebrate, ondone: () => {} } });
    break;
  }
  case 'cover':
    mount(BookCover, { target: wrap(p.w ?? 300), props: { id: p.id, title: p.title, color: p.color, percent: p.percent ?? 0, state: p.state ?? 'new', w: p.w ?? 300 } });
    break;
  case 'subjectcover':
    mount(BookCover, { target: wrap(p.w ?? 300), props: { id: p.id, title: coverTitle(p.title), color: shelfOf(p.id).color, percent: p.percent ?? 0, state: p.state ?? 'new', w: p.w ?? 300 } });
    break;
  case 'exercise': {
    // thẻ bài tập THẬT của web với dữ liệu khái niệm Đặt cọc (6 bậc ghi nhớ): type intro|mcq|pair|cloze|truefalse|recall
    const items = (datCoc as { items: { type: string }[] }).items;
    const item = p.type === 'intro' ? { type: 'intro' } : items.filter((x) => x.type === p.type)[p.idx ?? 0];
    let seed = 7;
    const rng = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    target.style.cssText = 'display:block;width:432px;padding:14px;box-sizing:border-box;background:var(--paper)';
    const box = document.createElement('div'); box.className = 'step-in'; target.appendChild(box);
    mount(cardFor(item as never), { target: box, props: { concept: datCoc as never, item: item as never, rng, onanswer: () => {}, onshown: () => {}, onspeak: () => {}, mode: p.mode ?? 'bank' } });
    break;
  }
  case 'spine':
    mount(BookSpine, { target: wrap(p.w ?? 60), props: { scheme: p.scheme, level: p.level, label: p.label, w: p.w ?? 60, h: p.h ?? 200 } });
    break;
  case 'art':
    mount(SubjectArt, { target: wrap(p.w ?? 900), props: { name: p.name } });
    break;
  case 'vignette':
    mount(Vignette, { target: wrap(p.w ?? 300), props: { name: p.name } });
    break;
  case 'memo':
    target.style.cssText = `display:grid;grid-template-columns:repeat(${p.cols ?? 11},${p.size ?? 72}px);gap:${p.gap ?? 28}px;color:${p.color ?? '#14213d'}`;
    for (const n of p.names as string[]) mount(MemoIcon, { target, props: { name: n as never, size: p.size ?? 72 } });
    break;
}
setTimeout(() => (document.body.dataset.ready = '1'), 50);
