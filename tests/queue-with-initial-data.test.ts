import { describe, it, expect } from "vitest"
import { MergeQueue } from "../src/"

describe("Queue with inital Data", () => {

    it("should initialize a queue with data", () => {
        const queue = MergeQueue([
            ["a", 1],
            ["b", 2],
            ["c", 3],
        ])

        expect(queue.toArray()).toEqual([
            ["a", 1],
            ["b", 2],
            ["c", 3],
        ])
    })

    it("should initialize with initial data and then apply merge rules", () => {
        const queue = MergeQueue([
            ["a", 1],
            ["b", 2],
            ["c", 3],
        ])

        queue.addMergeRule("a", "b", (a, b) => ["c", a + b])

        expect(queue.toArray()).toEqual([
            ["c", 3],
            ["c", 3],
        ])
    })


    it("should be able to be initialized from another queue", () => {
        const queue = MergeQueue([
            ["a", 1],
            ["b", 2],
            ["c", 3],
        ])

        const queue2 = MergeQueue(queue.toArray())

        expect(queue2.toArray()).toEqual([
            ["a", 1],
            ["b", 2],
            ["c", 3],
        ])
    });
});