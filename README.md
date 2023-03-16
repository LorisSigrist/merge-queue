# Merge-Queue
![Merge-Queue Minzipped Size](https://badgen.net/npm/v/merge-queue?icon=npm)
![Github Checks](https://badgen.net/github/checks/LorisSigrist/merge-queue?icon=github)

When you have a Series of Operations that need to happen, a Queue is often a great Data-Structure to choose.
But, often certain operations can be merged together, if they happen after one another.

For example, when you have a Queue of CRUD operations, you can merge a "create" operation with a "patch" operation into a single "create" operation.

`merge-queue` is a simple Queue Data-Structure that allows you to define Merge Rules, which allow you to merge stuff, while being fully typesafe.

## Getting Started

First obviously install the package:

```bash
npm i merge-queue
```

Then import it into your code like so:

```js
import { MergeQueue } from "merge-queue";
```

And instantiate a Queue:

```js
const q = MergeQueue(); //The "new" keyword is not required
```

## Writing your first Merge Rule

By default, there are no Merge Rules, The MergeQueue behaves like a regular Queue.
To add a Merge Rule, use the `addMergeRule` method. It takes 3 arguments:

- The leading operation
- The folloing operation
- A function to merge the data of the two operations

```ts
const q = MergeQueue();

//This Rule merges any sequence of "operation_1" and "operation_2" operations into a single "operation_1" operation
q.addMergeRule("operation_1", "operation_2", (a, b) => {
  //a is the data of operation_1
  //b is the data of operation_2
  return ["operation_1", a + b]; //The return value must be an Array containing the merged operation and it's data
});

q.enqueue("operation_1", 1);
q.enqueue("operation_2", 2);

q.length; //1 - The operations have been merged

const [operation, data] = q.dequeue(); // ["operation_1", 3]
```

There can only ever be one Merge Rule for a given tuple of operations. If you add a second Merge Rule for the same tuple, the first one will be overwritten.

You can get rid of a Merge Rule using the `removeMergeRule` method. Just give it the operator-tuple.

```ts
q.removeMergeRule("operation_1", "operation_2");
```

## Typesafety
We can define which operations are allowed, and which data they carry (if any), by passing a generic type to the `MergeQueue` constructor.

```ts
interface AllowedOperations {
  create: MY_CREATE_TYPE;
  patch: MY_PATCH_TYPE;
  delete: never; //The "delete" operation does not carry any data
}

const q = MergeQueue<AllowedOperations>();
```
This then causes all methods to be typechecked, so that you can't add invalid operations to the queue, or merge invalid operations.



```ts
const q = MergeQueue<{ create: CREATE_TYPE; patch: PATCH_TYPE }>();

//The operations must be of type "create" or "patch"
//The types of a and b are inferred based on the chosen operations
q.addMergeRule("create", "patch", (a, b) => {
  return ["create", { ...a, ...b }]; //The return type is typechecked as well

  //The returned operations does not have to be either of input operations, just any valid one
});

q.enqueue("create", create_data); //ok
q.enqueue("patch", update_data_1); //ok
q.enqueue("other", other_data); //Type Error, "other" is not a valid operation
```

## More Examples

### Regular Queue Operations
By default there are no merge rules. The queue behaves like a regular queue.

```js
import { MergeQueue } from "merge-queue";

const q = MergeQueue();

q.enqueue("operation_1", data_1);
q.enqueue("operation_2", data_2);
q.enqueue("operation_3", data_3);

q.length; //3


const [operation_1, data_1] = q.peek();    // ["operation_1", data_1]

q.length; //3 - Peek does not remove the item from the queue

const [operation_1, data_1] = q.dequeue(); // ["operation_1", data_1]
const [operation_2, data_2] = q.dequeue(); // ["operation_2", data_2]
const [operation_3, data_3] = q.dequeue(); // ["operation_3", data_3]

q.length; //0
```


### Loading and Saving the Queue
```ts
import { MergeQueue } from "merge-queue";

const queue_1 = MergeQueue();

queue_1.enqueue("operation_1", data_1);
queue_1.enqueue("operation_2", data_2);


//You can export the queue as an array
console.log(queue_1.toArray()) // [ ["operation_1", data_1], ["operation_2", data_2] ]

//You can initialize a new queue with the array
const queue_2 = MergeQueue(queue_1.toArray());
```

### Operations that Cancel

```ts
import { MergeQueue } from "merge-queue";

const q = MergeQueue<{ increment: never; decrement: never }>();

//Returning null in the Merge Function means that the operations cancel each other out. They are both removed
q.addMergeRule("increment", "decrement", () => null);
q.addMergeRule("decrement", "increment", () => null);

q.enqueue("increment", 1);
q.enqueue("decrement", 1);

q.length; //0
```


### Wildcard Rules
You can use the wildcard `*` to match any operation.
```ts
q.addMergeRule("*", "*", (a, b) => {
  return ["a", a + b];
});

q.enqueue("a", 1);
q.enqueue("b", 2);

console.log(q.dequeue()); // ["a", 3]
```

In case the rules are ambiguous, the disambiguation is done in the following order:

1. `a, b`
2. `a, *`
3. `*, b`
4. `*, *`