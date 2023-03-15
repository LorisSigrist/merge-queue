import { describe, it, expect } from 'vitest';
import { MergeQueue } from '../src';

describe('Queue With Merge Rules', () => {
    it.concurrent('should merge operations', () => {
        const queue = MergeQueue<{
            a: number,
            b: number,
            c: number,
        }>();

        queue.addMergeRule('a', 'b', (a, b) => ['c', a + b]);

        queue.enqueue('a', 1);
        queue.enqueue('b', 2);

        expect(queue.dequeue()).toEqual(['c', 3]);
    });

    it.concurrent('should merge operations recursively', () => {
        const queue = MergeQueue<{
            a: number,
            b: number,
            c: number,
        }>();

        queue.addMergeRule('a', 'a', (a, b) => ['a', a + b]);
        queue.addMergeRule('b', 'c', (a, b) => ['a', a + b]);

        queue.enqueue('a', 1);
        queue.enqueue('b', 2);
        queue.enqueue('c', 3);

        expect(queue.dequeue()).toEqual(['a', 6]);
    });

    it('should allow operations to cancel each other out', () => {
        const queue = MergeQueue<{
            inc: number,
            dec: number,
        }>();

        queue.addMergeRule('inc', 'dec', (a, b) => null);

        queue.enqueue('inc', 1);
        queue.enqueue('dec', 2);

        expect(queue.length).toBe(0);
    });

    it.concurrent('should merge operations even if the rules are added after they are enqueued', () => {
        const queue = MergeQueue<{
            a: number,
            b: number,
            c: number,
        }>();

        queue.enqueue('a', 1);
        queue.enqueue('b', 2);

        queue.addMergeRule('a', 'b', (a, b) => ['c', a + b]);

        expect(queue.dequeue()).toEqual(['c', 3]);
    });
});
