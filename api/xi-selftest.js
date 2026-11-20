"use strict";
const crypto=require("crypto");
module.exports=async function(req,res){
  res.setHeader("Cache-Control","no-store");
  res.setHeader("Content-Type","application/json; charset=utf-8");
  if(req.method!=="GET"){res.statusCode=405;return res.end(JSON.stringify({error:"Method not allowed."}));}
  const got=String(req.query&&req.query.token||"");
  const expected=process.env.MAT_STUDIO_SELFTEST_TOKEN||"";
  const a=Buffer.from(got),b=Buffer.from(expected);
  if(!expected||a.length!==b.length||!crypto.timingSafeEqual(a,b)){res.statusCode=404;return res.end(JSON.stringify({error:"Not found."}));}
  const host=String(req.headers["x-forwarded-host"]||req.headers.host||"").split(",")[0].trim();
  const origin="https://"+host;
  try{
    const login=await fetch(origin+"/api/xi-auth",{method:"POST",headers:{Origin:origin,"Content-Type":"application/json"},body:JSON.stringify({action:"login",password:process.env.MAT_STUDIO_CHAT_PASSWORD||""})});
    const loginBody=await login.json().catch(()=>({}));
    if(!login.ok||!loginBody.authenticated){res.statusCode=502;return res.end(JSON.stringify({stage:"owner-auth",ok:false,status:login.status}));}
    const cookie=login.headers.get("set-cookie");
    if(!cookie){res.statusCode=502;return res.end(JSON.stringify({stage:"owner-auth-cookie",ok:false}));}
    const chat=await fetch(origin+"/api/xi-chat",{method:"POST",headers:{Origin:origin,Cookie:cookie.split(";")[0],"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",text:"Reply with exactly MATUDI ENGINE ONLINE."}],system:"Reply with exactly MATUDI ENGINE ONLINE."})});
    const data=await chat.json().catch(()=>({}));
    res.statusCode=chat.ok?200:502;
    return res.end(JSON.stringify({stage:"ai-engine",ok:chat.ok,status:chat.status,provider:data.provider||null,model:data.model||null,replyReceived:typeof data.text==="string"&&data.text.length>0,replyLength:typeof data.text==="string"?data.text.length:0,error:data.error||null}));
  }catch(e){res.statusCode=502;return res.end(JSON.stringify({stage:"network",ok:false,error:"Internal test request failed."}));}
};
