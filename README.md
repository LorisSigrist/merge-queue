# Merge-Queue
Somtimes consecutive values in a queue can be merged together. This library provides a simple Data-Structure to do that.
## Installation
```bash 
npm i merge-queue
```

## Usage
```js
import { MergeQueue } from 'merge-queue';

const queue = new MergeQueue();

queue.addMergeRule("create", "patch", (a, b) => {
  return ["create", { ...a, ...b }];
});

queue.addMergeRule("patch", "patch", (a, b) => {
  return ["patch", { ...a, ...b }];
});


queue.enqueue("create", create_data );
queue.enqueue("patch",  update_data_1 );
queue.enqueue("patch",  update_data_2 );
queue.enqueue("other",  other_data );

queue.length //2 because create, patch, patch were merged together

const [operation, data] = queue.dequeue();

operation // "create"
data // { ...create_data, ...update_data_1, ...update_data_2 }
```

Or with TypeScript:
```ts
import { MergeQueue } from 'merge-queue';

const queue = new MergeQueue<{create: CREATE_TYPE, patch: PATCH_TYPE}>();

//The `operations` must be of type "create" | "patch". That's enforced
//The types of a and b are inferred based on those
queue.addMergeRule("create", "patch", (a, b) => {
  return ["create", { ...a, ...b }]; //The return type is typechecked as well
});


queue.enqueue("create", create_data );   //ok
queue.enqueue("patch",  update_data_1 ); //ok
queue.enqueue("other",  other_data );    //Type Error, "other" is not a valid operation
```