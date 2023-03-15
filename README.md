# Merge-Queue

Somtimes consecutive values in a queue can be merged together. This library provides a simple Data-Structure to do that.

## Installation

```bash
npm i merge-queue
```

## Usage example

```js
import { MergeQueue } from "merge-queue";

const q = MergeQueue();

//When a "create" operation is followed by a "patch" operation, the "patch" operation is merged into the "create" operation
q.addMergeRule("create", "patch", (a, b) => {
  return ["create", { ...a, ...b }];
});

//When a "patch" operation is followed by another "patch" operation, the second "patch" operation is merged into the first "patch" operation
q.addMergeRule("patch", "patch", (a, b) => {
  return ["patch", { ...a, ...b }];
});

q.enqueue("create", create_data);
q.enqueue("patch", update_data_1);
q.enqueue("patch", update_data_2);
q.enqueue("other", other_data);

queue.length; //2 because create, patch, patch were merged together

const [operation, data] = queue.dequeue(); // ["create", { ...create_data, ...update_data_1, ...update_data_2 }]

//The "other" operation was not merged with anything
const [operation2, data2] = queue.dequeue(); // ["other", other_data]
```

Or with TypeScript:

```ts
import { MergeQueue } from "merge-queue";

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
