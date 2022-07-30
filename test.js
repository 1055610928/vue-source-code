var obj = {
  a: 1,
};
Object.defineProperty(obj,'a',{
  get(){
    console.log('gets')
    return 1
  }
});

console.log(JSON.stringify(obj))