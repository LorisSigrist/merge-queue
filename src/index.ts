type WithWildcard<Map extends {}> = Map & {
    '*': Map[Extract<keyof Map, string>];
};

type Enqueue<OperationsMap extends {} = any>
    = <OperationKey extends Extract<keyof OperationsMap, string>>
        (operation: OperationKey, data: OperationsMap[OperationKey])
        => void;

type Dequeue<OperationsMap extends {} = any>
    = <OperationKey extends Extract<keyof OperationsMap, string>>
        () => [OperationKey, OperationsMap[OperationKey]];


type AddMergeRule<OperationsMap extends {} = any> = <
    OperationKey_1 extends Extract<keyof WithWildcard<OperationsMap>, string>,
    OperationKey_2 extends Extract<keyof WithWildcard<OperationsMap>, string>,
    OperationKey_3 extends Extract<keyof OperationsMap, string>,
>(
    operation_1: OperationKey_1,
    operation_2: OperationKey_2,
    merger: (
        a: WithWildcard<OperationsMap>[OperationKey_1],
        b: WithWildcard<OperationsMap>[OperationKey_2])
        => [OperationKey_3, OperationsMap[OperationKey_3]] | null
) => void;

type RemoveMergeRule<OperationsMap extends {} = any> = <
    OperationKey_1 extends Extract<keyof WithWildcard<OperationsMap>, string>,
    OperationKey_2 extends Extract<keyof WithWildcard<OperationsMap>, string>,
>(
    operation_1: OperationKey_1,
    operation_2: OperationKey_2,
) => void;

type Queue<OperationsMap> = {
    [OperationKey in keyof OperationsMap]: [OperationKey, OperationsMap[OperationKey]];
}[Extract<keyof OperationsMap, string>][];

type InitialQueue<OperationsMap> = {
    [OperationKey in keyof OperationsMap]: [OperationKey, OperationsMap[OperationKey]];
}[Extract<keyof OperationsMap, string>][];


interface MergeQueueReturn<OperationsMap extends {} = any> {
    /** Adds an item to the queue */
    enqueue: Enqueue<OperationsMap>;
    /** @returns the oldest item in the queue and removes it */
    dequeue: Dequeue<OperationsMap>;
    /** Adds a merge rule between two operations*/
    addMergeRule: AddMergeRule<OperationsMap>;
    /** Removes a merge rule */
    removeMergeRule: RemoveMergeRule<OperationsMap>;
    /** Removes all active merge rules */
    clearMergeRules: () => void;
    /** Removes all items from the queue */
    clear: () => void;
    /** @returns A string representation of the queue */
    toString: () => string;
    /** @returns An array representation of the queue. Equivalent to [...queue] */
    toArray: () => Queue<OperationsMap>;
    /** @returns The first item in the queue, without removing it */
    peek: () => Queue<OperationsMap>[0];
    /** The number of items currently in the queue */
    length: number;
    [Symbol.iterator]: () => IterableIterator<[Extract<keyof OperationsMap, string>, OperationsMap[Extract<keyof OperationsMap, string>]]>;
}


export function MergeQueue<OperationsMap extends {} = any>(initial_data: InitialQueue<OperationsMap> = []): MergeQueueReturn<OperationsMap> {

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
    let queue: Queue<OperationsMap> = initial_data;

    type Merger = (a: any, b: any) => [string, any] | null;

    let merge_rules: Record<string, Record<string, Merger>> = {};


    function mergeAll() {
        let i = 0;
        while (i + 1 < queue.length) {
            while (mergeAt(i)) { } //Keep merging until no more merges are possible at the current index
            i++; //Move to the next index
        }
    }

    function getMerger(leading: string, trailing: string) : Merger | null {
        if(merge_rules[leading] && merge_rules[leading][trailing]){
            return merge_rules[leading][trailing];
        }

        if(merge_rules[leading] && merge_rules[leading]['*']){
            return merge_rules[leading]['*'];
        }

        if(merge_rules['*'] && merge_rules['*'][trailing]){
            return merge_rules['*'][trailing];
        }

        if(merge_rules['*'] && merge_rules['*']['*']){
            return merge_rules['*']['*'];
        }

        return null;
    }

    /**
     * Attempts to merge the operation at the given index with the next one,
     * using the merge rules.
     * 
     * @param index 
     * @returns - If a merge was performed
     */
    function mergeAt(index: number): boolean {
        if (queue.length < 2)
            return false; //Nothing to merge

        const [operation_1, data_1] = queue[index];
        const [operation_2, data_2] = queue[index + 1];

        const merger = getMerger(operation_1, operation_2);
        if(!merger) return false;

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
        if (merged) mergeAtTheEnd();
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

    const addMergeRule: AddMergeRule<OperationsMap> = (leading_operation, following_operation, merger) => {
        if (!merge_rules[leading_operation]) merge_rules[leading_operation] = {};
        merge_rules[leading_operation][following_operation] = merger;

        mergeAll();
    }

    const removeMergeRule: RemoveMergeRule<OperationsMap> = (operation_1: string, operation_2: string) => {
        if (!merge_rules[operation_1]) return;
        delete merge_rules[operation_1][operation_2];
    }

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

        /** The current length of the queue */
        get length() { return queue.length; },

        /** Cannot set the length of the queue */
        set length(value: number) { throw new Error("Cannot set length of queue"); }
    };
}