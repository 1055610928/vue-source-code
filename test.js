let obj = {
  "a.b.c.d": 2,
};
let obj1  = {
  a: {
    b: {
      c: {
        d: 2,
      },
    },
  },
}
let keys = Object.keys(obj)[0];
const path = keys.split(".");
for (let i = 0; i < path.length; i++) {
  obj1 = obj1[path[i]];
  console.log(obj1)
}
