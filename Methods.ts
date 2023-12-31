const public_m = (...Items: any[]) => {
  Items.forEach(Item => {
    let keys = (
      Item.tb
        ? Item.tb().props
        : Object.keys(new Item())
    ).map(x => x.columnName || x);
    Item["n"] = () => new Item();
    keys.forEach(x => {
      let n = x[0].toUpperCase() + x.substring(1);
      if (!Item.prototype[n])
        Item.prototype[n] = function (v: any) {
          if (!this) throw "this is null" + Item;
          this[x] = v;
          return this;
        };
    });
  });
};

const sleep = (ms: number) => {
  return new Promise(r => setTimeout(r, ms));
};

const days_between = function (date: Date) {
  // The number of milliseconds in one day
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  let firstDate = date as any;
  let secondDate = new Date() as any;

  // Convert back to days and return
  const diffDays = Math.round(
    Math.abs((firstDate - secondDate) / oneDay)
  );

  return diffDays;
};

export { public_m, sleep, days_between };
