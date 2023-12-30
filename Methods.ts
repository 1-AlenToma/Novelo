const public_m = (Item: any) => {
    let keys = (Item.tb ? Item.tb().props: Object.keys(new Item())).map(x => x.columnName);
    Item["n"]= ()=> new Item();
    keys.forEach(x => {
        let n = x[0].toUpperCase() + x.substring(1);
        Item.prototype[n] = function (v: any) {
            this[x] = v;
            return this;
        };
    });
    return new Item();
};

export { public_m };
