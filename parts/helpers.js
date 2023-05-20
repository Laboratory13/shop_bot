
const filesys_uz = require('../langs/filesys_uz');
const filesys_ru = require('../langs/filesys_ru');
const filesys_en = require('../langs/filesys_en');
const dbase = require('./dbase.js');

async function check_status(id){
    try {
        ans = await dbase("SELECT status, lang FROM users WHERE id=?", [id]);
        if (ans.length === 0){
            await dbase(`INSERT INTO users ( id, name, lang, status, phone ) VALUES ( ?, ?, ?, ?, ? );`, [id, 0, 0, "lang", 0]);
            return ["lang", 0];
        } else {
            return [ans[0]["status"], get_lang(ans[0]["lang"])];
        }
    } catch (error) {
        console.log(error);
        return ["error", "en"];
    }
}

function get_lang(str_lang){
    if(str_lang === "en"){
        return filesys_en;
    }else if(str_lang === "ru"){
        return filesys_ru;
    }else{
        return filesys_uz;
    }
}

function check_lang(str_lang){
    if (str_lang === "En 🏴󠁧󠁢󠁥󠁮󠁧󠁿") {
        return "en";
    } else if (str_lang === "Uz 🇺🇿") {
        return "uz";
    } else if (str_lang === "Ru 🇷🇺") {
        return "ru";
    } else {
        return 0
    }
}

function check_word(primary, word){
    return filesys_uz[primary] === word || filesys_en[primary] === word || filesys_ru[primary] === word;
}

async function add_lang( id, lang ){
    try {
        await dbase(`UPDATE users SET lang = ? WHERE id = ?`, [lang, id]);
    } catch (error) {
        console.log(error);
    }
}

async function change_status( id, status ){
    try {
        await dbase(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);
    } catch (error) {
        console.log(error);
    }
}

async function set_name( id, name ){
    try {
        await dbase(`UPDATE users SET name = ? WHERE id = ?`, [name, id]);
    } catch (error) {
        console.log(error);
    }
}

async function add_contact( id, phone ){
    try {
        await dbase(`UPDATE users SET phone = ? WHERE id = ?`, [phone, id]);
    } catch (error) {
        console.log(error);
    }
}

async function get_cat(){
    try {
        return await dbase(`SELECT * FROM products`);
    } catch (error) {
        console.log(error);
        return [];
    }
}

async function check_prod( prod, lang ){
    try {
        ans = await dbase(`SELECT * FROM products WHERE name_${lang}=?`, [prod]);
        if (ans.length === 0){
            return false;
        } else {
            return ans[0];
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function get_all_catalogs(){
    try {
        ans = await dbase(`SELECT DISTINCT cat FROM products`);
        return ans;
    } catch (error) {
        console.log(error);
        return [];
    }
}

async function add_order(user_id, prod_id, count, lang){
    try {
        var ans = await dbase("SELECT * FROM products WHERE prod_id = ?", [prod_id]);
        if ( ans.length === 0 ){
            return lang.not_found;
        } else {
            var initial = await dbase("SELECT * FROM orders WHERE user_id = ? AND prod_id = ? AND status = ?", [user_id, prod_id, "new"]);
            if( initial.length === 0 ){
                await dbase("INSERT INTO orders (user_id, prod_id, count, status) VALUES ( ?, ?, ?, ?)", [user_id, prod_id, count, "new"]);
            }else{
                await dbase("UPDATE orders SET count = ?, order_date = NOW() WHERE id = ?", [ count, initial[0]["id"] ]);
            }
            const price = ans[0]["price"];
            const name = ans[0]["name_" + lang.str];
            return "✅" + lang.added + "\n\n" + name + "  " + count + " x " + price + " = " + (price * count) + " UZS"
        }
    } catch (error) {
        console.log(error);
        return error;
    }
}

async function get_orders( lang, user_id ){
    try {
        ans = await dbase(`
            SELECT id, user_id, orders.prod_id AS prod_id, count, name_${lang.str}, price 
            FROM orders 
            JOIN products ON orders.prod_id = products.prod_id AND user_id = ? AND status = ?`, [user_id, "new"]);
        var ret_str = lang.in_cart + "\n\n"
        var sum = 0
        ans.forEach(order => {
            sum = sum + (order["price"] * order["count"]);
            ret_str = ret_str + order["name_" + lang.str] + " x " + order["count"] + " x " + order["price"] + " = " + (order["price"] * order["count"]) + " UZS\n"
        });
        if (ans.length === 0){
            ret_str = ret_str + lang.empty
        }else{
            ret_str = ret_str + "\n" + lang.sum + sum
        }
        return [ ret_str, ans ];
    } catch (error) {
        console.log(error);
        return [error, []];
    }
}

async function get_count( user_id, prod_id ){
    try {
        ans = await dbase("SELECT * FROM orders WHERE user_id = ? AND prod_id = ? AND status = ?", [user_id, prod_id, "new"]);
        if( ans.length === 0 ){
            return 1;
        }else{
            return ans[0]["count"];
        }
    } catch (error) {
        console.log(error);
        return 1;
    }
}

async function remove_order( user_id, prod_id ){
    try {
        await dbase("DELETE FROM orders WHERE user_id = ? AND prod_id = ? AND status = ?", [user_id, prod_id, "new"]);
    } catch (error) {
        console.log(error);
    }
}

async function clear_order( user_id ){
    try {
        await dbase("DELETE FROM orders WHERE user_id = ? AND status = ?", [user_id, "new"]);
    } catch (error) {
        console.log(error);
    }
}

async function match_products( user_id ){
    try {
        ans = await dbase(`
            SELECT orders.id as id, user_id, orders.prod_id AS prod_id, count, price, order_date, location, name, lang, phone, name_ru 
            FROM orders 
            JOIN products ON orders.prod_id = products.prod_id AND user_id = ? AND status = ?
            JOIN users ON orders.user_id = users.id`, [user_id, "order"] );
        // console.log(ans[0]);
        await dbase("UPDATE orders SET status = ?, order_date = NOW() WHERE user_id = ? AND status = ?", [ "confirmed", user_id, "order" ]);
        return ans;
    } catch (error) {
        console.log(error);
        return [];
    }
}

async function locate( user_id, location ){
    try {
        await dbase("UPDATE orders SET status = ?, order_date = NOW(), location = ? WHERE user_id = ? AND status = ?", [ "order", location, user_id, "new" ]);
    } catch (error) {
        console.log(error);
    }
}

async function get_spenditure( user_id ){
    try {
        ans = await dbase(`
            SELECT id, user_id, orders.prod_id AS prod_id, count, price 
            FROM orders 
            JOIN products ON orders.prod_id = products.prod_id AND user_id = ? AND (status = ? OR status = ?)`, [user_id, "confirmed", "delivered"]);
        var spenditure = 0;
        ans.forEach(order => {
            spenditure = spenditure + (order["count"] * order["price"]);
        });
        return spenditure;
    } catch (error) {
        console.log(error);
        return -1;
    }
}

async function add_admin( admin_id ){
    try {
        ans = await dbase("SELECT * FROM admins WHERE admin_id = ?", [admin_id] );
        if( ans.length === 0){
            await dbase("INSERT INTO admins ( admin_id, status ) VALUES (?, ?)", [admin_id, "ready"]);
        }
    } catch (error) {
        console.log(error);
    }
}

async function get_admins(){
    try {
        ans = await dbase("SELECT * FROM admins");
        ret_arr = [];
        ans.forEach(adm => {
            ret_arr.push(adm["admin_id"]);
        });
        return ret_arr;
    } catch (error) {
        console.log(error);
        return [];
    }
}

async function get_catalog(cat){
    try {
        return await dbase( "SELECT * FROM products WHERE cat = ?", [cat] );
    } catch (error) {
        console.log(error);
        return [];
    }
}


async function get_msg_id( cat ){
    try {
        ans = await dbase( "SELECT * FROM category WHERE name = ?", [cat] );
        return [ ans[0]["msg_id"], ans[0]["video"], ans[0]["id"] ];
    } catch (error) {
        console.log(error);
        return 0;
    }
}


async function set_msg_id( cat_id, file_id ){
    try {
        await dbase(`UPDATE category SET msg_id = ? WHERE id = ?`, [file_id, cat_id]);
    } catch (error) {
        console.log(error);
    }
}


async function set_photo_id( prod_id, file_id ){
    try {
        await dbase(`UPDATE products SET file_id = ? WHERE prod_id = ?`, [file_id, prod_id]);
    } catch (error) {
        console.log(error);
    }
}


module.exports.check_status = check_status;
module.exports.add_lang = add_lang;
module.exports.check_lang = check_lang;
module.exports.check_word = check_word;
module.exports.change_status = change_status;
module.exports.set_name = set_name;
module.exports.add_contact = add_contact;
module.exports.get_lang = get_lang;
module.exports.get_cat = get_cat;
module.exports.check_prod = check_prod;
module.exports.add_order = add_order;
module.exports.get_orders = get_orders;
module.exports.get_count = get_count;
module.exports.remove_order = remove_order;
module.exports.clear_order = clear_order;
module.exports.match_products = match_products;
module.exports.locate = locate;
module.exports.get_spenditure = get_spenditure;
module.exports.add_admin = add_admin;
module.exports.get_admins = get_admins;
module.exports.get_all_catalogs = get_all_catalogs;
module.exports.get_catalog = get_catalog;
module.exports.set_msg_id = set_msg_id;
module.exports.get_msg_id = get_msg_id;
module.exports.set_photo_id = set_photo_id;