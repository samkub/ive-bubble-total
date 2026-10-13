import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,signInAnonymously,signInWithEmailAndPassword,signOut,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,collection,doc,onSnapshot,runTransaction,getDoc,getDocs,writeBatch,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import QRCode from 'https://esm.sh/qrcode@1.5.4';
import {firebaseConfig} from './firebase-config.js';
const $=id=>document.getElementById(id);
const view=new URLSearchParams(location.search).get('view')||'screen';
$(view in {screen:1,join:1,admin:1}?view:'screen').hidden=false;
const joinLink=new URL(location.href);joinLink.search='?view=join';
$('joinUrl').textContent=joinLink.href;
if(view==='screen')QRCode.toCanvas($('qr'),joinLink.href,{width:155,margin:1}).catch(console.error);
$('fullscreen').onclick=()=>document.documentElement.requestFullscreen?.();
if(firebaseConfig.apiKey==='REPLACE_ME'){$('status').textContent='กรุณาตั้งค่า firebase-config.js ก่อน';throw Error('Firebase not configured');}
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const answers=collection(db,'answers');let currentUser=null;
const fmt=n=>new Intl.NumberFormat('th-TH',{maximumFractionDigits:2}).format(n);
function render(rows){$('count').textContent=fmt(rows.length);$('total').textContent=fmt(rows.reduce((s,r)=>s+r.amount,0));const area=$('bubbleArea');area.replaceChildren();const n=rows.length;if(!n)return;
  const w=area.clientWidth,h=area.clientHeight;
  rows.slice(-120).forEach((r,i)=>{const el=document.createElement('div');el.className='bubble';const radius=Math.max(28,Math.min(65,Math.sqrt(w*h/Math.max(n,10))*.34));const cols=Math.max(1,Math.floor(w/(radius*2.35)));const rowsCount=Math.ceil(Math.min(n,120)/cols);const col=i%cols,row=Math.floor(i/cols);const x=(col+.5)*w/cols,y=(row+.5)*h/rowsCount;const hue=(i*59+210)%360;el.style.cssText=`width:${radius*2}px;height:${radius*2}px;left:${x}px;top:${y}px;background:hsl(${hue} 65% 42%);animation-delay:0s,${(i%7)*-.5}s`;const b=document.createElement('b'),small=document.createElement('small');b.textContent=fmt(r.amount);small.textContent=r.name;el.append(b,small);area.append(el);});}
if(view==='screen'){onSnapshot(answers,s=>{$('status').textContent='● LIVE';render(s.docs.map(d=>d.data()).filter(r=>typeof r.amount==='number'));},e=>$('status').textContent='เชื่อมต่อผิดพลาด: '+e.message);}
if(view==='join'){
  onAuthStateChanged(auth,async user=>{if(!user){try{await signInAnonymously(auth)}catch(e){$('joinMessage').textContent='เข้าสู่ระบบไม่สำเร็จ: '+e.message}return;}currentUser=user;$('status').textContent='พร้อมส่งยอด';try{const snap=await getDoc(doc(db,'answers',user.uid));if(snap.exists()){ $('responseForm').hidden=true;$('joinMessage').textContent='คุณส่งยอดแล้ว: '+fmt(snap.data().amount)+' (ส่งซ้ำไม่ได้)';}}catch(e){$('joinMessage').textContent=e.message;}});
  $('responseForm').onsubmit=async e=>{e.preventDefault();if(!currentUser)return;const name=$('name').value.trim(),amount=Number($('amount').value);if(!name||!Number.isFinite(amount)||amount<0||amount>1e9)return;const btn=$('responseForm').querySelector('button');btn.disabled=true;try{await runTransaction(db,async tx=>{const ref=doc(db,'answers',currentUser.uid),snap=await tx.get(ref);if(snap.exists())throw Error('คุณตอบไปแล้ว');tx.set(ref,{name,amount,createdAt:serverTimestamp()});});$('responseForm').hidden=true;$('joinMessage').textContent='ส่งยอดสำเร็จ ขอบคุณครับ!';}catch(err){$('joinMessage').textContent='ส่งไม่ได้: '+err.message;btn.disabled=false;}};
}
if(view==='admin'){
  onAuthStateChanged(auth,user=>{currentUser=user;$('loginForm').hidden=!!user;$('adminActions').hidden=!user;$('adminEmail').textContent=user?.email||'';$('status').textContent=user?'เข้าสู่ระบบแล้ว':'กรุณาเข้าสู่ระบบ';});
  $('loginForm').onsubmit=async e=>{e.preventDefault();try{await signInWithEmailAndPassword(auth,$('email').value,$('password').value);$('adminMessage').textContent='เข้าสู่ระบบสำเร็จ';}catch(err){$('adminMessage').textContent=err.message;}};
  $('logout').onclick=()=>signOut(auth);
  $('reset').onclick=async()=>{if(!confirm('ล้างคำตอบทั้งหมดจริงหรือไม่? การดำเนินการนี้ย้อนกลับไม่ได้'))return;try{const snap=await getDocs(answers);for(let i=0;i<snap.docs.length;i+=400){const batch=writeBatch(db);snap.docs.slice(i,i+400).forEach(d=>batch.delete(d.ref));await batch.commit();}$('adminMessage').textContent='ล้างยอดเรียบร้อยแล้ว';}catch(err){$('adminMessage').textContent='ล้างไม่ได้: '+err.message;}};
}
