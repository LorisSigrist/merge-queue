import { expect, it, describe, beforeEach } from "vitest";
import { MergeQueue } from "../src/index";

interface Person {
    name: string;
    age: number;
}

interface Operations {
    set: Person;
    update: Partial<Person>,
    delete: undefined;
}


describe("Difficult Example", () => {
    let q: ReturnType<typeof MergeQueue<Operations>>

    beforeEach(() => {
        q = MergeQueue<Operations>();
        q.addMergeRule("*", "set", (a, b) => ["set", b]);
        q.addMergeRule("set", "update", (a, b) => ["set", { ...a, ...b }]);
        q.addMergeRule("update", "update", (a, b) => ["update", { ...a, ...b }]);
        q.addMergeRule("set", "delete", (a, b) => null);
        q.addMergeRule("*", "delete", (a, b) => ["delete", b]);
    });


    it("should set, update, and delete - with a leading set", () => {
        q.enqueue("set", { name: "John", age: 20 });

        expect(q.peek()).toEqual(["set", { name: "John", age: 20 }]);

        q.enqueue("set", { name: "Jane", age: 21 });

        //The second set should overwrite the first
        expect(q.peek()).toEqual(["set", { name: "Jane", age: 21 }]);

        //The update is merged into the set
        q.enqueue("update", { name: "Bob" });
        expect(q.peek()).toEqual(["set", { name: "Bob", age: 21 }]);

        //The delete should neutralize the set
        q.enqueue("delete", undefined);
        expect(q.length).toBe(0);
    });


    it("should set, update, and delete - with a leading update", () => {
        q.enqueue("update", { name: "John", age: 20 });
        expect(q.peek()).toEqual(["update", { name: "John", age: 20 }]);

        q.enqueue("update", { name: "Bob" });

        //The second update should merge with the first
        expect(q.peek()).toEqual(["update", { name: "Bob", age: 20 }]);

        //The delete should override the update
        q.enqueue("delete", undefined);

        expect(q.length).toBe(1);

        //The set should override the delete
        q.enqueue("set", { name: "Jane", age: 21 });

        //The set should overwrite the update
        expect(q.peek()).toEqual(["set", { name: "Jane", age: 21 }]);

        //The update is merged into the set
        q.enqueue("update", { name: "Bob" });
        expect(q.peek()).toEqual(["set", { name: "Bob", age: 21 }]);

        //The delete should neutralize the set
        q.enqueue("delete", undefined);
        expect(q.length).toBe(0);
    });
});
