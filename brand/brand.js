const toggle = document.querySelector('.nv-menu');
const links = document.querySelector('#nv-links');
function closeMenu(){toggle?.setAttribute('aria-expanded','false');links?.classList.remove('is-open');}
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));links?.classList.toggle('is-open',open);});
links?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const open=toggle?.getAttribute('aria-expanded')==='true';closeMenu();if(open)toggle.focus();}});
// 計測用の名前だけを付ける。確認版からClarityへの送信は行わない。
document.querySelectorAll('a[href*="page.line.me"]').forEach(a=>{a.dataset.cta ||= 'page-body';});
