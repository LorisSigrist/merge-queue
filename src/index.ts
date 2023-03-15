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
    [Symbol.iterator]: () => IterableIterator<[Extract<keyof OperationsMap, string>, OperationsMap[Extract<keyof OperationsMap, string>]]>;
}


export function MergeQueue<OperationsMap extends {} = any>(): MergeQueueReturn<OperationsMap> {

    /*
        TS can be a bit of a pain to work with sometimes.
        Since the types here are extremely complex, I've decided to play it a bit fast and loose and 
        use more generic types than are strictly allowed. (eg string instead of Extract<keyof OperationsMap, string>)

        Otherwise 90% of this code would be type declarations.

        When contributing: 
        Just make sure the external interface is correct and you should be fine.
    */

    /**
     * The queue of operations. Stored oldest to newest.
     * New items are appended to the end
     */
    const queue: Queue<OperationsMap> = [];

    type Merger = (a: any, b: any) => [string, any] | null;

    const merge_rules: Record<string, Record<string, Merger>> = {};

    function applyMergeRules() {
        const merged_queue: Queue<OperationsMap> = [];
        for(let i = 0; i + 1 < queue.length; i++) {

        }
    }

    /**
     * Adds an operation to the queue
     * 
     * @param operation - Which operation to queue
     * @param data - The data associated with the operation
     */
    const enqueue: Enqueue<OperationsMap> = (operation, data) => {
        queue.push([operation, data]);
        applyMergeRules();
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

    return { 
        enqueue, 
        dequeue, 
        addMergeRule, 
        removeMergeRule, 
        [Symbol.iterator]: iterator 
    };
}