const {test}=require('node:test');const assert=require('node:assert/strict');const handler=require('../api/respond');
async function run(t,hook,response){
  const old={WEBHOOK_URL:process.env.WEBHOOK_URL,RESEND_API_KEY:process.env.RESEND_API_KEY};
  if(hook)process.env.WEBHOOK_URL=hook;else delete process.env.WEBHOOK_URL;delete process.env.RESEND_API_KEY;
  const calls=[];t.mock.method(global,'fetch',async (...args)=>{calls.push(args);return response;});t.mock.method(console,'log',()=>{});t.mock.method(console,'error',()=>{});
  let status;const res={status(n){status=n;return this;},end(){return this;}};
  try{await handler({method:'POST',body:{choice:'sealed',picks:{date:'A picnic',note:'A test preference'}}},res);return {status,calls};}
  finally{for(const [key,value] of Object.entries(old))if(value===undefined)delete process.env[key];else process.env[key]=value;}
}
test('missing notification configuration offers a recoverable failure',async t=>{const r=await run(t,null,{ok:true});assert.equal(r.status,503);assert.equal(r.calls.length,0);});
test('a rejected notification cannot be reported as sent',async t=>{const r=await run(t,'https://example.invalid/test',{ok:false,status:503});assert.equal(r.status,502);assert.equal(r.calls.length,1);});
test('a successful notification includes the optional preference note',async t=>{const r=await run(t,'https://example.invalid/test',{ok:true,status:200});assert.equal(r.status,200);assert.match(JSON.parse(r.calls[0][1].body).text,/note: A test preference/);});
