const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const MongoClient = require('mongodb').MongoClient;
const mongodb = require('mongodb')
const db_connect = require('./db.js').db_connect;
const db_create = require('./db.js').db_create;
const db_find = require('./db.js').db_find;
const db_update = require('./db.js').db_update;
const db_del = require('./db.js').db_del;
const db_close = require('./db.js').db_close;
const app = new Koa();
const router = new Router();
app.use(koaBody());
let lastId = 0;
let members = [];

router
    //creat new account(Test done)
    .post('/member', async ctx => {
        console.log(ctx.url)
        let is_valid_account = true
        let is_valid_pw = true
        var members = {};
        const indata = ctx.request.body
        console.log('[clinet][post]received data',indata)
        
        for (let [key, value] of Object.entries(indata)){
            console.log(`${key}: ${value}`);
            members[key] = value
        }
        console.log('[client][POST] datas len:', Object.keys(members).length);
        //Regular expression Testing
        let email_format = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;  
        //validate ok or not
        if(email_format.test(members.account)===false){
            ctx.body = 'Please use email as your account';
            is_valid_account = false
        }
        if(members.password.length < 6){
            ctx.body = 'Your password must have 6 words at least.';
            is_valid_pw = false
        }
        let client = await db_connect()
        let user_info = await db_find(client,'Users',{"account":members.account})

        if (user_info.length > 0){
            console.log('[client] The Account exist !!!',user_info)
            ctx.body = 'This account has registed, please use another email to regist.';
            ctx.status = 409;
        }
        else if (is_valid_account && is_valid_pw && user_info.length==0) {
            new_user = await db_create(client,'Users',members)
            create_id = mongodb.ObjectID(new_user.insertedCount)
            if (create_id){
                console.log('Create account success')
                ctx.body = 'Create account success';
                ctx.status = 201;
            }
        }else {
            ctx.status = 500;
        }
    })
    //Upload picture (Test done)
    .post('/member/uploadfile',koaBody({multipart: true}), async ctx => {
        const cur_account = ctx.query.account
        console.log('[client] update member:',cur_account)
        const files = ctx.request.files.snapshot;
        upload_file_json = JSON.stringify(files)
        console.log('files_json:', upload_file_json);
        upload_file = JSON.parse(upload_file_json)
        console.log('files_json:', typeof upload_file.size);
        if (upload_file.size > 100000){
            ctx.body = "Upload File size > 100KB"
            console.log('Upload File size > 100KB');
            ctx.status = 406
        }
        else{
            let client = await db_connect()
            upload_link = {"picture":upload_file.path}
            user_set = await db_update(client,'Users',{"account":cur_account},upload_link)
            ctx.body = upload_file_json
            ctx.status = 200
        }
        console.log('files object:', upload_file.path);
    })
    //Update account information(Test done)
    .put('/member',async ctx => {
        const cur_account = ctx.query.account
        const datas = ctx.request.body
        //const cur_account = ctx.params.account;
        console.log('[client] will set member:',cur_account)
        let client = await db_connect()
        res = await db_update(client,'Users',{"account":cur_account},datas)
        if (res.matchedCount > 0)
            ctx.status = 200
        else if (res.matchedCount === 0)
            ctx.status = 404
        else
            ctx.status = 500 
    })
    //Get account information(Test done)    
    .get('/member',async ctx => {
        let cur_member = {}
        const cur_account = ctx.query.account
        console.log('input account:',cur_account)
        let client = await db_connect()
        let user_info = await db_find(client,'Users',{"account":cur_account})
        ctx.body = user_info
        if (user_info.length > 0)
            ctx.status = 200
        else if (user_info.length === 0)
            ctx.status = 404 //not found
        else
            ctx.status = 400 //not found
    })
    //Post message (Test done)
    .post('/article', async ctx => {
        console.log(ctx.url)
        try {
            console.log('createPost:body=%j', ctx.request.body)
            var post = ctx.request.body
            var time = new Date()
            post.created_at = time.getFullYear()+'/'+(time.getMonth()+1)+'/'+time.getDate()
            if (post.parent_id !== 0){
                console.log('[client][artical]check parent_id specific')
                post.parent_id = mongodb.ObjectID(post.parent_id)
            }
            else{
                console.log('[client][artical]check parent_id not yet set')
                ctx.status = 404 
            }
            //post.parent_id = 0
            let client = await db_connect()
            post_in = await db_create(client,'posts',post)
            ctx.type = 'application/json'
            ctx.body = JSON.stringify(post)
            
        } catch (error) {
              ctx.throw(500)
              ctx.body = {}
        }
    })
    //Delete message (Test done)
    .delete('/article', async ctx => {
        const id = ctx.query.id
        console.log('[client][DELET]')
        //const id = ctx.params.id;
        console.log('[client] _id:',id)
        if (id) {
            let client = await db_connect()
            let rm_parent_res = await db_del(client,'posts',{"_id": mongodb.ObjectID(id)})
            let rm_child_res = await db_del(client,'posts',{"parent_id": mongodb.ObjectID(id)})
            console.log('[client]remove parent:',rm_parent_res.deletedCount)
            console.log('[client]remove child:',rm_child_res.deletedCount)
            ctx.type = 'application/json'
            ctx.body = {}
            ctx.status = 200
        } else {
            // return 404 if id is non
            ctx.status = 404;
            ctx.body = 'Delete content fail.';
        }    
    })

app.use(router.routes());
app.listen(3000);
module.exports = app