import { describe, it, expect, beforeEach } from 'vitest';
import { MergeQueue } from '../src/index';

describe('Queue Without Merge Rules', () => {
    interface Operations {
        a: number;
        b: string;
        c: boolean;
    }

    let queue: ReturnType<typeof MergeQueue<Operations>>;
    beforeEach(() => {
        queue = MergeQueue<Operations>();
    });


    it.concurrent('should enqueue and dequeue', () => {
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
        expect(() => queue.dequeue()).toThrow();
    });

    it.concurrent("should be iterable (spred operator)", () => {
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

    it('supports peeking', () => {
        queue.enqueue('a', 1);
        queue.enqueue('b', "2");
        queue.enqueue('c', true);

        expect(queue.peek()).toEqual(['a', 1]);
        expect(queue.peek()).toEqual(['a', 1]);

        expect(queue.dequeue()).toEqual(['a', 1]);
        expect(queue.dequeue()).toEqual(['b', "2"]);
    });

    it('should return undefined when peeking at an empty queue', () => {
        expect(queue.peek()).toBeUndefined();
    });
});
