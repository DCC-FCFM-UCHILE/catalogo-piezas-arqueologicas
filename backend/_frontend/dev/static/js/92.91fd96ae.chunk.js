"use strict";(self.webpackChunkcatalogomuseo=self.webpackChunkcatalogomuseo||[]).push([[92],{9092:(e,r,a)=>{a.r(r),a.d(r,{default:()=>w});var t=a(5043),n=a(835),o=a(5865),s=a(4535),i=a(6446),c=a(2314),l=a(1906),m=a(8911),u=a(4565),d=a(2768),p=a(7358),h=a(579);const y=(0,s.Ay)(m.A)((e=>{let{theme:r}=e;return{justifyContent:"center",alignItems:"center",rowGap:r.spacing(1)}})),g=(0,s.Ay)(o.A)((e=>{let{theme:r}=e;return{marginTop:r.spacing(12),marginBottom:r.spacing(3)}})),f=(0,s.Ay)(i.A)((e=>{let{theme:r}=e;return{display:"flex",flexDirection:"column"}})),A=(0,s.Ay)(l.A)((e=>{let{theme:r}=e;return{marginTop:r.spacing(3.5)}})),v=(0,s.Ay)(o.A)((e=>{let{theme:r}=e;return{color:r.palette.primary.main,cursor:"pointer",textDecoration:"underline","&:hover":{color:r.palette.primary.dark}}})),w=()=>{const e=(0,n.Zp)(),r=(0,n.zy)(),{addAlert:a}=(0,p.i)(),{setToken:o}=(0,u.r)(),[s,i]=(0,t.useState)({username:"",password:""}),[l,m]=(0,t.useState)("");(0,t.useEffect)((()=>{(async()=>{try{const e=await fetch("".concat(d.y.ADMIN_MAIL)),r=await e.json();m(r.admin_email)}catch(e){console.error("Error fetching admin email:",e)}})()}),[]);return(0,h.jsxs)(y,{children:[(0,h.jsx)(g,{variant:"h1",children:"Inicio de sesi\xf3n"}),(0,h.jsxs)(f,{component:"form",autoComplete:"off",onChange:e=>{const{name:r,value:a}=e.target;i({...s,[r]:a})},onSubmit:async t=>{t.preventDefault();try{var n;const t=await fetch(d.y.AUTH,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),i=await t.json();if(!t.ok)return void a(i.detail);o(i.token.replace(/"/g,""));const c=(null===(n=r.state)||void 0===n?void 0:n.from)||"/";console.log("from",c),"/"!==c&&String(c.pathname).includes("/reset-password")?e("/"):e(c,{replace:!0})}catch(i){a("Ha ocurrido un error durante la autenticaci\xf3n")}},children:[(0,h.jsx)(c.A,{required:!0,id:"username",name:"username",label:"Usuario",type:"text",margin:"normal",value:s.username}),(0,h.jsx)(c.A,{required:!0,id:"password",name:"password",label:"Contrase\xf1a",type:"password",margin:"normal",value:s.password}),(0,h.jsx)(A,{variant:"contained",color:"primary",type:"submit",children:"Iniciar sesi\xf3n"}),(0,h.jsx)(g,{variant:"body2",align:"center",marginTop:2,children:(0,h.jsx)(v,{onClick:()=>e("/password-recovery"),children:"Recuperar Contrase\xf1a"})})]})]})}}}]);
//# sourceMappingURL=92.91fd96ae.chunk.js.map