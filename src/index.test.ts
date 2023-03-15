import { describe, it, expect } from 'vitest';
import { MergeQueue } from '.';


describe('Queue Without Merge Rules', () => {
    it('should enqueue and dequeue', () => {
        const queue = MergeQueue<{
            a: number,
            b: string,
            c: boolean,
        }>();

        queue.enqueue('a', 1);
        queue.enqueue('b', "2");
        queue.enqueue('c', true);

        expect(queue.dequeue()).toEqual(['a', 1]);
        expect(queue.dequeue()).toEqual(['b', "2"]);
        expect(queue.dequeue()).toEqual(['c', true]);
    });

    it('should throw when dequeueing an empty queue', () => {
        const queue = MergeQueue<{
            a: number,
            b: string,
            c: boolean,
        }>();

        expect(() => queue.dequeue()).toThrow();
    });

    it("should be iterable (spred operator)", () => {
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

    it("should be iterable (for of)", () => {
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