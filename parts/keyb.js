const { Keyboard, Key } = require('telegram-keyboard')

var lang = {
    reply_markup:{
        keyboard:[
            [
                {text: "En 🏴󠁧󠁢󠁥󠁮󠁧󠁿"}, {text: "Uz 🇺🇿"}, {text: "Ru 🇷🇺"}
            ]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
}

var lang_b = function( lang ){
    return {
        reply_markup:{
            keyboard:[
                [
                    {text: "En 🏴󠁧󠁢󠁥󠁮󠁧󠁿"}, {text: "Uz 🇺🇿"}, {text: "Ru 🇷🇺"}
                ],[
                    {text: lang.back}
                ]
            ],
            resize_keyboard: true
        }
    }
}

var back = function( lang ){
    return {
        reply_markup:{
            keyboard:[
                [
                    {text: lang.back}
                ]
            ],
            resize_keyboard: true
        }
    }
}

var contact = function(contact){
    return {
        reply_markup:{
            keyboard:[
                [
                    {text: contact, request_contact: true}
                ]
            ],
            resize_keyboard: true
        }
    }
}

var main = function(lang){
    return {
        reply_markup:{
            keyboard:[
                [
                    {text: lang.catalog}, {text: lang.savat}
                ],[
                    {text: lang.aksiya}, {text: lang.my_aks}
                ],[
                    {text: lang.settings}
                ]
            ],
            resize_keyboard: true
        }
    }
} 

var sets = function(lang){
    return {
        reply_markup:{
            keyboard:[
                [
                    {text: lang.change_lang}, {text: lang.change_name}
                ],[
                    {text: lang.back}
                ]
            ],
            resize_keyboard: true
        }
    }
}

var catalog = function( lang, cat ){
    var arr = [];
    cat.forEach(item => {
        arr.push(item["name_" + lang.str]);
    });
    arr.push( lang.back );
    return Keyboard.make( arr,{ columns: 2, }).reply();
}

var make_cat = function( lang, cat ){
    var arr = [];
    cat.forEach(item => {
        arr.push(item["cat"]);
    });
    arr.push( lang.back );
    return Keyboard.make( arr,{ columns: 2, }).reply();
}

var prod = function( prod_id, lang, num ){
    return Keyboard.make([
        Key.callback( "➖", "rem_" + prod_id + "_" + num ),
        Key.callback( num, ""),
        Key.callback( "➕", "add_" + prod_id + "_" + num ),
        Key.callback( lang.add_cart, "cart_" + prod_id + "_" + num )
    ], { columns: 3 }).inline()
}

var show_cart = function( lang ){
    return Keyboard.make([
        Key.callback( lang.show_cart, "show_cart" )
    ]).inline()
}

var cart = function( orders, lang ){
    var arr = [];
    orders.forEach(order => {
        arr.push( Key.callback( "➖", "crem_" + order["prod_id"] + "_" + order["count"] ) );
        arr.push( Key.callback( order["name_" + lang.str], "" ) );
        arr.push( Key.callback( "➕", "cadd_" + order["prod_id"] + "_" + order["count"] ) );
    });
    if ( orders.length === 0 ){
        return undefined;
    }
    arr.push( Key.callback( lang.clear, "clear" ) )
    arr.push( Key.callback( lang.order, "order" ) )
    return Keyboard.make(arr, { columns: 3 }).inline()
}

var location = function( lang ){
    return Keyboard.make([
        Key.location(lang.share_location), lang.back
    ], { columns: 1 }).reply()
}

var confirm = function( lang ){
    return Keyboard.make([
        lang.confirm, lang.back
    ], { columns: 1 }).reply()
}

module.exports.lang = lang;
module.exports.lang_b = lang_b;
module.exports.back = back;
module.exports.contact = contact;
module.exports.main = main;
module.exports.sets = sets;
module.exports.catalog = catalog;
module.exports.prod = prod;
module.exports.show_cart = show_cart;
module.exports.cart = cart;
module.exports.location = location;
module.exports.confirm = confirm;
module.exports.make_cat = make_cat;
