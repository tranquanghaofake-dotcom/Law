import { describe, expect, it } from 'vitest';
import { filterSets, groupSets } from '$lib/ui/groups';

const sets = [{ id: 'x', group: 'dan-su' }, { id: 'y', group: 'pldc' }, { id: 'z', group: 'pldc' }];

describe('groups', () => {
  it('filterSets(null) trả tất cả, theo nhóm thì chỉ nhóm đó', () => {
    expect(filterSets(sets, null)).toHaveLength(3);
    expect(filterSets(sets, 'pldc').map((s) => s.id)).toEqual(['y', 'z']);
  });
  it('groupSets nhóm và xếp theo thứ tự GROUPS', () => {
    expect(groupSets(sets).map(([g]) => g)).toEqual(['pldc', 'dan-su']);
  });
});
