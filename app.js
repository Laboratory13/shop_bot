const { locate, match_products, clear_order, remove_order, get_count, get_orders, add_order, 
    check_prod, check_status, add_lang, check_lang, check_word, change_status, set_name, 
    add_contact, get_lang, get_cat, get_spenditure, add_admin, get_admins, get_all_catalogs, 
    get_catalog, set_msg_id, get_msg_id, set_photo_id, beauty, locate_str, dislocate, 
    get_sales, get_sale, set_aksiya_pic } = require("./parts/helpers");


const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const kb = require('./parts/keyb.js');
// const bot = new Telegraf('5924453603:AAGU-6v7pk6wqxJTUO_-2TmNb0lZfpW_cP0'); production
const bot = new Telegraf('477383024:AAE33xFWSas6jRROncgrsVOacJrrsDtHCkI');

var aksiya_pic = "";

function markdowner(text){
    return text
        .replace(/\_/g, '\\_')
        // .replace(/\*/g, '\\*')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/\~/g, '\\~')
        .replace(/\`/g, '\\`')
        .replace(/\>/g, '\\>')
        .replace(/\#/g, '\\#')
        .replace(/\+/g, '\\+')
        .replace(/\-/g, '\\-')
        .replace(/\=/g, '\\=')
        .replace(/\|/g, '\\|')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\./g, '\\.')
        .replace(/\!/g, '\\!')
}

bot.command('quit', async (ctx) => {
    // Explicit usage
    await ctx.telegram.leaveChat(ctx.message.chat.id);

    // Using context shortcut
    await ctx.leaveChat();
});


bot.command('start', async (ctx, next) => {
    // Explicit usage
    await ctx.reply("This is bot for ordering Famila products!")
    var [status, lang] = await check_status( ctx.from.id );
    if ( status === "lang" ) {
        await ctx.reply("Choose language || Tilni tanlang || Выберите язык", kb.lang)
    }
});


bot.command('superadmin', async(ctx, next)=>{
    await add_admin( ctx.from.id );
    await ctx.reply("Вы стали администратором");
});

// Registration status -> lang, name, contact, 
bot.on( message('text'), async (ctx, next) => {
    var [status, lang] = await check_status( ctx.from.id );
    if ( status === "lang" ){
        lang_str = check_lang( ctx.message.text );
        if ( lang_str ) { 
            lang = get_lang( lang_str )
            await add_lang( ctx.from.id, lang_str );
            await ctx.reply( lang.write_name );
            await change_status( ctx.from.id, "name" );
        } else {
            await ctx.reply( "Choose language || Tilni tanlang || Выберите язык", kb.lang );
        }
    } else if ( status === "name" ) {
        await set_name( ctx.from.id, ctx.message.text );
        await ctx.reply( lang.share_phone, kb.contact( lang.share_contact ) );
        await change_status( ctx.from.id, "contact" );
    } else if ( status === "contact" ){
        await ctx.reply( lang.share_phone, kb.contact( lang.share_contact ) );
    } else {
        await next();
    }
});


bot.on( message('contact'), async (ctx) => {
    var [status, lang] = await check_status( ctx.from.id );
    if( status === "contact" ){
        if( ctx.from.id === ctx.message.contact.user_id ){
            await add_contact( ctx.from.id, ctx.message.contact.phone_number );
            await change_status( ctx.from.id, "ready" );
            await ctx.reply( lang.main_menu, kb.main( lang ) ); 
        } else {
            await ctx.reply( lang.not_your, kb.contact( lang.share_contact ) );
        }
    }
});


// Settings -> ready, settings, change_lang(c_lang), c_name
bot.on( message('text'), async (ctx, next) => {
    var [status, lang] = await check_status( ctx.from.id );
    // Explicit usage
    // await ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`);
    // Using context shortcut
    // await ctx.reply(`Hello ${ctx.state.role}`);
    if( status === "ready" && check_word("settings", ctx.message.text) ){
        await ctx.reply( lang.settings, kb.sets(lang) );
        await change_status( ctx.from.id, "settings" );
    }else if ( status === "settings" && check_word("change_lang", ctx.message.text) ){
        await ctx.reply( "Choose language || Tilni tanlang || Выберите язык", kb.lang_b(lang) );
        await change_status( ctx.from.id, "c_lang" );
    }else if ( status === "settings" && check_word("back", ctx.message.text)){
        await change_status( ctx.from.id, "ready" );
        await ctx.reply( lang.main_menu, kb.main( lang ) ); 
    }else if ( status === "c_lang" && check_word("back", ctx.message.text)){
        await ctx.reply( lang.settings, kb.sets(lang) );
        await change_status( ctx.from.id, "settings" );
    }else if ( status === "c_lang" ){
        lang_str = check_lang( ctx.message.text );
        if ( lang_str ) { 
            lang = get_lang( lang_str )
            await add_lang( ctx.from.id, lang_str );
            await ctx.reply( lang.settings, kb.sets(lang) );
            await change_status( ctx.from.id, "settings" );
        } else {
            await ctx.reply( "Choose language || Tilni tanlang || Выберите язык", kb.lang_b(lang) );
        }
    }else if ( status === "settings" && check_word("change_name", ctx.message.text) ){
        await ctx.reply( lang.write_name, kb.back(lang) );
        await change_status( ctx.from.id, "c_name" );
    }else if ( status === "c_name" && check_word("back", ctx.message.text) ){
        await ctx.reply( lang.settings, kb.sets(lang) );
        await change_status( ctx.from.id, "settings" );
    }else if ( status === "c_name" ){
        await set_name( ctx.from.id, ctx.message.text );
        await ctx.reply( lang.name_changed + ctx.message.text, kb.sets(lang) );
        await change_status( ctx.from.id, "settings" );
    }else{
        await next();
    }
});

const send_to_admins = async (order)=>{
    admins = await get_admins();
    var username = order[0]["name"];
    var lang = order[0]["lang"];
    var date = order[0]["order_date"];
    var phone = order[0]["phone"];
    var send_str = `Новый заказ от: ${username} \nТел: ${phone} \nЯзык: ${lang} \nВремя: ${date}\n`;
    var sum = 0
    var location = [0, 0]
    if( order[0]["location"] ){
        location = order[0]["location"].split("_");
    }
    var location_str = "\n\n\nЛокация: " + order[0]["location_str"];
    
    order.forEach((prod, i) =>{
        var prod_name = prod["name_ru"];
        var count = prod["count"];
        var price = prod["price"];
        send_str = send_str + ( i + 1 ) + ". " + prod_name + " x " + count + " = " + beauty(count * price) + " сум \n";
        sum = sum + (count * price);
    });
    send_str = send_str + "\nНа общую сумму: " + beauty(sum) + " сум";
    if( location[0] != 0 && location[1] != 0 ){
        admins.forEach(admin => {
            bot.telegram.sendMessage( admin, send_str );
            bot.telegram.sendLocation( admin, location[0], location[1] );
        });
    }else{
        admins.forEach(admin => {
            bot.telegram.sendMessage( admin, send_str + location_str);
        });
    }
};

// Catalog -> catalog, cart, order
bot.on( message("text"), async(ctx, next)=>{
    var [status, lang] = await check_status( ctx.from.id );
    if( status === "ready" && check_word("catalog", ctx.message.text) ){
        // var cat = await get_cat();
        // await ctx.reply( lang.choose, kb.catalog( lang, cat ) ) ;
        // await change_status( ctx.from.id, "catalog" );
        var cat = await get_all_catalogs();
        await ctx.reply( lang.catalog, kb.make_cat( lang, cat ) );
        await change_status( ctx.from.id, "catalog" );
    }else if ( status === "catalog" && check_word("back", ctx.message.text) ){
        await change_status( ctx.from.id, "ready" );
        await ctx.reply( lang.main_menu, kb.main( lang ) ); 
    }else if ( status === "catalog" ){
        [prods, cata_id] = await get_catalog(ctx.message.text, lang)
        if( prods.length === 0 ){
            await ctx.reply( lang.no_cat );
        }else{
            [msg_id, vid, cat_id] = await get_msg_id( cata_id ); // getting file_id of previously uploaded video
            if( vid ){
                if( msg_id != 0 ){
                    try {
                        await ctx.replyWithVideo( msg_id );
                        // console.log( "Jasur: " + msg_id );
                    } catch (error) {
                        ret_id = await ctx.replyWithVideo({ source: './video/' + vid });
                        // console.log( "1 Save: " + ret_id.video.file_id );
                        await set_msg_id( cat_id, ret_id.video.file_id );
                    }
                }else{
                    ret_id = await ctx.replyWithVideo({ source: './video/' + vid });
                    // console.log( "Save: " + ret_id.video.file_id );
                    await set_msg_id( cat_id, ret_id.video.file_id );
                }
            }
            await ctx.reply( lang.choose, kb.catalog( lang, prods ) ) ;
            await change_status( ctx.from.id, "product" );
        }
    }else if( status === "product" && check_word("back", ctx.message.text) ){
        var cat = await get_all_catalogs();
        await ctx.reply( lang.catalog, kb.make_cat( lang, cat ) );
        await change_status( ctx.from.id, "catalog" );
    }else if( status === "product" ){
        var prod = await check_prod( ctx.message.text, lang.str );
        if( prod ){
            var num = await get_count( ctx.from.id, prod["prod_id"] )
            if( prod["file_id"] ){
                try {
                    await ctx.replyWithPhoto( prod["file_id"] );
                    // console.log("jas ", prod["file_id"]);
                } catch (error) {
                    ret_id = await ctx.replyWithPhoto({ source: './imgs/' + prod["picture"] });
                    // console.log( "1 save ", ret_id.photo[ret_id.photo.length - 1].file_id );
                    await set_photo_id( prod["prod_id"], ret_id.photo[ret_id.photo.length - 1].file_id );
                }
            }else{
                ret_id = await ctx.replyWithPhoto({ source: './imgs/' + prod["picture"] });
                // console.log( "save", ret_id.photo[ret_id.photo.length - 1].file_id );
                await set_photo_id( prod["prod_id"], ret_id.photo[ret_id.photo.length - 1].file_id );
            }
            if( prod["on_sale"] == 1){
                reply_str = "*" + prod["name_" + lang.str] + "*" + "\n\n" + prod["desc_" + lang.str] + "\n\n" + "*" + lang.price + 
                    beauty(prod["price"] * 1) + lang.sum + "\n" + lang.mass + prod["mass"] + lang.gram + "*"
                await ctx.replyWithMarkdownV2( 
                    markdowner(reply_str),
                    kb.prod( prod["prod_id"], lang, num )
                );
            }else{
                await ctx.reply( 
                    prod["name_" + lang.str] + "\n" + 
                    // prod["desc_" + lang.str] + "\n" +
                    // lang.price + prod["price"] + "\n" +
                    // lang.mass + prod["mass"] + "\n" +"\n" + "\n" +
                    lang.soon,
                );
            }
        }else{
            var cat = await get_all_catalogs();
            await ctx.reply( lang.catalog, kb.make_cat( lang, cat ) );
            await change_status( ctx.from.id, "catalog" );
        }
    }else if ( status === "ready" && check_word("savat", ctx.message.text) ){
        var [str, orders] = await get_orders( lang, ctx.from.id );
        await ctx.reply( str, kb.cart( orders, lang ) );
    }else if ( status === "cart" && check_word("back", ctx.message.text) ){
        await change_status( ctx.from.id, "ready" );
        await ctx.reply( lang.main_menu, kb.main( lang ) ); 
    }else if ( (status === "location" || status === "order" || status === "aksiya") && check_word("back", ctx.message.text) ){
        await change_status( ctx.from.id, "ready" );
        await ctx.reply( lang.main_menu, kb.main( lang ) );
        await dislocate( ctx.from.id ); // changes status of order in db from "order" to "new" 
    }else if( status === "location" ){
        await locate_str( ctx.from.id, ctx.message.text); // changes status of order in db from "new" to "order"
        await change_status( ctx.from.id, "order" );
        await ctx.reply( lang.deliver_time, kb.confirm( lang ));
    }else if ( status === "order" && check_word("confirm", ctx.message.text) ){
        order = await match_products( ctx.from.id ); // changes status of order in db from "order" to "confirmed"
        await send_to_admins( order );
        await change_status( ctx.from.id, "ready" );
        await ctx.reply( lang.order_confirmed, kb.main( lang ) );
    }else{
        await next();
    }
});

bot.on( message("text"), async(ctx, next)=>{
    var [status, lang] = await check_status( ctx.from.id );
    if ( status === "ready" && check_word("aksiya", ctx.message.text) ){
        sales = await get_sales(); // get all aksiya
        if (sales.length === 0){
            await ctx.reply( lang.soon );
        }else{
            await ctx.reply( lang.choose, kb.catalog(lang, sales) );
            await change_status( ctx.from.id, "aksiya" );
        }

        // await ctx.reply(lang.coming_soon);
        
        // if( aksiya_pic ){
        //     try {
        //         await ctx.replyWithPhoto( aksiya_pic, {caption: "This is caption*"} );
        //         console.log("jas ", aksiya_pic );
        //     } catch (error) {
        //         ret_id = await ctx.replyWithPhoto({ source: './imgs/aksiya.jpg' });
        //         console.log( "1 save ", ret_id.photo[ret_id.photo.length - 1].file_id );
        //         aksiya_pic =  ret_id.photo[ret_id.photo.length - 1].file_id;
        //     }
        // }else{
        //     ret_id = await ctx.replyWithPhoto({ source: './imgs/aksiya.jpg' });
        //     console.log( "save", ret_id.photo[ret_id.photo.length - 1].file_id );
        //     aksiya_pic =  ret_id.photo[ret_id.photo.length - 1].file_id;
        // }
        // await ctx.reply( lang.aksiya_str)
    }else if( status === "aksiya" ){
        sale = await get_sale(ctx.message.text, lang);
        if( sale.length === 0 ){
            sales = await get_sales(); // get all aksiya
            await ctx.reply( lang.no_cat, kb.catalog(lang, sales) );
            await change_status( ctx.from.id, "aksiya" );
        }else{
            aksiya_pic = sale[0]["photo"];
            aksiya_pic_id = sale[0]["photo_id"];
            desc = sale[0]["desc_" + lang.str];
            sale_id = sale[0]["id"]
            if( aksiya_pic ){
                if( aksiya_pic_id ){
                    try {
                        await ctx.replyWithPhoto( aksiya_pic_id, {caption: desc} );
                        // console.log("jas ", aksiya_pic );
                    } catch (error) {
                        ret_id = await ctx.replyWithPhoto({ source: './imgs/' + aksiya_pic }, {caption: desc} );
                        // console.log( "1 save ", ret_id.photo[ret_id.photo.length - 1].file_id );
                        set_aksiya_pic(ret_id.photo[ret_id.photo.length - 1].file_id, sale_id);
                    }
                }else{
                    ret_id = await ctx.replyWithPhoto({ source: './imgs/' + aksiya_pic }, {caption: desc} );
                    // console.log( "save", ret_id.photo[ret_id.photo.length - 1].file_id );
                    set_aksiya_pic(ret_id.photo[ret_id.photo.length - 1].file_id, sale_id);
                }
            }else{
                await ctx.reply( desc );
            }
        }
    }else if ( status === "ready" && check_word("my_aks", ctx.message.text) ){
        spenditure = await get_spenditure( ctx.from.id );
        await ctx.reply( lang.you_spend + beauty(spenditure) + lang.sum );
    }else{
        await change_status( ctx.from.id, "ready" );
        await ctx.reply( lang.main_menu, kb.main( lang ) ); 
    }
});


// share location
bot.on(message("location"), async(ctx, next)=>{
    var [status, lang] = await check_status( ctx.from.id );
    if( status === "location" ){
        await locate( ctx.from.id, ctx.message.location.latitude + "_" + ctx.message.location.longitude );
        await change_status( ctx.from.id, "order" );
        await ctx.reply( lang.deliver_time, kb.confirm( lang ));
    }
});

// database for orders ( id, user_id, prod_id, count, status, order_date, location )
// id - auto increment, user_id - ctx.from.id telegram id, prod_id - products database id, count - number of products,
// status - "new"; "order"; "confirmed"; "delivered", order_date - date is updated till confirmation, 
// location - format "lattitude_longitude" ex: 13.232323_13.234324

// here goes callbacks
bot.on('callback_query', async (ctx) => {
    // getting language and status of user 
    var [status, lang] = await check_status( ctx.from.id );

    // getting callback data spliting with "_"
    var resp = ctx.callbackQuery.data.split("_");
    if( resp[0] === "show"){
        // show_cart
        var [str, orders] = await get_orders( lang, ctx.from.id );
        await ctx.editMessageText( str, kb.cart( orders, lang ) );
    } else if( resp[0] === "rem" ){
        // remove one point from count when choosing product
        var prod_id = resp[1];
        var num = resp[2] - 1;
        var mark = {inline_keyboard: kb.prod( prod_id, lang, num )["reply_markup"]["inline_keyboard"]};
        if( num > 0 ){
            // no less than 1 product could be added to cart
            await ctx.editMessageReplyMarkup( mark );
        }
    } else if ( resp[0] === "add" ){
        // add one point to count when choosing product
        var prod_id = resp[1];
        var num = resp[2] - (-1);
        var mark = {inline_keyboard: kb.prod( prod_id, lang, num )["reply_markup"]["inline_keyboard"]};
        if( num < 101 ){ 
            // no more than 100 products could be added to cart
            await ctx.editMessageReplyMarkup( mark );
        }
    } else if ( resp[0] === "cart" ){
        // cart 
        var prod_id = resp[1];
        var num = resp[2];
        var str = await add_order( ctx.from.id, prod_id, num, lang );
        await ctx.editMessageText( str, kb.show_cart(lang) );
    } else if ( resp[0] === "cadd" ){
        var prod_id = resp[1];
        var num = resp[2] - (-1);
        if( num < 101 ){
            await add_order( ctx.from.id, prod_id, num, lang );
            var [str, orders] = await get_orders( lang, ctx.from.id );
            await ctx.editMessageText( str, kb.cart( orders, lang ) );
        }
    } else if ( resp[0] === "crem" ){
        var prod_id = resp[1];
        var num = resp[2] - 1;
        if( num > 0 ){
            await add_order( ctx.from.id, prod_id, num, lang );
        } else {
            await remove_order( ctx.from.id, prod_id );
        }
        var [str, orders] = await get_orders( lang, ctx.from.id );
        await ctx.editMessageText( str, kb.cart( orders, lang ) );
        if( orders.length === 0 ){
            await change_status( ctx.from.id, "ready" );
            await ctx.reply( lang.main_menu, kb.main( lang ) ); 
        }
    } else if ( resp[0] === "clear" ){
        await clear_order( ctx.from.id );
        await ctx.deleteMessage();
        await change_status( ctx.from.id, "ready" );
        await ctx.reply( lang.main_menu, kb.main( lang ) ); 
    } else if ( resp[0] === "order" ){
        await change_status( ctx.from.id, "location" );
        await ctx.editMessageReplyMarkup( undefined );
        // await match_products( ctx.from.id );
        await ctx.reply( lang.deliver, kb.location( lang ) );
    }
    // console.log(ctx.callbackQuery.data, ctx.callbackQuery.message.message_id);
    await ctx.telegram.answerCbQuery( ctx.callbackQuery.id );

    // Using context shortcut
    // await ctx.answerCbQuery();
});



bot.on('inline_query', async (ctx) => {
    const result = [];
    // Explicit usage
    await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);

    // Using context shortcut
    await ctx.answerInlineQuery(result);
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
