module.exports = function Cart(oldCart) { //passing old cart items every time we are creating the new one
    //oldCart initially is an empty JS o bject
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function (item, id) {
        var storedItem = this.items[id];
        if (!storedItem) { //if there are no stoed items in the list
            storedItem = this.items[id] = { item: item, qty: 0, price: 0 }; //qty and price are 0 bcz they will be implemented in the next step
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    }

    this.generateArray = function () { // it will return the cart items as an array
        var arr = [];
        for (var id in this.items) { //for(var i=0;i<this.items.length;i++)
            arr.push(this.items[id]);
        }
        return arr;
    }
};