import { describe, expect, it } from 'vitest';
import { GROUPS, filterSets, filterSetsByShelf, groupSets, shelfOfGroup } from '$lib/ui/groups';

const sets = [{ id: 'x', group: 'dan-su' }, { id: 'y', group: 'pldc' }, { id: 'z', group: 'pldc' }];

describe('groups', () => {
  it('filterSets(null) trả tất cả, theo nhóm thì chỉ nhóm đó', () => {
    expect(filterSets(sets, null)).toHaveLength(3);
    expect(filterSets(sets, 'pldc').map((s) => s.id)).toEqual(['y', 'z']);
  });
  it('groupSets nhóm và xếp theo thứ tự GROUPS', () => {
    expect(groupSets(sets).map(([g]) => g)).toEqual(['pldc', 'dan-su']);
  });
  it('shelfOfGroup ánh xạ nhóm đề sang kệ; nhóm lạ → khac', () => {
    expect(shelfOfGroup('pldc')).toBe('ly-luan');
    expect(shelfOfGroup('to-tung-dan-su')).toBe('dan-su');
    expect(shelfOfGroup('thuong-mai')).toBe('kinh-te');
    expect(shelfOfGroup('ngan-hang')).toBe('tai-chinh');
    expect(shelfOfGroup('khong-co')).toBe('khac');
  });
  it('filterSetsByShelf(null) trả tất cả, theo kệ thì chỉ các đề thuộc kệ', () => {
    const all = [...sets, { id: 'w', group: 'to-tung-dan-su' }];
    expect(filterSetsByShelf(all, null)).toHaveLength(4);
    expect(filterSetsByShelf(all, 'dan-su').map((s) => s.id)).toEqual(['x', 'w']);
    expect(filterSetsByShelf(all, 'ly-luan').map((s) => s.id)).toEqual(['y', 'z']);
  });
  it('Thương mại 1 tách khỏi Thương mại 2, xếp trước, cùng kệ kinh tế', () => {
    expect(GROUPS['thuong-mai-1']).toBe('Luật Thương mại 1');
    expect(GROUPS['thuong-mai']).toBe('Luật Thương mại 2');
    expect(shelfOfGroup('thuong-mai-1')).toBe('kinh-te');
    expect(groupSets([{ group: 'thuong-mai' }, { group: 'thuong-mai-1' }]).map(([g]) => g)).toEqual(['thuong-mai-1', 'thuong-mai']);
  });
});
