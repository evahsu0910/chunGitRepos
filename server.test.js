const request = require('supertest');
const testserver = require('./server');
const mongodb = require('mongodb')
const db_connect = require('./db.js').db_connect;
const db_create = require('./db.js').db_create;
const db_find = require('./db.js').db_find;
const db_update = require('./db.js').db_update;
const db_del = require('./db.js').db_del;
const db_close = require('./db.js').db_close;
const supertest = require('supertest');
/*
afterEach(() => {
    testserver.close() 
  })
  */

test('[TEST-1] Create new account:', async () => {
    const res = await request(testserver.callback())
        .post('/member')
        .send({account: "Company@gmail.com",password:'55555566'})
    expect(res.statusCode).not.toEqual(500)

})

test('[TEST-2] Update account info:', async () => {
    const res = await request(testserver.callback())
        .put('/member?account=Company@gmail.com')
        .send({bithday:'88/12/12',sex:"female",name:"Lily",nickname:'Bobo'})
    expect(res.statusCode).not.toEqual(500)
})
test('[TEST-3] Upload file:', async () => {
    const res = await request(testserver.callback())
        .post('/member/uploadfile?account=Company@gmail.com')
        .attach('snapshot', 'picture/cat.jpg')
    expect(res.statusCode).toEqual(200)
})
test('[TEST-4] Get account info:', async () => {
    const res = await request(testserver.callback())
        .get('/member?account=Company@gmail.com')
    expect(res.statusCode).not.toEqual(400)
})

test('[TEST-5] Post message:', async () => {
    const res = await request(testserver.callback())
        .post('/article')
        //.send({account:"Company@gmail.com",content:"Test post messge",parent_id:'5fe44808889d6d5474ee5197'})
        .send({account:"Company@gmail.com",content:"Post messge.....",parent_id:0})
    console.log('[Test res]:',res.body) 
    expect(res.statusCode).not.toEqual(500)
    expect(res.type).toEqual('application/json');
})

test('[TEST-6] Delete message:', async () => {
    const res = await request(testserver.callback())
        .delete('/article?id=5fe44edb521a030ed08ad09e')
    expect(res.statusCode).not.toEqual(500)
    expect(res.type).toEqual('application/json');
})
