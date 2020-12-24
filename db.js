const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'membersdata';
let dbclient = {};

const db_connect = function(){
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url, function(err, client) {
            const db = client.db(dbName);
            dbclient = client
            resolve(db, dbclient);
        });
    });
};

const db_create = function(db,collection_str,members){
    return new Promise(function (resolve, reject) {
        db.collection(collection_str, function (err, collection) {
            insertedId  = collection.insertOne(members);
            if (err) throw err;
            resolve(insertedId)
        });
    });
};
const db_find = function(db,collection_str,json){
    return new Promise(function (resolve, reject) {
        db.collection(collection_str, function (err, collection) {
            collection.find(json).toArray( function(err,items){
                if (err) throw err;
                resolve(items);
            })
        })
    })
};
const db_update = function(db,collection_str,query,update){
    return new Promise(function (resolve, reject) {
        db.collection(collection_str, function (err, collection) {
            result = collection.updateOne(query,{$set :update},{w:1},function(err,items){
                if (err) throw err;
                resolve(items);
            });
                
        });
    })
};
const db_del = function(db,collection_str,item){
    return new Promise(function (resolve, reject) {
        db.collection(collection_str, function (err, collection) {
            collection.deleteMany(item,{w:1},function(err,res){
                if (err) throw err;
                resolve(res);
              });
                
            });
                
        });
};
const db_close = function(){
    /*
    return new Promise(function (resolve, reject) {
        dbclient.close()
        resolve();
    });
    */
};

module.exports.db_connect = db_connect;
module.exports.db_create = db_create;
module.exports.db_find = db_find;
module.exports.db_update = db_update;
module.exports.db_del = db_del;
module.exports.db_close = db_close;

