import { describe, it, expect } from 'vitest';
import { MergeQueue } from '.';


describe('Queue Without Merge Rules', () => {
    it.concurrent('should enqueue and dequeue', () => {
        const queue = MergeQueue<{
            a: number,
            b: string,
            c: boolean,
        }>();

        queue.enqueue('a', 1);
        queue.enqueue('b', "2");
        queue.enqueue('c', true);

        expect(queue.length).toBe(3);

        expect(queue.dequeue()).toEqual(['a', 1]);
        expect(queue.dequeue()).toEqual(['b', "2"]);
        expect(queue.dequeue()).toEqual(['c', true]);

        expect(queue.length).toBe(0);
    });

    it.concurrent('should throw when dequeueing an empty queue', () => {
        const queue = MergeQueue<{
            a: number,
            b: string,
            c: boolean,
        }>();

        expect(() => queue.dequeue()).toThrow();
    });

    it.concurrent("should be iterable (spred operator)", () => {
        const queue = MergeQueue<{
            a: number,
            b: string,
            c: boolean,
        }>();

        queue.enqueue('a', 1);
        queue.enqueue('b', "2");
        queue.enqueue('c', true);

        expect([...queue]).toEqual([
            ['a', 1],
            ['b', "2"],
            ['c', true],
        ]);
    });

    it.concurrent("should be iterable (for of)", () => {
        const queue = MergeQueue<{
            a: number,
            b: string,
            c: boolean,
        }>();

        queue.enqueue('a', 1);
        queue.enqueue('b', "2");
        queue.enqueue('c', true);

        const result: [string, any][] = [];
        for (const item of queue) {
            result.push(item);
        }

        expect(result).toEqual([
            ['a', 1],
            ['b', "2"],
            ['c', true],
        ]);
    });
});

describe('Queue Witth Merge Rules', () => {
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
            a: number,
            b: number,
            c: number,
        }>();

        queue.addMergeRule('a', 'b', (a, b) => null);

        queue.enqueue('a', 1);
        queue.enqueue('b', 2);

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
