type Enqueue<OperationsMap extends {} = any>
    = <OperationKey extends Extract<keyof OperationsMap, string>>
        (operation: OperationKey, data: OperationsMap[OperationKey])
        => void;

type Dequeue<OperationsMap extends {} = any>
    = <OperationKey extends Extract<keyof OperationsMap, string>>
        () => [OperationKey, OperationsMap[OperationKey]];


type AddMergeRule<OperationsMap extends {} = any> = <
    OperationKey_1 extends Extract<keyof OperationsMap, string>,
    OperationKey_2 extends Extract<keyof OperationsMap, string>,
    OperationKey_3 extends Extract<keyof OperationsMap, string>,
>(
    operation_1: OperationKey_1,
    operation_2: OperationKey_2,
    merger: (
        a: OperationsMap[OperationKey_1],
        b: OperationsMap[OperationKey_2])
        => [OperationKey_3, OperationsMap[OperationKey_3]] | null
) => void;

type RemoveMergeRule<OperationsMap extends {} = any> = <
    OperationKey_1 extends Extract<keyof OperationsMap, string>,
    OperationKey_2 extends Extract<keyof OperationsMap, string>,
>(
    operation_1: OperationKey_1,
    operation_2: OperationKey_2,
) => void;

type Queue<OperationsMap> = {
    [OperationKey in keyof OperationsMap]: [OperationKey, OperationsMap[OperationKey]];
}[Extract<keyof OperationsMap, string>][];


interface MergeQueueReturn<OperationsMap extends {} = any> {
    enqueue: Enqueue<OperationsMap>;
    dequeue: Dequeue<OperationsMap>;
    addMergeRule: AddMergeRule<OperationsMap>;
    removeMergeRule: RemoveMergeRule<OperationsMap>;
    clearMergeRules: () => void;
    clear: () => void;
    toString: () => string;
    toArray: () => Queue<OperationsMap>;
    peek: () => Queue<OperationsMap>[0];
    length: number;
    [Symbol.iterator]: () => IterableIterator<[Extract<keyof OperationsMap, string>, OperationsMap[Extract<keyof OperationsMap, string>]]>;
}


export function MergeQueue<OperationsMap extends {} = any>(): MergeQueueReturn<OperationsMap> {

    /*
        TS can be a bit of a pain to work with sometimes.
        Since the types here are extremely complex, I've decided to play it a bit fast and loose and 
        use more generic types than are technially allowed by the interface. (eg string instead of T extends Extract<keyof OperationsMap, string>)

        Otherwise 90% of this code would be type declarations.

        When contributing: 
        Just make sure the external interface is correct and you should be fine.
    */

    /**
     * The queue of operations. Stored oldest to newest.
     * New items are appended to the end
     */
    let queue: Queue<OperationsMap> = [];

    type Merger = (a: any, b: any) => [string, any] | null;

    let merge_rules: Record<string, Record<string, Merger>> = {};


    function mergeAll() {
        let i = 0;
        while (i + 1 < queue.length) {
            while(mergeAt(i)) {} //Keep merging until no more merges are possible at the current index
            i++; //Move to the next index
        }
    }

    /**
     * Attempts to merge the operation at the given index with the next one,
     * using the merge rules.
     * 
     * @param index 
     * @returns - If a merge was performed
     */
    function mergeAt(index: number) : boolean {
        if (queue.length < 2)
            return false; //Nothing to merge

        const [operation_1, data_1] = queue[index];
        const [operation_2, data_2] = queue[index + 1];

        if (!merge_rules[operation_1] || !merge_rules[operation_1][operation_2]) {
            return false;
        }

        const merger = merge_rules[operation_1][operation_2];
        const merged = merger(data_1, data_2);

        if (!merged) {
            //If the merger returns null, 
            //the operations cancel each other out and should both be removed
            queue.splice(index, 2);
        } else {
            //If the merger returns a value,
            //The two operations that got merged should be removed
            //and the merged operation should be inserted at the same location
            queue.splice(index, 2, merged as any);
        }

        return true;
    }

    function mergeAtTheEnd() {
        const merged = mergeAt(queue.length - 2);

        //Try to keep merging, in case the new operation can be merged with the next one
        if(merged) mergeAtTheEnd();
    }

    /**
     * Adds an operation to the queue
     * 
     * @param operation - Which operation to queue
     * @param data - The data associated with the operation
     */
    const enqueue: Enqueue<OperationsMap> = (operation, data) => {
        queue.push([operation, data]);
        mergeAtTheEnd();
    }

    const dequeue: Dequeue<OperationsMap> = () => {
        const data = queue.shift();
        if (!data) throw new Error("Queue is empty");
        return data as any; //The type is correct, the compiler is just stupid
    }


    /**
     * Adds a merge rule between two operations.
     * Whenever these two operations are queued in that order, the merger function will be called to merge them
     * 
     * @param operation_1 Which operation must be queued fist
     * @param operation_2 Which operation must be queued second
     * @param merger A function that returns a merged operation, or null if the operations cancel each other out
     */
    const addMergeRule: AddMergeRule<OperationsMap> = (operation_1, operation_2, merger) => {
        if (!merge_rules[operation_1]) merge_rules[operation_1] = {};
        merge_rules[operation_1][operation_2] = merger;

        mergeAll();
    }

    /**
     * Removes a merge rule between two operations
     * 
     * @param operation_1  The fist operation the rule was added for
     * @param operation_2  The second operation the rule was added for
     */
    const removeMergeRule: RemoveMergeRule<OperationsMap> = (operation_1: string, operation_2: string) => {
        if (!merge_rules[operation_1]) return;
        delete merge_rules[operation_1][operation_2];
    }

    /**
     * @returns An iterator for the queue from oldest to newest
     */
    const iterator = () => queue[Symbol.iterator]();

    function clear() {
        queue = [];
    }

    function toArray() {
        return [...queue];
    }

    function toString() {
        return queue.map(([operation, data]) => `${operation}: ${JSON.stringify(data)}`).join("\n");
    }

    function clearMergeRules() {
        merge_rules = {};
    }

    /**
     * Returns the next operation that will be dequeued, without removing it from the queue
     * @returns 
     */
    function peek() {
        return queue[0];
    }

    return {
        enqueue,
        dequeue,
        addMergeRule,
        removeMergeRule,
        clear,
        toArray,
        toString,
        clearMergeRules,
        peek,
        [Symbol.iterator]: iterator,
        get length() { return queue.length; },
        set length(value: number) { throw new Error("Cannot set length of queue"); }
    };
}