import { describe, it, expect, beforeEach } from "vitest"
import { MergeQueue } from "../src/"

describe("Queue with wildcard rules", () => {
    interface Operations {
        a: number;
        b: string;
    }

    let queue: ReturnType<typeof MergeQueue<Operations>>;
    beforeEach(() => {
        queue = MergeQueue<Operations>();
    });

    it("should support leading wildcard rules", () => {
        queue.addMergeRule("*", "b", (a, b) => ["a", Number(a) + Number(b)]);

        queue.enqueue("a", 1);
        queue.enqueue("b", "2");

        expect(queue.toArray()).toEqual([
            ["a", 3],
        ]);
    });

    it("should support trailing wildcard rules", () => {
        queue.addMergeRule("a", "*", (a, b) => ["a", a + Number(b)]);

        queue.enqueue("a", 1);
        queue.enqueue("b", "2");

        expect(queue.toArray()).toEqual([
            ["a", 3],
        ]);
    });

    it("should support dual wildcard rules", () => {
        queue.addMergeRule("*", "*", (a, b) => ["a", Number(a) + Number(b)]);

        queue.enqueue("a", 1);
        queue.enqueue("b", "2");
        queue.enqueue("a", 10);

        expect(queue.toArray()).toEqual([
            ["a", 13],
        ]);
    });

    it("should favour non-wildcard rules", () => {
        queue.addMergeRule("a", "b", (a, b) => ["a", a + Number(b)]);
        queue.addMergeRule("*", "b", (a, b) => null);

        queue.enqueue("a", 1);
        queue.enqueue("b", "2");

        expect(queue.toArray()).toEqual([
            ["a", 3],
        ]);
    });

    it("should favour trailing wildcard rules over leading wildcard rules", () => {
        queue.addMergeRule("a", "*", (a, b) => ["a", a + Number(b)]);
        queue.addMergeRule("*", "b", (a, b) => null)

        queue.enqueue("a", 1);
        queue.enqueue("b", "2");

        expect(queue.toArray()).toEqual([
            ["a", 3],
        ]);
    });

    it("should favour single wildcard rules over dual wildcard rules", () => {
        queue.addMergeRule("a", "*", (a, b) => ["a", a + Number(b)]);
        queue.addMergeRule("*", "*", (a, b) => null);

        queue.enqueue("a", 1);
        queue.enqueue("b", "2");

        expect(queue.toArray()).toEqual([
            ["a", 3],
        ]);
    });
});