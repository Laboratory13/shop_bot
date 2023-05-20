const mysql = require("mysql2");
const util = require( 'util' );


//    // For hosting server
// const connection = mysql.createConnection({
//     host: "localhost",
//     user: "procente_markaz",
//     database: "procente_markaz",
//     password: "555"
// });

    // For localhosting
const connection = mysql.createConnection({
    host: "localhost",
    user: "jasur",
    database: "shop",
    password: "J@$Ur"
});


function makerequest(){

    return {
        query( sql, args ) {
            return util.promisify( connection.query ).call( connection, sql, args );
        },
        close() {
            return util.promisify( connection.end ).call( connection );
        }
    }; 
}


const request = makerequest();

function dbase(sql, args){
    try{
        const res = request.query(sql, args);
        // request.close();
        return res;
    }
    catch(e){
        console.log(e)
        return [];
    }
}
module.exports = dbase;