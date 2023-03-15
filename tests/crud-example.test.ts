import { expect, it, describe } from "vitest";
import { MergeQueue } from "../src/index";

describe("CRUD Example", () => {

    interface Person {
        name: string;
        age: number;
    }

    it.concurrent("should add, update, and delete", () => {
        const queue = MergeQueue<{
            add: Person;
            update: Partial<Person>,
            delete: never;
        }>();

        queue.addMergeRule("add", "add", (a, b) => ["add", { ...a, ...b }]);
        queue.addMergeRule("add", "update", (a, b) => ["add", { ...a, ...b }]);
        queue.addMergeRule("update", "add", (a, b) => ["add", { ...b }]);
        queue.addMergeRule("update", "update", (a, b) => ["update", { ...a, ...b }]);
        
        queue.addMergeRule("add", "delete", (a, b) => ["delete", b]);
        queue.addMergeRule("update", "delete", (a, b) => ["delete", b]);
        queue.addMergeRule("delete", "delete", (a, b) => ["delete", b]);

        queue.enqueue("add", { name: "John", age: 20 });
        queue.enqueue("add", { name: "Jane", age: 21 });

        expect(queue.length).toBe(1); //The two adds are merged into one
        queue.enqueue("update", { name: "Bob" });

        expect(queue.length).toBe(1); //The update is merged into the add

        expect(queue.dequeue()).toEqual(["add", {
            name: "Bob",
            age: 21,
        }]);

        expect(queue.length).toBe(0);
    });
});