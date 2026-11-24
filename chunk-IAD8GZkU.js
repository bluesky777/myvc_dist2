import{n as s$1,t as r}from"./chunk-DarCEgGK.js";import{t as r$1}from"./chunk-DA7eT0LC.js";import{a as H,i as F,m as g}from"./chunk-BzUGygPV2.js";import{c as V,r as K$1,s as Q}from"./chunk-B8Z3WGZn2.js";var y=r=>r&&typeof r==`object`?r:{};var s=r=>typeof r==`string`?r.trim():typeof r==`number`?String(r):``;var t=(r,b,n)=>{let e=document.createElement(r);return b&&(e.className=b),n?.appendChild(e),e};var D=r=>({clase:s(r.clase),src:s(r.src),emoji:s(r.emoji),alt:s(r.alt)});var Y=r=>/^https?:/.test(r)?r:r$1.biblioteca+r;function K(r,b,n){if(r.src){let e=t(`img`,`${b} bib-ar-${r.clase||`imagen`}`,n);e.src=Y(r.src),e.alt=r.alt??``,e.decoding=`async`,e.draggable=!1}else if(r.emoji){let e=t(`span`,`${b} bib-ar-emoji`,n);e.textContent=r.emoji,e.setAttribute(`aria-hidden`,`true`)}}var _=(r$2,b,n)=>{K$1(`bib-ar`,Z);let e=(Array.isArray(b.zonas)?b.zonas:[]).map(o=>s$1(r({},D(y(o))),{id:s(y(o).id),rotulo:s(y(o).rotulo)})).filter(o=>o.id&&o.rotulo),x=(Array.isArray(b.fichas)?b.fichas:[]).map((o,d)=>{let f=y(o),v=s(f.rotulo);return s$1(r({},D(f)),{id:s(f.id)||`f`+d,rotulo:v,texto:s(f.texto)||v,zona:s(f.zona)})}).filter(o=>o.rotulo&&e.some(d=>d.id===o.zona));if(e.length<2||!x.length)return null;let m=s(b.consigna_en),O=s(b.consigna)||`Lleva cada uno a su lugar: arrástralo, o tócalo y después toca el lugar.`,L=n.reducido||!!matchMedia?.(`(prefers-reduced-motion: reduce)`).matches,g$1=t(`div`,`bib-ar`,r$2),k=t(`div`,`bib-ar-cab`,g$1);if(m){let o=g(k,`🔊`,()=>n.decir(m));o.classList.add(`bib-ar-oir`),o.setAttribute(`aria-label`,`Escuchar: ${m}`);let d=t(`p`,`bib-ar-en`,k);d.lang=`en`,d.textContent=m}t(`p`,`bib-ar-es`,k).textContent=O;let u=t(`div`,`bib-ar-juego`,g$1),h=F(g$1),z=H(g$1);z.hidden=!0,g(z,`Jugar otra vez`,()=>{C.destruir(),C=$(),z.hidden=!0,h.poner(``)},!0);function $(){u.replaceChildren();let o=t(`div`,`bib-ar-bandeja`,u),d=t(`div`,`bib-ar-zonas`,u),f=e.map(a=>{let i=t(`div`,`bib-ar-zona`,d);K(a,`bib-ar-zimg`,t(`div`,`bib-ar-fondo`,i));let l=t(`span`,`bib-ar-zrotulo`,i);return l.textContent=a.rotulo,l.setAttribute(`aria-hidden`,`true`),{id:a.id,nombre:a.rotulo,el:i}}),v=new Map(x.map(a=>[a.id,a])),A=a=>e.find(i=>i.id===a)?.rotulo??a,w=new Set,T=[],W=x.map(a=>r({id:a.id,texto:a.rotulo},a.emoji?{emoji:a.emoji}:{})),p=Q({raiz:u,bandeja:o,ctx:n,fichas:W,varias:!0,clase:`bib-ar-ficha`,alCambiar(a,i){let c=v.get(a);if(!c||i==null||w.has(a))return;let l=u.querySelector(`[data-ficha="${a}"] .bib-ar-cara`);if(i===c.zona){if(w.add(a),p.fijar(a),p.marcar(a,`bien`),H(l,`encaja`),n.decir(c.texto),w.size<x.length){h.poner(`${c.rotulo}: ${A(i)}. \xA1Muy bien!`);return}h.poner(n.ingles?`¡Lo lograste! Well done!`:`¡Lo lograste! Todos están en su lugar.`),T.push(setTimeout(()=>n.decir(n.ingles?`Well done!`:`¡Lo lograste!`),1400)),n.celebrar?.(d),z.hidden=!1;return}p.marcar(a,`mal`),H(l,`tiembla`),h.poner(`${c.rotulo} no va en ${A(i)}. Prueba en otro lugar.`),T.push(setTimeout(()=>{p.donde(a)===i&&!w.has(a)&&p.poner(a,null)},L?700:480))}});for(let a of x){let i=t(`span`,`bib-ar-cara`);K(a,`bib-ar-fimg`,t(`span`,`bib-ar-marco`,i));let l=t(`span`,`bib-ar-frotulo`,i);l.textContent=a.rotulo,l.setAttribute(`aria-hidden`,`true`),p.cara(a.id,i,a.rotulo)}p.usar(V(p,f));function H(a,i){if(!a||L||typeof a.animate!=`function`)return;let c=i===`encaja`?[{transform:`scale(1)`},{transform:`scale(1.18)`,offset:.4},{transform:`scale(.94)`,offset:.7},{transform:`scale(1)`}]:[{transform:`translateX(0)`},{transform:`translateX(-7px)`},{transform:`translateX(6px)`},{transform:`translateX(-4px)`},{transform:`translateX(3px)`},{transform:`translateX(0)`}];a.animate(c,{duration:i===`encaja`?420:380,delay:i===`encaja`?200:60,easing:`ease-out`})}return{destruir(){T.forEach(clearTimeout),p.destruir(),u.replaceChildren()}}}let C=$();return{destruir(){C.destruir(),g$1.remove()}}};var Z=`
.bib-ar { display: grid; gap: 12px; min-width: 0; }
.bib-ar-cab { display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 10px; }
.bib-ar-cab .bib-ar-es { grid-column: 1 / -1; }
.bib-ar-cab .bib-ar-oir { min-width: 44px; min-height: 44px; padding: 4px 10px; font-size: 20px; border-radius: 999px; }
.bib-ar-en { margin: 0; font-size: 22px; font-weight: 800; color: var(--bib-tinta, #15304d); }
.bib-ar-es { margin: 0; font-size: 15px; color: var(--bib-suave, #4d6378); }
.bib-ar-juego { display: grid; gap: 14px; min-width: 0; }
.bib-ar-bandeja { min-height: 112px; }
.bib-ar-zonas { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr)); gap: 12px; }
.bib-ar .bib-fx-hueco.bib-ar-zona { position: relative; display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-end; justify-content: center; min-height: 190px; padding: 44px 8px 10px; overflow: hidden; border: 3px solid transparent; border-radius: 20px; background: var(--bib-suelo, #fff4dc); box-shadow: 0 6px 16px -6px rgb(21 48 77 / 35%); transition: transform .15s, border-color .15s, box-shadow .15s; }
.bib-ar .bib-fx-hueco.bib-ar-zona.bib-fx-lleno { border-color: transparent; }
.bib-ar .bib-fx-con-elegida .bib-ar-zona { border-color: var(--bib-medio, #b9d3ff); }
.bib-ar .bib-fx-hueco.bib-ar-zona.bib-fx-encima, .bib-ar .bib-fx-hueco.bib-ar-zona:hover { border-color: var(--bib-acento, #2563eb); background: var(--bib-suelo, #fff4dc); transform: scale(1.015); }
.bib-ar .bib-ar-zona:focus-visible { outline: 3px solid var(--bib-acento, #2563eb); outline-offset: 3px; }
.bib-ar-fondo { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.bib-ar-zimg { width: 100%; height: 100%; object-fit: cover; display: block; }
.bib-ar-fondo .bib-ar-emoji { display: grid; place-items: center; height: 100%; font-size: 72px; opacity: .85; }
.bib-ar-fondo::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgb(255 255 255 / 0%) 45%, rgb(255 255 255 / 35%)); }
.bib-ar-zrotulo { position: absolute; z-index: 1; top: 8px; left: 8px; padding: 4px 12px; border-radius: 999px; background: rgb(255 255 255 / 92%); color: var(--bib-tinta, #15304d); font-size: 18px; font-weight: 800; box-shadow: 0 2px 6px rgb(21 48 77 / 25%); pointer-events: none; }
.bib-ar .bib-fx-ficha.bib-ar-ficha { z-index: 1; flex-direction: column; gap: 2px; width: 96px; padding: 6px 6px 5px; border: 0; border-radius: 18px; background: #fff; box-shadow: 0 4px 12px -2px rgb(21 48 77 / 30%); text-align: center; }
.bib-ar .bib-fx-ficha.bib-ar-ficha:hover { transform: translateY(-3px); }
.bib-ar .bib-fx-ficha.bib-ar-ficha.bib-fx-elegida { background: var(--bib-sol, #ffc23a); }
.bib-ar .bib-fx-ficha.bib-ar-ficha.bib-fx-volando { box-shadow: 0 16px 28px -8px rgb(21 48 77 / 50%); transform-origin: center; }
/* la que ya encaj\xF3 no se toca: el toque pasa a su zona (con otra elegida, tocar la vaca es tocar la finca) */
.bib-ar .bib-fx-ficha.bib-ar-ficha.bib-fx-fija { pointer-events: none; border: 0; cursor: default; box-shadow: 0 4px 12px -2px rgb(21 48 77 / 30%); }
.bib-ar .bib-fx-ficha.bib-ar-ficha.bib-fx-bien { background: #fff; box-shadow: 0 0 0 3px var(--bib-bien, #2f9e5d), 0 4px 12px -2px rgb(21 48 77 / 30%); }
.bib-ar .bib-fx-ficha.bib-ar-ficha.bib-fx-mal { background: #fff; box-shadow: 0 0 0 3px var(--bib-mal, #e2553a), 0 4px 12px -2px rgb(21 48 77 / 30%); }
.bib-ar-cara { display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; pointer-events: none; }
.bib-ar-marco { display: grid; place-items: center; width: 80px; height: 72px; overflow: hidden; border-radius: 14px; background: radial-gradient(circle at 50% 40%, #fffdf5, #f3ead2); }
.bib-ar-fimg { display: block; width: 100%; height: 100%; object-fit: cover; }
.bib-ar-fimg.bib-ar-modelo { object-fit: contain; transform: scale(1.45) translateY(4%); filter: drop-shadow(0 3px 3px rgb(21 48 77 / 30%)); }
.bib-ar-marco .bib-ar-emoji { font-size: 46px; line-height: 1; }
.bib-ar-frotulo { font-size: 16px; font-weight: 800; color: var(--bib-tinta, #15304d); line-height: 1.15; }
.bib-ar-zona .bib-fx-ficha.bib-ar-ficha { width: 78px; padding: 4px 4px 3px; }
.bib-ar-zona .bib-ar-marco { width: 64px; height: 56px; }
.bib-ar-zona .bib-ar-frotulo { font-size: 14px; }
.bib-ar .bib-esc-mandos[hidden] { display: none; }
@media (max-width: 520px) {
	.bib-ar-zonas { gap: 8px; }
	.bib-ar .bib-fx-hueco.bib-ar-zona { min-height: 160px; padding: 40px 3px 8px; gap: 4px; }
	.bib-ar .bib-fx-ficha.bib-ar-ficha { width: 84px; }
	.bib-ar-marco { width: 70px; height: 62px; }
	/* dos por fila en una zona de 140 px */
	.bib-ar-zona .bib-fx-ficha.bib-ar-ficha { width: 58px; padding: 3px 3px 2px; border-radius: 14px; }
	.bib-ar-zona .bib-ar-marco { width: 50px; height: 42px; border-radius: 10px; }
	.bib-ar-zona .bib-ar-frotulo { font-size: 12px; }
	.bib-ar-zrotulo { font-size: 16px; padding: 3px 10px; }
	.bib-ar-en { font-size: 20px; }
}
@media (prefers-reduced-motion: reduce) { .bib-ar .bib-ar-zona, .bib-ar .bib-fx-ficha.bib-ar-ficha { transition: none; } .bib-ar .bib-fx-ficha.bib-ar-ficha:hover, .bib-ar .bib-ar-zona:hover { transform: none; } }
`;export{_ as montar};