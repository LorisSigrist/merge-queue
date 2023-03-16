import { describe, it, expect, beforeEach } from 'vitest';
import { MergeQueue } from '../src';

describe('Queue With Merge Rules', () => {

    interface Operations {
        a: number;
        b: number;
        c: number;
    }

    let queue: ReturnType<typeof MergeQueue<Operations>>;
    beforeEach(() => {
        queue = MergeQueue<Operations>();
    });

    it.concurrent('should merge operations', () => {
        queue.addMergeRule('a', 'b', (a, b) => ['c', a + b]);

        queue.enqueue('a', 1);
        queue.enqueue('b', 2);

        expect(queue.dequeue()).toEqual(['c', 3]);
    });

    it.concurrent('should merge operations recursively', () => {
        queue.addMergeRule('a', 'a', (a, b) => ['a', a + b]);
        queue.addMergeRule('b', 'c', (a, b) => ['a', a + b]);

        queue.enqueue('a', 1);
        queue.enqueue('b', 2);
        queue.enqueue('c', 3);

        expect(queue.dequeue()).toEqual(['a', 6]);
    });

    it.concurrent('should allow operations to cancel each other out', () => {

        queue.addMergeRule('a', 'b', (a, b) => null);
        queue.enqueue('a', 1);
        queue.enqueue('b', 2);

        expect(queue.length).toBe(0);
    });

    it.concurrent('should merge operations even if the rules are added after they are enqueued', () => {
        queue.enqueue('a', 1);
        queue.enqueue('b', 2);

        queue.addMergeRule('a', 'b', (a, b) => ['c', a + b]);

        expect(queue.dequeue()).toEqual(['c', 3]);
    });


    it.concurrent("should be able to remove merge rules", () => {
        queue.addMergeRule('a', 'b', (a, b) => ['c', a + b]);
        queue.removeMergeRule('a', 'b');

        queue.enqueue('a', 1);
        queue.enqueue('b', 2);

        expect(queue.dequeue()).toEqual(['a', 1]);
        expect(queue.dequeue()).toEqual(['b', 2]);
    });
});
