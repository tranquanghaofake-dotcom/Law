import { describe, expect, it } from 'vitest';
import { sortGroups } from '$lib/ui/groups';

describe('sortGroups', () => {
  it('theo thứ tự GROUPS, nhóm lạ xếp cuối', () => {
    const out = sortGroups([['hinh-su', []], ['la', []], ['pldc', []], ['dan-su', []]] as any).map(([g]) => g);
    expect(out).toEqual(['pldc', 'dan-su', 'hinh-su', 'la']);
  });
});
