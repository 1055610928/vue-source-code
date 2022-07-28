var arr = {
  a: {
    b: [],
    c: {
      fn() {
        console.log(this);
      },
    },
  },
};
arr.a.c.fn(); // this指向c
