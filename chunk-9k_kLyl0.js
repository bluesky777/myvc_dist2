var By=`128`;var zy={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2};var Oy={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3};var Eu=0;var Gl=1;var Tu=2;var Uy=3;var Hy=0;var qh=1;var Au=2;var Xi=3;var Rr=0;var Qe=1;var Lo=2;var Xh=1;var Gy=2;var mn=0;var Ji=1;var kl=2;var Vl=3;var Wl=4;var Lu=5;var ui=100;var Ru=101;var Cu=102;var ql=103;var Xl=104;var Pu=200;var Iu=201;var Du=202;var Fu=203;var Yh=204;var Zh=205;var Nu=206;var Bu=207;var zu=208;var Ou=209;var Uu=210;var Hu=0;var Gu=1;var ku=2;var _a=3;var Vu=4;var Wu=5;var qu=6;var Xu=7;var Ro=0;var Yu=1;var Zu=2;var mi=0;var Ju=1;var ju=2;var $u=3;var Qu=4;var Ku=5;var wa=300;var Co=301;var Po=302;var ba=303;var Ma=304;var Cr=306;var Io=307;var ws=1e3;var yt=1001;var bs=1002;var rt=1003;var Sa=1004;var ky=1004;var Ea=1005;var Vy=1005;var st=1006;var Jh=1007;var Wy=1007;var Pr=1008;var qy=1008;var Ir=1009;var ed=1010;var td=1011;var Ms=1012;var nd=1013;var _s=1014;var fn=1015;var Ss=1016;var id=1017;var rd=1018;var sd=1019;var ji=1020;var od=1021;var zn=1022;var Tt=1023;var ad=1024;var ld=1025;var cd=Tt;var gi=1026;var tr=1027;var hd=1028;var ud=1029;var dd=1030;var fd=1031;var pd=1032;var md=1033;var Yl=33776;var Zl=33777;var Jl=33778;var jl=33779;var $l=35840;var Ql=35841;var Kl=35842;var ec=35843;var gd=36196;var tc=37492;var nc=37496;var xd=37808;var yd=37809;var vd=37810;var _d=37811;var wd=37812;var bd=37813;var Md=37814;var Sd=37815;var Ed=37816;var Td=37817;var Ad=37818;var Ld=37819;var Rd=37820;var Cd=37821;var Pd=36492;var Id=37840;var Dd=37841;var Fd=37842;var Nd=37843;var Bd=37844;var zd=37845;var Od=37846;var Ud=37847;var Hd=37848;var Gd=37849;var kd=37850;var Vd=37851;var Wd=37852;var qd=37853;var Xd=2200;var Yd=2201;var Zd=2202;var Es=2300;var Ts=2301;var zo=2302;var di=2400;var fi=2401;var As=2402;var El=2500;var jh=2501;var Jd=0;var Xy=1;var Yy=2;var vt=3e3;var Do=3001;var Tl=3007;var Al=3002;var jd=3003;var $h=3004;var Qh=3005;var Kh=3006;var $d=3200;var Qd=3201;var Di=0;var Kd=1;var Zy=0;var Oo=7680;var Jy=7681;var jy=7682;var $y=7683;var Qy=34055;var Ky=34056;var ev=5386;var tv=512;var nv=513;var iv=514;var rv=515;var sv=516;var ov=517;var av=518;var ef=519;var nr=35044;var ir=35048;var lv=35040;var cv=35045;var hv=35049;var uv=35041;var dv=35046;var fv=35050;var pv=35042;var mv=`100`;var ic=`300 es`;var en=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let i=this._listeners[e];if(i!==void 0){let r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,e);e.target=null}}};var ot=[];for(let s=0;s<256;s++)ot[s]=(s<16?`0`:``)+s.toString(16);var Dr=1234567;var On=Math.PI/180;var rr=180/Math.PI;function Mt(){let s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(ot[s&255]+ot[s>>8&255]+ot[s>>16&255]+ot[s>>24&255]+`-`+ot[e&255]+ot[e>>8&255]+`-`+ot[e>>16&15|64]+ot[e>>24&255]+`-`+ot[t&63|128]+ot[t>>8&255]+`-`+ot[t>>16&255]+ot[t>>24&255]+ot[n&255]+ot[n>>8&255]+ot[n>>16&255]+ot[n>>24&255]).toUpperCase()}function at(s,e,t){return Math.max(e,Math.min(t,s))}function Ll(s,e){return(s%e+e)%e}function tf(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function nf(s,e,t){return s!==e?(t-s)/(e-s):0}function $i(s,e,t){return(1-t)*s+t*e}function rf(s,e,t,n){return $i(s,e,1-Math.exp(-t*n))}function sf(s,e=1){return e-Math.abs(Ll(s,e*2)-e)}function of(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function af(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function lf(s,e){return s+Math.floor(Math.random()*(e-s+1))}function cf(s,e){return s+Math.random()*(e-s)}function hf(s){return s*(.5-Math.random())}function uf(s){return s!==void 0&&(Dr=s%2147483647),Dr=Dr*16807%2147483647,(Dr-1)/2147483646}function df(s){return s*On}function ff(s){return s*rr}function Ta(s){return(s&s-1)===0&&s!==0}function eu(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function tu(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function pf(s,e,t,n,i){let r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+n)/2),u=o((e+n)/2),h=r((e-n)/2),d=o((e-n)/2),f=r((n-e)/2),m=o((n-e)/2);switch(i){case`XYX`:s.set(a*u,c*h,c*d,a*l);break;case`YZY`:s.set(c*d,a*u,c*h,a*l);break;case`ZXZ`:s.set(c*h,c*d,a*u,a*l);break;case`XZX`:s.set(a*u,c*m,c*f,a*l);break;case`YXY`:s.set(c*f,a*u,c*m,a*l);break;case`ZYZ`:s.set(c*m,c*f,a*u,a*l);break;default:console.warn(`THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}var gv=Object.freeze({__proto__:null,DEG2RAD:On,RAD2DEG:rr,generateUUID:Mt,clamp:at,euclideanModulo:Ll,mapLinear:tf,inverseLerp:nf,lerp:$i,damp:rf,pingpong:sf,smoothstep:of,smootherstep:af,randInt:lf,randFloat:cf,randFloatSpread:hf,seededRandom:uf,degToRad:df,radToDeg:ff,isPowerOfTwo:Ta,ceilPowerOfTwo:eu,floorPowerOfTwo:tu,setQuaternionFromProperEuler:pf});var W=class{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e,t){return t!==void 0?(console.warn(`THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead.`),this.addVectors(e,t)):(this.x+=e.x,this.y+=e.y,this)}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e,t){return t!==void 0?(console.warn(`THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.`),this.subVectors(e,t)):(this.x-=e.x,this.y-=e.y,this)}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t,n){return n!==void 0&&console.warn(`THREE.Vector2: offset has been removed from .fromBufferAttribute().`),this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*i+e.x,this.y=r*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}};W.prototype.isVector2=!0;var je=class{constructor(){this.elements=[1,0,0,0,1,0,0,0,1],arguments.length>0&&console.error(`THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.`)}set(e,t,n,i,r,o,a,c,l){let u=this.elements;return u[0]=e,u[1]=i,u[2]=a,u[3]=t,u[4]=r,u[5]=c,u[6]=n,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],u=n[4],h=n[7],d=n[2],f=n[5],m=n[8],x=i[0],y=i[3],g=i[6],p=i[1],w=i[4],b=i[7],E=i[2],v=i[5],A=i[8];return r[0]=o*x+a*p+c*E,r[3]=o*y+a*w+c*v,r[6]=o*g+a*b+c*A,r[1]=l*x+u*p+h*E,r[4]=l*y+u*w+h*v,r[7]=l*g+u*b+h*A,r[2]=d*x+f*p+m*E,r[5]=d*y+f*w+m*v,r[8]=d*g+f*b+m*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*a*l-n*r*u+n*a*c+i*r*l-i*o*c}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=u*o-a*l,d=a*c-u*r,f=l*r-o*c,m=t*h+n*d+i*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/m;return e[0]=h*x,e[1]=(i*l-u*n)*x,e[2]=(a*n-i*o)*x,e[3]=d*x,e[4]=(u*t-i*c)*x,e[5]=(i*r-a*t)*x,e[6]=f*x,e[7]=(n*c-l*t)*x,e[8]=(o*t-n*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+e,-i*l,i*c,-i*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){let n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=t,n[4]*=t,n[7]*=t,this}rotate(e){let t=Math.cos(e),n=Math.sin(e),i=this.elements,r=i[0],o=i[3],a=i[6],c=i[1],l=i[4],u=i[7];return i[0]=t*r+n*c,i[3]=t*o+n*l,i[6]=t*a+n*u,i[1]=-n*r+t*c,i[4]=-n*o+t*l,i[7]=-n*a+t*u,this}translate(e,t){let n=this.elements;return n[0]+=e*n[2],n[3]+=e*n[5],n[6]+=e*n[8],n[1]+=t*n[2],n[4]+=t*n[5],n[7]+=t*n[8],this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};je.prototype.isMatrix3=!0;var Xn;var yn=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Xn===void 0&&(Xn=document.createElementNS(`http://www.w3.org/1999/xhtml`,`canvas`)),Xn.width=e.width,Xn.height=e.height;let n=Xn.getContext(`2d`);e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Xn}return t.width>2048||t.height>2048?(console.warn(`THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons`,e),t.toDataURL(`image/jpeg`,.6)):t.toDataURL(`image/png`)}};var mf=0;var St=(()=>{class s extends en{constructor(t=s.DEFAULT_IMAGE,n=s.DEFAULT_MAPPING,i=yt,r=yt,o=st,a=Pr,c=Tt,l=Ir,u=1,h=vt){super(),Object.defineProperty(this,"id",{value:mf++}),this.uuid=Mt(),this.name=``,this.image=t,this.mipmaps=[],this.mapping=n,this.wrapS=i,this.wrapT=r,this.magFilter=o,this.minFilter=a,this.anisotropy=u,this.format=c,this.internalFormat=null,this.type=l,this.offset=new W(0,0),this.repeat=new W(1,1),this.center=new W(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new je,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.encoding=h,this.version=0,this.onUpdate=null}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.image=t.image,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.encoding=t.encoding,this}toJSON(t){let n=t===void 0||typeof t==`string`;if(!n&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.5,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,mapping:this.mapping,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,type:this.type,encoding:this.encoding,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(this.image!==void 0){let r=this.image;if(r.uuid===void 0&&(r.uuid=Mt()),!n&&t.images[r.uuid]===void 0){let o;if(Array.isArray(r)){o=[];for(let a=0,c=r.length;a<c;a++)r[a].isDataTexture?o.push(Uo(r[a].image)):o.push(Uo(r[a]))}else o=Uo(r);t.images[r.uuid]={uuid:r.uuid,url:o}}i.image=r.uuid}return n||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(t){if(this.mapping!==300)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ws:t.x=t.x-Math.floor(t.x);break;case yt:t.x=t.x<0?0:1;break;case bs:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ws:t.y=t.y-Math.floor(t.y);break;case yt:t.y=t.y<0?0:1;break;case bs:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&this.version++}}return s.DEFAULT_IMAGE=void 0,s.DEFAULT_MAPPING=300,s})();St.prototype.isTexture=!0;function Uo(s){return typeof HTMLImageElement<`u`&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&s instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&s instanceof ImageBitmap?yn.getDataURL(s):s.data?{data:Array.prototype.slice.call(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn(`THREE.Texture: Unable to serialize Texture.`),{})}var De=class{constructor(e=0,t=0,n=0,i=1){this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e,t){return t!==void 0?(console.warn(`THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead.`),this.addVectors(e,t)):(this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this)}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e,t){return t!==void 0?(console.warn(`THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.`),this.subVectors(e,t)):(this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this)}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*r,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r,c=e.elements,l=c[0],u=c[4],h=c[8],d=c[1],f=c[5],m=c[9],x=c[2],y=c[6],g=c[10];if(Math.abs(u-d)<.01&&Math.abs(h-x)<.01&&Math.abs(m-y)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+x)<.1&&Math.abs(m+y)<.1&&Math.abs(l+f+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let w=(l+1)/2,b=(f+1)/2,E=(g+1)/2,v=(u+d)/4,A=(h+x)/4,L=(m+y)/4;return w>b&&w>E?w<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(w),i=v/n,r=A/n):b>E?b<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(b),n=v/i,r=L/i):E<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(E),n=A/r,i=L/r),this.set(n,i,r,t),this}let p=Math.sqrt((y-m)*(y-m)+(h-x)*(h-x)+(d-u)*(d-u));return Math.abs(p)<.001&&(p=1),this.x=(y-m)/p,this.y=(h-x)/p,this.z=(d-u)/p,this.w=Math.acos((l+f+g-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this.w=this.w<0?Math.ceil(this.w):Math.floor(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t,n){return n!==void 0&&console.warn(`THREE.Vector4: offset has been removed from .fromBufferAttribute().`),this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}};De.prototype.isVector4=!0;var Ht=class extends en{constructor(e,t,n){super(),this.width=e,this.height=t,this.depth=1,this.scissor=new De(0,0,e,t),this.scissorTest=!1,this.viewport=new De(0,0,e,t),n=n||{},this.texture=new St(void 0,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.encoding),this.texture.image={},this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=1,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:st,this.depthBuffer=n.depthBuffer!==void 0?n.depthBuffer:!0,this.stencilBuffer=n.stencilBuffer!==void 0?n.stencilBuffer:!1,this.depthTexture=n.depthTexture!==void 0?n.depthTexture:null}setTexture(e){e.image={width:this.width,height:this.height,depth:this.depth},this.texture=e}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.width=e.width,this.height=e.height,this.depth=e.depth,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.depthTexture=e.depthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}};Ht.prototype.isWebGLRenderTarget=!0;var Aa=class extends Ht{constructor(e,t,n){super(e,t,n),this.samples=4}copy(e){return super.copy.call(this,e),this.samples=e.samples,this}};Aa.prototype.isWebGLMultisampleRenderTarget=!0;var et=class{constructor(e=0,t=0,n=0,i=1){this._x=e,this._y=t,this._z=n,this._w=i}static slerp(e,t,n,i){return console.warn(`THREE.Quaternion: Static .slerp() has been deprecated. Use qm.slerpQuaternions( qa, qb, t ) instead.`),n.slerpQuaternions(e,t,i)}static slerpFlat(e,t,n,i,r,o,a){let c=n[i+0],l=n[i+1],u=n[i+2],h=n[i+3],d=r[o+0],f=r[o+1],m=r[o+2],x=r[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=m,e[t+3]=x;return}if(h!==x||c!==d||l!==f||u!==m){let y=1-a,g=c*d+l*f+u*m+h*x,p=g>=0?1:-1,w=1-g*g;if(w>Number.EPSILON){let E=Math.sqrt(w),v=Math.atan2(E,g*p);y=Math.sin(y*v)/E,a=Math.sin(a*v)/E}let b=a*p;if(c=c*y+d*b,l=l*y+f*b,u=u*y+m*b,h=h*y+x*b,y===1-a){let E=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=E,l*=E,u*=E,h*=E}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,i,r,o){let a=n[i],c=n[i+1],l=n[i+2],u=n[i+3],h=r[o],d=r[o+1],f=r[o+2],m=r[o+3];return e[t]=a*m+u*h+c*f-l*d,e[t+1]=c*m+u*d+l*h-a*f,e[t+2]=l*m+u*f+a*d-c*h,e[t+3]=u*m-a*h-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t){if(!(e&&e.isEuler))throw new Error(`THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.`);let n=e._x,i=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(n/2),u=a(i/2),h=a(r/2),d=c(n/2),f=c(i/2),m=c(r/2);switch(o){case`XYZ`:this._x=d*u*h+l*f*m,this._y=l*f*h-d*u*m,this._z=l*u*m+d*f*h,this._w=l*u*h-d*f*m;break;case`YXZ`:this._x=d*u*h+l*f*m,this._y=l*f*h-d*u*m,this._z=l*u*m-d*f*h,this._w=l*u*h+d*f*m;break;case`ZXY`:this._x=d*u*h-l*f*m,this._y=l*f*h+d*u*m,this._z=l*u*m+d*f*h,this._w=l*u*h-d*f*m;break;case`ZYX`:this._x=d*u*h-l*f*m,this._y=l*f*h+d*u*m,this._z=l*u*m-d*f*h,this._w=l*u*h+d*f*m;break;case`YZX`:this._x=d*u*h+l*f*m,this._y=l*f*h+d*u*m,this._z=l*u*m-d*f*h,this._w=l*u*h-d*f*m;break;case`XZY`:this._x=d*u*h-l*f*m,this._y=l*f*h-d*u*m,this._z=l*u*m+d*f*h,this._w=l*u*h+d*f*m;break;default:console.warn(`THREE.Quaternion: .setFromEuler() encountered an unknown order: `+o)}return t!==!1&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],u=t[6],h=t[10],d=n+a+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-c)*f,this._y=(r-l)*f,this._z=(o-i)*f}else if(n>a&&n>h){let f=2*Math.sqrt(1+n-a-h);this._w=(u-c)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+l)/f}else if(a>h){let f=2*Math.sqrt(1+a-n-h);this._w=(r-l)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(c+u)/f}else{let f=2*Math.sqrt(1+h-n-a);this._w=(o-i)/f,this._x=(r+l)/f,this._y=(c+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(at(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e,t){return t!==void 0?(console.warn(`THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.`),this.multiplyQuaternions(e,t)):this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=n*u+o*a+i*l-r*c,this._y=i*u+o*c+r*a-n*l,this._z=r*u+o*l+n*c-i*a,this._w=o*u-n*a-i*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,i=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+i*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=i,this._z=r,this;let c=1-a*a;if(c<=Number.EPSILON){let f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*r+t*this._z,this.normalize(),this._onChangeCallback(),this}let l=Math.sqrt(c),u=Math.atan2(l,a),h=Math.sin((1-t)*u)/l,d=Math.sin(t*u)/l;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=i*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){this.copy(e).slerp(t,n)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}};et.prototype.isQuaternion=!0;var _=class{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e,t){return t!==void 0?(console.warn(`THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.`),this.addVectors(e,t)):(this.x+=e.x,this.y+=e.y,this.z+=e.z,this)}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e,t){return t!==void 0?(console.warn(`THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.`),this.subVectors(e,t)):(this.x-=e.x,this.y-=e.y,this.z-=e.z,this)}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e,t){return t!==void 0?(console.warn(`THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.`),this.multiplyVectors(e,t)):(this.x*=e.x,this.y*=e.y,this.z*=e.z,this)}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return e&&e.isEuler||console.error(`THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.`),this.applyQuaternion(rc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(rc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=c*t+o*i-a*n,u=c*n+a*t-r*i,h=c*i+r*n-o*t,d=-r*t-o*n-a*i;return this.x=l*c+d*-r+u*-a-h*-o,this.y=u*c+d*-o+h*-r-l*-a,this.z=h*c+d*-a+l*-o-u*-r,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e,t){return t!==void 0?(console.warn(`THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.`),this.crossVectors(e,t)):this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=i*c-r*a,this.y=r*o-n*c,this.z=n*a-i*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ho.copy(this).projectOnVector(e),this.sub(Ho)}reflect(e){return this.sub(Ho.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(at(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t,n){return n!==void 0&&console.warn(`THREE.Vector3: offset has been removed from .fromBufferAttribute().`),this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}};_.prototype.isVector3=!0;var Ho=new _;var rc=new et;var pt=class{constructor(e=new _(Infinity,Infinity,Infinity),t=new _(-Infinity,-Infinity,-Infinity)){this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){let t=Infinity,n=Infinity,i=Infinity,r=-Infinity,o=-Infinity,a=-Infinity;for(let c=0,l=e.length;c<l;c+=3){let u=e[c],h=e[c+1],d=e[c+2];u<t&&(t=u),h<n&&(n=h),d<i&&(i=d),u>r&&(r=u),h>o&&(o=h),d>a&&(a=d)}return this.min.set(t,n,i),this.max.set(r,o,a),this}setFromBufferAttribute(e){let t=Infinity,n=Infinity,i=Infinity,r=-Infinity,o=-Infinity,a=-Infinity;for(let c=0,l=e.count;c<l;c++){let u=e.getX(c),h=e.getY(c),d=e.getZ(c);u<t&&(t=u),h<n&&(n=h),d<i&&(i=d),u>r&&(r=u),h>o&&(o=h),d>a&&(a=d)}return this.min.set(t,n,i),this.max.set(r,o,a),this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Ni.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e){return this.makeEmpty(),this.expandByObject(e)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=Infinity,this.max.x=this.max.y=this.max.z=-Infinity,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return e===void 0&&(console.warn(`THREE.Box3: .getCenter() target is now required`),e=new _),this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return e===void 0&&(console.warn(`THREE.Box3: .getSize() target is now required`),e=new _),this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e){e.updateWorldMatrix(!1,!1);let t=e.geometry;t!==void 0&&(t.boundingBox===null&&t.computeBoundingBox(),Go.copy(t.boundingBox),Go.applyMatrix4(e.matrixWorld),this.union(Go));let n=e.children;for(let i=0,r=n.length;i<r;i++)this.expandByObject(n[i]);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t===void 0&&(console.warn(`THREE.Box3: .getParameter() target is now required`),t=new _),t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Ni),Ni.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Bi),Fr.subVectors(this.max,Bi),Yn.subVectors(e.a,Bi),Zn.subVectors(e.b,Bi),Jn.subVectors(e.c,Bi),sn.subVectors(Zn,Yn),on.subVectors(Jn,Zn),Rn.subVectors(Yn,Jn);let t=[0,-sn.z,sn.y,0,-on.z,on.y,0,-Rn.z,Rn.y,sn.z,0,-sn.x,on.z,0,-on.x,Rn.z,0,-Rn.x,-sn.y,sn.x,0,-on.y,on.x,0,-Rn.y,Rn.x,0];return!ko(t,Yn,Zn,Jn,Fr)||(t=[1,0,0,0,1,0,0,0,1],!ko(t,Yn,Zn,Jn,Fr))?!1:(Nr.crossVectors(sn,on),t=[Nr.x,Nr.y,Nr.z],ko(t,Yn,Zn,Jn,Fr))}clampPoint(e,t){return t===void 0&&(console.warn(`THREE.Box3: .clampPoint() target is now required`),t=new _),t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return Ni.copy(e).clamp(this.min,this.max).sub(e).length()}getBoundingSphere(e){return e===void 0&&console.error(`THREE.Box3: .getBoundingSphere() target is now required`),this.getCenter(e.center),e.radius=this.getSize(Ni).length()*.5,e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Yt[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Yt[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Yt[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Yt[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Yt[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Yt[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Yt[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Yt[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Yt),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}};pt.prototype.isBox3=!0;var Yt=[new _,new _,new _,new _,new _,new _,new _,new _];var Ni=new _;var Go=new pt;var Yn=new _;var Zn=new _;var Jn=new _;var sn=new _;var on=new _;var Rn=new _;var Bi=new _;var Fr=new _;var Nr=new _;var Cn=new _;function ko(s,e,t,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){Cn.fromArray(s,r);let a=i.x*Math.abs(Cn.x)+i.y*Math.abs(Cn.y)+i.z*Math.abs(Cn.z),c=e.dot(Cn),l=t.dot(Cn),u=n.dot(Cn);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}var gf=new pt;var sc=new _;var Vo=new _;var Wo=new _;var tn=class{constructor(e=new _,t=-1){this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):gf.setFromPoints(e).getCenter(n);let i=0;for(let r=0,o=e.length;r<o;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t===void 0&&(console.warn(`THREE.Sphere: .clampPoint() target is now required`),t=new _),t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return e===void 0&&(console.warn(`THREE.Sphere: .getBoundingBox() target is now required`),e=new pt),this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){Wo.subVectors(e,this.center);let t=Wo.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.add(Wo.multiplyScalar(i/n)),this.radius+=i}return this}union(e){return Vo.subVectors(e.center,this.center).normalize().multiplyScalar(e.radius),this.expandByPoint(sc.copy(e.center).add(Vo)),this.expandByPoint(sc.copy(e.center).sub(Vo)),this}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}};var Zt=new _;var qo=new _;var Br=new _;var an=new _;var Xo=new _;var zr=new _;var Yo=new _;var nn=class{constructor(e=new _,t=new _(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t===void 0&&(console.warn(`THREE.Ray: .at() target is now required`),t=new _),t.copy(this.direction).multiplyScalar(e).add(this.origin)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Zt)),this}closestPointToPoint(e,t){t===void 0&&(console.warn(`THREE.Ray: .closestPointToPoint() target is now required`),t=new _),t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.direction).multiplyScalar(n).add(this.origin)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Zt.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Zt.copy(this.direction).multiplyScalar(t).add(this.origin),Zt.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){qo.copy(e).add(t).multiplyScalar(.5),Br.copy(t).sub(e).normalize(),an.copy(this.origin).sub(qo);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Br),a=an.dot(this.direction),c=-an.dot(Br),l=an.lengthSq(),u=Math.abs(1-o*o),h,d,f,m;if(u>0)if(h=o*c-a,d=o*a-c,m=r*u,h>=0)if(d>=-m)if(d<=m){let x=1/u;h*=x,d*=x,f=h*(h+o*d+2*a)+d*(o*h+d+2*c)+l}else d=r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;else d=-r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;else d<=-m?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-c),r),f=-h*h+d*(d+2*c)+l):d<=m?(h=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-c),r),f=-h*h+d*(d+2*c)+l);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;return n&&n.copy(this.direction).multiplyScalar(h).add(this.origin),i&&i.copy(Br).multiplyScalar(d).add(qo),f}intersectSphere(e,t){Zt.subVectors(e.center,this.origin);let n=Zt.dot(this.direction),i=Zt.dot(Zt)-n*n,r=e.radius*e.radius;if(i>r)return null;let o=Math.sqrt(r-i),a=n-o,c=n+o;return a<0&&c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,o,a,c,l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return l>=0?(n=(e.min.x-d.x)*l,i=(e.max.x-d.x)*l):(n=(e.max.x-d.x)*l,i=(e.min.x-d.x)*l),u>=0?(r=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),n>o||r>i||((r>n||n!==n)&&(n=r),(o<i||i!==i)&&(i=o),h>=0?(a=(e.min.z-d.z)*h,c=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,c=(e.min.z-d.z)*h),n>c||a>i)||((a>n||n!==n)&&(n=a),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Zt)!==null}intersectTriangle(e,t,n,i,r){Xo.subVectors(t,e),zr.subVectors(n,e),Yo.crossVectors(Xo,zr);let o=this.direction.dot(Yo),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;an.subVectors(this.origin,e);let c=a*this.direction.dot(zr.crossVectors(an,zr));if(c<0)return null;let l=a*this.direction.dot(Xo.cross(an));if(l<0||c+l>o)return null;let u=-a*an.dot(Yo);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}};var le=class s{constructor(){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],arguments.length>0&&console.error(`THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.`)}set(e,t,n,i,r,o,a,c,l,u,h,d,f,m,x,y){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=i,g[1]=r,g[5]=o,g[9]=a,g[13]=c,g[2]=l,g[6]=u,g[10]=h,g[14]=d,g[3]=f,g[7]=m,g[11]=x,g[15]=y,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new s().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,i=1/jn.setFromMatrixColumn(e,0).length(),r=1/jn.setFromMatrixColumn(e,1).length(),o=1/jn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){e&&e.isEuler||console.error(`THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.`);let t=this.elements,n=e.x,i=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(i),l=Math.sin(i),u=Math.cos(r),h=Math.sin(r);if(e.order===`XYZ`){let d=o*u,f=o*h,m=a*u,x=a*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=f+m*l,t[5]=d-x*l,t[9]=-a*c,t[2]=x-d*l,t[6]=m+f*l,t[10]=o*c}else if(e.order===`YXZ`){let d=c*u,f=c*h,m=l*u,x=l*h;t[0]=d+x*a,t[4]=m*a-f,t[8]=o*l,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-m,t[6]=x+d*a,t[10]=o*c}else if(e.order===`ZXY`){let d=c*u,f=c*h,m=l*u,x=l*h;t[0]=d-x*a,t[4]=-o*h,t[8]=m+f*a,t[1]=f+m*a,t[5]=o*u,t[9]=x-d*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order===`ZYX`){let d=o*u,f=o*h,m=a*u,x=a*h;t[0]=c*u,t[4]=m*l-f,t[8]=d*l+x,t[1]=c*h,t[5]=x*l+d,t[9]=f*l-m,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order===`YZX`){let d=o*c,f=o*l,m=a*c,x=a*l;t[0]=c*u,t[4]=x-d*h,t[8]=m*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-l*u,t[6]=f*h+m,t[10]=d-x*h}else if(e.order===`XZY`){let d=o*c,f=o*l,m=a*c,x=a*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=d*h+x,t[5]=o*u,t[9]=f*h-m,t[2]=m*h-f,t[6]=a*u,t[10]=x*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(xf,e,yf)}lookAt(e,t,n){let i=this.elements;return wt.subVectors(e,t),wt.lengthSq()===0&&(wt.z=1),wt.normalize(),ln.crossVectors(n,wt),ln.lengthSq()===0&&(Math.abs(n.z)===1?wt.x+=1e-4:wt.z+=1e-4,wt.normalize(),ln.crossVectors(n,wt)),ln.normalize(),Or.crossVectors(wt,ln),i[0]=ln.x,i[4]=Or.x,i[8]=wt.x,i[1]=ln.y,i[5]=Or.y,i[9]=wt.y,i[2]=ln.z,i[6]=Or.z,i[10]=wt.z,this}multiply(e,t){return t!==void 0?(console.warn(`THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead.`),this.multiplyMatrices(e,t)):this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],u=n[1],h=n[5],d=n[9],f=n[13],m=n[2],x=n[6],y=n[10],g=n[14],p=n[3],w=n[7],b=n[11],E=n[15],v=i[0],A=i[4],L=i[8],I=i[12],N=i[1],U=i[5],z=i[9],R=i[13],D=i[2],F=i[6],P=i[10],X=i[14],$=i[3],Z=i[7],ae=i[11],re=i[15];return r[0]=o*v+a*N+c*D+l*$,r[4]=o*A+a*U+c*F+l*Z,r[8]=o*L+a*z+c*P+l*ae,r[12]=o*I+a*R+c*X+l*re,r[1]=u*v+h*N+d*D+f*$,r[5]=u*A+h*U+d*F+f*Z,r[9]=u*L+h*z+d*P+f*ae,r[13]=u*I+h*R+d*X+f*re,r[2]=m*v+x*N+y*D+g*$,r[6]=m*A+x*U+y*F+g*Z,r[10]=m*L+x*z+y*P+g*ae,r[14]=m*I+x*R+y*X+g*re,r[3]=p*v+w*N+b*D+E*$,r[7]=p*A+w*U+b*F+E*Z,r[11]=p*L+w*z+b*P+E*ae,r[15]=p*I+w*R+b*X+E*re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],u=e[2],h=e[6],d=e[10],f=e[14],m=e[3],x=e[7],y=e[11],g=e[15];return m*(+r*c*h-i*l*h-r*a*d+n*l*d+i*a*f-n*c*f)+x*(+t*c*f-t*l*d+r*o*d-i*o*f+i*l*u-r*c*u)+y*(+t*l*h-t*a*f-r*o*h+n*o*f+r*a*u-n*l*u)+g*(-i*a*u-t*c*h+t*a*d+i*o*h-n*o*d+n*c*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=e[9],d=e[10],f=e[11],m=e[12],x=e[13],y=e[14],g=e[15],p=h*y*l-x*d*l+x*c*f-a*y*f-h*c*g+a*d*g,w=m*d*l-u*y*l-m*c*f+o*y*f+u*c*g-o*d*g,b=u*x*l-m*h*l+m*a*f-o*x*f-u*a*g+o*h*g,E=m*h*c-u*x*c-m*a*d+o*x*d+u*a*y-o*h*y,v=t*p+n*w+i*b+r*E;if(v===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/v;return e[0]=p*A,e[1]=(x*d*r-h*y*r-x*i*f+n*y*f+h*i*g-n*d*g)*A,e[2]=(a*y*r-x*c*r+x*i*l-n*y*l-a*i*g+n*c*g)*A,e[3]=(h*c*r-a*d*r-h*i*l+n*d*l+a*i*f-n*c*f)*A,e[4]=w*A,e[5]=(u*y*r-m*d*r+m*i*f-t*y*f-u*i*g+t*d*g)*A,e[6]=(m*c*r-o*y*r-m*i*l+t*y*l+o*i*g-t*c*g)*A,e[7]=(o*d*r-u*c*r+u*i*l-t*d*l-o*i*f+t*c*f)*A,e[8]=b*A,e[9]=(m*h*r-u*x*r-m*n*f+t*x*f+u*n*g-t*h*g)*A,e[10]=(o*x*r-m*a*r+m*n*l-t*x*l-o*n*g+t*a*g)*A,e[11]=(u*a*r-o*h*r-u*n*l+t*h*l+o*n*f-t*a*f)*A,e[12]=E*A,e[13]=(u*x*i-m*h*i+m*n*d-t*x*d-u*n*y+t*h*y)*A,e[14]=(m*a*i-o*x*i-m*n*c+t*x*c+o*n*y-t*a*y)*A,e[15]=(o*h*i-u*a*i+u*n*c-t*h*c-o*n*d+t*a*d)*A,this}scale(e){let t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),r=1-n,o=e.x,a=e.y,c=e.z,l=r*o,u=r*a;return this.set(l*o+n,l*a-i*c,l*c+i*a,0,l*a+i*c,u*a+n,u*c-i*o,0,l*c-i*a,u*c+i*o,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n){return this.set(1,t,n,0,e,1,n,0,e,t,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,u=o+o,h=a+a,d=r*l,f=r*u,m=r*h,x=o*u,y=o*h,g=a*h,p=c*l,w=c*u,b=c*h,E=n.x,v=n.y,A=n.z;return i[0]=(1-(x+g))*E,i[1]=(f+b)*E,i[2]=(m-w)*E,i[3]=0,i[4]=(f-b)*v,i[5]=(1-(d+g))*v,i[6]=(y+p)*v,i[7]=0,i[8]=(m+w)*A,i[9]=(y-p)*A,i[10]=(1-(d+x))*A,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements,r=jn.set(i[0],i[1],i[2]).length(),o=jn.set(i[4],i[5],i[6]).length(),a=jn.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],Ct.copy(this);let l=1/r,u=1/o,h=1/a;return Ct.elements[0]*=l,Ct.elements[1]*=l,Ct.elements[2]*=l,Ct.elements[4]*=u,Ct.elements[5]*=u,Ct.elements[6]*=u,Ct.elements[8]*=h,Ct.elements[9]*=h,Ct.elements[10]*=h,t.setFromRotationMatrix(Ct),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,i,r,o){o===void 0&&console.warn(`THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.`);let a=this.elements,c=2*r/(t-e),l=2*r/(n-i),u=(t+e)/(t-e),h=(n+i)/(n-i),d=-(o+r)/(o-r),f=-2*o*r/(o-r);return a[0]=c,a[4]=0,a[8]=u,a[12]=0,a[1]=0,a[5]=l,a[9]=h,a[13]=0,a[2]=0,a[6]=0,a[10]=d,a[14]=f,a[3]=0,a[7]=0,a[11]=-1,a[15]=0,this}makeOrthographic(e,t,n,i,r,o){let a=this.elements,c=1/(t-e),l=1/(n-i),u=1/(o-r),h=(t+e)*c,d=(n+i)*l,f=(o+r)*u;return a[0]=2*c,a[4]=0,a[8]=0,a[12]=-h,a[1]=0,a[5]=2*l,a[9]=0,a[13]=-d,a[2]=0,a[6]=0,a[10]=-2*u,a[14]=-f,a[3]=0,a[7]=0,a[11]=0,a[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};le.prototype.isMatrix4=!0;var jn=new _;var Ct=new le;var xf=new _(0,0,0);var yf=new _(1,1,1);var ln=new _;var Or=new _;var wt=new _;var oc=new le;var ac=new et;var yi=class s{constructor(e=0,t=0,n=0,i=s.DefaultOrder){this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._order=i||this._order,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t,n){let i=e.elements,r=i[0],o=i[4],a=i[8],c=i[1],l=i[5],u=i[9],h=i[2],d=i[6],f=i[10];switch(t=t||this._order,t){case`XYZ`:this._y=Math.asin(at(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,l),this._z=0);break;case`YXZ`:this._x=Math.asin(-at(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,r),this._z=0);break;case`ZXY`:this._x=Math.asin(at(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case`ZYX`:this._y=Math.asin(-at(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case`YZX`:this._z=Math.asin(at(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,f));break;case`XZY`:this._z=Math.asin(-at(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn(`THREE.Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n!==!1&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return oc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(oc,t,n)}setFromVector3(e,t){return this.set(e.x,e.y,e.z,t||this._order)}reorder(e){return ac.setFromEuler(this),this.setFromQuaternion(ac,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}toVector3(e){return e?e.set(this._x,this._y,this._z):new _(this._x,this._y,this._z)}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}};yi.prototype.isEuler=!0;yi.DefaultOrder=`XYZ`;yi.RotationOrders=[`XYZ`,`YZX`,`ZXY`,`XZY`,`YXZ`,`ZYX`];var Ls=class{constructor(){this.mask=1}set(e){this.mask=1<<e|0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}};var vf=0;var lc=new _;var $n=new et;var Jt=new le;var Ur=new _;var zi=new _;var _f=new _;var wf=new et;var cc=new _(1,0,0);var hc=new _(0,1,0);var uc=new _(0,0,1);var bf={type:`added`};var dc={type:`removed`};var Ae=class s extends en{constructor(){super(),Object.defineProperty(this,"id",{value:vf++}),this.uuid=Mt(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=s.DefaultUp.clone();let e=new _,t=new yi,n=new et,i=new _(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new le},normalMatrix:{value:new je}}),this.matrix=new le,this.matrixWorld=new le,this.matrixAutoUpdate=s.DefaultMatrixAutoUpdate,this.matrixWorldNeedsUpdate=!1,this.layers=new Ls,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return $n.setFromAxisAngle(e,t),this.quaternion.multiply($n),this}rotateOnWorldAxis(e,t){return $n.setFromAxisAngle(e,t),this.quaternion.premultiply($n),this}rotateX(e){return this.rotateOnAxis(cc,e)}rotateY(e){return this.rotateOnAxis(hc,e)}rotateZ(e){return this.rotateOnAxis(uc,e)}translateOnAxis(e,t){return lc.copy(e).applyQuaternion(this.quaternion),this.position.add(lc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(cc,e)}translateY(e){return this.translateOnAxis(hc,e)}translateZ(e){return this.translateOnAxis(uc,e)}localToWorld(e){return e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return e.applyMatrix4(Jt.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ur.copy(e):Ur.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),zi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Jt.lookAt(zi,Ur,this.up):Jt.lookAt(Ur,zi,this.up),this.quaternion.setFromRotationMatrix(Jt),i&&(Jt.extractRotation(i.matrixWorld),$n.setFromRotationMatrix(Jt),this.quaternion.premultiply($n.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error(`THREE.Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(bf)):console.error(`THREE.Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(dc)),this}clear(){for(let e=0;e<this.children.length;e++){let t=this.children[e];t.parent=null,t.dispatchEvent(dc)}return this.children.length=0,this}attach(e){return this.updateWorldMatrix(!0,!1),Jt.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Jt.multiply(e.parent.matrixWorld)),e.applyMatrix4(Jt),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getWorldPosition(e){return e===void 0&&(console.warn(`THREE.Object3D: .getWorldPosition() target is now required`),e=new _),this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return e===void 0&&(console.warn(`THREE.Object3D: .getWorldQuaternion() target is now required`),e=new et),this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zi,e,_f),e}getWorldScale(e){return e===void 0&&(console.warn(`THREE.Object3D: .getWorldScale() target is now required`),e=new _),this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zi,wf,e),e}getWorldDirection(e){e===void 0&&(console.warn(`THREE.Object3D: .getWorldDirection() target is now required`),e=new _),this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{}},n.metadata={version:4.5,type:`Object`,generator:`Object3D.toJSON`});let i={};i.uuid=this.uuid,i.type=this.type,this.name!==``&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),JSON.stringify(this.userData)!==`{}`&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type=`InstancedMesh`,i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let h=c[l];r(e.shapes,h)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));i.material=a}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];i.animations.push(r(e.animations,c))}}if(t){let a=o(e.geometries),c=o(e.materials),l=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f)}return n.object=i,n;function o(a){let c=[];for(let l in a){let u=a[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}};Ae.DefaultUp=new _(0,1,0);Ae.DefaultMatrixAutoUpdate=!0;Ae.prototype.isObject3D=!0;var Zo=new _;var Mf=new _;var Sf=new je;var Et=class{constructor(e=new _(1,0,0),t=0){this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=Zo.subVectors(n,t).cross(Mf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t===void 0&&(console.warn(`THREE.Plane: .projectPoint() target is now required`),t=new _),t.copy(this.normal).multiplyScalar(-this.distanceToPoint(e)).add(e)}intersectLine(e,t){t===void 0&&(console.warn(`THREE.Plane: .intersectLine() target is now required`),t=new _);let n=e.delta(Zo),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(n).multiplyScalar(r).add(e.start)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e===void 0&&(console.warn(`THREE.Plane: .coplanarPoint() target is now required`),e=new _),e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Sf.getNormalMatrix(e),i=this.coplanarPoint(Zo).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}};Et.prototype.isPlane=!0;var Pt=new _;var jt=new _;var Jo=new _;var $t=new _;var Qn=new _;var Kn=new _;var fc=new _;var jo=new _;var $o=new _;var Qo=new _;var ht=class s{constructor(e=new _,t=new _,n=new _){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i===void 0&&(console.warn(`THREE.Triangle: .getNormal() target is now required`),i=new _),i.subVectors(n,t),Pt.subVectors(e,t),i.cross(Pt);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){Pt.subVectors(i,t),jt.subVectors(n,t),Jo.subVectors(e,t);let o=Pt.dot(Pt),a=Pt.dot(jt),c=Pt.dot(Jo),l=jt.dot(jt),u=jt.dot(Jo),h=o*l-a*a;if(r===void 0&&(console.warn(`THREE.Triangle: .getBarycoord() target is now required`),r=new _),h===0)return r.set(-2,-1,-1);let d=1/h,f=(l*c-a*u)*d,m=(o*u-a*c)*d;return r.set(1-f-m,m,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,$t),$t.x>=0&&$t.y>=0&&$t.x+$t.y<=1}static getUV(e,t,n,i,r,o,a,c){return this.getBarycoord(e,t,n,i,$t),c.set(0,0),c.addScaledVector(r,$t.x),c.addScaledVector(o,$t.y),c.addScaledVector(a,$t.z),c}static isFrontFacing(e,t,n,i){return Pt.subVectors(n,t),jt.subVectors(e,t),Pt.cross(jt).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Pt.subVectors(this.c,this.b),jt.subVectors(this.a,this.b),Pt.cross(jt).length()*.5}getMidpoint(e){return e===void 0&&(console.warn(`THREE.Triangle: .getMidpoint() target is now required`),e=new _),e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return s.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e===void 0&&(console.warn(`THREE.Triangle: .getPlane() target is now required`),e=new Et),e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return s.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,i,r){return s.getUV(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return s.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return s.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){t===void 0&&(console.warn(`THREE.Triangle: .closestPointToPoint() target is now required`),t=new _);let n=this.a,i=this.b,r=this.c,o,a;Qn.subVectors(i,n),Kn.subVectors(r,n),jo.subVectors(e,n);let c=Qn.dot(jo),l=Kn.dot(jo);if(c<=0&&l<=0)return t.copy(n);$o.subVectors(e,i);let u=Qn.dot($o),h=Kn.dot($o);if(u>=0&&h<=u)return t.copy(i);let d=c*h-u*l;if(d<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(n).addScaledVector(Qn,o);Qo.subVectors(e,r);let f=Qn.dot(Qo),m=Kn.dot(Qo);if(m>=0&&f<=m)return t.copy(r);let x=f*l-c*m;if(x<=0&&l>=0&&m<=0)return a=l/(l-m),t.copy(n).addScaledVector(Kn,a);let y=u*m-f*h;if(y<=0&&h-u>=0&&f-m>=0)return fc.subVectors(r,i),a=(h-u)/(h-u+(f-m)),t.copy(i).addScaledVector(fc,a);let g=1/(y+x+d);return o=x*g,a=d*g,t.copy(n).addScaledVector(Qn,o).addScaledVector(Kn,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}};var Ef=0;function tt(){Object.defineProperty(this,"id",{value:Ef++}),this.uuid=Mt(),this.name=``,this.type=`Material`,this.fog=!0,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Oo,this.stencilZFail=Oo,this.stencilZPass=Oo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaTest=0,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0}tt.prototype=Object.assign(Object.create(en.prototype),{constructor:tt,isMaterial:!0,onBuild:function(){},onBeforeCompile:function(){},customProgramCacheKey:function(){return this.onBeforeCompile.toString()},setValues:function(s){if(s!==void 0)for(let e in s){let t=s[e];if(t===void 0){console.warn(`THREE.Material: '`+e+`' parameter is undefined.`);continue}if(e===`shading`){console.warn(`THREE.`+this.type+`: .shading has been removed. Use the boolean .flatShading instead.`),this.flatShading=t===1;continue}let n=this[e];if(n===void 0){console.warn(`THREE.`+this.type+`: '`+e+`' is not a property of this material.`);continue}n&&n.isColor?n.set(t):n&&n.isVector3&&t&&t.isVector3?n.copy(t):this[e]=t}},toJSON:function(s){let e=s===void 0||typeof s==`string`;e&&(s={textures:{},images:{}});let t={metadata:{version:4.5,type:`Material`,generator:`Material.toJSON`}};t.uuid=this.uuid,t.type=this.type,this.name!==``&&(t.name=this.name),this.color&&this.color.isColor&&(t.color=this.color.getHex()),this.roughness!==void 0&&(t.roughness=this.roughness),this.metalness!==void 0&&(t.metalness=this.metalness),this.sheen&&this.sheen.isColor&&(t.sheen=this.sheen.getHex()),this.emissive&&this.emissive.isColor&&(t.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(t.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(t.specular=this.specular.getHex()),this.shininess!==void 0&&(t.shininess=this.shininess),this.clearcoat!==void 0&&(t.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(t.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(t.clearcoatMap=this.clearcoatMap.toJSON(s).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(t.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(s).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(t.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(s).uuid,t.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.map&&this.map.isTexture&&(t.map=this.map.toJSON(s).uuid),this.matcap&&this.matcap.isTexture&&(t.matcap=this.matcap.toJSON(s).uuid),this.alphaMap&&this.alphaMap.isTexture&&(t.alphaMap=this.alphaMap.toJSON(s).uuid),this.lightMap&&this.lightMap.isTexture&&(t.lightMap=this.lightMap.toJSON(s).uuid,t.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(t.aoMap=this.aoMap.toJSON(s).uuid,t.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(t.bumpMap=this.bumpMap.toJSON(s).uuid,t.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(t.normalMap=this.normalMap.toJSON(s).uuid,t.normalMapType=this.normalMapType,t.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(t.displacementMap=this.displacementMap.toJSON(s).uuid,t.displacementScale=this.displacementScale,t.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(t.roughnessMap=this.roughnessMap.toJSON(s).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(t.metalnessMap=this.metalnessMap.toJSON(s).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(t.emissiveMap=this.emissiveMap.toJSON(s).uuid),this.specularMap&&this.specularMap.isTexture&&(t.specularMap=this.specularMap.toJSON(s).uuid),this.envMap&&this.envMap.isTexture&&(t.envMap=this.envMap.toJSON(s).uuid,this.combine!==void 0&&(t.combine=this.combine)),this.envMapIntensity!==void 0&&(t.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(t.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(t.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(t.gradientMap=this.gradientMap.toJSON(s).uuid),this.size!==void 0&&(t.size=this.size),this.shadowSide!==null&&(t.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(t.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(t.blending=this.blending),this.side!==0&&(t.side=this.side),this.vertexColors&&(t.vertexColors=!0),this.opacity<1&&(t.opacity=this.opacity),this.transparent===!0&&(t.transparent=this.transparent),t.depthFunc=this.depthFunc,t.depthTest=this.depthTest,t.depthWrite=this.depthWrite,t.colorWrite=this.colorWrite,t.stencilWrite=this.stencilWrite,t.stencilWriteMask=this.stencilWriteMask,t.stencilFunc=this.stencilFunc,t.stencilRef=this.stencilRef,t.stencilFuncMask=this.stencilFuncMask,t.stencilFail=this.stencilFail,t.stencilZFail=this.stencilZFail,t.stencilZPass=this.stencilZPass,this.rotation&&this.rotation!==0&&(t.rotation=this.rotation),this.polygonOffset===!0&&(t.polygonOffset=!0),this.polygonOffsetFactor!==0&&(t.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(t.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth&&this.linewidth!==1&&(t.linewidth=this.linewidth),this.dashSize!==void 0&&(t.dashSize=this.dashSize),this.gapSize!==void 0&&(t.gapSize=this.gapSize),this.scale!==void 0&&(t.scale=this.scale),this.dithering===!0&&(t.dithering=!0),this.alphaTest>0&&(t.alphaTest=this.alphaTest),this.alphaToCoverage===!0&&(t.alphaToCoverage=this.alphaToCoverage),this.premultipliedAlpha===!0&&(t.premultipliedAlpha=this.premultipliedAlpha),this.wireframe===!0&&(t.wireframe=this.wireframe),this.wireframeLinewidth>1&&(t.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(t.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(t.wireframeLinejoin=this.wireframeLinejoin),this.morphTargets===!0&&(t.morphTargets=!0),this.morphNormals===!0&&(t.morphNormals=!0),this.skinning===!0&&(t.skinning=!0),this.flatShading===!0&&(t.flatShading=this.flatShading),this.visible===!1&&(t.visible=!1),this.toneMapped===!1&&(t.toneMapped=!1),JSON.stringify(this.userData)!==`{}`&&(t.userData=this.userData);function n(i){let r=[];for(let o in i){let a=i[o];delete a.metadata,r.push(a)}return r}if(e){let i=n(s.textures),r=n(s.images);i.length>0&&(t.textures=i),r.length>0&&(t.images=r)}return t},clone:function(){return new this.constructor().copy(this)},copy:function(s){this.name=s.name,this.fog=s.fog,this.blending=s.blending,this.side=s.side,this.vertexColors=s.vertexColors,this.opacity=s.opacity,this.transparent=s.transparent,this.blendSrc=s.blendSrc,this.blendDst=s.blendDst,this.blendEquation=s.blendEquation,this.blendSrcAlpha=s.blendSrcAlpha,this.blendDstAlpha=s.blendDstAlpha,this.blendEquationAlpha=s.blendEquationAlpha,this.depthFunc=s.depthFunc,this.depthTest=s.depthTest,this.depthWrite=s.depthWrite,this.stencilWriteMask=s.stencilWriteMask,this.stencilFunc=s.stencilFunc,this.stencilRef=s.stencilRef,this.stencilFuncMask=s.stencilFuncMask,this.stencilFail=s.stencilFail,this.stencilZFail=s.stencilZFail,this.stencilZPass=s.stencilZPass,this.stencilWrite=s.stencilWrite;let e=s.clippingPlanes,t=null;if(e!==null){let n=e.length;t=new Array(n);for(let i=0;i!==n;++i)t[i]=e[i].clone()}return this.clippingPlanes=t,this.clipIntersection=s.clipIntersection,this.clipShadows=s.clipShadows,this.shadowSide=s.shadowSide,this.colorWrite=s.colorWrite,this.precision=s.precision,this.polygonOffset=s.polygonOffset,this.polygonOffsetFactor=s.polygonOffsetFactor,this.polygonOffsetUnits=s.polygonOffsetUnits,this.dithering=s.dithering,this.alphaTest=s.alphaTest,this.alphaToCoverage=s.alphaToCoverage,this.premultipliedAlpha=s.premultipliedAlpha,this.visible=s.visible,this.toneMapped=s.toneMapped,this.userData=JSON.parse(JSON.stringify(s.userData)),this},dispose:function(){this.dispatchEvent({type:`dispose`})}});Object.defineProperty(tt.prototype,"needsUpdate",{set:function(s){s===!0&&this.version++}});var pc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};var It={h:0,s:0,l:0};var Hr={h:0,s:0,l:0};function Ko(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}function ea(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function ta(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var se=(()=>{class s{constructor(t,n,i){return n===void 0&&i===void 0?this.set(t):this.setRGB(t,n,i)}set(t){return t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t),this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,this}setRGB(t,n,i){return this.r=t,this.g=n,this.b=i,this}setHSL(t,n,i){if(t=Ll(t,1),n=at(n,0,1),i=at(i,0,1),n===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+n):i+n-i*n,o=2*i-r;this.r=Ko(o,r,t+1/3),this.g=Ko(o,r,t),this.b=Ko(o,r,t-1/3)}return this}setStyle(t){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn(`THREE.Color: Alpha component of `+t+` will be ignored.`)}let i;if(i=/^((?:rgb|hsl)a?)\(([^\)]*)\)/.exec(t)){let r,o=i[1],a=i[2];switch(o){case`rgb`:case`rgba`:if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return this.r=Math.min(255,parseInt(r[1],10))/255,this.g=Math.min(255,parseInt(r[2],10))/255,this.b=Math.min(255,parseInt(r[3],10))/255,n(r[4]),this;if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return this.r=Math.min(100,parseInt(r[1],10))/100,this.g=Math.min(100,parseInt(r[2],10))/100,this.b=Math.min(100,parseInt(r[3],10))/100,n(r[4]),this;break;case`hsl`:case`hsla`:if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)){let c=parseFloat(r[1])/360,l=parseInt(r[2],10)/100,u=parseInt(r[3],10)/100;return n(r[4]),this.setHSL(c,l,u)}break}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=i[1],o=r.length;if(o===3)return this.r=parseInt(r.charAt(0)+r.charAt(0),16)/255,this.g=parseInt(r.charAt(1)+r.charAt(1),16)/255,this.b=parseInt(r.charAt(2)+r.charAt(2),16)/255,this;if(o===6)return this.r=parseInt(r.charAt(0)+r.charAt(1),16)/255,this.g=parseInt(r.charAt(2)+r.charAt(3),16)/255,this.b=parseInt(r.charAt(4)+r.charAt(5),16)/255,this}return t&&t.length>0?this.setColorName(t):this}setColorName(t){let n=pc[t.toLowerCase()];return n!==void 0?this.setHex(n):console.warn(`THREE.Color: Unknown color `+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copyGammaToLinear(t,n=2){return this.r=Math.pow(t.r,n),this.g=Math.pow(t.g,n),this.b=Math.pow(t.b,n),this}copyLinearToGamma(t,n=2){let i=n>0?1/n:1;return this.r=Math.pow(t.r,i),this.g=Math.pow(t.g,i),this.b=Math.pow(t.b,i),this}convertGammaToLinear(t){return this.copyGammaToLinear(this,t),this}convertLinearToGamma(t){return this.copyLinearToGamma(this,t),this}copySRGBToLinear(t){return this.r=ea(t.r),this.g=ea(t.g),this.b=ea(t.b),this}copyLinearToSRGB(t){return this.r=ta(t.r),this.g=ta(t.g),this.b=ta(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(){return this.r*255<<16^this.g*255<<8^this.b*255<<0}getHexString(){return(`000000`+this.getHex().toString(16)).slice(-6)}getHSL(t){t===void 0&&(console.warn(`THREE.Color: .getHSL() target is now required`),t={h:0,s:0,l:0});let n=this.r,i=this.g,r=this.b,o=Math.max(n,i,r),a=Math.min(n,i,r),c,l,u=(a+o)/2;if(a===o)c=0,l=0;else{let h=o-a;switch(l=u<=.5?h/(o+a):h/(2-o-a),o){case n:c=(i-r)/h+(i<r?6:0);break;case i:c=(r-n)/h+2;break;case r:c=(n-i)/h+4;break}c/=6}return t.h=c,t.s=l,t.l=u,t}getStyle(){return`rgb(`+(this.r*255|0)+`,`+(this.g*255|0)+`,`+(this.b*255|0)+`)`}offsetHSL(t,n,i){return this.getHSL(It),It.h+=t,It.s+=n,It.l+=i,this.setHSL(It.h,It.s,It.l),this}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,n){return this.r=t.r+n.r,this.g=t.g+n.g,this.b=t.b+n.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,n){return this.r+=(t.r-this.r)*n,this.g+=(t.g-this.g)*n,this.b+=(t.b-this.b)*n,this}lerpColors(t,n,i){return this.r=t.r+(n.r-t.r)*i,this.g=t.g+(n.g-t.g)*i,this.b=t.b+(n.b-t.b)*i,this}lerpHSL(t,n){this.getHSL(It),t.getHSL(Hr);let i=$i(It.h,Hr.h,n),r=$i(It.s,Hr.s,n),o=$i(It.l,Hr.l,n);return this.setHSL(i,r,o),this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,n=0){return this.r=t[n],this.g=t[n+1],this.b=t[n+2],this}toArray(t=[],n=0){return t[n]=this.r,t[n+1]=this.g,t[n+2]=this.b,t}fromBufferAttribute(t,n){return this.r=t.getX(n),this.g=t.getY(n),this.b=t.getZ(n),t.normalized===!0&&(this.r/=255,this.g/=255,this.b/=255),this}toJSON(){return this.getHex()}}return s.NAMES=pc,s})();se.prototype.isColor=!0;se.prototype.r=1;se.prototype.g=1;se.prototype.b=1;var Gt=class extends tt{constructor(e){super(),this.type=`MeshBasicMaterial`,this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.skinning=!1,this.morphTargets=!1,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.skinning=e.skinning,this.morphTargets=e.morphTargets,this}};Gt.prototype.isMeshBasicMaterial=!0;var Ue=new _;var Gr=new W;var Me=class{constructor(e,t,n){if(Array.isArray(e))throw new TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.name=``,this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n===!0,this.usage=nr,this.updateRange={offset:0,count:-1},this.version=0,this.onUploadCallback=function(){}}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}copyColorsArray(e){let t=this.array,n=0;for(let i=0,r=e.length;i<r;i++){let o=e[i];o===void 0&&(console.warn(`THREE.BufferAttribute.copyColorsArray(): color is undefined`,i),o=new se),t[n++]=o.r,t[n++]=o.g,t[n++]=o.b}return this}copyVector2sArray(e){let t=this.array,n=0;for(let i=0,r=e.length;i<r;i++){let o=e[i];o===void 0&&(console.warn(`THREE.BufferAttribute.copyVector2sArray(): vector is undefined`,i),o=new W),t[n++]=o.x,t[n++]=o.y}return this}copyVector3sArray(e){let t=this.array,n=0;for(let i=0,r=e.length;i<r;i++){let o=e[i];o===void 0&&(console.warn(`THREE.BufferAttribute.copyVector3sArray(): vector is undefined`,i),o=new _),t[n++]=o.x,t[n++]=o.y,t[n++]=o.z}return this}copyVector4sArray(e){let t=this.array,n=0;for(let i=0,r=e.length;i<r;i++){let o=e[i];o===void 0&&(console.warn(`THREE.BufferAttribute.copyVector4sArray(): vector is undefined`,i),o=new De),t[n++]=o.x,t[n++]=o.y,t[n++]=o.z,t[n++]=o.w}return this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Gr.fromBufferAttribute(this,t),Gr.applyMatrix3(e),this.setXY(t,Gr.x,Gr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ue.fromBufferAttribute(this,t),Ue.applyMatrix3(e),this.setXYZ(t,Ue.x,Ue.y,Ue.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ue.x=this.getX(t),Ue.y=this.getY(t),Ue.z=this.getZ(t),Ue.applyMatrix4(e),this.setXYZ(t,Ue.x,Ue.y,Ue.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ue.x=this.getX(t),Ue.y=this.getY(t),Ue.z=this.getZ(t),Ue.applyNormalMatrix(e),this.setXYZ(t,Ue.x,Ue.y,Ue.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ue.x=this.getX(t),Ue.y=this.getY(t),Ue.z=this.getZ(t),Ue.transformDirection(e),this.setXYZ(t,Ue.x,Ue.y,Ue.z);return this}set(e,t=0){return this.array.set(e,t),this}getX(e){return this.array[e*this.itemSize]}setX(e,t){return this.array[e*this.itemSize]=t,this}getY(e){return this.array[e*this.itemSize+1]}setY(e,t){return this.array[e*this.itemSize+1]=t,this}getZ(e){return this.array[e*this.itemSize+2]}setZ(e,t){return this.array[e*this.itemSize+2]=t,this}getW(e){return this.array[e*this.itemSize+3]}setW(e,t){return this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.prototype.slice.call(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),(this.updateRange.offset!==0||this.updateRange.count!==-1)&&(e.updateRange=this.updateRange),e}};Me.prototype.isBufferAttribute=!0;var La=class extends Me{constructor(e,t,n){super(new Int8Array(e),t,n)}};var Ra=class extends Me{constructor(e,t,n){super(new Uint8Array(e),t,n)}};var Ca=class extends Me{constructor(e,t,n){super(new Uint8ClampedArray(e),t,n)}};var Pa=class extends Me{constructor(e,t,n){super(new Int16Array(e),t,n)}};var sr=class extends Me{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ia=class extends Me{constructor(e,t,n){super(new Int32Array(e),t,n)}};var or=class extends Me{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Da=class extends Me{constructor(e,t,n){super(new Uint16Array(e),t,n)}};Da.prototype.isFloat16BufferAttribute=!0;var oe=class extends Me{constructor(e,t,n){super(new Float32Array(e),t,n)}};var Fa=class extends Me{constructor(e,t,n){super(new Float64Array(e),t,n)}};function nu(s){if(s.length===0)return-Infinity;let e=s[0];for(let t=1,n=s.length;t<n;++t)s[t]>e&&(e=s[t]);return e}var Tf={Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array};function Yi(s,e){return new Tf[s](e)}var Af=0;var Bt=new le;var na=new Ae;var ei=new _;var bt=new pt;var Oi=new pt;var it=new _;var ue=class s extends en{constructor(){super(),Object.defineProperty(this,"id",{value:Af++}),this.uuid=Mt(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:Infinity},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(nu(e)>65535?or:sr)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new je().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}rotateX(e){return Bt.makeRotationX(e),this.applyMatrix4(Bt),this}rotateY(e){return Bt.makeRotationY(e),this.applyMatrix4(Bt),this}rotateZ(e){return Bt.makeRotationZ(e),this.applyMatrix4(Bt),this}translate(e,t,n){return Bt.makeTranslation(e,t,n),this.applyMatrix4(Bt),this}scale(e,t,n){return Bt.makeScale(e,t,n),this.applyMatrix4(Bt),this}lookAt(e){return na.lookAt(e),na.updateMatrix(),this.applyMatrix4(na.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ei).negate(),this.translate(ei.x,ei.y,ei.z),this}setFromPoints(e){let t=[];for(let n=0,i=e.length;n<i;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}return this.setAttribute(`position`,new oe(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new pt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".`,this),this.boundingBox.set(new _(-Infinity,-Infinity,-Infinity),new _(Infinity,Infinity,Infinity));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let r=t[n];bt.setFromBufferAttribute(r),this.morphTargetsRelative?(it.addVectors(this.boundingBox.min,bt.min),this.boundingBox.expandByPoint(it),it.addVectors(this.boundingBox.max,bt.max),this.boundingBox.expandByPoint(it)):(this.boundingBox.expandByPoint(bt.min),this.boundingBox.expandByPoint(bt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error(`THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new tn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".`,this),this.boundingSphere.set(new _,Infinity);return}if(e){let n=this.boundingSphere.center;if(bt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Oi.setFromBufferAttribute(a),this.morphTargetsRelative?(it.addVectors(bt.min,Oi.min),bt.expandByPoint(it),it.addVectors(bt.max,Oi.max),bt.expandByPoint(it)):(bt.expandByPoint(Oi.min),bt.expandByPoint(Oi.max))}bt.getCenter(n);let i=0;for(let r=0,o=e.count;r<o;r++)it.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(it));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)it.fromBufferAttribute(a,l),c&&(ei.fromBufferAttribute(e,l),it.add(ei)),i=Math.max(i,n.distanceToSquared(it))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error(`THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeFaceNormals(){}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error(`THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=e.array,i=t.position.array,r=t.normal.array,o=t.uv.array,a=i.length/3;t.tangent===void 0&&this.setAttribute(`tangent`,new Me(new Float32Array(4*a),4));let c=t.tangent.array,l=[],u=[];for(let N=0;N<a;N++)l[N]=new _,u[N]=new _;let h=new _,d=new _,f=new _,m=new W,x=new W,y=new W,g=new _,p=new _;function w(N,U,z){h.fromArray(i,N*3),d.fromArray(i,U*3),f.fromArray(i,z*3),m.fromArray(o,N*2),x.fromArray(o,U*2),y.fromArray(o,z*2),d.sub(h),f.sub(h),x.sub(m),y.sub(m);let R=1/(x.x*y.y-y.x*x.y);isFinite(R)&&(g.copy(d).multiplyScalar(y.y).addScaledVector(f,-x.y).multiplyScalar(R),p.copy(f).multiplyScalar(x.x).addScaledVector(d,-y.x).multiplyScalar(R),l[N].add(g),l[U].add(g),l[z].add(g),u[N].add(p),u[U].add(p),u[z].add(p))}let b=this.groups;b.length===0&&(b=[{start:0,count:n.length}]);for(let N=0,U=b.length;N<U;++N){let z=b[N],R=z.start,D=z.count;for(let F=R,P=R+D;F<P;F+=3)w(n[F+0],n[F+1],n[F+2])}let E=new _,v=new _,A=new _,L=new _;function I(N){A.fromArray(r,N*3),L.copy(A);let U=l[N];E.copy(U),E.sub(A.multiplyScalar(A.dot(U))).normalize(),v.crossVectors(L,U);let R=v.dot(u[N])<0?-1:1;c[N*4]=E.x,c[N*4+1]=E.y,c[N*4+2]=E.z,c[N*4+3]=R}for(let N=0,U=b.length;N<U;++N){let z=b[N],R=z.start,D=z.count;for(let F=R,P=R+D;F<P;F+=3)I(n[F+0]),I(n[F+1]),I(n[F+2])}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new Me(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let i=new _,r=new _,o=new _,a=new _,c=new _,l=new _,u=new _,h=new _;if(e)for(let d=0,f=e.count;d<f;d+=3){let m=e.getX(d+0),x=e.getX(d+1),y=e.getX(d+2);i.fromBufferAttribute(t,m),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,y),u.subVectors(o,r),h.subVectors(i,r),u.cross(h),a.fromBufferAttribute(n,m),c.fromBufferAttribute(n,x),l.fromBufferAttribute(n,y),a.add(u),c.add(u),l.add(u),n.setXYZ(m,a.x,a.y,a.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(y,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,r),h.subVectors(i,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}merge(e,t){if(!(e&&e.isBufferGeometry)){console.error(`THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.`,e);return}t===void 0&&(t=0,console.warn(`THREE.BufferGeometry.merge(): Overwriting original geometry, starting at offset=0. Use BufferGeometryUtils.mergeBufferGeometries() for lossless merge.`));let n=this.attributes;for(let i in n){if(e.attributes[i]===void 0)continue;let o=n[i].array,a=e.attributes[i],c=a.array,l=a.itemSize*t,u=Math.min(c.length,o.length-l);for(let h=0,d=l;h<u;h++,d++)o[d]=c[h]}return this}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)it.fromBufferAttribute(e,t),it.normalize(),e.setXYZ(t,it.x,it.y,it.z)}toNonIndexed(){function e(a,c){let l=a.array,u=a.itemSize,h=a.normalized,d=new l.constructor(c.length*u),f=0,m=0;for(let x=0,y=c.length;x<y;x++){f=c[x]*u;for(let g=0;g<u;g++)d[m++]=l[f++]}return new Me(d,u,h)}if(this.index===null)return console.warn(`THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let t=new s,n=this.index.array,i=this.attributes;for(let a in i){let c=i[a],l=e(c,n);t.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let u=0,h=l.length;u<h;u++){let d=l[u],f=e(d,n);c.push(f)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.5,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let l=n[c];e.data.attributes[c]=l.toJSON(e.data)}let i={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let h=0,d=l.length;h<d;h++){let f=l[h];u.push(f.toJSON(e.data))}u.length>0&&(i[c]=u,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new s().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let i=e.attributes;for(let l in i){let u=i[l];this.setAttribute(l,u.clone(t))}let r=e.morphAttributes;for(let l in r){let u=[],h=r[l];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let l=0,u=o.length;l<u;l++){let h=o[l];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}};ue.prototype.isBufferGeometry=!0;var mc=new le;var ti=new nn;var ia=new tn;var cn=new _;var hn=new _;var un=new _;var ra=new _;var sa=new _;var oa=new _;var kr=new _;var Vr=new _;var Wr=new _;var qr=new W;var Xr=new W;var Yr=new W;var aa=new _;var Zr=new _;var Ye=class extends Ae{constructor(e=new ue,t=new Gt){super(),this.type=`Mesh`,this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e){return super.copy(e),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry;if(e.isBufferGeometry){let t=e.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}else{let t=e.morphTargets;t!==void 0&&t.length>0&&console.error(`THREE.Mesh.updateMorphTargets() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.`)}}raycast(e,t){let n=this.geometry,i=this.material,r=this.matrixWorld;if(i===void 0||(n.boundingSphere===null&&n.computeBoundingSphere(),ia.copy(n.boundingSphere),ia.applyMatrix4(r),e.ray.intersectsSphere(ia)===!1)||(mc.copy(r).invert(),ti.copy(e.ray).applyMatrix4(mc),n.boundingBox!==null&&ti.intersectsBox(n.boundingBox)===!1))return;let o;if(n.isBufferGeometry){let a=n.index,c=n.attributes.position,l=n.morphAttributes.position,u=n.morphTargetsRelative,h=n.attributes.uv,d=n.attributes.uv2,f=n.groups,m=n.drawRange;if(a!==null)if(Array.isArray(i))for(let x=0,y=f.length;x<y;x++){let g=f[x],p=i[g.materialIndex],w=Math.max(g.start,m.start),b=Math.min(g.start+g.count,m.start+m.count);for(let E=w,v=b;E<v;E+=3){let A=a.getX(E),L=a.getX(E+1),I=a.getX(E+2);o=Jr(this,p,e,ti,c,l,u,h,d,A,L,I),o&&(o.faceIndex=Math.floor(E/3),o.face.materialIndex=g.materialIndex,t.push(o))}}else{let x=Math.max(0,m.start),y=Math.min(a.count,m.start+m.count);for(let g=x,p=y;g<p;g+=3){let w=a.getX(g),b=a.getX(g+1),E=a.getX(g+2);o=Jr(this,i,e,ti,c,l,u,h,d,w,b,E),o&&(o.faceIndex=Math.floor(g/3),t.push(o))}}else if(c!==void 0)if(Array.isArray(i))for(let x=0,y=f.length;x<y;x++){let g=f[x],p=i[g.materialIndex],w=Math.max(g.start,m.start),b=Math.min(g.start+g.count,m.start+m.count);for(let E=w,v=b;E<v;E+=3){let A=E,L=E+1,I=E+2;o=Jr(this,p,e,ti,c,l,u,h,d,A,L,I),o&&(o.faceIndex=Math.floor(E/3),o.face.materialIndex=g.materialIndex,t.push(o))}}else{let x=Math.max(0,m.start),y=Math.min(c.count,m.start+m.count);for(let g=x,p=y;g<p;g+=3){let w=g,b=g+1,E=g+2;o=Jr(this,i,e,ti,c,l,u,h,d,w,b,E),o&&(o.faceIndex=Math.floor(g/3),t.push(o))}}}else n.isGeometry&&console.error(`THREE.Mesh.raycast() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.`)}};Ye.prototype.isMesh=!0;function Lf(s,e,t,n,i,r,o,a){let c;if(e.side===1?c=n.intersectTriangle(o,r,i,!0,a):c=n.intersectTriangle(i,r,o,e.side!==2,a),c===null)return null;Zr.copy(a),Zr.applyMatrix4(s.matrixWorld);let l=t.ray.origin.distanceTo(Zr);return l<t.near||l>t.far?null:{distance:l,point:Zr.clone(),object:s}}function Jr(s,e,t,n,i,r,o,a,c,l,u,h){cn.fromBufferAttribute(i,l),hn.fromBufferAttribute(i,u),un.fromBufferAttribute(i,h);let d=s.morphTargetInfluences;if(e.morphTargets&&r&&d){kr.set(0,0,0),Vr.set(0,0,0),Wr.set(0,0,0);for(let m=0,x=r.length;m<x;m++){let y=d[m],g=r[m];y!==0&&(ra.fromBufferAttribute(g,l),sa.fromBufferAttribute(g,u),oa.fromBufferAttribute(g,h),o?(kr.addScaledVector(ra,y),Vr.addScaledVector(sa,y),Wr.addScaledVector(oa,y)):(kr.addScaledVector(ra.sub(cn),y),Vr.addScaledVector(sa.sub(hn),y),Wr.addScaledVector(oa.sub(un),y)))}cn.add(kr),hn.add(Vr),un.add(Wr)}s.isSkinnedMesh&&e.skinning&&(s.boneTransform(l,cn),s.boneTransform(u,hn),s.boneTransform(h,un));let f=Lf(s,e,t,n,cn,hn,un,aa);if(f){a&&(qr.fromBufferAttribute(a,l),Xr.fromBufferAttribute(a,u),Yr.fromBufferAttribute(a,h),f.uv=ht.getUV(aa,cn,hn,un,qr,Xr,Yr,new W)),c&&(qr.fromBufferAttribute(c,l),Xr.fromBufferAttribute(c,u),Yr.fromBufferAttribute(c,h),f.uv2=ht.getUV(aa,cn,hn,un,qr,Xr,Yr,new W));let m={a:l,b:u,c:h,normal:new _,materialIndex:0};ht.getNormal(cn,hn,un,m.normal),f.face=m}return f}var Un=class extends ue{constructor(e=1,t=1,n=1,i=1,r=1,o=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};let a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],u=[],h=[],d=0,f=0;m(`z`,`y`,`x`,-1,-1,n,t,e,o,r,0),m(`z`,`y`,`x`,1,-1,n,t,-e,o,r,1),m(`x`,`z`,`y`,1,1,e,n,t,i,o,2),m(`x`,`z`,`y`,1,-1,e,n,-t,i,o,3),m(`x`,`y`,`z`,1,-1,e,t,n,i,r,4),m(`x`,`y`,`z`,-1,-1,e,t,-n,i,r,5),this.setIndex(c),this.setAttribute(`position`,new oe(l,3)),this.setAttribute(`normal`,new oe(u,3)),this.setAttribute(`uv`,new oe(h,2));function m(x,y,g,p,w,b,E,v,A,L,I){let N=b/A,U=E/L,z=b/2,R=E/2,D=v/2,F=A+1,P=L+1,X=0,$=0,Z=new _;for(let ae=0;ae<P;ae++){let re=ae*U-R;for(let fe=0;fe<F;fe++)Z[x]=(fe*N-z)*p,Z[y]=re*w,Z[g]=D,l.push(Z.x,Z.y,Z.z),Z[x]=0,Z[y]=0,Z[g]=v>0?1:-1,u.push(Z.x,Z.y,Z.z),h.push(fe/A),h.push(1-ae/L),X+=1}for(let ae=0;ae<L;ae++)for(let re=0;re<A;re++){let fe=d+re+F*ae,ve=d+re+F*(ae+1),G=d+(re+1)+F*(ae+1),Be=d+(re+1)+F*ae;c.push(fe,ve,Be),c.push(ve,G,Be),$+=6}a.addGroup(f,$,I),f+=$,d+=X}}};function vi(s){let e={};for(let t in s){e[t]={};for(let n in s[t]){let i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function ct(s){let e={};for(let t=0;t<s.length;t++){let n=vi(s[t]);for(let i in n)e[i]=n[i]}return e}var Rf={clone:vi,merge:ct};var Cf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;var Pf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;var kt=class extends tt{constructor(e){super(),this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.vertexShader=Cf,this.fragmentShader=Pf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.skinning=!1,this.morphTargets=!1,this.morphNormals=!1,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv2:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&(e.attributes!==void 0&&console.error(`THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead.`),this.setValues(e))}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=vi(e.uniforms),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.lights=e.lights,this.clipping=e.clipping,this.skinning=e.skinning,this.morphTargets=e.morphTargets,this.morphNormals=e.morphNormals,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:`t`,value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:`c`,value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:`v2`,value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:`v3`,value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:`v4`,value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:`m3`,value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:`m4`,value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}};kt.prototype.isShaderMaterial=!0;var _i=class extends Ae{constructor(){super(),this.type=`Camera`,this.matrixWorldInverse=new le,this.projectionMatrix=new le,this.projectionMatrixInverse=new le}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this}getWorldDirection(e){e===void 0&&(console.warn(`THREE.Camera: .getWorldDirection() target is now required`),e=new _),this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(-t[8],-t[9],-t[10]).normalize()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}};_i.prototype.isCamera=!0;var Ke=class extends _i{constructor(e=50,t=1,n=.1,i=2e3){super(),this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=rr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(On*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return rr*2*Math.atan(Math.tan(On*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,i,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(On*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*i/c,t-=o.offsetY*n/l,i*=o.width/c,n*=o.height/l}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};Ke.prototype.isPerspectiveCamera=!0;var ni=90;var ii=1;var ar=class extends Ae{constructor(e,t,n){if(super(),this.type=`CubeCamera`,n.isWebGLCubeRenderTarget!==!0){console.error(`THREE.CubeCamera: The constructor now expects an instance of WebGLCubeRenderTarget as third parameter.`);return}this.renderTarget=n;let i=new Ke(ni,ii,e,t);i.layers=this.layers,i.up.set(0,-1,0),i.lookAt(new _(1,0,0)),this.add(i);let r=new Ke(ni,ii,e,t);r.layers=this.layers,r.up.set(0,-1,0),r.lookAt(new _(-1,0,0)),this.add(r);let o=new Ke(ni,ii,e,t);o.layers=this.layers,o.up.set(0,0,1),o.lookAt(new _(0,1,0)),this.add(o);let a=new Ke(ni,ii,e,t);a.layers=this.layers,a.up.set(0,0,-1),a.lookAt(new _(0,-1,0)),this.add(a);let c=new Ke(ni,ii,e,t);c.layers=this.layers,c.up.set(0,-1,0),c.lookAt(new _(0,0,1)),this.add(c);let l=new Ke(ni,ii,e,t);l.layers=this.layers,l.up.set(0,-1,0),l.lookAt(new _(0,0,-1)),this.add(l)}update(e,t){this.parent===null&&this.updateMatrixWorld();let n=this.renderTarget,[i,r,o,a,c,l]=this.children,u=e.xr.enabled,h=e.getRenderTarget();e.xr.enabled=!1;let d=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0),e.render(t,i),e.setRenderTarget(n,1),e.render(t,r),e.setRenderTarget(n,2),e.render(t,o),e.setRenderTarget(n,3),e.render(t,a),e.setRenderTarget(n,4),e.render(t,c),n.texture.generateMipmaps=d,e.setRenderTarget(n,5),e.render(t,l),e.setRenderTarget(h),e.xr.enabled=u}};var Hn=class extends St{constructor(e,t,n,i,r,o,a,c,l,u){e=e!==void 0?e:[],t=t!==void 0?t:301,a=a!==void 0?a:zn,super(e,t,n,i,r,o,a,c,l,u),this._needsFlipEnvMap=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};Hn.prototype.isCubeTexture=!0;var lr=class extends Ht{constructor(e,t,n){Number.isInteger(t)&&(console.warn(`THREE.WebGLCubeRenderTarget: constructor signature is now WebGLCubeRenderTarget( size, options )`),t=n),super(e,e,t),t=t||{},this.texture=new Hn(void 0,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.encoding),this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:st,this.texture._needsFlipEnvMap=!1}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.format=Tt,this.texture.encoding=t.encoding,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Un(5,5,5),r=new kt({name:`CubemapFromEquirect`,uniforms:vi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});r.uniforms.tEquirect.value=t;let o=new Ye(i,r),a=t.minFilter;return t.minFilter===1008&&(t.minFilter=1006),new ar(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,i){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(r)}};lr.prototype.isWebGLCubeRenderTarget=!0;var Gn=class extends St{constructor(e,t,n,i,r,o,a,c,l,u,h,d){super(null,o,a,c,l,u,i,r,h,d),this.image={data:e||null,width:t||1,height:n||1},this.magFilter=l!==void 0?l:rt,this.minFilter=u!==void 0?u:rt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.needsUpdate=!0}};Gn.prototype.isDataTexture=!0;var ri=new tn;var jr=new _;var wi=class{constructor(e=new Et,t=new Et,n=new Et,i=new Et,r=new Et,o=new Et){this.planes=[e,t,n,i,r,o]}set(e,t,n,i,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e){let t=this.planes,n=e.elements,i=n[0],r=n[1],o=n[2],a=n[3],c=n[4],l=n[5],u=n[6],h=n[7],d=n[8],f=n[9],m=n[10],x=n[11],y=n[12],g=n[13],p=n[14],w=n[15];return t[0].setComponents(a-i,h-c,x-d,w-y).normalize(),t[1].setComponents(a+i,h+c,x+d,w+y).normalize(),t[2].setComponents(a+r,h+l,x+f,w+g).normalize(),t[3].setComponents(a-r,h-l,x-f,w-g).normalize(),t[4].setComponents(a-o,h-u,x-m,w-p).normalize(),t[5].setComponents(a+o,h+u,x+m,w+p).normalize(),this}intersectsObject(e){let t=e.geometry;return t.boundingSphere===null&&t.computeBoundingSphere(),ri.copy(t.boundingSphere).applyMatrix4(e.matrixWorld),this.intersectsSphere(ri)}intersectsSprite(e){return ri.center.set(0,0,0),ri.radius=.7071067811865476,ri.applyMatrix4(e.matrixWorld),this.intersectsSphere(ri)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(jr.x=i.normal.x>0?e.max.x:e.min.x,jr.y=i.normal.y>0?e.max.y:e.min.y,jr.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(jr)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function iu(){let s=null,e=!1,t=null,n=null;function i(r,o){t(r,o),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function If(s,e){let t=e.isWebGL2,n=new WeakMap;function i(l,u){let h=l.array,d=l.usage,f=s.createBuffer();s.bindBuffer(u,f),s.bufferData(u,h,d),l.onUploadCallback();let m=5126;return h instanceof Float32Array?m=5126:h instanceof Float64Array?console.warn(`THREE.WebGLAttributes: Unsupported data buffer format: Float64Array.`):h instanceof Uint16Array?l.isFloat16BufferAttribute?t?m=5131:console.warn(`THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.`):m=5123:h instanceof Int16Array?m=5122:h instanceof Uint32Array?m=5125:h instanceof Int32Array?m=5124:h instanceof Int8Array?m=5120:h instanceof Uint8Array&&(m=5121),{buffer:f,type:m,bytesPerElement:h.BYTES_PER_ELEMENT,version:l.version}}function r(l,u,h){let d=u.array,f=u.updateRange;s.bindBuffer(h,l),f.count===-1?s.bufferSubData(h,0,d):(t?s.bufferSubData(h,f.offset*d.BYTES_PER_ELEMENT,d,f.offset,f.count):s.bufferSubData(h,f.offset*d.BYTES_PER_ELEMENT,d.subarray(f.offset,f.offset+f.count)),f.count=-1)}function o(l){return l.isInterleavedBufferAttribute&&(l=l.data),n.get(l)}function a(l){l.isInterleavedBufferAttribute&&(l=l.data);let u=n.get(l);u&&(s.deleteBuffer(u.buffer),n.delete(l))}function c(l,u){if(l.isGLBufferAttribute){let d=n.get(l);(!d||d.version<l.version)&&n.set(l,{buffer:l.buffer,type:l.type,bytesPerElement:l.elementSize,version:l.version});return}l.isInterleavedBufferAttribute&&(l=l.data);let h=n.get(l);h===void 0?n.set(l,i(l,u)):h.version<l.version&&(r(h.buffer,l,u),h.version=l.version)}return{get:o,remove:a,update:c}}var cr=class extends ue{constructor(e=1,t=1,n=1,i=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let r=e/2,o=t/2,a=Math.floor(n),c=Math.floor(i),l=a+1,u=c+1,h=e/a,d=t/c,f=[],m=[],x=[],y=[];for(let g=0;g<u;g++){let p=g*d-o;for(let w=0;w<l;w++){let b=w*h-r;m.push(b,-p,0),x.push(0,0,1),y.push(w/a),y.push(1-g/c)}}for(let g=0;g<c;g++)for(let p=0;p<a;p++){let w=p+l*g,b=p+l*(g+1),E=p+1+l*(g+1),v=p+1+l*g;f.push(w,b,v),f.push(b,E,v)}this.setIndex(f),this.setAttribute(`position`,new oe(m,3)),this.setAttribute(`normal`,new oe(x,3)),this.setAttribute(`uv`,new oe(y,2))}};var Ee={alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef ALPHATEST
	if ( diffuseColor.a < ALPHATEST ) discard;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.specularRoughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,begin_vertex:`vec3 transformed = vec3( position );`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`vec2 integrateSpecularBRDF( const in float dotNV, const in float roughness ) {
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	return vec2( -1.04, 1.04 ) * a004 + r.zw;
}
float punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
#if defined ( PHYSICALLY_CORRECT_LIGHTS )
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
#else
	if( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
		return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );
	}
	return 1.0;
#endif
}
vec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {
	float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );
	return ( 1.0 - specularColor ) * fresnel + specularColor;
}
vec3 F_Schlick_RoughnessDependent( const in vec3 F0, const in float dotNV, const in float roughness ) {
	float fresnel = exp2( ( -5.55473 * dotNV - 6.98316 ) * dotNV );
	vec3 Fr = max( vec3( 1.0 - roughness ), F0 ) - F0;
	return Fr * fresnel + F0;
}
float G_GGX_Smith( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	float gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	return 1.0 / ( gl * gv );
}
float G_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
vec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float roughness ) {
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( incidentLight.direction + viewDir );
	float dotNL = saturate( dot( normal, incidentLight.direction ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
	vec3 F = F_Schlick( specularColor, dotLH );
	float G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );
	float D = D_GGX( alpha, dotNH );
	return F * ( G * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
vec3 BRDF_Specular_GGX_Environment( const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 brdf = integrateSpecularBRDF( dotNV, roughness );
	return specularColor * brdf.x + brdf.y;
}
void BRDF_Specular_Multiscattering_Environment( const in GeometricContext geometry, const in vec3 specularColor, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
	vec3 F = F_Schlick_RoughnessDependent( specularColor, dotNV, roughness );
	vec2 brdf = integrateSpecularBRDF( dotNV, roughness );
	vec3 FssEss = F * brdf.x + brdf.y;
	float Ess = brdf.x + brdf.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = specularColor + ( 1.0 - specularColor ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );
	float dotNH = saturate( dot( geometry.normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
	vec3 F = F_Schlick( specularColor, dotLH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
}
float GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {
	return ( 2.0 / pow2( ggxRoughness + 0.0001 ) - 2.0 );
}
float BlinnExponentToGGXRoughness( const in float blinnExponent ) {
	return sqrt( 2.0 / ( blinnExponent + 2.0 ) );
}
#if defined( USE_SHEEN )
float D_Charlie(float roughness, float NoH) {
	float invAlpha = 1.0 / roughness;
	float cos2h = NoH * NoH;
	float sin2h = max(1.0 - cos2h, 0.0078125);	return (2.0 + invAlpha) * pow(sin2h, invAlpha * 0.5) / (2.0 * PI);
}
float V_Neubelt(float NoV, float NoL) {
	return saturate(1.0 / (4.0 * (NoL + NoV - NoL * NoV)));
}
vec3 BRDF_Specular_Sheen( const in float roughness, const in vec3 L, const in GeometricContext geometry, vec3 specularColor ) {
	vec3 N = geometry.normal;
	vec3 V = geometry.viewDir;
	vec3 H = normalize( V + L );
	float dotNH = saturate( dot( N, H ) );
	return specularColor * D_Charlie( roughness, dotNH ) * V_Neubelt( dot(N, V), dot(N, L) );
}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vUv );
		vec2 dSTdy = dFdy( vUv );
		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );
		vec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate(a) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement(a) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract(sin(sn) * c);
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float max3( vec3 v ) { return max( max( v.x, v.y ), v.z ); }
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
#ifdef CLEARCOAT
	vec3 clearcoatNormal;
#endif
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
	float distance = dot( planeNormal, point - pointOnPlane );
	return - distance * planeNormal + point;
}
float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
	return sign( dot( point - pointOnPlane, planeNormal ) );
}
vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {
	return lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float linearToRelativeLuminance( const in vec3 color ) {
	vec3 weights = vec3( 0.2126, 0.7152, 0.0722 );
	return dot( weights, color.rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_maxMipLevel 8.0
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_maxTileSize 256.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		float texelSize = 1.0 / ( 3.0 * cubeUV_maxTileSize );
		vec2 uv = getUV( direction, face ) * ( faceSize - 1.0 );
		vec2 f = fract( uv );
		uv += 0.5 - f;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		if ( mipInt < cubeUV_maxMipLevel ) {
			uv.y += 2.0 * cubeUV_maxTileSize;
		}
		uv.y += filterInt * 2.0 * cubeUV_minTileSize;
		uv.x += 3.0 * max( 0.0, cubeUV_maxTileSize - 2.0 * faceSize );
		uv *= texelSize;
		vec3 tl = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;
		uv.x += texelSize;
		vec3 tr = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;
		uv.y += texelSize;
		vec3 br = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;
		uv.x -= texelSize;
		vec3 bl = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;
		vec3 tm = mix( tl, tr, f.x );
		vec3 bm = mix( bl, br, f.x );
		return mix( tm, bm, f.y );
	}
	#define r0 1.0
	#define v0 0.339
	#define m0 - 2.0
	#define r1 0.8
	#define v1 0.276
	#define m1 - 1.0
	#define r4 0.4
	#define v4 0.046
	#define m4 2.0
	#define r5 0.305
	#define v5 0.016
	#define m5 3.0
	#define r6 0.21
	#define v6 0.0038
	#define m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= r1 ) {
			mip = ( r0 - roughness ) * ( m1 - m0 ) / ( r0 - r1 ) + m0;
		} else if ( roughness >= r4 ) {
			mip = ( r1 - roughness ) * ( m4 - m1 ) / ( r1 - r4 ) + m1;
		} else if ( roughness >= r5 ) {
			mip = ( r4 - roughness ) * ( m5 - m4 ) / ( r4 - r5 ) + m4;
		} else if ( roughness >= r6 ) {
			mip = ( r5 - roughness ) * ( m6 - m5 ) / ( r5 - r6 ) + m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), m0, cubeUV_maxMipLevel );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_INSTANCING
	mat3 m = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
	transformedNormal = m * transformedNormal;
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vUv );
	emissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,encodings_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,encodings_pars_fragment:`
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 GammaToLinear( in vec4 value, in float gammaFactor ) {
	return vec4( pow( value.rgb, vec3( gammaFactor ) ), value.a );
}
vec4 LinearToGamma( in vec4 value, in float gammaFactor ) {
	return vec4( pow( value.rgb, vec3( 1.0 / gammaFactor ) ), value.a );
}
vec4 sRGBToLinear( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 RGBEToLinear( in vec4 value ) {
	return vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );
}
vec4 LinearToRGBE( in vec4 value ) {
	float maxComponent = max( max( value.r, value.g ), value.b );
	float fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );
	return vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );
}
vec4 RGBMToLinear( in vec4 value, in float maxRange ) {
	return vec4( value.rgb * value.a * maxRange, 1.0 );
}
vec4 LinearToRGBM( in vec4 value, in float maxRange ) {
	float maxRGB = max( value.r, max( value.g, value.b ) );
	float M = clamp( maxRGB / maxRange, 0.0, 1.0 );
	M = ceil( M * 255.0 ) / 255.0;
	return vec4( value.rgb / ( M * maxRange ), M );
}
vec4 RGBDToLinear( in vec4 value, in float maxRange ) {
	return vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );
}
vec4 LinearToRGBD( in vec4 value, in float maxRange ) {
	float maxRGB = max( value.r, max( value.g, value.b ) );
	float D = max( maxRange / maxRGB, 1.0 );
	D = clamp( floor( D ) / 255.0, 0.0, 1.0 );
	return vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );
}
const mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );
vec4 LinearToLogLuv( in vec4 value ) {
	vec3 Xp_Y_XYZp = cLogLuvM * value.rgb;
	Xp_Y_XYZp = max( Xp_Y_XYZp, vec3( 1e-6, 1e-6, 1e-6 ) );
	vec4 vResult;
	vResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;
	float Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;
	vResult.w = fract( Le );
	vResult.z = ( Le - ( floor( vResult.w * 255.0 ) ) / 255.0 ) / 255.0;
	return vResult;
}
const mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );
vec4 LogLuvToLinear( in vec4 value ) {
	float Le = value.z * 255.0 + value.w;
	vec3 Xp_Y_XYZp;
	Xp_Y_XYZp.y = exp2( ( Le - 127.0 ) / 2.0 );
	Xp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;
	Xp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;
	vec3 vRGB = cLogLuvInverseM * Xp_Y_XYZp.rgb;
	return vec4( max( vRGB, 0.0 ), 1.0 );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 envColor = textureCubeUV( envMap, reflectVec, 0.0 );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifndef ENVMAP_TYPE_CUBE_UV
		envColor = envMapTexelToLinear( envColor );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform int maxMipLevel;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) ||defined( PHONG )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#if defined( USE_ENVMAP )
	#ifdef ENVMAP_MODE_REFRACTION
		uniform float refractionRatio;
	#endif
	vec3 getLightProbeIndirectIrradiance( const in GeometricContext geometry, const in int maxMIPLevel ) {
		vec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );
		#ifdef ENVMAP_TYPE_CUBE
			vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );
			#ifdef TEXTURE_LOD_EXT
				vec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );
			#else
				vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );
			#endif
			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
		#elif defined( ENVMAP_TYPE_CUBE_UV )
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
		#else
			vec4 envMapColor = vec4( 0.0 );
		#endif
		return PI * envMapColor.rgb * envMapIntensity;
	}
	float getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {
		float maxMIPLevelScalar = float( maxMIPLevel );
		float sigma = PI * roughness * roughness / ( 1.0 + roughness );
		float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );
		return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );
	}
	vec3 getLightProbeIndirectRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in int maxMIPLevel ) {
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( -viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
		#else
			vec3 reflectVec = refract( -viewDir, normal, refractionRatio );
		#endif
		reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
		float specularMIPLevel = getSpecularMIPLevel( roughness, maxMIPLevel );
		#ifdef ENVMAP_TYPE_CUBE
			vec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
			#ifdef TEXTURE_LOD_EXT
				vec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );
			#else
				vec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );
			#endif
			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
		#elif defined( ENVMAP_TYPE_CUBE_UV )
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
		#endif
		return envMapColor.rgb * envMapIntensity;
	}
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	fogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float fogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * fogDepth * fogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float fogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return texture2D( gradientMap, coord ).rgb;
	#else
		return ( coord.x < 0.7 ) ? vec3( 0.7 ) : vec3( 1.0 );
	#endif
}`,lightmap_fragment:`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel= texture2D( lightMap, vUv2 );
	reflectedLight.indirectDiffuse += PI * lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;
#endif`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_vertex:`vec3 diffuse = vec3( 1.0 );
GeometricContext geometry;
geometry.position = mvPosition.xyz;
geometry.normal = normalize( transformedNormal );
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( -mvPosition.xyz );
GeometricContext backGeometry;
backGeometry.position = geometry.position;
backGeometry.normal = -geometry.normal;
backGeometry.viewDir = geometry.viewDir;
vLightFront = vec3( 0.0 );
vIndirectFront = vec3( 0.0 );
#ifdef DOUBLE_SIDED
	vLightBack = vec3( 0.0 );
	vIndirectBack = vec3( 0.0 );
#endif
IncidentLight directLight;
float dotNL;
vec3 directLightColor_Diffuse;
vIndirectFront += getAmbientLightIrradiance( ambientLightColor );
vIndirectFront += getLightProbeIrradiance( lightProbe, geometry );
#ifdef DOUBLE_SIDED
	vIndirectBack += getAmbientLightIrradiance( ambientLightColor );
	vIndirectBack += getLightProbeIrradiance( lightProbe, backGeometry );
#endif
#if NUM_POINT_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		getPointDirectLightIrradiance( pointLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;
		#endif
	}
	#pragma unroll_loop_end
#endif
#if NUM_SPOT_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		getSpotDirectLightIrradiance( spotLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;
		#endif
	}
	#pragma unroll_loop_end
#endif
#if NUM_DIR_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		getDirectionalDirectLightIrradiance( directionalLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;
		#endif
	}
	#pragma unroll_loop_end
#endif
#if NUM_HEMI_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
		vIndirectFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );
		#ifdef DOUBLE_SIDED
			vIndirectBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometry );
		#endif
	}
	#pragma unroll_loop_end
#endif`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
uniform vec3 lightProbe[ 9 ];
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in GeometricContext geometry ) {
	vec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	#ifndef PHYSICALLY_CORRECT_LIGHTS
		irradiance *= PI;
	#endif
	return irradiance;
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight ) {
		directLight.color = directionalLight.color;
		directLight.direction = directionalLight.direction;
		directLight.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointDirectLightIrradiance( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight ) {
		vec3 lVector = pointLight.position - geometry.position;
		directLight.direction = normalize( lVector );
		float lightDistance = length( lVector );
		directLight.color = pointLight.color;
		directLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );
		directLight.visible = ( directLight.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotDirectLightIrradiance( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight directLight ) {
		vec3 lVector = spotLight.position - geometry.position;
		directLight.direction = normalize( lVector );
		float lightDistance = length( lVector );
		float angleCos = dot( directLight.direction, spotLight.direction );
		if ( angleCos > spotLight.coneCos ) {
			float spotEffect = smoothstep( spotLight.coneCos, spotLight.penumbraCos, angleCos );
			directLight.color = spotLight.color;
			directLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor( lightDistance, spotLight.distance, spotLight.decay );
			directLight.visible = true;
		} else {
			directLight.color = vec3( 0.0 );
			directLight.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in GeometricContext geometry ) {
		float dotNL = dot( geometry.normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		#ifndef PHYSICALLY_CORRECT_LIGHTS
			irradiance *= PI;
		#endif
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;
	#ifndef PHYSICALLY_CORRECT_LIGHTS
		irradiance *= PI;
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon
#define Material_LightProbeLOD( material )	(0)`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifndef PHYSICALLY_CORRECT_LIGHTS
		irradiance *= PI;
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong
#define Material_LightProbeLOD( material )	(0)`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.specularRoughness = max( roughnessFactor, 0.0525 );material.specularRoughness += geometryRoughness;
material.specularRoughness = min( material.specularRoughness, 1.0 );
#ifdef REFLECTIVITY
	material.specularColor = mix( vec3( MAXIMUM_SPECULAR_COEFFICIENT * pow2( reflectivity ) ), diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( DEFAULT_SPECULAR_COEFFICIENT ), diffuseColor.rgb, metalnessFactor );
#endif
#ifdef CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheen;
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float specularRoughness;
	vec3 specularColor;
#ifdef CLEARCOAT
	float clearcoat;
	float clearcoatRoughness;
#endif
#ifdef USE_SHEEN
	vec3 sheenColor;
#endif
};
#define MAXIMUM_SPECULAR_COEFFICIENT 0.16
#define DEFAULT_SPECULAR_COEFFICIENT 0.04
float clearcoatDHRApprox( const in float roughness, const in float dotNL ) {
	return DEFAULT_SPECULAR_COEFFICIENT + ( 1.0 - DEFAULT_SPECULAR_COEFFICIENT ) * ( pow( 1.0 - dotNL, 5.0 ) * pow( 1.0 - roughness, 2.0 ) );
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometry.normal;
		vec3 viewDir = geometry.viewDir;
		vec3 position = geometry.position;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.specularRoughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifndef PHYSICALLY_CORRECT_LIGHTS
		irradiance *= PI;
	#endif
	#ifdef CLEARCOAT
		float ccDotNL = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = ccDotNL * directLight.color;
		#ifndef PHYSICALLY_CORRECT_LIGHTS
			ccIrradiance *= PI;
		#endif
		float clearcoatDHR = material.clearcoat * clearcoatDHRApprox( material.clearcoatRoughness, ccDotNL );
		reflectedLight.directSpecular += ccIrradiance * material.clearcoat * BRDF_Specular_GGX( directLight, geometry.viewDir, geometry.clearcoatNormal, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearcoatRoughness );
	#else
		float clearcoatDHR = 0.0;
	#endif
	#ifdef USE_SHEEN
		reflectedLight.directSpecular += ( 1.0 - clearcoatDHR ) * irradiance * BRDF_Specular_Sheen(
			material.specularRoughness,
			directLight.direction,
			geometry,
			material.sheenColor
		);
	#else
		reflectedLight.directSpecular += ( 1.0 - clearcoatDHR ) * irradiance * BRDF_Specular_GGX( directLight, geometry.viewDir, geometry.normal, material.specularColor, material.specularRoughness);
	#endif
	reflectedLight.directDiffuse += ( 1.0 - clearcoatDHR ) * irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef CLEARCOAT
		float ccDotNV = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
		reflectedLight.indirectSpecular += clearcoatRadiance * material.clearcoat * BRDF_Specular_GGX_Environment( geometry.viewDir, geometry.clearcoatNormal, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearcoatRoughness );
		float ccDotNL = ccDotNV;
		float clearcoatDHR = material.clearcoat * clearcoatDHRApprox( material.clearcoatRoughness, ccDotNL );
	#else
		float clearcoatDHR = 0.0;
	#endif
	float clearcoatInv = 1.0 - clearcoatDHR;
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	BRDF_Specular_Multiscattering_Environment( geometry, material.specularColor, material.specularRoughness, singleScattering, multiScattering );
	vec3 diffuse = material.diffuseColor * ( 1.0 - ( singleScattering + multiScattering ) );
	reflectedLight.indirectSpecular += clearcoatInv * radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
GeometricContext geometry;
geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
#ifdef CLEARCOAT
	geometry.clearcoatNormal = clearcoatNormal;
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointDirectLightIrradiance( pointLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotDirectLightIrradiance( spotLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	irradiance += getLightProbeIrradiance( lightProbe, geometry );
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel= texture2D( lightMap, vUv2 );
		vec3 lightMapIrradiance = lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;
		#ifndef PHYSICALLY_CORRECT_LIGHTS
			lightMapIrradiance *= PI;
		#endif
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getLightProbeIndirectIrradiance( geometry, maxMipLevel );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	radiance += getLightProbeIndirectRadiance( geometry.viewDir, geometry.normal, material.specularRoughness, maxMipLevel );
	#ifdef CLEARCOAT
		clearcoatRadiance += getLightProbeIndirectRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness, maxMipLevel );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 texelColor = texture2D( map, vUv );
	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
#endif
#ifdef USE_MAP
	vec4 mapTexel = texture2D( map, uv );
	diffuseColor *= mapTexelToLinear( mapTexel );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	uniform mat3 uvTransform;
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
	objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
	objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
	objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifndef USE_MORPHNORMALS
		uniform float morphTargetInfluences[ 8 ];
	#else
		uniform float morphTargetInfluences[ 4 ];
	#endif
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	transformed += morphTarget0 * morphTargetInfluences[ 0 ];
	transformed += morphTarget1 * morphTargetInfluences[ 1 ];
	transformed += morphTarget2 * morphTargetInfluences[ 2 ];
	transformed += morphTarget3 * morphTargetInfluences[ 3 ];
	#ifndef USE_MORPHNORMALS
		transformed += morphTarget4 * morphTargetInfluences[ 4 ];
		transformed += morphTarget5 * morphTargetInfluences[ 5 ];
		transformed += morphTarget6 * morphTargetInfluences[ 6 ];
		transformed += morphTarget7 * morphTargetInfluences[ 7 ];
	#endif
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
	vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	#ifdef USE_TANGENT
		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );
		#ifdef DOUBLE_SIDED
			tangent = tangent * faceDirection;
			bitangent = bitangent * faceDirection;
		#endif
		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
			mat3 vTBN = mat3( tangent, bitangent, normal );
		#endif
	#endif
#endif
vec3 geometryNormal = normal;`,normal_fragment_maps:`#ifdef OBJECTSPACE_NORMALMAP
	normal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( TANGENTSPACE_NORMALMAP )
	vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	#ifdef USE_TANGENT
		normal = normalize( vTBN * mapN );
	#else
		normal = perturbNormal2Arb( -vViewPosition, normal, mapN, faceDirection );
	#endif
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef OBJECTSPACE_NORMALMAP
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( TANGENTSPACE_NORMALMAP ) || defined ( USE_CLEARCOAT_NORMALMAP ) )
	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {
		vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
		vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
		vec2 st0 = dFdx( vUv.st );
		vec2 st1 = dFdy( vUv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );
		return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef CLEARCOAT
	vec3 clearcoatNormal = geometryNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	#ifdef USE_TANGENT
		clearcoatNormal = normalize( vTBN * clearcoatMapN );
	#else
		clearcoatNormal = perturbNormal2Arb( - vViewPosition, clearcoatNormal, clearcoatMapN, faceDirection );
	#endif
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ));
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w);
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
	return linearClipZ * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return (( near + viewZ ) * far ) / (( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		varying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
		bool inFrustum = all( inFrustumVec );
		bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );
		bool frustumTest = all( frustumTestVec );
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ), 
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ), 
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ), 
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ), 
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ), 
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ), 
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,shadowmap_pars_vertex:`#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform mat4 spotShadowMatrix[ NUM_SPOT_LIGHT_SHADOWS ];
		varying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SPOT_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		vec4 shadowWorldPosition;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
		vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias, 0 );
		vSpotShadowCoord[ i ] = spotShadowMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
		vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	#ifdef BONE_TEXTURE
		uniform highp sampler2D boneTexture;
		uniform int boneTextureSize;
		mat4 getBoneMatrix( const in float i ) {
			float j = i * 4.0;
			float x = mod( j, float( boneTextureSize ) );
			float y = floor( j / float( boneTextureSize ) );
			float dx = 1.0 / float( boneTextureSize );
			float dy = 1.0 / float( boneTextureSize );
			y = dy * ( y + 0.5 );
			vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
			vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
			vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
			vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
			mat4 bone = mat4( v1, v2, v3, v4 );
			return bone;
		}
	#else
		uniform mat4 boneMatrices[ MAX_BONES ];
		mat4 getBoneMatrix( const in float i ) {
			mat4 bone = boneMatrices[ int(i) ];
			return bone;
		}
	#endif
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate(a) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return toneMappingExposure * color;
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmissionmap_fragment:`#ifdef USE_TRANSMISSIONMAP
	totalTransmission *= texture2D( transmissionMap, vUv ).r;
#endif`,transmissionmap_pars_fragment:`#ifdef USE_TRANSMISSIONMAP
	uniform sampler2D transmissionMap;
#endif`,uv_pars_fragment:`#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )
	varying vec2 vUv;
#endif`,uv_pars_vertex:`#ifdef USE_UV
	#ifdef UVS_VERTEX_ONLY
		vec2 vUv;
	#else
		varying vec2 vUv;
	#endif
	uniform mat3 uvTransform;
#endif`,uv_vertex:`#ifdef USE_UV
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
#endif`,uv2_pars_fragment:`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	varying vec2 vUv2;
#endif`,uv2_pars_vertex:`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	attribute vec2 uv2;
	varying vec2 vUv2;
	uniform mat3 uv2Transform;
#endif`,uv2_vertex:`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP )
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_frag:`uniform sampler2D t2D;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	gl_FragColor = mapTexelToLinear( texColor );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,cube_frag:`#include <envmap_common_pars_fragment>
uniform float opacity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	vec3 vReflect = vWorldDirection;
	#include <envmap_fragment>
	gl_FragColor = envColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,depth_vert:`#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	vec4 texColor = texture2D( tEquirect, sampleUV );
	gl_FragColor = mapTexelToLinear( texColor );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <color_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
	
		vec4 lightMapTexel= texture2D( lightMap, vUv2 );
		reflectedLight.indirectDiffuse += lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshbasic_vert:`#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <skinbase_vertex>
	#ifdef USE_ENVMAP
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
varying vec3 vLightFront;
varying vec3 vIndirectFront;
#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
	varying vec3 vIndirectBack;
#endif
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <fog_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <emissivemap_fragment>
	#ifdef DOUBLE_SIDED
		reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;
	#else
		reflectedLight.indirectDiffuse += vIndirectFront;
	#endif
	#include <lightmap_fragment>
	reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );
	#ifdef DOUBLE_SIDED
		reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;
	#else
		reflectedLight.directDiffuse = vLightFront;
	#endif
	reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vLightFront;
varying vec3 vIndirectFront;
#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
	varying vec3 vIndirectBack;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <bsdfs>
#include <lights_pars_begin>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <lights_lambert_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <fog_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
		matcapColor = matcapTexelToLinear( matcapColor );
	#else
		vec4 matcapColor = vec4( 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#ifndef FLAT_SHADED
		vNormal = normalize( transformedNormal );
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define REFLECTIVITY
	#define CLEARCOAT
	#define TRANSMISSION
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef TRANSMISSION
	uniform float transmission;
#endif
#ifdef REFLECTIVITY
	uniform float reflectivity;
#endif
#ifdef CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheen;
#endif
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <transmissionmap_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#ifdef TRANSMISSION
		float totalTransmission = transmission;
	#endif
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <transmissionmap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#ifdef TRANSMISSION
		diffuseColor.a *= mix( saturate( 1. - totalTransmission + linearToRelativeLuminance( reflectedLight.directSpecular + reflectedLight.indirectSpecular ) ), 1.0, metalness );
	#endif
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,normal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif
#include <packing>
#include <uv_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
}`,normal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	vViewPosition = - mvPosition.xyz;
#endif
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <color_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,shadow_vert:`#include <common>
#include <fog_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <begin_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`};var K={common:{diffuse:{value:new se(15658734)},opacity:{value:1},map:{value:null},uvTransform:{value:new je},uv2Transform:{value:new je},alphaMap:{value:null}},specularmap:{specularMap:{value:null}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},refractionRatio:{value:.98},maxMipLevel:{value:0}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1}},emissivemap:{emissiveMap:{value:null}},bumpmap:{bumpMap:{value:null},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalScale:{value:new W(1,1)}},displacementmap:{displacementMap:{value:null},displacementScale:{value:1},displacementBias:{value:0}},roughnessmap:{roughnessMap:{value:null}},metalnessmap:{metalnessMap:{value:null}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new se(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotShadowMap:{value:[]},spotShadowMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new se(15658734)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},uvTransform:{value:new je}},sprite:{diffuse:{value:new se(15658734)},opacity:{value:1},center:{value:new W(.5,.5)},rotation:{value:0},map:{value:null},alphaMap:{value:null},uvTransform:{value:new je}}};var Ot={basic:{uniforms:ct([K.common,K.specularmap,K.envmap,K.aomap,K.lightmap,K.fog]),vertexShader:Ee.meshbasic_vert,fragmentShader:Ee.meshbasic_frag},lambert:{uniforms:ct([K.common,K.specularmap,K.envmap,K.aomap,K.lightmap,K.emissivemap,K.fog,K.lights,{emissive:{value:new se(0)}}]),vertexShader:Ee.meshlambert_vert,fragmentShader:Ee.meshlambert_frag},phong:{uniforms:ct([K.common,K.specularmap,K.envmap,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.fog,K.lights,{emissive:{value:new se(0)},specular:{value:new se(1118481)},shininess:{value:30}}]),vertexShader:Ee.meshphong_vert,fragmentShader:Ee.meshphong_frag},standard:{uniforms:ct([K.common,K.envmap,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.roughnessmap,K.metalnessmap,K.fog,K.lights,{emissive:{value:new se(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ee.meshphysical_vert,fragmentShader:Ee.meshphysical_frag},toon:{uniforms:ct([K.common,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.gradientmap,K.fog,K.lights,{emissive:{value:new se(0)}}]),vertexShader:Ee.meshtoon_vert,fragmentShader:Ee.meshtoon_frag},matcap:{uniforms:ct([K.common,K.bumpmap,K.normalmap,K.displacementmap,K.fog,{matcap:{value:null}}]),vertexShader:Ee.meshmatcap_vert,fragmentShader:Ee.meshmatcap_frag},points:{uniforms:ct([K.points,K.fog]),vertexShader:Ee.points_vert,fragmentShader:Ee.points_frag},dashed:{uniforms:ct([K.common,K.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ee.linedashed_vert,fragmentShader:Ee.linedashed_frag},depth:{uniforms:ct([K.common,K.displacementmap]),vertexShader:Ee.depth_vert,fragmentShader:Ee.depth_frag},normal:{uniforms:ct([K.common,K.bumpmap,K.normalmap,K.displacementmap,{opacity:{value:1}}]),vertexShader:Ee.normal_vert,fragmentShader:Ee.normal_frag},sprite:{uniforms:ct([K.sprite,K.fog]),vertexShader:Ee.sprite_vert,fragmentShader:Ee.sprite_frag},background:{uniforms:{uvTransform:{value:new je},t2D:{value:null}},vertexShader:Ee.background_vert,fragmentShader:Ee.background_frag},cube:{uniforms:ct([K.envmap,{opacity:{value:1}}]),vertexShader:Ee.cube_vert,fragmentShader:Ee.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ee.equirect_vert,fragmentShader:Ee.equirect_frag},distanceRGBA:{uniforms:ct([K.common,K.displacementmap,{referencePosition:{value:new _},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ee.distanceRGBA_vert,fragmentShader:Ee.distanceRGBA_frag},shadow:{uniforms:ct([K.lights,K.fog,{color:{value:new se(0)},opacity:{value:1}}]),vertexShader:Ee.shadow_vert,fragmentShader:Ee.shadow_frag}};Ot.physical={uniforms:ct([Ot.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatNormalScale:{value:new W(1,1)},clearcoatNormalMap:{value:null},sheen:{value:new se(0)},transmission:{value:0},transmissionMap:{value:null}}]),vertexShader:Ee.meshphysical_vert,fragmentShader:Ee.meshphysical_frag};function eg(s,e,t,n,i){let r=new se(0),o=0,a,c,l=null,u=0,h=null;function d(m,x,y,g){let p=x.isScene===!0?x.background:null;p&&p.isTexture&&(p=e.get(p));let w=s.xr,b=w.getSession&&w.getSession();b&&b.environmentBlendMode===`additive`&&(p=null),p===null?f(r,o):p&&p.isColor&&(f(p,1),g=!0),(s.autoClear||g)&&s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil),p&&(p.isCubeTexture||p.mapping===306)?(c===void 0&&(c=new Ye(new Un(1,1,1),new kt({name:`BackgroundCubeMaterial`,uniforms:vi(Ot.cube.uniforms),vertexShader:Ot.cube.vertexShader,fragmentShader:Ot.cube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute(`normal`),c.geometry.deleteAttribute(`uv`),c.onBeforeRender=function(E,v,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=p,c.material.uniforms.flipEnvMap.value=p.isCubeTexture&&p._needsFlipEnvMap?-1:1,(l!==p||u!==p.version||h!==s.toneMapping)&&(c.material.needsUpdate=!0,l=p,u=p.version,h=s.toneMapping),m.unshift(c,c.geometry,c.material,0,0,null)):p&&p.isTexture&&(a===void 0&&(a=new Ye(new cr(2,2),new kt({name:`BackgroundMaterial`,uniforms:vi(Ot.background.uniforms),vertexShader:Ot.background.vertexShader,fragmentShader:Ot.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),a.geometry.deleteAttribute(`normal`),Object.defineProperty(a.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(a)),a.material.uniforms.t2D.value=p,p.matrixAutoUpdate===!0&&p.updateMatrix(),a.material.uniforms.uvTransform.value.copy(p.matrix),(l!==p||u!==p.version||h!==s.toneMapping)&&(a.material.needsUpdate=!0,l=p,u=p.version,h=s.toneMapping),m.unshift(a,a.geometry,a.material,0,0,null))}function f(m,x){t.buffers.color.setClear(m.r,m.g,m.b,x,i)}return{getClearColor:function(){return r},setClearColor:function(m,x=1){r.set(m),o=x,f(r,o)},getClearAlpha:function(){return o},setClearAlpha:function(m){o=m,f(r,o)},render:d}}function tg(s,e,t,n){let i=s.getParameter(34921),r=n.isWebGL2?null:e.get(`OES_vertex_array_object`),o=n.isWebGL2||r!==null,a={},c=x(null),l=c;function u(R,D,F,P,X){let $=!1;if(o){let Z=m(P,F,D);l!==Z&&(l=Z,d(l.object)),$=y(P,X),$&&g(P,X)}else{let Z=D.wireframe===!0;(l.geometry!==P.id||l.program!==F.id||l.wireframe!==Z)&&(l.geometry=P.id,l.program=F.id,l.wireframe=Z,$=!0)}R.isInstancedMesh===!0&&($=!0),X!==null&&t.update(X,34963),$&&(A(R,D,F,P),X!==null&&s.bindBuffer(34963,t.get(X).buffer))}function h(){return n.isWebGL2?s.createVertexArray():r.createVertexArrayOES()}function d(R){return n.isWebGL2?s.bindVertexArray(R):r.bindVertexArrayOES(R)}function f(R){return n.isWebGL2?s.deleteVertexArray(R):r.deleteVertexArrayOES(R)}function m(R,D,F){let P=F.wireframe===!0,X=a[R.id];X===void 0&&(X={},a[R.id]=X);let $=X[D.id];$===void 0&&($={},X[D.id]=$);let Z=$[P];return Z===void 0&&(Z=x(h()),$[P]=Z),Z}function x(R){let D=[],F=[],P=[];for(let X=0;X<i;X++)D[X]=0,F[X]=0,P[X]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:F,attributeDivisors:P,object:R,attributes:{},index:null}}function y(R,D){let F=l.attributes,P=R.attributes,X=0;for(let $ in P){let Z=F[$],ae=P[$];if(Z===void 0||Z.attribute!==ae||Z.data!==ae.data)return!0;X++}return l.attributesNum!==X||l.index!==D}function g(R,D){let F={},P=R.attributes,X=0;for(let $ in P){let Z=P[$],ae={};ae.attribute=Z,Z.data&&(ae.data=Z.data),F[$]=ae,X++}l.attributes=F,l.attributesNum=X,l.index=D}function p(){let R=l.newAttributes;for(let D=0,F=R.length;D<F;D++)R[D]=0}function w(R){b(R,0)}function b(R,D){let F=l.newAttributes,P=l.enabledAttributes,X=l.attributeDivisors;F[R]=1,P[R]===0&&(s.enableVertexAttribArray(R),P[R]=1),X[R]!==D&&((n.isWebGL2?s:e.get(`ANGLE_instanced_arrays`))[n.isWebGL2?`vertexAttribDivisor`:`vertexAttribDivisorANGLE`](R,D),X[R]=D)}function E(){let R=l.newAttributes,D=l.enabledAttributes;for(let F=0,P=D.length;F<P;F++)D[F]!==R[F]&&(s.disableVertexAttribArray(F),D[F]=0)}function v(R,D,F,P,X,$){n.isWebGL2===!0&&(F===5124||F===5125)?s.vertexAttribIPointer(R,D,F,X,$):s.vertexAttribPointer(R,D,F,P,X,$)}function A(R,D,F,P){if(n.isWebGL2===!1&&(R.isInstancedMesh||P.isInstancedBufferGeometry)&&e.get(`ANGLE_instanced_arrays`)===null)return;p();let X=P.attributes,$=F.getAttributes(),Z=D.defaultAttributeValues;for(let ae in $){let re=$[ae];if(re>=0){let fe=X[ae];if(fe!==void 0){let ve=fe.normalized,G=fe.itemSize,Be=t.get(fe);if(Be===void 0)continue;let Le=Be.buffer,_e=Be.type,pe=Be.bytesPerElement;if(fe.isInterleavedBufferAttribute){let Ce=fe.data,Se=Ce.stride,Te=fe.offset;Ce&&Ce.isInstancedInterleavedBuffer?(b(re,Ce.meshPerAttribute),P._maxInstanceCount===void 0&&(P._maxInstanceCount=Ce.meshPerAttribute*Ce.count)):w(re),s.bindBuffer(34962,Le),v(re,G,_e,ve,Se*pe,Te*pe)}else fe.isInstancedBufferAttribute?(b(re,fe.meshPerAttribute),P._maxInstanceCount===void 0&&(P._maxInstanceCount=fe.meshPerAttribute*fe.count)):w(re),s.bindBuffer(34962,Le),v(re,G,_e,ve,0,0)}else if(ae===`instanceMatrix`){let ve=t.get(R.instanceMatrix);if(ve===void 0)continue;let G=ve.buffer,Be=ve.type;b(re+0,1),b(re+1,1),b(re+2,1),b(re+3,1),s.bindBuffer(34962,G),s.vertexAttribPointer(re+0,4,Be,!1,64,0),s.vertexAttribPointer(re+1,4,Be,!1,64,16),s.vertexAttribPointer(re+2,4,Be,!1,64,32),s.vertexAttribPointer(re+3,4,Be,!1,64,48)}else if(ae===`instanceColor`){let ve=t.get(R.instanceColor);if(ve===void 0)continue;let G=ve.buffer,Be=ve.type;b(re,1),s.bindBuffer(34962,G),s.vertexAttribPointer(re,3,Be,!1,12,0)}else if(Z!==void 0){let ve=Z[ae];if(ve!==void 0)switch(ve.length){case 2:s.vertexAttrib2fv(re,ve);break;case 3:s.vertexAttrib3fv(re,ve);break;case 4:s.vertexAttrib4fv(re,ve);break;default:s.vertexAttrib1fv(re,ve)}}}}E()}function L(){U();for(let R in a){let D=a[R];for(let F in D){let P=D[F];for(let X in P)f(P[X].object),delete P[X];delete D[F]}delete a[R]}}function I(R){if(a[R.id]===void 0)return;let D=a[R.id];for(let F in D){let P=D[F];for(let X in P)f(P[X].object),delete P[X];delete D[F]}delete a[R.id]}function N(R){for(let D in a){let F=a[D];if(F[R.id]===void 0)continue;let P=F[R.id];for(let X in P)f(P[X].object),delete P[X];delete F[R.id]}}function U(){z(),l!==c&&(l=c,d(l.object))}function z(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:u,reset:U,resetDefaultState:z,dispose:L,releaseStatesOfGeometry:I,releaseStatesOfProgram:N,initAttributes:p,enableAttribute:w,disableUnusedAttributes:E}}function ng(s,e,t,n){let i=n.isWebGL2,r;function o(l){r=l}function a(l,u){s.drawArrays(r,l,u),t.update(u,r,1)}function c(l,u,h){if(h===0)return;let d,f;if(i)d=s,f=`drawArraysInstanced`;else if(d=e.get(`ANGLE_instanced_arrays`),f=`drawArraysInstancedANGLE`,d===null){console.error(`THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.`);return}d[f](r,l,u,h),t.update(u,r,h)}this.setMode=o,this.render=a,this.renderInstances=c}function ig(s,e,t){let n;function i(){if(n!==void 0)return n;if(e.has(`EXT_texture_filter_anisotropic`)===!0){let v=e.get(`EXT_texture_filter_anisotropic`);n=s.getParameter(v.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(v){if(v===`highp`){if(s.getShaderPrecisionFormat(35633,36338).precision>0&&s.getShaderPrecisionFormat(35632,36338).precision>0)return`highp`;v=`mediump`}return v===`mediump`&&s.getShaderPrecisionFormat(35633,36337).precision>0&&s.getShaderPrecisionFormat(35632,36337).precision>0?`mediump`:`lowp`}let o=typeof WebGL2RenderingContext<`u`&&s instanceof WebGL2RenderingContext||typeof WebGL2ComputeRenderingContext<`u`&&s instanceof WebGL2ComputeRenderingContext,a=t.precision!==void 0?t.precision:`highp`,c=r(a);c!==a&&(console.warn(`THREE.WebGLRenderer:`,a,`not supported, using`,c,`instead.`),a=c);let l=t.logarithmicDepthBuffer===!0,u=s.getParameter(34930),h=s.getParameter(35660),d=s.getParameter(3379),f=s.getParameter(34076),m=s.getParameter(34921),x=s.getParameter(36347),y=s.getParameter(36348),g=s.getParameter(36349),p=h>0,w=o||e.has(`OES_texture_float`),b=p&&w,E=o?s.getParameter(36183):0;return{isWebGL2:o,getMaxAnisotropy:i,getMaxPrecision:r,precision:a,logarithmicDepthBuffer:l,maxTextures:u,maxVertexTextures:h,maxTextureSize:d,maxCubemapSize:f,maxAttributes:m,maxVertexUniforms:x,maxVaryings:y,maxFragmentUniforms:g,vertexTextures:p,floatFragmentTextures:w,floatVertexTextures:b,maxSamples:E}}function rg(s){let e=this,t=null,n=0,i=!1,r=!1,o=new Et,a=new je,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d,f){let m=h.length!==0||d||n!==0||i;return i=d,t=u(h,f,0),n=h.length,m},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1,l()},this.setState=function(h,d,f){let m=h.clippingPlanes,x=h.clipIntersection,y=h.clipShadows,g=s.get(h);if(!i||m===null||m.length===0||r&&!y)r?u(null):l();else{let p=r?0:n,w=p*4,b=g.clippingState||null;c.value=b,b=u(m,d,w,f);for(let E=0;E!==w;++E)b[E]=t[E];g.clippingState=b,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=p}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,m){let x=h!==null?h.length:0,y=null;if(x!==0){if(y=c.value,m!==!0||y===null){let g=f+x*4,p=d.matrixWorldInverse;a.getNormalMatrix(p),(y===null||y.length<g)&&(y=new Float32Array(g));for(let w=0,b=f;w!==x;++w,b+=4)o.copy(h[w]).applyMatrix4(p,a),o.normal.toArray(y,b),y[b+3]=o.constant}c.value=y,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,y}}function sg(s){let e=new WeakMap;function t(o,a){return a===303?o.mapping=301:a===304&&(o.mapping=302),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===303||a===304)if(e.has(o)){let c=e.get(o).texture;return t(c,o.mapping)}else{let c=o.image;if(c&&c.height>0){let l=s.getRenderTarget(),u=new lr(c.height/2);return u.fromEquirectangularTexture(s,o),e.set(o,u),s.setRenderTarget(l),o.addEventListener(`dispose`,i),t(u.texture,o.mapping)}else return null}}return o}function i(o){let a=o.target;a.removeEventListener(`dispose`,i);let c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}function og(s){let e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case`WEBGL_depth_texture`:i=s.getExtension(`WEBGL_depth_texture`)||s.getExtension(`MOZ_WEBGL_depth_texture`)||s.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:i=s.getExtension(`EXT_texture_filter_anisotropic`)||s.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||s.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:i=s.getExtension(`WEBGL_compressed_texture_s3tc`)||s.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||s.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:i=s.getExtension(`WEBGL_compressed_texture_pvrtc`)||s.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:i=s.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?t(`EXT_color_buffer_float`):(t(`WEBGL_depth_texture`),t(`OES_texture_float`),t(`OES_texture_half_float`),t(`OES_texture_half_float_linear`),t(`OES_standard_derivatives`),t(`OES_element_index_uint`),t(`OES_vertex_array_object`),t(`ANGLE_instanced_arrays`)),t(`OES_texture_float_linear`),t(`EXT_color_buffer_half_float`)},get:function(n){let i=t(n);return i===null&&console.warn(`THREE.WebGLRenderer: `+n+` extension not supported.`),i}}}function ag(s,e,t,n){let i={},r=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let m in d.attributes)e.remove(d.attributes[m]);d.removeEventListener(`dispose`,o),delete i[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return i[d.id]===!0||(d.addEventListener(`dispose`,o),i[d.id]=!0,t.memory.geometries++),d}function c(h){let d=h.attributes;for(let m in d)e.update(d[m],34962);let f=h.morphAttributes;for(let m in f){let x=f[m];for(let y=0,g=x.length;y<g;y++)e.update(x[y],34962)}}function l(h){let d=[],f=h.index,m=h.attributes.position,x=0;if(f!==null){let p=f.array;x=f.version;for(let w=0,b=p.length;w<b;w+=3){let E=p[w+0],v=p[w+1],A=p[w+2];d.push(E,v,v,A,A,E)}}else{let p=m.array;x=m.version;for(let w=0,b=p.length/3-1;w<b;w+=3){let E=w+0,v=w+1,A=w+2;d.push(E,v,v,A,A,E)}}let y=new(nu(d)>65535?or:sr)(d,1);y.version=x;let g=r.get(h);g&&e.remove(g),r.set(h,y)}function u(h){let d=r.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&l(h)}else l(h);return r.get(h)}return{get:a,update:c,getWireframeAttribute:u}}function lg(s,e,t,n){let i=n.isWebGL2,r;function o(d){r=d}let a,c;function l(d){a=d.type,c=d.bytesPerElement}function u(d,f){s.drawElements(r,f,a,d*c),t.update(f,r,1)}function h(d,f,m){if(m===0)return;let x,y;if(i)x=s,y=`drawElementsInstanced`;else if(x=e.get(`ANGLE_instanced_arrays`),y=`drawElementsInstancedANGLE`,x===null){console.error(`THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.`);return}x[y](r,f,a,d*c,m),t.update(f,r,m)}this.setMode=o,this.setIndex=l,this.render=u,this.renderInstances=h}function cg(s){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case 4:t.triangles+=a*(r/3);break;case 1:t.lines+=a*(r/2);break;case 3:t.lines+=a*(r-1);break;case 2:t.lines+=a*r;break;case 0:t.points+=a*r;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,o);break}}function i(){t.frame++,t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function hg(s,e){return s[0]-e[0]}function ug(s,e){return Math.abs(e[1])-Math.abs(s[1])}function dg(s){let e={},t=new Float32Array(8),n=[];for(let r=0;r<8;r++)n[r]=[r,0];function i(r,o,a,c){let l=r.morphTargetInfluences,u=l===void 0?0:l.length,h=e[o.id];if(h===void 0){h=[];for(let y=0;y<u;y++)h[y]=[y,0];e[o.id]=h}for(let y=0;y<u;y++){let g=h[y];g[0]=y,g[1]=l[y]}h.sort(ug);for(let y=0;y<8;y++)y<u&&h[y][1]?(n[y][0]=h[y][0],n[y][1]=h[y][1]):(n[y][0]=Number.MAX_SAFE_INTEGER,n[y][1]=0);n.sort(hg);let d=a.morphTargets&&o.morphAttributes.position,f=a.morphNormals&&o.morphAttributes.normal,m=0;for(let y=0;y<8;y++){let g=n[y],p=g[0],w=g[1];p!==Number.MAX_SAFE_INTEGER&&w?(d&&o.getAttribute(`morphTarget`+y)!==d[p]&&o.setAttribute(`morphTarget`+y,d[p]),f&&o.getAttribute(`morphNormal`+y)!==f[p]&&o.setAttribute(`morphNormal`+y,f[p]),t[y]=w,m+=w):(d&&o.hasAttribute(`morphTarget`+y)===!0&&o.deleteAttribute(`morphTarget`+y),f&&o.hasAttribute(`morphNormal`+y)===!0&&o.deleteAttribute(`morphNormal`+y),t[y]=0)}let x=o.morphTargetsRelative?1:1-m;c.getUniforms().setValue(s,`morphTargetBaseInfluence`,x),c.getUniforms().setValue(s,`morphTargetInfluences`,t)}return{update:i}}function fg(s,e,t,n){let i=new WeakMap;function r(c){let l=n.render.frame,u=c.geometry,h=e.get(c,u);return i.get(h)!==l&&(e.update(h),i.set(h,l)),c.isInstancedMesh&&(c.hasEventListener(`dispose`,a)===!1&&c.addEventListener(`dispose`,a),t.update(c.instanceMatrix,34962),c.instanceColor!==null&&t.update(c.instanceColor,34962)),h}function o(){i=new WeakMap}function a(c){let l=c.target;l.removeEventListener(`dispose`,a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:o}}var Rs=class extends St{constructor(e=null,t=1,n=1,i=1){super(null),this.image={data:e,width:t,height:n,depth:i},this.magFilter=rt,this.minFilter=rt,this.wrapR=yt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.needsUpdate=!0}};Rs.prototype.isDataTexture2DArray=!0;var Cs=class extends St{constructor(e=null,t=1,n=1,i=1){super(null),this.image={data:e,width:t,height:n,depth:i},this.magFilter=rt,this.minFilter=rt,this.wrapR=yt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.needsUpdate=!0}};Cs.prototype.isDataTexture3D=!0;var ru=new St;var pg=new Rs;var mg=new Cs;var su=new Hn;var gc=[];var xc=[];var yc=new Float32Array(16);var vc=new Float32Array(9);var _c=new Float32Array(4);function Fi(s,e,t){let n=s[0];if(n<=0||n>0)return s;let i=e*t,r=gc[i];if(r===void 0&&(r=new Float32Array(i),gc[i]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function mt(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function ut(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function ou(s,e){let t=xc[e];t===void 0&&(t=new Int32Array(e),xc[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function gg(s,e){let t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function xg(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(mt(t,e))return;s.uniform2fv(this.addr,e),ut(t,e)}}function yg(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(mt(t,e))return;s.uniform3fv(this.addr,e),ut(t,e)}}function vg(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(mt(t,e))return;s.uniform4fv(this.addr,e),ut(t,e)}}function _g(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(mt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),ut(t,e)}else{if(mt(t,n))return;_c.set(n),s.uniformMatrix2fv(this.addr,!1,_c),ut(t,n)}}function wg(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(mt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),ut(t,e)}else{if(mt(t,n))return;vc.set(n),s.uniformMatrix3fv(this.addr,!1,vc),ut(t,n)}}function bg(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(mt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),ut(t,e)}else{if(mt(t,n))return;yc.set(n),s.uniformMatrix4fv(this.addr,!1,yc),ut(t,n)}}function Mg(s,e){let t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function Sg(s,e){let t=this.cache;mt(t,e)||(s.uniform2iv(this.addr,e),ut(t,e))}function Eg(s,e){let t=this.cache;mt(t,e)||(s.uniform3iv(this.addr,e),ut(t,e))}function Tg(s,e){let t=this.cache;mt(t,e)||(s.uniform4iv(this.addr,e),ut(t,e))}function Ag(s,e){let t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function Lg(s,e){let t=this.cache;mt(t,e)||(s.uniform2uiv(this.addr,e),ut(t,e))}function Rg(s,e){let t=this.cache;mt(t,e)||(s.uniform3uiv(this.addr,e),ut(t,e))}function Cg(s,e){let t=this.cache;mt(t,e)||(s.uniform4uiv(this.addr,e),ut(t,e))}function Pg(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.safeSetTexture2D(e||ru,i)}function Ig(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||mg,i)}function Dg(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.safeSetTextureCube(e||su,i)}function Fg(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||pg,i)}function Ng(s){switch(s){case 5126:return gg;case 35664:return xg;case 35665:return yg;case 35666:return vg;case 35674:return _g;case 35675:return wg;case 35676:return bg;case 5124:case 35670:return Mg;case 35667:case 35671:return Sg;case 35668:case 35672:return Eg;case 35669:case 35673:return Tg;case 5125:return Ag;case 36294:return Lg;case 36295:return Rg;case 36296:return Cg;case 35678:case 36198:case 36298:case 36306:case 35682:return Pg;case 35679:case 36299:case 36307:return Ig;case 35680:case 36300:case 36308:case 36293:return Dg;case 36289:case 36303:case 36311:case 36292:return Fg}}function Bg(s,e){s.uniform1fv(this.addr,e)}function zg(s,e){let t=Fi(e,this.size,2);s.uniform2fv(this.addr,t)}function Og(s,e){let t=Fi(e,this.size,3);s.uniform3fv(this.addr,t)}function Ug(s,e){let t=Fi(e,this.size,4);s.uniform4fv(this.addr,t)}function Hg(s,e){let t=Fi(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function Gg(s,e){let t=Fi(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function kg(s,e){let t=Fi(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function Vg(s,e){s.uniform1iv(this.addr,e)}function Wg(s,e){s.uniform2iv(this.addr,e)}function qg(s,e){s.uniform3iv(this.addr,e)}function Xg(s,e){s.uniform4iv(this.addr,e)}function Yg(s,e){s.uniform1uiv(this.addr,e)}function Zg(s,e){s.uniform2uiv(this.addr,e)}function Jg(s,e){s.uniform3uiv(this.addr,e)}function jg(s,e){s.uniform4uiv(this.addr,e)}function $g(s,e,t){let n=e.length,i=ou(t,n);s.uniform1iv(this.addr,i);for(let r=0;r!==n;++r)t.safeSetTexture2D(e[r]||ru,i[r])}function Qg(s,e,t){let n=e.length,i=ou(t,n);s.uniform1iv(this.addr,i);for(let r=0;r!==n;++r)t.safeSetTextureCube(e[r]||su,i[r])}function Kg(s){switch(s){case 5126:return Bg;case 35664:return zg;case 35665:return Og;case 35666:return Ug;case 35674:return Hg;case 35675:return Gg;case 35676:return kg;case 5124:case 35670:return Vg;case 35667:case 35671:return Wg;case 35668:case 35672:return qg;case 35669:case 35673:return Xg;case 5125:return Yg;case 36294:return Zg;case 36295:return Jg;case 36296:return jg;case 35678:case 36198:case 36298:case 36306:case 35682:return $g;case 35680:case 36300:case 36308:case 36293:return Qg}}function ex(s,e,t){this.id=s,this.addr=t,this.cache=[],this.setValue=Ng(e.type)}function au(s,e,t){this.id=s,this.addr=t,this.cache=[],this.size=e.size,this.setValue=Kg(e.type)}au.prototype.updateCache=function(s){let e=this.cache;s instanceof Float32Array&&e.length!==s.length&&(this.cache=new Float32Array(s.length)),ut(e,s)};function lu(s){this.id=s,this.seq=[],this.map={}}lu.prototype.setValue=function(s,e,t){let n=this.seq;for(let i=0,r=n.length;i!==r;++i){let o=n[i];o.setValue(s,e[o.id],t)}};var la=/(\w+)(\])?(\[|\.)?/g;function wc(s,e){s.seq.push(e),s.map[e.id]=e}function tx(s,e,t){let n=s.name,i=n.length;for(la.lastIndex=0;;){let r=la.exec(n),o=la.lastIndex,a=r[1],c=r[2]===`]`,l=r[3];if(c&&(a=a|0),l===void 0||l===`[`&&o+2===i){wc(t,l===void 0?new ex(a,s,e):new au(a,s,e));break}else{let h=t.map[a];h===void 0&&(h=new lu(a),wc(t,h)),t=h}}}function gn(s,e){this.seq=[],this.map={};let t=s.getProgramParameter(e,35718);for(let n=0;n<t;++n){let i=s.getActiveUniform(e,n);tx(i,s.getUniformLocation(e,i.name),this)}}gn.prototype.setValue=function(s,e,t,n){let i=this.map[e];i!==void 0&&i.setValue(s,t,n)};gn.prototype.setOptional=function(s,e,t){let n=e[t];n!==void 0&&this.setValue(s,t,n)};gn.upload=function(s,e,t,n){for(let i=0,r=e.length;i!==r;++i){let o=e[i],a=t[o.id];a.needsUpdate!==!1&&o.setValue(s,a.value,n)}};gn.seqWithValue=function(s,e){let t=[];for(let n=0,i=s.length;n!==i;++n){let r=s[n];r.id in e&&t.push(r)}return t};function bc(s,e,t){let n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}var nx=0;function ix(s){let e=s.split(`
`);for(let t=0;t<e.length;t++)e[t]=t+1+`: `+e[t];return e.join(`
`)}function cu(s){switch(s){case vt:return[`Linear`,`( value )`];case Do:return[`sRGB`,`( value )`];case Al:return[`RGBE`,`( value )`];case $h:return[`RGBM`,`( value, 7.0 )`];case Qh:return[`RGBM`,`( value, 16.0 )`];case Kh:return[`RGBD`,`( value, 256.0 )`];case Tl:return[`Gamma`,`( value, float( GAMMA_FACTOR ) )`];case jd:return[`LogLuv`,`( value )`];default:return console.warn(`THREE.WebGLProgram: Unsupported encoding:`,s),[`Linear`,`( value )`]}}function Mc(s,e,t){let n=s.getShaderParameter(e,35713),i=s.getShaderInfoLog(e).trim();if(n&&i===``)return``;let r=s.getShaderSource(e);return`THREE.WebGLShader: gl.getShaderInfoLog() `+t+`
`+i+ix(r)}function Ui(s,e){let t=cu(e);return`vec4 `+s+`( vec4 value ) { return `+t[0]+`ToLinear`+t[1]+`; }`}function rx(s,e){let t=cu(e);return`vec4 `+s+`( vec4 value ) { return LinearTo`+t[0]+t[1]+`; }`}function sx(s,e){let t;switch(e){case 1:t=`Linear`;break;case 2:t=`Reinhard`;break;case 3:t=`OptimizedCineon`;break;case 4:t=`ACESFilmic`;break;case 5:t=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,e),t=`Linear`}return`vec3 `+s+`( vec3 color ) { return `+t+`ToneMapping( color ); }`}function ox(s){return[s.extensionDerivatives||s.envMapCubeUV||s.bumpMap||s.tangentSpaceNormalMap||s.clearcoatNormalMap||s.flatShading||s.shaderID===`physical`?`#extension GL_OES_standard_derivatives : enable`:``,(s.extensionFragDepth||s.logarithmicDepthBuffer)&&s.rendererExtensionFragDepth?`#extension GL_EXT_frag_depth : enable`:``,s.extensionDrawBuffers&&s.rendererExtensionDrawBuffers?`#extension GL_EXT_draw_buffers : require`:``,(s.extensionShaderTextureLOD||s.envMap)&&s.rendererExtensionShaderTextureLod?`#extension GL_EXT_shader_texture_lod : enable`:``].filter(Zi).join(`
`)}function ax(s){let e=[];for(let t in s){let n=s[t];n!==!1&&e.push(`#define `+t+` `+n)}return e.join(`
`)}function lx(s,e){let t={},n=s.getProgramParameter(e,35721);for(let i=0;i<n;i++){let o=s.getActiveAttrib(e,i).name;t[o]=s.getAttribLocation(e,o)}return t}function Zi(s){return s!==``}function Sc(s,e){return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ec(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var cx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Na(s){return s.replace(cx,hx)}function hx(s,e){let t=Ee[e];if(t===void 0)throw new Error(`Can not resolve #include <`+e+`>`);return Na(t)}var ux=/#pragma unroll_loop[\s]+?for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g;var dx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Tc(s){return s.replace(dx,hu).replace(ux,fx)}function fx(s,e,t,n){return console.warn(`WebGLProgram: #pragma unroll_loop shader syntax is deprecated. Please use #pragma unroll_loop_start syntax instead.`),hu(s,e,t,n)}function hu(s,e,t,n){let i=``;for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,`[ `+r+` ]`).replace(/UNROLLED_LOOP_INDEX/g,r);return i}function Ac(s){let e=`precision `+s.precision+` float;
precision `+s.precision+` int;`;return s.precision===`highp`?e+=`
#define HIGH_PRECISION`:s.precision===`mediump`?e+=`
#define MEDIUM_PRECISION`:s.precision===`lowp`&&(e+=`
#define LOW_PRECISION`),e}function px(s){let e=`SHADOWMAP_TYPE_BASIC`;return s.shadowMapType===1?e=`SHADOWMAP_TYPE_PCF`:s.shadowMapType===2?e=`SHADOWMAP_TYPE_PCF_SOFT`:s.shadowMapType===3&&(e=`SHADOWMAP_TYPE_VSM`),e}function mx(s){let e=`ENVMAP_TYPE_CUBE`;if(s.envMap)switch(s.envMapMode){case 301:case 302:e=`ENVMAP_TYPE_CUBE`;break;case 306:case 307:e=`ENVMAP_TYPE_CUBE_UV`;break}return e}function gx(s){let e=`ENVMAP_MODE_REFLECTION`;if(s.envMap)switch(s.envMapMode){case 302:case 307:e=`ENVMAP_MODE_REFRACTION`;break}return e}function xx(s){let e=`ENVMAP_BLENDING_NONE`;if(s.envMap)switch(s.combine){case 0:e=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:e=`ENVMAP_BLENDING_MIX`;break;case 2:e=`ENVMAP_BLENDING_ADD`;break}return e}function yx(s,e,t,n){let i=s.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,c=px(t),l=mx(t),u=gx(t),h=xx(t),d=s.gammaFactor>0?s.gammaFactor:1,f=t.isWebGL2?``:ox(t),m=ax(r),x=i.createProgram(),y,g,p=t.glslVersion?`#version `+t.glslVersion+`
`:``;t.isRawShaderMaterial?(y=[m].filter(Zi).join(`
`),y.length>0&&(y+=`
`),g=[f,m].filter(Zi).join(`
`),g.length>0&&(g+=`
`)):(y=[Ac(t),`#define SHADER_NAME `+t.shaderName,m,t.instancing?`#define USE_INSTANCING`:``,t.instancingColor?`#define USE_INSTANCING_COLOR`:``,t.supportsVertexTextures?`#define VERTEX_TEXTURES`:``,`#define GAMMA_FACTOR `+d,`#define MAX_BONES `+t.maxBones,t.useFog&&t.fog?`#define USE_FOG`:``,t.useFog&&t.fogExp2?`#define FOG_EXP2`:``,t.map?`#define USE_MAP`:``,t.envMap?`#define USE_ENVMAP`:``,t.envMap?`#define `+u:``,t.lightMap?`#define USE_LIGHTMAP`:``,t.aoMap?`#define USE_AOMAP`:``,t.emissiveMap?`#define USE_EMISSIVEMAP`:``,t.bumpMap?`#define USE_BUMPMAP`:``,t.normalMap?`#define USE_NORMALMAP`:``,t.normalMap&&t.objectSpaceNormalMap?`#define OBJECTSPACE_NORMALMAP`:``,t.normalMap&&t.tangentSpaceNormalMap?`#define TANGENTSPACE_NORMALMAP`:``,t.clearcoatMap?`#define USE_CLEARCOATMAP`:``,t.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,t.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,t.displacementMap&&t.supportsVertexTextures?`#define USE_DISPLACEMENTMAP`:``,t.specularMap?`#define USE_SPECULARMAP`:``,t.roughnessMap?`#define USE_ROUGHNESSMAP`:``,t.metalnessMap?`#define USE_METALNESSMAP`:``,t.alphaMap?`#define USE_ALPHAMAP`:``,t.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,t.vertexTangents?`#define USE_TANGENT`:``,t.vertexColors?`#define USE_COLOR`:``,t.vertexAlphas?`#define USE_COLOR_ALPHA`:``,t.vertexUvs?`#define USE_UV`:``,t.uvsVertexOnly?`#define UVS_VERTEX_ONLY`:``,t.flatShading?`#define FLAT_SHADED`:``,t.skinning?`#define USE_SKINNING`:``,t.useVertexTexture?`#define BONE_TEXTURE`:``,t.morphTargets?`#define USE_MORPHTARGETS`:``,t.morphNormals&&t.flatShading===!1?`#define USE_MORPHNORMALS`:``,t.doubleSided?`#define DOUBLE_SIDED`:``,t.flipSided?`#define FLIP_SIDED`:``,t.shadowMapEnabled?`#define USE_SHADOWMAP`:``,t.shadowMapEnabled?`#define `+c:``,t.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,t.logarithmicDepthBuffer?`#define USE_LOGDEPTHBUF`:``,t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?`#define USE_LOGDEPTHBUF_EXT`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_MORPHTARGETS`,`	attribute vec3 morphTarget0;`,`	attribute vec3 morphTarget1;`,`	attribute vec3 morphTarget2;`,`	attribute vec3 morphTarget3;`,`	#ifdef USE_MORPHNORMALS`,`		attribute vec3 morphNormal0;`,`		attribute vec3 morphNormal1;`,`		attribute vec3 morphNormal2;`,`		attribute vec3 morphNormal3;`,`	#else`,`		attribute vec3 morphTarget4;`,`		attribute vec3 morphTarget5;`,`		attribute vec3 morphTarget6;`,`		attribute vec3 morphTarget7;`,`	#endif`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Zi).join(`
`),g=[f,Ac(t),`#define SHADER_NAME `+t.shaderName,m,t.alphaTest?`#define ALPHATEST `+t.alphaTest+(t.alphaTest%1?``:`.0`):``,`#define GAMMA_FACTOR `+d,t.useFog&&t.fog?`#define USE_FOG`:``,t.useFog&&t.fogExp2?`#define FOG_EXP2`:``,t.map?`#define USE_MAP`:``,t.matcap?`#define USE_MATCAP`:``,t.envMap?`#define USE_ENVMAP`:``,t.envMap?`#define `+l:``,t.envMap?`#define `+u:``,t.envMap?`#define `+h:``,t.lightMap?`#define USE_LIGHTMAP`:``,t.aoMap?`#define USE_AOMAP`:``,t.emissiveMap?`#define USE_EMISSIVEMAP`:``,t.bumpMap?`#define USE_BUMPMAP`:``,t.normalMap?`#define USE_NORMALMAP`:``,t.normalMap&&t.objectSpaceNormalMap?`#define OBJECTSPACE_NORMALMAP`:``,t.normalMap&&t.tangentSpaceNormalMap?`#define TANGENTSPACE_NORMALMAP`:``,t.clearcoatMap?`#define USE_CLEARCOATMAP`:``,t.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,t.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,t.specularMap?`#define USE_SPECULARMAP`:``,t.roughnessMap?`#define USE_ROUGHNESSMAP`:``,t.metalnessMap?`#define USE_METALNESSMAP`:``,t.alphaMap?`#define USE_ALPHAMAP`:``,t.sheen?`#define USE_SHEEN`:``,t.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,t.vertexTangents?`#define USE_TANGENT`:``,t.vertexColors||t.instancingColor?`#define USE_COLOR`:``,t.vertexAlphas?`#define USE_COLOR_ALPHA`:``,t.vertexUvs?`#define USE_UV`:``,t.uvsVertexOnly?`#define UVS_VERTEX_ONLY`:``,t.gradientMap?`#define USE_GRADIENTMAP`:``,t.flatShading?`#define FLAT_SHADED`:``,t.doubleSided?`#define DOUBLE_SIDED`:``,t.flipSided?`#define FLIP_SIDED`:``,t.shadowMapEnabled?`#define USE_SHADOWMAP`:``,t.shadowMapEnabled?`#define `+c:``,t.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,t.physicallyCorrectLights?`#define PHYSICALLY_CORRECT_LIGHTS`:``,t.logarithmicDepthBuffer?`#define USE_LOGDEPTHBUF`:``,t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?`#define USE_LOGDEPTHBUF_EXT`:``,(t.extensionShaderTextureLOD||t.envMap)&&t.rendererExtensionShaderTextureLod?`#define TEXTURE_LOD_EXT`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,t.toneMapping!==0?`#define TONE_MAPPING`:``,t.toneMapping!==0?Ee.tonemapping_pars_fragment:``,t.toneMapping!==0?sx(`toneMapping`,t.toneMapping):``,t.dithering?`#define DITHERING`:``,Ee.encodings_pars_fragment,t.map?Ui(`mapTexelToLinear`,t.mapEncoding):``,t.matcap?Ui(`matcapTexelToLinear`,t.matcapEncoding):``,t.envMap?Ui(`envMapTexelToLinear`,t.envMapEncoding):``,t.emissiveMap?Ui(`emissiveMapTexelToLinear`,t.emissiveMapEncoding):``,t.lightMap?Ui(`lightMapTexelToLinear`,t.lightMapEncoding):``,rx(`linearToOutputTexel`,t.outputEncoding),t.depthPacking?`#define DEPTH_PACKING `+t.depthPacking:``,`
`].filter(Zi).join(`
`)),o=Na(o),o=Sc(o,t),o=Ec(o,t),a=Na(a),a=Sc(a,t),a=Ec(a,t),o=Tc(o),a=Tc(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(p=`#version 300 es
`,y=[`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+y,g=[`#define varying in`,t.glslVersion===`300 es`?``:`out highp vec4 pc_fragColor;`,t.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let w=p+y+o,b=p+g+a,E=bc(i,35633,w),v=bc(i,35632,b);if(i.attachShader(x,E),i.attachShader(x,v),t.index0AttributeName!==void 0?i.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(x,0,`position`),i.linkProgram(x),s.debug.checkShaderErrors){let I=i.getProgramInfoLog(x).trim(),N=i.getShaderInfoLog(E).trim(),U=i.getShaderInfoLog(v).trim(),z=!0,R=!0;if(i.getProgramParameter(x,35714)===!1){z=!1;let D=Mc(i,E,`vertex`),F=Mc(i,v,`fragment`);console.error(`THREE.WebGLProgram: shader error: `,i.getError(),`35715`,i.getProgramParameter(x,35715),`gl.getProgramInfoLog`,I,D,F)}else I!==``?console.warn(`THREE.WebGLProgram: gl.getProgramInfoLog()`,I):(N===``||U===``)&&(R=!1);R&&(this.diagnostics={runnable:z,programLog:I,vertexShader:{log:N,prefix:y},fragmentShader:{log:U,prefix:g}})}i.deleteShader(E),i.deleteShader(v);let A;this.getUniforms=function(){return A===void 0&&(A=new gn(i,x)),A};let L;return this.getAttributes=function(){return L===void 0&&(L=lx(i,x)),L},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(x),this.program=void 0},this.name=t.shaderName,this.id=nx++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=E,this.fragmentShader=v,this}function vx(s,e,t,n,i,r){let o=[],a=n.isWebGL2,c=n.logarithmicDepthBuffer,l=n.floatVertexTextures,u=n.maxVertexUniforms,h=n.vertexTextures,d=n.precision,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`},m=[`precision`,`isWebGL2`,`supportsVertexTextures`,`outputEncoding`,`instancing`,`instancingColor`,`map`,`mapEncoding`,`matcap`,`matcapEncoding`,`envMap`,`envMapMode`,`envMapEncoding`,`envMapCubeUV`,`lightMap`,`lightMapEncoding`,`aoMap`,`emissiveMap`,`emissiveMapEncoding`,`bumpMap`,`normalMap`,`objectSpaceNormalMap`,`tangentSpaceNormalMap`,`clearcoatMap`,`clearcoatRoughnessMap`,`clearcoatNormalMap`,`displacementMap`,`specularMap`,`roughnessMap`,`metalnessMap`,`gradientMap`,`alphaMap`,`combine`,`vertexColors`,`vertexAlphas`,`vertexTangents`,`vertexUvs`,`uvsVertexOnly`,`fog`,`useFog`,`fogExp2`,`flatShading`,`sizeAttenuation`,`logarithmicDepthBuffer`,`skinning`,`maxBones`,`useVertexTexture`,`morphTargets`,`morphNormals`,`premultipliedAlpha`,`numDirLights`,`numPointLights`,`numSpotLights`,`numHemiLights`,`numRectAreaLights`,`numDirLightShadows`,`numPointLightShadows`,`numSpotLightShadows`,`shadowMapEnabled`,`shadowMapType`,`toneMapping`,`physicallyCorrectLights`,`alphaTest`,`doubleSided`,`flipSided`,`numClippingPlanes`,`numClipIntersection`,`depthPacking`,`dithering`,`sheen`,`transmissionMap`];function x(v){let L=v.skeleton.bones;if(l)return 1024;{let N=Math.floor((u-20)/4),U=Math.min(N,L.length);return U<L.length?(console.warn(`THREE.WebGLRenderer: Skeleton has `+L.length+` bones. This GPU supports `+U+`.`),0):U}}function y(v){let A;return v&&v.isTexture?A=v.encoding:v&&v.isWebGLRenderTarget?(console.warn(`THREE.WebGLPrograms.getTextureEncodingFromMap: don't use render targets as textures. Use their .texture property instead.`),A=v.texture.encoding):A=vt,A}function g(v,A,L,I,N){let U=I.fog,z=v.isMeshStandardMaterial?I.environment:null,R=e.get(v.envMap||z),D=f[v.type],F=N.isSkinnedMesh?x(N):0;v.precision!==null&&(d=n.getMaxPrecision(v.precision),d!==v.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,v.precision,`not supported, using`,d,`instead.`));let P,X;if(D){let ae=Ot[D];P=ae.vertexShader,X=ae.fragmentShader}else P=v.vertexShader,X=v.fragmentShader;let $=s.getRenderTarget();return{isWebGL2:a,shaderID:D,shaderName:v.type,vertexShader:P,fragmentShader:X,defines:v.defines,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:d,instancing:N.isInstancedMesh===!0,instancingColor:N.isInstancedMesh===!0&&N.instanceColor!==null,supportsVertexTextures:h,outputEncoding:$!==null?y($.texture):s.outputEncoding,map:!!v.map,mapEncoding:y(v.map),matcap:!!v.matcap,matcapEncoding:y(v.matcap),envMap:!!R,envMapMode:R&&R.mapping,envMapEncoding:y(R),envMapCubeUV:!!R&&(R.mapping===306||R.mapping===307),lightMap:!!v.lightMap,lightMapEncoding:y(v.lightMap),aoMap:!!v.aoMap,emissiveMap:!!v.emissiveMap,emissiveMapEncoding:y(v.emissiveMap),bumpMap:!!v.bumpMap,normalMap:!!v.normalMap,objectSpaceNormalMap:v.normalMapType===1,tangentSpaceNormalMap:v.normalMapType===0,clearcoatMap:!!v.clearcoatMap,clearcoatRoughnessMap:!!v.clearcoatRoughnessMap,clearcoatNormalMap:!!v.clearcoatNormalMap,displacementMap:!!v.displacementMap,roughnessMap:!!v.roughnessMap,metalnessMap:!!v.metalnessMap,specularMap:!!v.specularMap,alphaMap:!!v.alphaMap,gradientMap:!!v.gradientMap,sheen:!!v.sheen,transmissionMap:!!v.transmissionMap,combine:v.combine,vertexTangents:v.normalMap&&v.vertexTangents,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&N.geometry&&N.geometry.attributes.color&&N.geometry.attributes.color.itemSize===4,vertexUvs:!!v.map||!!v.bumpMap||!!v.normalMap||!!v.specularMap||!!v.alphaMap||!!v.emissiveMap||!!v.roughnessMap||!!v.metalnessMap||!!v.clearcoatMap||!!v.clearcoatRoughnessMap||!!v.clearcoatNormalMap||!!v.displacementMap||!!v.transmissionMap,uvsVertexOnly:!(v.map||v.bumpMap||v.normalMap||v.specularMap||v.alphaMap||v.emissiveMap||v.roughnessMap||v.metalnessMap||v.clearcoatNormalMap||v.transmissionMap)&&!!v.displacementMap,fog:!!U,useFog:v.fog,fogExp2:U&&U.isFogExp2,flatShading:!!v.flatShading,sizeAttenuation:v.sizeAttenuation,logarithmicDepthBuffer:c,skinning:v.skinning&&F>0,maxBones:F,useVertexTexture:l,morphTargets:v.morphTargets,morphNormals:v.morphNormals,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:s.shadowMap.enabled&&L.length>0,shadowMapType:s.shadowMap.type,toneMapping:v.toneMapped?s.toneMapping:0,physicallyCorrectLights:s.physicallyCorrectLights,premultipliedAlpha:v.premultipliedAlpha,alphaTest:v.alphaTest,doubleSided:v.side===2,flipSided:v.side===1,depthPacking:v.depthPacking!==void 0?v.depthPacking:!1,index0AttributeName:v.index0AttributeName,extensionDerivatives:v.extensions&&v.extensions.derivatives,extensionFragDepth:v.extensions&&v.extensions.fragDepth,extensionDrawBuffers:v.extensions&&v.extensions.drawBuffers,extensionShaderTextureLOD:v.extensions&&v.extensions.shaderTextureLOD,rendererExtensionFragDepth:a||t.has(`EXT_frag_depth`),rendererExtensionDrawBuffers:a||t.has(`WEBGL_draw_buffers`),rendererExtensionShaderTextureLod:a||t.has(`EXT_shader_texture_lod`),customProgramCacheKey:v.customProgramCacheKey()}}function p(v){let A=[];if(v.shaderID?A.push(v.shaderID):(A.push(v.fragmentShader),A.push(v.vertexShader)),v.defines!==void 0)for(let L in v.defines)A.push(L),A.push(v.defines[L]);if(v.isRawShaderMaterial===!1){for(let L=0;L<m.length;L++)A.push(v[m[L]]);A.push(s.outputEncoding),A.push(s.gammaFactor)}return A.push(v.customProgramCacheKey),A.join()}function w(v){let A=f[v.type],L;if(A){let I=Ot[A];L=Rf.clone(I.uniforms)}else L=v.uniforms;return L}function b(v,A){let L;for(let I=0,N=o.length;I<N;I++){let U=o[I];if(U.cacheKey===A){L=U,++L.usedTimes;break}}return L===void 0&&(L=new yx(s,A,v,i),o.push(L)),L}function E(v){if(--v.usedTimes===0){let A=o.indexOf(v);o[A]=o[o.length-1],o.pop(),v.destroy()}}return{getParameters:g,getProgramCacheKey:p,getUniforms:w,acquireProgram:b,releaseProgram:E,programs:o}}function _x(){let s=new WeakMap;function e(r){let o=s.get(r);return o===void 0&&(o={},s.set(r,o)),o}function t(r){s.delete(r)}function n(r,o,a){s.get(r)[o]=a}function i(){s=new WeakMap}return{get:e,remove:t,update:n,dispose:i}}function wx(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.program!==e.program?s.program.id-e.program.id:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function bx(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Lc(s){let e=[],t=0,n=[],i=[],r={id:-1};function o(){t=0,n.length=0,i.length=0}function a(d,f,m,x,y,g){let p=e[t],w=s.get(m);return p===void 0?(p={id:d.id,object:d,geometry:f,material:m,program:w.program||r,groupOrder:x,renderOrder:d.renderOrder,z:y,group:g},e[t]=p):(p.id=d.id,p.object=d,p.geometry=f,p.material=m,p.program=w.program||r,p.groupOrder=x,p.renderOrder=d.renderOrder,p.z=y,p.group=g),t++,p}function c(d,f,m,x,y,g){let p=a(d,f,m,x,y,g);(m.transparent===!0?i:n).push(p)}function l(d,f,m,x,y,g){let p=a(d,f,m,x,y,g);(m.transparent===!0?i:n).unshift(p)}function u(d,f){n.length>1&&n.sort(d||wx),i.length>1&&i.sort(f||bx)}function h(){for(let d=t,f=e.length;d<f;d++){let m=e[d];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.program=null,m.group=null}}return{opaque:n,transparent:i,init:o,push:c,unshift:l,finish:h,sort:u}}function Mx(s){let e=new WeakMap;function t(i,r){let o;return e.has(i)===!1?(o=new Lc(s),e.set(i,[o])):r>=e.get(i).length?(o=new Lc(s),e.get(i).push(o)):o=e.get(i)[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}function Sx(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case`DirectionalLight`:t={direction:new _,color:new se};break;case`SpotLight`:t={position:new _,direction:new _,color:new se,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:t={position:new _,color:new se,distance:0,decay:0};break;case`HemisphereLight`:t={direction:new _,skyColor:new se,groundColor:new se};break;case`RectAreaLight`:t={color:new se,position:new _,halfWidth:new _,halfHeight:new _};break}return s[e.id]=t,t}}}function Ex(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case`DirectionalLight`:t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new W};break;case`SpotLight`:t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new W};break;case`PointLight`:t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new W,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}var Tx=0;function Ax(s,e){return(e.castShadow?1:0)-(s.castShadow?1:0)}function Lx(s,e){let t=new Sx,n=Ex(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotShadow:[],spotShadowMap:[],spotShadowMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[]};for(let u=0;u<9;u++)i.probe.push(new _);let r=new _,o=new le,a=new le;function c(u){let h=0,d=0,f=0;for(let A=0;A<9;A++)i.probe[A].set(0,0,0);let m=0,x=0,y=0,g=0,p=0,w=0,b=0,E=0;u.sort(Ax);for(let A=0,L=u.length;A<L;A++){let I=u[A],N=I.color,U=I.intensity,z=I.distance,R=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=N.r*U,d+=N.g*U,f+=N.b*U;else if(I.isLightProbe)for(let D=0;D<9;D++)i.probe[D].addScaledVector(I.sh.coefficients[D],U);else if(I.isDirectionalLight){let D=t.get(I);if(D.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let F=I.shadow,P=n.get(I);P.shadowBias=F.bias,P.shadowNormalBias=F.normalBias,P.shadowRadius=F.radius,P.shadowMapSize=F.mapSize,i.directionalShadow[m]=P,i.directionalShadowMap[m]=R,i.directionalShadowMatrix[m]=I.shadow.matrix,w++}i.directional[m]=D,m++}else if(I.isSpotLight){let D=t.get(I);if(D.position.setFromMatrixPosition(I.matrixWorld),D.color.copy(N).multiplyScalar(U),D.distance=z,D.coneCos=Math.cos(I.angle),D.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),D.decay=I.decay,I.castShadow){let F=I.shadow,P=n.get(I);P.shadowBias=F.bias,P.shadowNormalBias=F.normalBias,P.shadowRadius=F.radius,P.shadowMapSize=F.mapSize,i.spotShadow[y]=P,i.spotShadowMap[y]=R,i.spotShadowMatrix[y]=I.shadow.matrix,E++}i.spot[y]=D,y++}else if(I.isRectAreaLight){let D=t.get(I);D.color.copy(N).multiplyScalar(U),D.halfWidth.set(I.width*.5,0,0),D.halfHeight.set(0,I.height*.5,0),i.rectArea[g]=D,g++}else if(I.isPointLight){let D=t.get(I);if(D.color.copy(I.color).multiplyScalar(I.intensity),D.distance=I.distance,D.decay=I.decay,I.castShadow){let F=I.shadow,P=n.get(I);P.shadowBias=F.bias,P.shadowNormalBias=F.normalBias,P.shadowRadius=F.radius,P.shadowMapSize=F.mapSize,P.shadowCameraNear=F.camera.near,P.shadowCameraFar=F.camera.far,i.pointShadow[x]=P,i.pointShadowMap[x]=R,i.pointShadowMatrix[x]=I.shadow.matrix,b++}i.point[x]=D,x++}else if(I.isHemisphereLight){let D=t.get(I);D.skyColor.copy(I.color).multiplyScalar(U),D.groundColor.copy(I.groundColor).multiplyScalar(U),i.hemi[p]=D,p++}}g>0&&(e.isWebGL2||s.has(`OES_texture_float_linear`)===!0?(i.rectAreaLTC1=K.LTC_FLOAT_1,i.rectAreaLTC2=K.LTC_FLOAT_2):s.has(`OES_texture_half_float_linear`)===!0?(i.rectAreaLTC1=K.LTC_HALF_1,i.rectAreaLTC2=K.LTC_HALF_2):console.error(`THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.`)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=f;let v=i.hash;(v.directionalLength!==m||v.pointLength!==x||v.spotLength!==y||v.rectAreaLength!==g||v.hemiLength!==p||v.numDirectionalShadows!==w||v.numPointShadows!==b||v.numSpotShadows!==E)&&(i.directional.length=m,i.spot.length=y,i.rectArea.length=g,i.point.length=x,i.hemi.length=p,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=b,i.pointShadowMap.length=b,i.spotShadow.length=E,i.spotShadowMap.length=E,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=b,i.spotShadowMatrix.length=E,v.directionalLength=m,v.pointLength=x,v.spotLength=y,v.rectAreaLength=g,v.hemiLength=p,v.numDirectionalShadows=w,v.numPointShadows=b,v.numSpotShadows=E,i.version=Tx++)}function l(u,h){let d=0,f=0,m=0,x=0,y=0,g=h.matrixWorldInverse;for(let p=0,w=u.length;p<w;p++){let b=u[p];if(b.isDirectionalLight){let E=i.directional[d];E.direction.setFromMatrixPosition(b.matrixWorld),r.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(r),E.direction.transformDirection(g),d++}else if(b.isSpotLight){let E=i.spot[m];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(g),E.direction.setFromMatrixPosition(b.matrixWorld),r.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(r),E.direction.transformDirection(g),m++}else if(b.isRectAreaLight){let E=i.rectArea[x];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(g),a.identity(),o.copy(b.matrixWorld),o.premultiply(g),a.extractRotation(o),E.halfWidth.set(b.width*.5,0,0),E.halfHeight.set(0,b.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),x++}else if(b.isPointLight){let E=i.point[f];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(g),f++}else if(b.isHemisphereLight){let E=i.hemi[y];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(g),E.direction.normalize(),y++}}}return{setup:c,setupView:l,state:i}}function Rc(s,e){let t=new Lx(s,e),n=[],i=[];function r(){n.length=0,i.length=0}function o(h){n.push(h)}function a(h){i.push(h)}function c(){t.setup(n)}function l(h){t.setupView(n,h)}return{init:r,state:{lightsArray:n,shadowsArray:i,lights:t},setupLights:c,setupLightsView:l,pushLight:o,pushShadow:a}}function Rx(s,e){let t=new WeakMap;function n(r,o=0){let a;return t.has(r)===!1?(a=new Rc(s,e),t.set(r,[a])):o>=t.get(r).length?(a=new Rc(s,e),t.get(r).push(a)):a=t.get(r)[o],a}function i(){t=new WeakMap}return{get:n,dispose:i}}var hr=class extends tt{constructor(e){super(),this.type=`MeshDepthMaterial`,this.depthPacking=$d,this.skinning=!1,this.morphTargets=!1,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.skinning=e.skinning,this.morphTargets=e.morphTargets,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}};hr.prototype.isMeshDepthMaterial=!0;var ur=class extends tt{constructor(e){super(),this.type=`MeshDistanceMaterial`,this.referencePosition=new _,this.nearDistance=1,this.farDistance=1e3,this.skinning=!1,this.morphTargets=!1,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.fog=!1,this.setValues(e)}copy(e){return super.copy(e),this.referencePosition.copy(e.referencePosition),this.nearDistance=e.nearDistance,this.farDistance=e.farDistance,this.skinning=e.skinning,this.morphTargets=e.morphTargets,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};ur.prototype.isMeshDistanceMaterial=!0;var Cx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	float mean = 0.0;
	float squared_mean = 0.0;
	float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy ) / resolution ) );
	for ( float i = -1.0; i < 1.0 ; i += SAMPLE_RATE) {
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( i, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, i ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean * HALF_SAMPLE_RATE;
	squared_mean = squared_mean * HALF_SAMPLE_RATE;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;var Px=`void main() {
	gl_Position = vec4( position, 1.0 );
}`;function uu(s,e,t){let n=new wi,i=new W,r=new W,o=new De,a=[],c=[],l={},u=t.maxTextureSize,h={0:1,1:0,2:2},d=new kt({defines:{SAMPLE_RATE:2/8,HALF_SAMPLE_RATE:1/8},uniforms:{shadow_pass:{value:null},resolution:{value:new W},radius:{value:4}},vertexShader:Px,fragmentShader:Cx}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let m=new ue;m.setAttribute(`position`,new Me(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Ye(m,d),y=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1,this.render=function(v,A,L){if(y.enabled===!1||y.autoUpdate===!1&&y.needsUpdate===!1||v.length===0)return;let I=s.getRenderTarget(),N=s.getActiveCubeFace(),U=s.getActiveMipmapLevel(),z=s.state;z.setBlending(0),z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);for(let R=0,D=v.length;R<D;R++){let F=v[R],P=F.shadow;if(P===void 0){console.warn(`THREE.WebGLShadowMap:`,F,`has no shadow.`);continue}if(P.autoUpdate===!1&&P.needsUpdate===!1)continue;i.copy(P.mapSize);let X=P.getFrameExtents();if(i.multiply(X),r.copy(P.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(r.x=Math.floor(u/X.x),i.x=r.x*X.x,P.mapSize.x=r.x),i.y>u&&(r.y=Math.floor(u/X.y),i.y=r.y*X.y,P.mapSize.y=r.y)),P.map===null&&!P.isPointLightShadow&&this.type===3){let Z={minFilter:st,magFilter:st,format:Tt};P.map=new Ht(i.x,i.y,Z),P.map.texture.name=F.name+`.shadowMap`,P.mapPass=new Ht(i.x,i.y,Z),P.camera.updateProjectionMatrix()}if(P.map===null){let Z={minFilter:rt,magFilter:rt,format:Tt};P.map=new Ht(i.x,i.y,Z),P.map.texture.name=F.name+`.shadowMap`,P.camera.updateProjectionMatrix()}s.setRenderTarget(P.map),s.clear();let $=P.getViewportCount();for(let Z=0;Z<$;Z++){let ae=P.getViewport(Z);o.set(r.x*ae.x,r.y*ae.y,r.x*ae.z,r.y*ae.w),z.viewport(o),P.updateMatrices(F,Z),n=P.getFrustum(),E(A,L,P.camera,F,this.type)}!P.isPointLightShadow&&this.type===3&&g(P,L),P.needsUpdate=!1}y.needsUpdate=!1,s.setRenderTarget(I,N,U)};function g(v,A){let L=e.update(x);d.uniforms.shadow_pass.value=v.map.texture,d.uniforms.resolution.value=v.mapSize,d.uniforms.radius.value=v.radius,s.setRenderTarget(v.mapPass),s.clear(),s.renderBufferDirect(A,null,L,d,x,null),f.uniforms.shadow_pass.value=v.mapPass.texture,f.uniforms.resolution.value=v.mapSize,f.uniforms.radius.value=v.radius,s.setRenderTarget(v.map),s.clear(),s.renderBufferDirect(A,null,L,f,x,null)}function p(v,A,L){let I=v<<0|A<<1|L<<2,N=a[I];return N===void 0&&(N=new hr({depthPacking:3201,morphTargets:v,skinning:A}),a[I]=N),N}function w(v,A,L){let I=v<<0|A<<1|L<<2,N=c[I];return N===void 0&&(N=new ur({morphTargets:v,skinning:A}),c[I]=N),N}function b(v,A,L,I,N,U,z){let R=null,D=p,F=v.customDepthMaterial;if(I.isPointLight===!0&&(D=w,F=v.customDistanceMaterial),F===void 0){let P=!1;L.morphTargets===!0&&(P=A.morphAttributes&&A.morphAttributes.position&&A.morphAttributes.position.length>0);let X=!1;v.isSkinnedMesh===!0&&(L.skinning===!0?X=!0:console.warn(`THREE.WebGLShadowMap: THREE.SkinnedMesh with material.skinning set to false:`,v));let $=v.isInstancedMesh===!0;R=D(P,X,$)}else R=F;if(s.localClippingEnabled&&L.clipShadows===!0&&L.clippingPlanes.length!==0){let P=R.uuid,X=L.uuid,$=l[P];$===void 0&&($={},l[P]=$);let Z=$[X];Z===void 0&&(Z=R.clone(),$[X]=Z),R=Z}return R.visible=L.visible,R.wireframe=L.wireframe,z===3?R.side=L.shadowSide!==null?L.shadowSide:L.side:R.side=L.shadowSide!==null?L.shadowSide:h[L.side],R.clipShadows=L.clipShadows,R.clippingPlanes=L.clippingPlanes,R.clipIntersection=L.clipIntersection,R.wireframeLinewidth=L.wireframeLinewidth,R.linewidth=L.linewidth,I.isPointLight===!0&&R.isMeshDistanceMaterial===!0&&(R.referencePosition.setFromMatrixPosition(I.matrixWorld),R.nearDistance=N,R.farDistance=U),R}function E(v,A,L,I,N){if(v.visible===!1)return;if(v.layers.test(A.layers)&&(v.isMesh||v.isLine||v.isPoints)&&(v.castShadow||v.receiveShadow&&N===3)&&(!v.frustumCulled||n.intersectsObject(v))){v.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,v.matrixWorld);let R=e.update(v),D=v.material;if(Array.isArray(D)){let F=R.groups;for(let P=0,X=F.length;P<X;P++){let $=F[P],Z=D[$.materialIndex];if(Z&&Z.visible){let ae=b(v,R,Z,I,L.near,L.far,N);s.renderBufferDirect(L,null,R,ae,v,$)}}}else if(D.visible){let F=b(v,R,D,I,L.near,L.far,N);s.renderBufferDirect(L,null,R,F,v,null)}}let z=v.children;for(let R=0,D=z.length;R<D;R++)E(z[R],A,L,I,N)}}function Ix(s,e,t){let n=t.isWebGL2;function i(){let C=!1,J=new De,Q=null,de=new De(0,0,0,0);return{setMask:function(q){Q!==q&&!C&&(s.colorMask(q,q,q,q),Q=q)},setLocked:function(q){C=q},setClear:function(q,me,Fe,Ze,En){En===!0&&(q*=Ze,me*=Ze,Fe*=Ze),J.set(q,me,Fe,Ze),de.equals(J)===!1&&(s.clearColor(q,me,Fe,Ze),de.copy(J))},reset:function(){C=!1,Q=null,de.set(-1,0,0,0)}}}function r(){let C=!1,J=null,Q=null,de=null;return{setTest:function(q){q?fe(2929):ve(2929)},setMask:function(q){J!==q&&!C&&(s.depthMask(q),J=q)},setFunc:function(q){if(Q!==q){if(q)switch(q){case 0:s.depthFunc(512);break;case 1:s.depthFunc(519);break;case 2:s.depthFunc(513);break;case 3:s.depthFunc(515);break;case 4:s.depthFunc(514);break;case 5:s.depthFunc(518);break;case 6:s.depthFunc(516);break;case 7:s.depthFunc(517);break;default:s.depthFunc(515)}else s.depthFunc(515);Q=q}},setLocked:function(q){C=q},setClear:function(q){de!==q&&(s.clearDepth(q),de=q)},reset:function(){C=!1,J=null,Q=null,de=null}}}function o(){let C=!1,J=null,Q=null,de=null,q=null,me=null,Fe=null,Ze=null,En=null;return{setTest:function(We){C||(We?fe(2960):ve(2960))},setMask:function(We){J!==We&&!C&&(s.stencilMask(We),J=We)},setFunc:function(We,qt,Rt){(Q!==We||de!==qt||q!==Rt)&&(s.stencilFunc(We,qt,Rt),Q=We,de=qt,q=Rt)},setOp:function(We,qt,Rt){(me!==We||Fe!==qt||Ze!==Rt)&&(s.stencilOp(We,qt,Rt),me=We,Fe=qt,Ze=Rt)},setLocked:function(We){C=We},setClear:function(We){En!==We&&(s.clearStencil(We),En=We)},reset:function(){C=!1,J=null,Q=null,de=null,q=null,me=null,Fe=null,Ze=null,En=null}}}let a=new i,c=new r,l=new o,u={},h=null,d={},f=null,m=!1,x=null,y=null,g=null,p=null,w=null,b=null,E=null,v=!1,A=null,L=null,I=null,N=null,U=null,z=s.getParameter(35661),R=!1,D=0,F=s.getParameter(7938);F.indexOf(`WebGL`)!==-1?(D=parseFloat(/^WebGL (\d)/.exec(F)[1]),R=D>=1):F.indexOf(`OpenGL ES`)!==-1&&(D=parseFloat(/^OpenGL ES (\d)/.exec(F)[1]),R=D>=2);let P=null,X={},$=new De(0,0,s.canvas.width,s.canvas.height),Z=new De(0,0,s.canvas.width,s.canvas.height);function ae(C,J,Q){let de=new Uint8Array(4),q=s.createTexture();s.bindTexture(C,q),s.texParameteri(C,10241,9728),s.texParameteri(C,10240,9728);for(let me=0;me<Q;me++)s.texImage2D(J+me,0,6408,1,1,0,6408,5121,de);return q}let re={};re[3553]=ae(3553,3553,1),re[34067]=ae(34067,34069,6),a.setClear(0,0,0,1),c.setClear(1),l.setClear(0),fe(2929),c.setFunc(3),Te(!1),Y(1),fe(2884),Ce(0);function fe(C){u[C]!==!0&&(s.enable(C),u[C]=!0)}function ve(C){u[C]!==!1&&(s.disable(C),u[C]=!1)}function G(C){C!==h&&(s.bindFramebuffer(36160,C),h=C)}function Be(C,J){J===null&&h!==null&&(J=h),d[C]!==J&&(s.bindFramebuffer(C,J),d[C]=J,n&&(C===36009&&(d[36160]=J),C===36160&&(d[36009]=J)))}function Le(C){return f!==C?(s.useProgram(C),f=C,!0):!1}let _e={[100]:32774,[101]:32778,[102]:32779};if(n)_e[103]=32775,_e[104]=32776;else{let C=e.get(`EXT_blend_minmax`);C!==null&&(_e[103]=C.MIN_EXT,_e[104]=C.MAX_EXT)}let pe={[200]:0,[201]:1,[202]:768,[204]:770,[210]:776,[208]:774,[206]:772,[203]:769,[205]:771,[209]:775,[207]:773};function Ce(C,J,Q,de,q,me,Fe,Ze){if(C===0){m===!0&&(ve(3042),m=!1);return}if(m===!1&&(fe(3042),m=!0),C!==5){if(C!==x||Ze!==v){if((y!==100||w!==100)&&(s.blendEquation(32774),y=100,w=100),Ze)switch(C){case 1:s.blendFuncSeparate(1,771,1,771);break;case 2:s.blendFunc(1,1);break;case 3:s.blendFuncSeparate(0,0,769,771);break;case 4:s.blendFuncSeparate(0,768,0,770);break;default:console.error(`THREE.WebGLState: Invalid blending: `,C);break}else switch(C){case 1:s.blendFuncSeparate(770,771,1,771);break;case 2:s.blendFunc(770,1);break;case 3:s.blendFunc(0,769);break;case 4:s.blendFunc(0,768);break;default:console.error(`THREE.WebGLState: Invalid blending: `,C);break}g=null,p=null,b=null,E=null,x=C,v=Ze}return}q=q||J,me=me||Q,Fe=Fe||de,(J!==y||q!==w)&&(s.blendEquationSeparate(_e[J],_e[q]),y=J,w=q),(Q!==g||de!==p||me!==b||Fe!==E)&&(s.blendFuncSeparate(pe[Q],pe[de],pe[me],pe[Fe]),g=Q,p=de,b=me,E=Fe),x=C,v=null}function Se(C,J){C.side===2?ve(2884):fe(2884);let Q=C.side===1;J&&(Q=!Q),Te(Q),C.blending===1&&C.transparent===!1?Ce(0):Ce(C.blending,C.blendEquation,C.blendSrc,C.blendDst,C.blendEquationAlpha,C.blendSrcAlpha,C.blendDstAlpha,C.premultipliedAlpha),c.setFunc(C.depthFunc),c.setTest(C.depthTest),c.setMask(C.depthWrite),a.setMask(C.colorWrite);let de=C.stencilWrite;l.setTest(de),de&&(l.setMask(C.stencilWriteMask),l.setFunc(C.stencilFunc,C.stencilRef,C.stencilFuncMask),l.setOp(C.stencilFail,C.stencilZFail,C.stencilZPass)),ee(C.polygonOffset,C.polygonOffsetFactor,C.polygonOffsetUnits),C.alphaToCoverage===!0?fe(32926):ve(32926)}function Te(C){A!==C&&(C?s.frontFace(2304):s.frontFace(2305),A=C)}function Y(C){C!==0?(fe(2884),C!==L&&(C===1?s.cullFace(1029):C===2?s.cullFace(1028):s.cullFace(1032))):ve(2884),L=C}function j(C){C!==I&&(R&&s.lineWidth(C),I=C)}function ee(C,J,Q){C?(fe(32823),(N!==J||U!==Q)&&(s.polygonOffset(J,Q),N=J,U=Q)):ve(32823)}function he(C){C?fe(3089):ve(3089)}function ne(C){C===void 0&&(C=33984+z-1),P!==C&&(s.activeTexture(C),P=C)}function T(C,J){P===null&&ne();let Q=X[P];Q===void 0&&(Q={type:void 0,texture:void 0},X[P]=Q),(Q.type!==C||Q.texture!==J)&&(s.bindTexture(C,J||re[C]),Q.type=C,Q.texture=J)}function S(){let C=X[P];C!==void 0&&C.type!==void 0&&(s.bindTexture(C.type,null),C.type=void 0,C.texture=void 0)}function k(){try{s.compressedTexImage2D.apply(s,arguments)}catch(C){console.error(`THREE.WebGLState:`,C)}}function V(){try{s.texImage2D.apply(s,arguments)}catch(C){console.error(`THREE.WebGLState:`,C)}}function ie(){try{s.texImage3D.apply(s,arguments)}catch(C){console.error(`THREE.WebGLState:`,C)}}function ce(C){$.equals(C)===!1&&(s.scissor(C.x,C.y,C.z,C.w),$.copy(C))}function Pe(C){Z.equals(C)===!1&&(s.viewport(C.x,C.y,C.z,C.w),Z.copy(C))}function ge(){s.disable(3042),s.disable(2884),s.disable(2929),s.disable(32823),s.disable(3089),s.disable(2960),s.disable(32926),s.blendEquation(32774),s.blendFunc(1,0),s.blendFuncSeparate(1,0,1,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(513),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(519,0,4294967295),s.stencilOp(7680,7680,7680),s.clearStencil(0),s.cullFace(1029),s.frontFace(2305),s.polygonOffset(0,0),s.activeTexture(33984),s.bindFramebuffer(36160,null),n===!0&&(s.bindFramebuffer(36009,null),s.bindFramebuffer(36008,null)),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),u={},P=null,X={},h=null,d={},f=null,m=!1,x=null,y=null,g=null,p=null,w=null,b=null,E=null,v=!1,A=null,L=null,I=null,N=null,U=null,$.set(0,0,s.canvas.width,s.canvas.height),Z.set(0,0,s.canvas.width,s.canvas.height),a.reset(),c.reset(),l.reset()}return{buffers:{color:a,depth:c,stencil:l},enable:fe,disable:ve,bindFramebuffer:Be,bindXRFramebuffer:G,useProgram:Le,setBlending:Ce,setMaterial:Se,setFlipSided:Te,setCullFace:Y,setLineWidth:j,setPolygonOffset:ee,setScissorTest:he,activeTexture:ne,bindTexture:T,unbindTexture:S,compressedTexImage2D:k,texImage2D:V,texImage3D:ie,scissor:ce,viewport:Pe,reset:ge}}function Dx(s,e,t,n,i,r,o){let a=i.isWebGL2,c=i.maxTextures,l=i.maxCubemapSize,u=i.maxTextureSize,h=i.maxSamples,d=new WeakMap,f,m=!1;try{m=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function x(T,S){return m?new OffscreenCanvas(T,S):document.createElementNS(`http://www.w3.org/1999/xhtml`,`canvas`)}function y(T,S,k,V){let ie=1;if((T.width>V||T.height>V)&&(ie=V/Math.max(T.width,T.height)),ie<1||S===!0)if(typeof HTMLImageElement<`u`&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&T instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&T instanceof ImageBitmap){let ce=S?tu:Math.floor,Pe=ce(ie*T.width),ge=ce(ie*T.height);f===void 0&&(f=x(Pe,ge));let C=k?x(Pe,ge):f;return C.width=Pe,C.height=ge,C.getContext(`2d`).drawImage(T,0,0,Pe,ge),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+T.width+`x`+T.height+`) to (`+Pe+`x`+ge+`).`),C}else return`data`in T&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+T.width+`x`+T.height+`).`),T;return T}function g(T){return Ta(T.width)&&Ta(T.height)}function p(T){return a?!1:T.wrapS!==1001||T.wrapT!==1001||T.minFilter!==1003&&T.minFilter!==1006}function w(T,S){return T.generateMipmaps&&S&&T.minFilter!==1003&&T.minFilter!==1006}function b(T,S,k,V){s.generateMipmap(T);let ie=n.get(S);ie.__maxMipLevel=Math.log2(Math.max(k,V))}function E(T,S,k){if(a===!1)return S;if(T!==null){if(s[T]!==void 0)return s[T];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+T+`'`)}let V=S;return S===6403&&(k===5126&&(V=33326),k===5131&&(V=33325),k===5121&&(V=33321)),S===6407&&(k===5126&&(V=34837),k===5131&&(V=34843),k===5121&&(V=32849)),S===6408&&(k===5126&&(V=34836),k===5131&&(V=34842),k===5121&&(V=32856)),(V===33325||V===33326||V===34842||V===34836)&&e.get(`EXT_color_buffer_float`),V}function v(T){return T===1003||T===1004||T===1005?9728:9729}function A(T){let S=T.target;S.removeEventListener(`dispose`,A),I(S),S.isVideoTexture&&d.delete(S),o.memory.textures--}function L(T){let S=T.target;S.removeEventListener(`dispose`,L),N(S),o.memory.textures--}function I(T){let S=n.get(T);S.__webglInit!==void 0&&(s.deleteTexture(S.__webglTexture),n.remove(T))}function N(T){let S=T.texture,k=n.get(T),V=n.get(S);if(T){if(V.__webglTexture!==void 0&&s.deleteTexture(V.__webglTexture),T.depthTexture&&T.depthTexture.dispose(),T.isWebGLCubeRenderTarget)for(let ie=0;ie<6;ie++)s.deleteFramebuffer(k.__webglFramebuffer[ie]),k.__webglDepthbuffer&&s.deleteRenderbuffer(k.__webglDepthbuffer[ie]);else s.deleteFramebuffer(k.__webglFramebuffer),k.__webglDepthbuffer&&s.deleteRenderbuffer(k.__webglDepthbuffer),k.__webglMultisampledFramebuffer&&s.deleteFramebuffer(k.__webglMultisampledFramebuffer),k.__webglColorRenderbuffer&&s.deleteRenderbuffer(k.__webglColorRenderbuffer),k.__webglDepthRenderbuffer&&s.deleteRenderbuffer(k.__webglDepthRenderbuffer);n.remove(S),n.remove(T)}}let U=0;function z(){U=0}function R(){let T=U;return T>=c&&console.warn(`THREE.WebGLTextures: Trying to use `+T+` texture units while this GPU supports only `+c),U+=1,T}function D(T,S){let k=n.get(T);if(T.isVideoTexture&&Y(T),T.version>0&&k.__version!==T.version){let V=T.image;if(V===void 0)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is undefined`);else if(V.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{fe(k,T,S);return}}t.activeTexture(33984+S),t.bindTexture(3553,k.__webglTexture)}function F(T,S){let k=n.get(T);if(T.version>0&&k.__version!==T.version){fe(k,T,S);return}t.activeTexture(33984+S),t.bindTexture(35866,k.__webglTexture)}function P(T,S){let k=n.get(T);if(T.version>0&&k.__version!==T.version){fe(k,T,S);return}t.activeTexture(33984+S),t.bindTexture(32879,k.__webglTexture)}function X(T,S){let k=n.get(T);if(T.version>0&&k.__version!==T.version){ve(k,T,S);return}t.activeTexture(33984+S),t.bindTexture(34067,k.__webglTexture)}let $={[ws]:10497,[yt]:33071,[bs]:33648},Z={[rt]:9728,[Sa]:9984,[Ea]:9986,[st]:9729,[Jh]:9985,[Pr]:9987};function ae(T,S,k){if(k?(s.texParameteri(T,10242,$[S.wrapS]),s.texParameteri(T,10243,$[S.wrapT]),(T===32879||T===35866)&&s.texParameteri(T,32882,$[S.wrapR]),s.texParameteri(T,10240,Z[S.magFilter]),s.texParameteri(T,10241,Z[S.minFilter])):(s.texParameteri(T,10242,33071),s.texParameteri(T,10243,33071),(T===32879||T===35866)&&s.texParameteri(T,32882,33071),(S.wrapS!==1001||S.wrapT!==1001)&&console.warn(`THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping.`),s.texParameteri(T,10240,v(S.magFilter)),s.texParameteri(T,10241,v(S.minFilter)),S.minFilter!==1003&&S.minFilter!==1006&&console.warn(`THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.`)),e.has(`EXT_texture_filter_anisotropic`)===!0){let V=e.get(`EXT_texture_filter_anisotropic`);if(S.type===1015&&e.has(`OES_texture_float_linear`)===!1||a===!1&&S.type===1016&&e.has(`OES_texture_half_float_linear`)===!1)return;(S.anisotropy>1||n.get(S).__currentAnisotropy)&&(s.texParameterf(T,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,i.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy)}}function re(T,S){T.__webglInit===void 0&&(T.__webglInit=!0,S.addEventListener(`dispose`,A),T.__webglTexture=s.createTexture(),o.memory.textures++)}function fe(T,S,k){let V=3553;S.isDataTexture2DArray&&(V=35866),S.isDataTexture3D&&(V=32879),re(T,S),t.activeTexture(33984+k),t.bindTexture(V,T.__webglTexture),s.pixelStorei(37440,S.flipY),s.pixelStorei(37441,S.premultiplyAlpha),s.pixelStorei(3317,S.unpackAlignment),s.pixelStorei(37443,0);let ie=p(S)&&g(S.image)===!1,ce=y(S.image,ie,!1,u),Pe=g(ce)||a,ge=r.convert(S.format),C=r.convert(S.type),J=E(S.internalFormat,ge,C);ae(V,S,Pe);let Q,de=S.mipmaps;if(S.isDepthTexture)J=6402,a?S.type===1015?J=36012:S.type===1014?J=33190:S.type===1020?J=35056:J=33189:S.type===1015&&console.error(`WebGLRenderer: Floating point depth texture requires WebGL2.`),S.format===1026&&J===6402&&S.type!==1012&&S.type!==1014&&(console.warn(`THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture.`),S.type=1012,C=r.convert(S.type)),S.format===1027&&J===6402&&(J=34041,S.type!==1020&&(console.warn(`THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture.`),S.type=1020,C=r.convert(S.type))),t.texImage2D(3553,0,J,ce.width,ce.height,0,ge,C,null);else if(S.isDataTexture)if(de.length>0&&Pe){for(let q=0,me=de.length;q<me;q++)Q=de[q],t.texImage2D(3553,q,J,Q.width,Q.height,0,ge,C,Q.data);S.generateMipmaps=!1,T.__maxMipLevel=de.length-1}else t.texImage2D(3553,0,J,ce.width,ce.height,0,ge,C,ce.data),T.__maxMipLevel=0;else if(S.isCompressedTexture){for(let q=0,me=de.length;q<me;q++)Q=de[q],S.format!==1023&&S.format!==1022?ge!==null?t.compressedTexImage2D(3553,q,J,Q.width,Q.height,0,Q.data):console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):t.texImage2D(3553,q,J,Q.width,Q.height,0,ge,C,Q.data);T.__maxMipLevel=de.length-1}else if(S.isDataTexture2DArray)t.texImage3D(35866,0,J,ce.width,ce.height,ce.depth,0,ge,C,ce.data),T.__maxMipLevel=0;else if(S.isDataTexture3D)t.texImage3D(32879,0,J,ce.width,ce.height,ce.depth,0,ge,C,ce.data),T.__maxMipLevel=0;else if(de.length>0&&Pe){for(let q=0,me=de.length;q<me;q++)Q=de[q],t.texImage2D(3553,q,J,ge,C,Q);S.generateMipmaps=!1,T.__maxMipLevel=de.length-1}else t.texImage2D(3553,0,J,ge,C,ce),T.__maxMipLevel=0;w(S,Pe)&&b(V,S,ce.width,ce.height),T.__version=S.version,S.onUpdate&&S.onUpdate(S)}function ve(T,S,k){if(S.image.length!==6)return;re(T,S),t.activeTexture(33984+k),t.bindTexture(34067,T.__webglTexture),s.pixelStorei(37440,S.flipY),s.pixelStorei(37441,S.premultiplyAlpha),s.pixelStorei(3317,S.unpackAlignment),s.pixelStorei(37443,0);let V=S&&(S.isCompressedTexture||S.image[0].isCompressedTexture),ie=S.image[0]&&S.image[0].isDataTexture,ce=[];for(let q=0;q<6;q++)!V&&!ie?ce[q]=y(S.image[q],!1,!0,l):ce[q]=ie?S.image[q].image:S.image[q];let Pe=ce[0],ge=g(Pe)||a,C=r.convert(S.format),J=r.convert(S.type),Q=E(S.internalFormat,C,J);ae(34067,S,ge);let de;if(V){for(let q=0;q<6;q++){de=ce[q].mipmaps;for(let me=0;me<de.length;me++){let Fe=de[me];S.format!==1023&&S.format!==1022?C!==null?t.compressedTexImage2D(34069+q,me,Q,Fe.width,Fe.height,0,Fe.data):console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):t.texImage2D(34069+q,me,Q,Fe.width,Fe.height,0,C,J,Fe.data)}}T.__maxMipLevel=de.length-1}else{de=S.mipmaps;for(let q=0;q<6;q++)if(ie){t.texImage2D(34069+q,0,Q,ce[q].width,ce[q].height,0,C,J,ce[q].data);for(let me=0;me<de.length;me++){let Ze=de[me].image[q].image;t.texImage2D(34069+q,me+1,Q,Ze.width,Ze.height,0,C,J,Ze.data)}}else{t.texImage2D(34069+q,0,Q,C,J,ce[q]);for(let me=0;me<de.length;me++){let Fe=de[me];t.texImage2D(34069+q,me+1,Q,C,J,Fe.image[q])}}T.__maxMipLevel=de.length}w(S,ge)&&b(34067,S,Pe.width,Pe.height),T.__version=S.version,S.onUpdate&&S.onUpdate(S)}function G(T,S,k,V){let ie=S.texture,ce=r.convert(ie.format),Pe=r.convert(ie.type),ge=E(ie.internalFormat,ce,Pe);V===32879||V===35866?t.texImage3D(V,0,ge,S.width,S.height,S.depth,0,ce,Pe,null):t.texImage2D(V,0,ge,S.width,S.height,0,ce,Pe,null),t.bindFramebuffer(36160,T),s.framebufferTexture2D(36160,k,V,n.get(ie).__webglTexture,0),t.bindFramebuffer(36160,null)}function Be(T,S,k){if(s.bindRenderbuffer(36161,T),S.depthBuffer&&!S.stencilBuffer){let V=33189;if(k){let ie=S.depthTexture;ie&&ie.isDepthTexture&&(ie.type===1015?V=36012:ie.type===1014&&(V=33190));let ce=Te(S);s.renderbufferStorageMultisample(36161,ce,V,S.width,S.height)}else s.renderbufferStorage(36161,V,S.width,S.height);s.framebufferRenderbuffer(36160,36096,36161,T)}else if(S.depthBuffer&&S.stencilBuffer){if(k){let V=Te(S);s.renderbufferStorageMultisample(36161,V,35056,S.width,S.height)}else s.renderbufferStorage(36161,34041,S.width,S.height);s.framebufferRenderbuffer(36160,33306,36161,T)}else{let V=S.texture,ie=r.convert(V.format),ce=r.convert(V.type),Pe=E(V.internalFormat,ie,ce);if(k){let ge=Te(S);s.renderbufferStorageMultisample(36161,ge,Pe,S.width,S.height)}else s.renderbufferStorage(36161,Pe,S.width,S.height)}s.bindRenderbuffer(36161,null)}function Le(T,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error(`Depth Texture with cube render targets is not supported`);if(t.bindFramebuffer(36160,T),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);(!n.get(S.depthTexture).__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),D(S.depthTexture,0);let V=n.get(S.depthTexture).__webglTexture;if(S.depthTexture.format===1026)s.framebufferTexture2D(36160,36096,3553,V,0);else if(S.depthTexture.format===1027)s.framebufferTexture2D(36160,33306,3553,V,0);else throw new Error(`Unknown depthTexture format`)}function _e(T){let S=n.get(T),k=T.isWebGLCubeRenderTarget===!0;if(T.depthTexture){if(k)throw new Error(`target.depthTexture not supported in Cube render targets`);Le(S.__webglFramebuffer,T)}else if(k){S.__webglDepthbuffer=[];for(let V=0;V<6;V++)t.bindFramebuffer(36160,S.__webglFramebuffer[V]),S.__webglDepthbuffer[V]=s.createRenderbuffer(),Be(S.__webglDepthbuffer[V],T,!1)}else t.bindFramebuffer(36160,S.__webglFramebuffer),S.__webglDepthbuffer=s.createRenderbuffer(),Be(S.__webglDepthbuffer,T,!1);t.bindFramebuffer(36160,null)}function pe(T){let S=T.texture,k=n.get(T),V=n.get(S);T.addEventListener(`dispose`,L),V.__webglTexture=s.createTexture(),V.__version=S.version,o.memory.textures++;let ie=T.isWebGLCubeRenderTarget===!0,ce=T.isWebGLMultisampleRenderTarget===!0,Pe=S.isDataTexture3D||S.isDataTexture2DArray,ge=g(T)||a;if(a&&S.format===1022&&(S.type===1015||S.type===1016)&&(S.format=1023,console.warn(`THREE.WebGLRenderer: Rendering to textures with RGB format is not supported. Using RGBA format instead.`)),ie){k.__webglFramebuffer=[];for(let C=0;C<6;C++)k.__webglFramebuffer[C]=s.createFramebuffer()}else if(k.__webglFramebuffer=s.createFramebuffer(),ce)if(a){k.__webglMultisampledFramebuffer=s.createFramebuffer(),k.__webglColorRenderbuffer=s.createRenderbuffer(),s.bindRenderbuffer(36161,k.__webglColorRenderbuffer);let C=r.convert(S.format),J=r.convert(S.type),Q=E(S.internalFormat,C,J),de=Te(T);s.renderbufferStorageMultisample(36161,de,Q,T.width,T.height),t.bindFramebuffer(36160,k.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(36160,36064,36161,k.__webglColorRenderbuffer),s.bindRenderbuffer(36161,null),T.depthBuffer&&(k.__webglDepthRenderbuffer=s.createRenderbuffer(),Be(k.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(36160,null)}else console.warn(`THREE.WebGLRenderer: WebGLMultisampleRenderTarget can only be used with WebGL2.`);if(ie){t.bindTexture(34067,V.__webglTexture),ae(34067,S,ge);for(let C=0;C<6;C++)G(k.__webglFramebuffer[C],T,36064,34069+C);w(S,ge)&&b(34067,S,T.width,T.height),t.bindTexture(34067,null)}else{let C=3553;Pe&&(a?C=S.isDataTexture3D?32879:35866:console.warn(`THREE.DataTexture3D and THREE.DataTexture2DArray only supported with WebGL2.`)),t.bindTexture(C,V.__webglTexture),ae(C,S,ge),G(k.__webglFramebuffer,T,36064,C),w(S,ge)&&b(3553,S,T.width,T.height),t.bindTexture(3553,null)}T.depthBuffer&&_e(T)}function Ce(T){let S=T.texture;if(w(S,g(T)||a)){let V=T.isWebGLCubeRenderTarget?34067:3553,ie=n.get(S).__webglTexture;t.bindTexture(V,ie),b(V,S,T.width,T.height),t.bindTexture(V,null)}}function Se(T){if(T.isWebGLMultisampleRenderTarget)if(a){let S=T.width,k=T.height,V=16384;T.depthBuffer&&(V|=256),T.stencilBuffer&&(V|=1024);let ie=n.get(T);t.bindFramebuffer(36008,ie.__webglMultisampledFramebuffer),t.bindFramebuffer(36009,ie.__webglFramebuffer),s.blitFramebuffer(0,0,S,k,0,0,S,k,V,9728),t.bindFramebuffer(36008,null),t.bindFramebuffer(36009,ie.__webglMultisampledFramebuffer)}else console.warn(`THREE.WebGLRenderer: WebGLMultisampleRenderTarget can only be used with WebGL2.`)}function Te(T){return a&&T.isWebGLMultisampleRenderTarget?Math.min(h,T.samples):0}function Y(T){let S=o.render.frame;d.get(T)!==S&&(d.set(T,S),T.update())}let j=!1,ee=!1;function he(T,S){T&&T.isWebGLRenderTarget&&(j===!1&&(console.warn(`THREE.WebGLTextures.safeSetTexture2D: don't use render targets as textures. Use their .texture property instead.`),j=!0),T=T.texture),D(T,S)}function ne(T,S){T&&T.isWebGLCubeRenderTarget&&(ee===!1&&(console.warn(`THREE.WebGLTextures.safeSetTextureCube: don't use cube render targets as textures. Use their .texture property instead.`),ee=!0),T=T.texture),X(T,S)}this.allocateTextureUnit=R,this.resetTextureUnits=z,this.setTexture2D=D,this.setTexture2DArray=F,this.setTexture3D=P,this.setTextureCube=X,this.setupRenderTarget=pe,this.updateRenderTargetMipmap=Ce,this.updateMultisampleRenderTarget=Se,this.safeSetTexture2D=he,this.safeSetTextureCube=ne}function Fx(s,e,t){let n=t.isWebGL2;function i(r){let o;if(r===1009)return 5121;if(r===1017)return 32819;if(r===1018)return 32820;if(r===1019)return 33635;if(r===1010)return 5120;if(r===1011)return 5122;if(r===1012)return 5123;if(r===1013)return 5124;if(r===1014)return 5125;if(r===1015)return 5126;if(r===1016)return n?5131:(o=e.get(`OES_texture_half_float`),o!==null?o.HALF_FLOAT_OES:null);if(r===1021)return 6406;if(r===1022)return 6407;if(r===1023)return 6408;if(r===1024)return 6409;if(r===1025)return 6410;if(r===1026)return 6402;if(r===1027)return 34041;if(r===1028)return 6403;if(r===1029)return 36244;if(r===1030)return 33319;if(r===1031)return 33320;if(r===1032)return 36248;if(r===1033)return 36249;if(r===33776||r===33777||r===33778||r===33779)if(o=e.get(`WEBGL_compressed_texture_s3tc`),o!==null){if(r===33776)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===33777)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===33778)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===33779)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===35840||r===35841||r===35842||r===35843)if(o=e.get(`WEBGL_compressed_texture_pvrtc`),o!==null){if(r===35840)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===35841)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===35842)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===35843)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===36196)return o=e.get(`WEBGL_compressed_texture_etc1`),o!==null?o.COMPRESSED_RGB_ETC1_WEBGL:null;if((r===37492||r===37496)&&(o=e.get(`WEBGL_compressed_texture_etc`),o!==null)){if(r===37492)return o.COMPRESSED_RGB8_ETC2;if(r===37496)return o.COMPRESSED_RGBA8_ETC2_EAC}if(r===37808||r===37809||r===37810||r===37811||r===37812||r===37813||r===37814||r===37815||r===37816||r===37817||r===37818||r===37819||r===37820||r===37821||r===37840||r===37841||r===37842||r===37843||r===37844||r===37845||r===37846||r===37847||r===37848||r===37849||r===37850||r===37851||r===37852||r===37853)return o=e.get(`WEBGL_compressed_texture_astc`),o!==null?r:null;if(r===36492)return o=e.get(`EXT_texture_compression_bptc`),o!==null?r:null;if(r===1020)return n?34042:(o=e.get(`WEBGL_depth_texture`),o!==null?o.UNSIGNED_INT_24_8_WEBGL:null)}return{convert:i}}var Ps=class extends Ke{constructor(e=[]){super(),this.cameras=e}};Ps.prototype.isArrayCamera=!0;var pn=class extends Ae{constructor(){super(),this.type=`Group`}};pn.prototype.isGroup=!0;var Nx={type:`move`};var Qi=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new pn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new pn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new _,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new _),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new pn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new _,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new _),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`)if(a!==null&&(i=t.getPose(e.targetRaySpace,n),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Nx))),l&&e.hand){o=!0;for(let x of e.hand.values()){let y=t.getJointPose(x,n);if(l.joints[x.jointName]===void 0){let p=new pn;p.matrixAutoUpdate=!1,p.visible=!1,l.joints[x.jointName]=p,l.add(p)}let g=l.joints[x.jointName];y!==null&&(g.matrix.fromArray(y.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.jointRadius=y.radius),g.visible=y!==null}let u=l.joints[`index-finger-tip`],h=l.joints[`thumb-tip`],d=u.position.distanceTo(h.position);l.inputState.pinching&&d>.025?(l.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=.015&&(l.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));return a!==null&&(a.visible=i!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}};var Ba=class extends en{constructor(e,t){super();let n=this,i=e.state,r=null,o=1,a=null,c=`local-floor`,l=null,u=[],h=new Map,d=new Ke;d.layers.enable(1),d.viewport=new De;let f=new Ke;f.layers.enable(2),f.viewport=new De;let m=[d,f],x=new Ps;x.layers.enable(1),x.layers.enable(2);let y=null,g=null;this.enabled=!1,this.isPresenting=!1,this.getController=function(z){let R=u[z];return R===void 0&&(R=new Qi,u[z]=R),R.getTargetRaySpace()},this.getControllerGrip=function(z){let R=u[z];return R===void 0&&(R=new Qi,u[z]=R),R.getGripSpace()},this.getHand=function(z){let R=u[z];return R===void 0&&(R=new Qi,u[z]=R),R.getHandSpace()};function p(z){let R=h.get(z.inputSource);R&&R.dispatchEvent({type:z.type,data:z.inputSource})}function w(){h.forEach(function(z,R){z.disconnect(R)}),h.clear(),y=null,g=null,i.bindXRFramebuffer(null),e.setRenderTarget(e.getRenderTarget()),U.stop(),n.isPresenting=!1,n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(z){o=z,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(z){c=z,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return a},this.getSession=function(){return r},this.setSession=async function(z){if(r=z,r!==null){r.addEventListener(`select`,p),r.addEventListener(`selectstart`,p),r.addEventListener(`selectend`,p),r.addEventListener(`squeeze`,p),r.addEventListener(`squeezestart`,p),r.addEventListener(`squeezeend`,p),r.addEventListener(`end`,w),r.addEventListener(`inputsourceschange`,b);let R=t.getContextAttributes();R.xrCompatible!==!0&&await t.makeXRCompatible();let D={antialias:R.antialias,alpha:R.alpha,depth:R.depth,stencil:R.stencil,framebufferScaleFactor:o},F=new XRWebGLLayer(r,t,D);r.updateRenderState({baseLayer:F}),a=await r.requestReferenceSpace(c),U.setContext(r),U.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}};function b(z){let R=r.inputSources;for(let D=0;D<u.length;D++)h.set(R[D],u[D]);for(let D=0;D<z.removed.length;D++){let F=z.removed[D],P=h.get(F);P&&(P.dispatchEvent({type:`disconnected`,data:F}),h.delete(F))}for(let D=0;D<z.added.length;D++){let F=z.added[D],P=h.get(F);P&&P.dispatchEvent({type:`connected`,data:F})}}let E=new _,v=new _;function A(z,R,D){E.setFromMatrixPosition(R.matrixWorld),v.setFromMatrixPosition(D.matrixWorld);let F=E.distanceTo(v),P=R.projectionMatrix.elements,X=D.projectionMatrix.elements,$=P[14]/(P[10]-1),Z=P[14]/(P[10]+1),ae=(P[9]+1)/P[5],re=(P[9]-1)/P[5],fe=(P[8]-1)/P[0],ve=(X[8]+1)/X[0],G=$*fe,Be=$*ve,Le=F/(-fe+ve),_e=Le*-fe;R.matrixWorld.decompose(z.position,z.quaternion,z.scale),z.translateX(_e),z.translateZ(Le),z.matrixWorld.compose(z.position,z.quaternion,z.scale),z.matrixWorldInverse.copy(z.matrixWorld).invert();let pe=$+Le,Ce=Z+Le,Se=G-_e,Te=Be+(F-_e),Y=ae*Z/Ce*pe,j=re*Z/Ce*pe;z.projectionMatrix.makePerspective(Se,Te,Y,j,pe,Ce)}function L(z,R){R===null?z.matrixWorld.copy(z.matrix):z.matrixWorld.multiplyMatrices(R.matrixWorld,z.matrix),z.matrixWorldInverse.copy(z.matrixWorld).invert()}this.getCamera=function(z){x.near=f.near=d.near=z.near,x.far=f.far=d.far=z.far,(y!==x.near||g!==x.far)&&(r.updateRenderState({depthNear:x.near,depthFar:x.far}),y=x.near,g=x.far);let R=z.parent,D=x.cameras;L(x,R);for(let P=0;P<D.length;P++)L(D[P],R);z.matrixWorld.copy(x.matrixWorld),z.matrix.copy(x.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale);let F=z.children;for(let P=0,X=F.length;P<X;P++)F[P].updateMatrixWorld(!0);return D.length===2?A(x,d,f):x.projectionMatrix.copy(d.projectionMatrix),x};let I=null;function N(z,R){if(l=R.getViewerPose(a),l!==null){let F=l.views,P=r.renderState.baseLayer;i.bindXRFramebuffer(P.framebuffer);let X=!1;F.length!==x.cameras.length&&(x.cameras.length=0,X=!0);for(let $=0;$<F.length;$++){let Z=F[$],ae=P.getViewport(Z),re=m[$];re.matrix.fromArray(Z.transform.matrix),re.projectionMatrix.fromArray(Z.projectionMatrix),re.viewport.set(ae.x,ae.y,ae.width,ae.height),$===0&&x.matrix.copy(re.matrix),X===!0&&x.cameras.push(re)}}let D=r.inputSources;for(let F=0;F<u.length;F++){let P=u[F],X=D[F];P.update(X,R,a)}I&&I(z,R)}let U=new iu;U.setAnimationLoop(N),this.setAnimationLoop=function(z){I=z},this.dispose=function(){}}};function Bx(s){function e(g,p){g.fogColor.value.copy(p.color),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function t(g,p,w,b){p.isMeshBasicMaterial?n(g,p):p.isMeshLambertMaterial?(n(g,p),c(g,p)):p.isMeshToonMaterial?(n(g,p),u(g,p)):p.isMeshPhongMaterial?(n(g,p),l(g,p)):p.isMeshStandardMaterial?(n(g,p),p.isMeshPhysicalMaterial?d(g,p):h(g,p)):p.isMeshMatcapMaterial?(n(g,p),f(g,p)):p.isMeshDepthMaterial?(n(g,p),m(g,p)):p.isMeshDistanceMaterial?(n(g,p),x(g,p)):p.isMeshNormalMaterial?(n(g,p),y(g,p)):p.isLineBasicMaterial?(i(g,p),p.isLineDashedMaterial&&r(g,p)):p.isPointsMaterial?o(g,p,w,b):p.isSpriteMaterial?a(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function n(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map),p.alphaMap&&(g.alphaMap.value=p.alphaMap),p.specularMap&&(g.specularMap.value=p.specularMap);let w=s.get(p).envMap;if(w){g.envMap.value=w,g.flipEnvMap.value=w.isCubeTexture&&w._needsFlipEnvMap?-1:1,g.reflectivity.value=p.reflectivity,g.refractionRatio.value=p.refractionRatio;let v=s.get(w).__maxMipLevel;v!==void 0&&(g.maxMipLevel.value=v)}p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity);let b;p.map?b=p.map:p.specularMap?b=p.specularMap:p.displacementMap?b=p.displacementMap:p.normalMap?b=p.normalMap:p.bumpMap?b=p.bumpMap:p.roughnessMap?b=p.roughnessMap:p.metalnessMap?b=p.metalnessMap:p.alphaMap?b=p.alphaMap:p.emissiveMap?b=p.emissiveMap:p.clearcoatMap?b=p.clearcoatMap:p.clearcoatNormalMap?b=p.clearcoatNormalMap:p.clearcoatRoughnessMap&&(b=p.clearcoatRoughnessMap),b!==void 0&&(b.isWebGLRenderTarget&&(b=b.texture),b.matrixAutoUpdate===!0&&b.updateMatrix(),g.uvTransform.value.copy(b.matrix));let E;p.aoMap?E=p.aoMap:p.lightMap&&(E=p.lightMap),E!==void 0&&(E.isWebGLRenderTarget&&(E=E.texture),E.matrixAutoUpdate===!0&&E.updateMatrix(),g.uv2Transform.value.copy(E.matrix))}function i(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity}function r(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function o(g,p,w,b){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*w,g.scale.value=b*.5,p.map&&(g.map.value=p.map),p.alphaMap&&(g.alphaMap.value=p.alphaMap);let E;p.map?E=p.map:p.alphaMap&&(E=p.alphaMap),E!==void 0&&(E.matrixAutoUpdate===!0&&E.updateMatrix(),g.uvTransform.value.copy(E.matrix))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map),p.alphaMap&&(g.alphaMap.value=p.alphaMap);let w;p.map?w=p.map:p.alphaMap&&(w=p.alphaMap),w!==void 0&&(w.matrixAutoUpdate===!0&&w.updateMatrix(),g.uvTransform.value.copy(w.matrix))}function c(g,p){p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap)}function l(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap),p.bumpMap&&(g.bumpMap.value=p.bumpMap,g.bumpScale.value=p.bumpScale,p.side===1&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,g.normalScale.value.copy(p.normalScale),p.side===1&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias)}function u(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap),p.bumpMap&&(g.bumpMap.value=p.bumpMap,g.bumpScale.value=p.bumpScale,p.side===1&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,g.normalScale.value.copy(p.normalScale),p.side===1&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias)}function h(g,p){g.roughness.value=p.roughness,g.metalness.value=p.metalness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap),p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap),p.bumpMap&&(g.bumpMap.value=p.bumpMap,g.bumpScale.value=p.bumpScale,p.side===1&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,g.normalScale.value.copy(p.normalScale),p.side===1&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),s.get(p).envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function d(g,p){h(g,p),g.reflectivity.value=p.reflectivity,g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.sheen&&g.sheen.value.copy(p.sheen),p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap),p.clearcoatNormalMap&&(g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),g.clearcoatNormalMap.value=p.clearcoatNormalMap,p.side===1&&g.clearcoatNormalScale.value.negate()),g.transmission.value=p.transmission,p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap)}function f(g,p){p.matcap&&(g.matcap.value=p.matcap),p.bumpMap&&(g.bumpMap.value=p.bumpMap,g.bumpScale.value=p.bumpScale,p.side===1&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,g.normalScale.value.copy(p.normalScale),p.side===1&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias)}function m(g,p){p.displacementMap&&(g.displacementMap.value=p.displacementMap,g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias)}function x(g,p){p.displacementMap&&(g.displacementMap.value=p.displacementMap,g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),g.referencePosition.value.copy(p.referencePosition),g.nearDistance.value=p.nearDistance,g.farDistance.value=p.farDistance}function y(g,p){p.bumpMap&&(g.bumpMap.value=p.bumpMap,g.bumpScale.value=p.bumpScale,p.side===1&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,g.normalScale.value.copy(p.normalScale),p.side===1&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias)}return{refreshFogUniforms:e,refreshMaterialUniforms:t}}function zx(){let s=document.createElementNS(`http://www.w3.org/1999/xhtml`,`canvas`);return s.style.display=`block`,s}function Oe(s){s=s||{};let e=s.canvas!==void 0?s.canvas:zx(),t=s.context!==void 0?s.context:null,n=s.alpha!==void 0?s.alpha:!1,i=s.depth!==void 0?s.depth:!0,r=s.stencil!==void 0?s.stencil:!0,o=s.antialias!==void 0?s.antialias:!1,a=s.premultipliedAlpha!==void 0?s.premultipliedAlpha:!0,c=s.preserveDrawingBuffer!==void 0?s.preserveDrawingBuffer:!1,l=s.powerPreference!==void 0?s.powerPreference:`default`,u=s.failIfMajorPerformanceCaveat!==void 0?s.failIfMajorPerformanceCaveat:!1,h=null,d=null,f=[],m=[];this.domElement=e,this.debug={checkShaderErrors:!0},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.gammaFactor=2,this.outputEncoding=vt,this.physicallyCorrectLights=!1,this.toneMapping=0,this.toneMappingExposure=1;let x=this,y=!1,g=0,p=0,w=null,b=-1,E=null,v=new De,A=new De,L=null,I=e.width,N=e.height,U=1,z=null,R=null,D=new De(0,0,I,N),F=new De(0,0,I,N),P=!1,X=new wi,$=!1,Z=!1,ae=new le,re=new _,fe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function ve(){return w===null?U:1}let G=t;function Be(M,O){for(let B=0;B<M.length;B++){let H=M[B],te=e.getContext(H,O);if(te!==null)return te}return null}try{let M={alpha:n,depth:i,stencil:r,antialias:o,premultipliedAlpha:a,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(e.addEventListener(`webglcontextlost`,me,!1),e.addEventListener(`webglcontextrestored`,Fe,!1),G===null){let O=[`webgl2`,`webgl`,`experimental-webgl`];if(x.isWebGL1Renderer===!0&&O.shift(),G=Be(O,M),G===null)throw Be(O)?new Error(`Error creating WebGL context with your selected attributes.`):new Error(`Error creating WebGL context.`)}G.getShaderPrecisionFormat===void 0&&(G.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(M){throw console.error(`THREE.WebGLRenderer: `+M.message),M}let Le,_e,pe,Ce,Se,Te,Y,j,ee,he,ne,T,S,k,V,ie,ce,Pe,ge,C,J,Q;function de(){Le=new og(G),_e=new ig(G,Le,s),Le.init(_e),J=new Fx(G,Le,_e),pe=new Ix(G,Le,_e),Ce=new cg(G),Se=new _x,Te=new Dx(G,Le,pe,Se,_e,J,Ce),Y=new sg(x),j=new If(G,_e),Q=new tg(G,Le,j,_e),ee=new ag(G,j,Ce,Q),he=new fg(G,ee,j,Ce),Pe=new dg(G),V=new rg(Se),ne=new vx(x,Y,Le,_e,Q,V),T=new Bx(Se),S=new Mx(Se),k=new Rx(Le,_e),ce=new eg(x,Y,pe,he,a),ie=new uu(x,he,_e),ge=new ng(G,Le,Ce,_e),C=new lg(G,Le,Ce,_e),Ce.programs=ne.programs,x.capabilities=_e,x.extensions=Le,x.properties=Se,x.renderLists=S,x.shadowMap=ie,x.state=pe,x.info=Ce}de();let q=new Ba(x,G);this.xr=q,this.getContext=function(){return G},this.getContextAttributes=function(){return G.getContextAttributes()},this.forceContextLoss=function(){let M=Le.get(`WEBGL_lose_context`);M&&M.loseContext()},this.forceContextRestore=function(){let M=Le.get(`WEBGL_lose_context`);M&&M.restoreContext()},this.getPixelRatio=function(){return U},this.setPixelRatio=function(M){M!==void 0&&(U=M,this.setSize(I,N,!1))},this.getSize=function(M){return M===void 0&&(console.warn(`WebGLRenderer: .getsize() now requires a Vector2 as an argument`),M=new W),M.set(I,N)},this.setSize=function(M,O,B){if(q.isPresenting){console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`);return}I=M,N=O,e.width=Math.floor(M*U),e.height=Math.floor(O*U),B!==!1&&(e.style.width=M+`px`,e.style.height=O+`px`),this.setViewport(0,0,M,O)},this.getDrawingBufferSize=function(M){return M===void 0&&(console.warn(`WebGLRenderer: .getdrawingBufferSize() now requires a Vector2 as an argument`),M=new W),M.set(I*U,N*U).floor()},this.setDrawingBufferSize=function(M,O,B){I=M,N=O,U=B,e.width=Math.floor(M*B),e.height=Math.floor(O*B),this.setViewport(0,0,M,O)},this.getCurrentViewport=function(M){return M===void 0&&(console.warn(`WebGLRenderer: .getCurrentViewport() now requires a Vector4 as an argument`),M=new De),M.copy(v)},this.getViewport=function(M){return M.copy(D)},this.setViewport=function(M,O,B,H){M.isVector4?D.set(M.x,M.y,M.z,M.w):D.set(M,O,B,H),pe.viewport(v.copy(D).multiplyScalar(U).floor())},this.getScissor=function(M){return M.copy(F)},this.setScissor=function(M,O,B,H){M.isVector4?F.set(M.x,M.y,M.z,M.w):F.set(M,O,B,H),pe.scissor(A.copy(F).multiplyScalar(U).floor())},this.getScissorTest=function(){return P},this.setScissorTest=function(M){pe.setScissorTest(P=M)},this.setOpaqueSort=function(M){z=M},this.setTransparentSort=function(M){R=M},this.getClearColor=function(M){return M===void 0&&(console.warn(`WebGLRenderer: .getClearColor() now requires a Color as an argument`),M=new se),M.copy(ce.getClearColor())},this.setClearColor=function(){ce.setClearColor.apply(ce,arguments)},this.getClearAlpha=function(){return ce.getClearAlpha()},this.setClearAlpha=function(){ce.setClearAlpha.apply(ce,arguments)},this.clear=function(M,O,B){let H=0;(M===void 0||M)&&(H|=16384),(O===void 0||O)&&(H|=256),(B===void 0||B)&&(H|=1024),G.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener(`webglcontextlost`,me,!1),e.removeEventListener(`webglcontextrestored`,Fe,!1),S.dispose(),k.dispose(),Se.dispose(),Y.dispose(),he.dispose(),Q.dispose(),q.dispose(),q.removeEventListener(`sessionstart`,Fl),q.removeEventListener(`sessionend`,Nl),Tn.stop()};function me(M){M.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),y=!0}function Fe(){console.log(`THREE.WebGLRenderer: Context Restored.`),y=!1;let M=Ce.autoReset,O=ie.enabled,B=ie.autoUpdate,H=ie.needsUpdate,te=ie.type;de(),Ce.autoReset=M,ie.enabled=O,ie.autoUpdate=B,ie.needsUpdate=H,ie.type=te}function Ze(M){let O=M.target;O.removeEventListener(`dispose`,Ze),En(O)}function En(M){We(M),Se.remove(M)}function We(M){let O=Se.get(M).programs;O!==void 0&&O.forEach(function(B){ne.releaseProgram(B)})}function qt(M,O){M.render(function(B){x.renderBufferImmediate(B,O)})}this.renderBufferImmediate=function(M,O){Q.initAttributes();let B=Se.get(M);M.hasPositions&&!B.position&&(B.position=G.createBuffer()),M.hasNormals&&!B.normal&&(B.normal=G.createBuffer()),M.hasUvs&&!B.uv&&(B.uv=G.createBuffer()),M.hasColors&&!B.color&&(B.color=G.createBuffer());let H=O.getAttributes();M.hasPositions&&(G.bindBuffer(34962,B.position),G.bufferData(34962,M.positionArray,35048),Q.enableAttribute(H.position),G.vertexAttribPointer(H.position,3,5126,!1,0,0)),M.hasNormals&&(G.bindBuffer(34962,B.normal),G.bufferData(34962,M.normalArray,35048),Q.enableAttribute(H.normal),G.vertexAttribPointer(H.normal,3,5126,!1,0,0)),M.hasUvs&&(G.bindBuffer(34962,B.uv),G.bufferData(34962,M.uvArray,35048),Q.enableAttribute(H.uv),G.vertexAttribPointer(H.uv,2,5126,!1,0,0)),M.hasColors&&(G.bindBuffer(34962,B.color),G.bufferData(34962,M.colorArray,35048),Q.enableAttribute(H.color),G.vertexAttribPointer(H.color,3,5126,!1,0,0)),Q.disableUnusedAttributes(),G.drawArrays(4,0,M.count),M.count=0},this.renderBufferDirect=function(M,O,B,H,te,Re){O===null&&(O=fe);let xe=te.isMesh&&te.matrixWorld.determinant()<0,be=Hl(M,O,H,te);pe.setMaterial(H,xe);let ze=B.index,we=B.attributes.position;if(ze===null){if(we===void 0||we.count===0)return}else if(ze.count===0)return;let Ie=1;H.wireframe===!0&&(ze=ee.getWireframeAttribute(B),Ie=2),(H.morphTargets||H.morphNormals)&&Pe.update(te,B,H,be),Q.setup(te,H,be,B,ze);let ye,Ne=ge;ze!==null&&(ye=j.get(ze),Ne=C,Ne.setIndex(ye));let Nt=ze!==null?ze.count:we.count,dt=B.drawRange.start*Ie,An=B.drawRange.count*Ie,$e=Re!==null?Re.start*Ie:0,Ln=Re!==null?Re.count*Ie:Infinity,Je=Math.max(dt,$e),Bo=Math.min(Nt,dt+An,$e+Ln)-1,xt=Math.max(0,Bo-Je+1);if(xt!==0){if(te.isMesh)H.wireframe===!0?(pe.setLineWidth(H.wireframeLinewidth*ve()),Ne.setMode(1)):Ne.setMode(4);else if(te.isLine){let Xt=H.linewidth;Xt===void 0&&(Xt=1),pe.setLineWidth(Xt*ve()),te.isLineSegments?Ne.setMode(1):te.isLineLoop?Ne.setMode(2):Ne.setMode(3)}else te.isPoints?Ne.setMode(0):te.isSprite&&Ne.setMode(4);if(te.isInstancedMesh)Ne.renderInstances(Je,xt,te.count);else if(B.isInstancedBufferGeometry){let Xt=Math.min(B.instanceCount,B._maxInstanceCount);Ne.renderInstances(Je,xt,Xt)}else Ne.render(Je,xt)}},this.compile=function(M,O){d=k.get(M),d.init(),M.traverseVisible(function(B){B.isLight&&B.layers.test(O.layers)&&(d.pushLight(B),B.castShadow&&d.pushShadow(B))}),d.setupLights(),M.traverse(function(B){let H=B.material;if(H)if(Array.isArray(H))for(let te=0;te<H.length;te++){let Re=H[te];No(Re,M,B)}else No(H,M,B)})};let Rt=null;function wu(M){Rt&&Rt(M)}function Fl(){Tn.stop()}function Nl(){Tn.start()}let Tn=new iu;Tn.setAnimationLoop(wu),typeof window<`u`&&Tn.setContext(window),this.setAnimationLoop=function(M){Rt=M,q.setAnimationLoop(M),M===null?Tn.stop():Tn.start()},q.addEventListener(`sessionstart`,Fl),q.addEventListener(`sessionend`,Nl),this.render=function(M,O){let B,H;if(arguments[2]!==void 0&&(console.warn(`THREE.WebGLRenderer.render(): the renderTarget argument has been removed. Use .setRenderTarget() instead.`),B=arguments[2]),arguments[3]!==void 0&&(console.warn(`THREE.WebGLRenderer.render(): the forceClear argument has been removed. Use .clear() instead.`),H=arguments[3]),O!==void 0&&O.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(y===!0)return;M.autoUpdate===!0&&M.updateMatrixWorld(),O.parent===null&&O.updateMatrixWorld(),q.enabled===!0&&q.isPresenting===!0&&(O=q.getCamera(O)),M.isScene===!0&&M.onBeforeRender(x,M,O,B||w),d=k.get(M,m.length),d.init(),m.push(d),ae.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),X.setFromProjectionMatrix(ae),Z=this.localClippingEnabled,$=V.init(this.clippingPlanes,Z,O),h=S.get(M,f.length),h.init(),f.push(h),Bl(M,O,0,x.sortObjects),h.finish(),x.sortObjects===!0&&h.sort(z,R),$===!0&&V.beginShadows();let te=d.state.shadowsArray;ie.render(te,M,O),d.setupLights(),d.setupLightsView(O),$===!0&&V.endShadows(),this.info.autoReset===!0&&this.info.reset(),B!==void 0&&this.setRenderTarget(B),ce.render(h,M,O,H);let Re=h.opaque,xe=h.transparent;Re.length>0&&zl(Re,M,O),xe.length>0&&zl(xe,M,O),w!==null&&(Te.updateRenderTargetMipmap(w),Te.updateMultisampleRenderTarget(w)),M.isScene===!0&&M.onAfterRender(x,M,O),pe.buffers.depth.setTest(!0),pe.buffers.depth.setMask(!0),pe.buffers.color.setMask(!0),pe.setPolygonOffset(!1),Q.resetDefaultState(),b=-1,E=null,m.pop(),m.length>0?d=m[m.length-1]:d=null,f.pop(),f.length>0?h=f[f.length-1]:h=null};function Bl(M,O,B,H){if(M.visible===!1)return;if(M.layers.test(O.layers)){if(M.isGroup)B=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(O);else if(M.isLight)d.pushLight(M),M.castShadow&&d.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||X.intersectsSprite(M)){H&&re.setFromMatrixPosition(M.matrixWorld).applyMatrix4(ae);let xe=he.update(M),be=M.material;be.visible&&h.push(M,xe,be,B,re.z,null)}}else if(M.isImmediateRenderObject)H&&re.setFromMatrixPosition(M.matrixWorld).applyMatrix4(ae),h.push(M,null,M.material,B,re.z,null);else if((M.isMesh||M.isLine||M.isPoints)&&(M.isSkinnedMesh&&M.skeleton.frame!==Ce.render.frame&&(M.skeleton.update(),M.skeleton.frame=Ce.render.frame),!M.frustumCulled||X.intersectsObject(M))){H&&re.setFromMatrixPosition(M.matrixWorld).applyMatrix4(ae);let xe=he.update(M),be=M.material;if(Array.isArray(be)){let ze=xe.groups;for(let we=0,Ie=ze.length;we<Ie;we++){let ye=ze[we],Ne=be[ye.materialIndex];Ne&&Ne.visible&&h.push(M,xe,Ne,B,re.z,ye)}}else be.visible&&h.push(M,xe,be,B,re.z,null)}}let Re=M.children;for(let xe=0,be=Re.length;xe<be;xe++)Bl(Re[xe],O,B,H)}function zl(M,O,B){let H=O.isScene===!0?O.overrideMaterial:null;for(let te=0,Re=M.length;te<Re;te++){let xe=M[te],be=xe.object,ze=xe.geometry,we=H===null?xe.material:H,Ie=xe.group;if(B.isArrayCamera){let ye=B.cameras;for(let Ne=0,Nt=ye.length;Ne<Nt;Ne++){let dt=ye[Ne];be.layers.test(dt.layers)&&(pe.viewport(v.copy(dt.viewport)),d.setupLightsView(dt),Ol(be,O,dt,ze,we,Ie))}}else Ol(be,O,B,ze,we,Ie)}}function Ol(M,O,B,H,te,Re){if(M.onBeforeRender(x,O,B,H,te,Re),M.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),M.isImmediateRenderObject){let xe=Hl(B,O,te,M);pe.setMaterial(te),Q.reset(),qt(M,xe)}else x.renderBufferDirect(B,O,H,te,M,Re);M.onAfterRender(x,O,B,H,te,Re)}function No(M,O,B){O.isScene!==!0&&(O=fe);let H=Se.get(M),te=d.state.lights,Re=d.state.shadowsArray,xe=te.state.version,be=ne.getParameters(M,te.state,Re,O,B),ze=ne.getProgramCacheKey(be),we=H.programs;H.environment=M.isMeshStandardMaterial?O.environment:null,H.fog=O.fog,H.envMap=Y.get(M.envMap||H.environment),we===void 0&&(M.addEventListener(`dispose`,Ze),we=new Map,H.programs=we);let Ie=we.get(ze);if(Ie!==void 0){if(H.currentProgram===Ie&&H.lightsStateVersion===xe)return Ul(M,be),Ie}else be.uniforms=ne.getUniforms(M),M.onBuild(be,x),M.onBeforeCompile(be,x),Ie=ne.acquireProgram(be,ze),we.set(ze,Ie),H.uniforms=be.uniforms;let ye=H.uniforms;(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(ye.clippingPlanes=V.uniform),Ul(M,be),H.needsLights=Mu(M),H.lightsStateVersion=xe,H.needsLights&&(ye.ambientLightColor.value=te.state.ambient,ye.lightProbe.value=te.state.probe,ye.directionalLights.value=te.state.directional,ye.directionalLightShadows.value=te.state.directionalShadow,ye.spotLights.value=te.state.spot,ye.spotLightShadows.value=te.state.spotShadow,ye.rectAreaLights.value=te.state.rectArea,ye.ltc_1.value=te.state.rectAreaLTC1,ye.ltc_2.value=te.state.rectAreaLTC2,ye.pointLights.value=te.state.point,ye.pointLightShadows.value=te.state.pointShadow,ye.hemisphereLights.value=te.state.hemi,ye.directionalShadowMap.value=te.state.directionalShadowMap,ye.directionalShadowMatrix.value=te.state.directionalShadowMatrix,ye.spotShadowMap.value=te.state.spotShadowMap,ye.spotShadowMatrix.value=te.state.spotShadowMatrix,ye.pointShadowMap.value=te.state.pointShadowMap,ye.pointShadowMatrix.value=te.state.pointShadowMatrix);let Ne=Ie.getUniforms(),Nt=gn.seqWithValue(Ne.seq,ye);return H.currentProgram=Ie,H.uniformsList=Nt,Ie}function Ul(M,O){let B=Se.get(M);B.outputEncoding=O.outputEncoding,B.instancing=O.instancing,B.numClippingPlanes=O.numClippingPlanes,B.numIntersection=O.numClipIntersection,B.vertexAlphas=O.vertexAlphas}function Hl(M,O,B,H){O.isScene!==!0&&(O=fe),Te.resetTextureUnits();let te=O.fog,Re=B.isMeshStandardMaterial?O.environment:null,xe=w===null?x.outputEncoding:w.texture.encoding,be=Y.get(B.envMap||Re),ze=B.vertexColors===!0&&H.geometry&&H.geometry.attributes.color&&H.geometry.attributes.color.itemSize===4,we=Se.get(B),Ie=d.state.lights;if($===!0&&(Z===!0||M!==E)){let Je=M===E&&B.id===b;V.setState(B,M,Je)}let ye=!1;B.version===we.__version?(we.needsLights&&we.lightsStateVersion!==Ie.state.version||we.outputEncoding!==xe||H.isInstancedMesh&&we.instancing===!1||!H.isInstancedMesh&&we.instancing===!0||we.envMap!==be||B.fog&&we.fog!==te||we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==V.numPlanes||we.numIntersection!==V.numIntersection)||we.vertexAlphas!==ze)&&(ye=!0):(ye=!0,we.__version=B.version);let Ne=we.currentProgram;ye===!0&&(Ne=No(B,O,H));let Nt=!1,dt=!1,An=!1,$e=Ne.getUniforms(),Ln=we.uniforms;if(pe.useProgram(Ne.program)&&(Nt=!0,dt=!0,An=!0),B.id!==b&&(b=B.id,dt=!0),Nt||E!==M){if($e.setValue(G,`projectionMatrix`,M.projectionMatrix),_e.logarithmicDepthBuffer&&$e.setValue(G,`logDepthBufFC`,2/(Math.log(M.far+1)/Math.LN2)),E!==M&&(E=M,dt=!0,An=!0),B.isShaderMaterial||B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshStandardMaterial||B.envMap){let Je=$e.map.cameraPosition;Je!==void 0&&Je.setValue(G,re.setFromMatrixPosition(M.matrixWorld))}(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&$e.setValue(G,`isOrthographic`,M.isOrthographicCamera===!0),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial||B.isShadowMaterial||B.skinning)&&$e.setValue(G,`viewMatrix`,M.matrixWorldInverse)}if(B.skinning){$e.setOptional(G,H,`bindMatrix`),$e.setOptional(G,H,`bindMatrixInverse`);let Je=H.skeleton;if(Je){let Bo=Je.bones;if(_e.floatVertexTextures){if(Je.boneTexture===null){let xt=Math.sqrt(Bo.length*4);xt=eu(xt),xt=Math.max(xt,4);let Xt=new Float32Array(xt*xt*4);Xt.set(Je.boneMatrices);let Su=new Gn(Xt,xt,xt,Tt,fn);Je.boneMatrices=Xt,Je.boneTexture=Su,Je.boneTextureSize=xt}$e.setValue(G,`boneTexture`,Je.boneTexture,Te),$e.setValue(G,`boneTextureSize`,Je.boneTextureSize)}else $e.setOptional(G,Je,`boneMatrices`)}}return(dt||we.receiveShadow!==H.receiveShadow)&&(we.receiveShadow=H.receiveShadow,$e.setValue(G,`receiveShadow`,H.receiveShadow)),dt&&($e.setValue(G,`toneMappingExposure`,x.toneMappingExposure),we.needsLights&&bu(Ln,An),te&&B.fog&&T.refreshFogUniforms(Ln,te),T.refreshMaterialUniforms(Ln,B,U,N),gn.upload(G,we.uniformsList,Ln,Te)),B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(gn.upload(G,we.uniformsList,Ln,Te),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&$e.setValue(G,`center`,H.center),$e.setValue(G,`modelViewMatrix`,H.modelViewMatrix),$e.setValue(G,`normalMatrix`,H.normalMatrix),$e.setValue(G,`modelMatrix`,H.matrixWorld),Ne}function bu(M,O){M.ambientLightColor.needsUpdate=O,M.lightProbe.needsUpdate=O,M.directionalLights.needsUpdate=O,M.directionalLightShadows.needsUpdate=O,M.pointLights.needsUpdate=O,M.pointLightShadows.needsUpdate=O,M.spotLights.needsUpdate=O,M.spotLightShadows.needsUpdate=O,M.rectAreaLights.needsUpdate=O,M.hemisphereLights.needsUpdate=O}function Mu(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return g},this.getActiveMipmapLevel=function(){return p},this.getRenderTarget=function(){return w},this.setRenderTarget=function(M,O=0,B=0){w=M,g=O,p=B,M&&Se.get(M).__webglFramebuffer===void 0&&Te.setupRenderTarget(M);let H=null,te=!1,Re=!1;if(M){let xe=M.texture;(xe.isDataTexture3D||xe.isDataTexture2DArray)&&(Re=!0);let be=Se.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(H=be[O],te=!0):M.isWebGLMultisampleRenderTarget?H=Se.get(M).__webglMultisampledFramebuffer:H=be,v.copy(M.viewport),A.copy(M.scissor),L=M.scissorTest}else v.copy(D).multiplyScalar(U).floor(),A.copy(F).multiplyScalar(U).floor(),L=P;if(pe.bindFramebuffer(36160,H),pe.viewport(v),pe.scissor(A),pe.setScissorTest(L),te){let xe=Se.get(M.texture);G.framebufferTexture2D(36160,36064,34069+O,xe.__webglTexture,B)}else if(Re){let xe=Se.get(M.texture),be=O||0;G.framebufferTextureLayer(36160,36064,xe.__webglTexture,B||0,be)}},this.readRenderTargetPixels=function(M,O,B,H,te,Re,xe){if(!(M&&M.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let be=Se.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&xe!==void 0&&(be=be[xe]),be){pe.bindFramebuffer(36160,be);try{let ze=M.texture,we=ze.format,Ie=ze.type;if(we!==1023&&J.convert(we)!==G.getParameter(35739)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}let ye=Ie===1016&&(Le.has(`EXT_color_buffer_half_float`)||_e.isWebGL2&&Le.has(`EXT_color_buffer_float`));if(Ie!==1009&&J.convert(Ie)!==G.getParameter(35738)&&!(Ie===1015&&(_e.isWebGL2||Le.has(`OES_texture_float`)||Le.has(`WEBGL_color_buffer_float`)))&&!ye){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}G.checkFramebufferStatus(36160)===36053?O>=0&&O<=M.width-H&&B>=0&&B<=M.height-te&&G.readPixels(O,B,H,te,J.convert(we),J.convert(Ie),Re):console.error(`THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.`)}finally{let ze=w!==null?Se.get(w).__webglFramebuffer:null;pe.bindFramebuffer(36160,ze)}}},this.copyFramebufferToTexture=function(M,O,B=0){let H=Math.pow(2,-B),te=Math.floor(O.image.width*H),Re=Math.floor(O.image.height*H),xe=J.convert(O.format);Te.setTexture2D(O,0),G.copyTexImage2D(3553,B,xe,M.x,M.y,te,Re,0),pe.unbindTexture()},this.copyTextureToTexture=function(M,O,B,H=0){let te=O.image.width,Re=O.image.height,xe=J.convert(B.format),be=J.convert(B.type);Te.setTexture2D(B,0),G.pixelStorei(37440,B.flipY),G.pixelStorei(37441,B.premultiplyAlpha),G.pixelStorei(3317,B.unpackAlignment),O.isDataTexture?G.texSubImage2D(3553,H,M.x,M.y,te,Re,xe,be,O.image.data):O.isCompressedTexture?G.compressedTexSubImage2D(3553,H,M.x,M.y,O.mipmaps[0].width,O.mipmaps[0].height,xe,O.mipmaps[0].data):G.texSubImage2D(3553,H,M.x,M.y,xe,be,O.image),H===0&&B.generateMipmaps&&G.generateMipmap(3553),pe.unbindTexture()},this.copyTextureToTexture3D=function(M,O,B,H,te=0){if(x.isWebGL1Renderer){console.warn(`THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.`);return}let{width:Re,height:xe,data:be}=B.image,ze=J.convert(H.format),we=J.convert(H.type),Ie;if(H.isDataTexture3D)Te.setTexture3D(H,0),Ie=32879;else if(H.isDataTexture2DArray)Te.setTexture2DArray(H,0),Ie=35866;else{console.warn(`THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.`);return}G.pixelStorei(37440,H.flipY),G.pixelStorei(37441,H.premultiplyAlpha),G.pixelStorei(3317,H.unpackAlignment);let ye=G.getParameter(3314),Ne=G.getParameter(32878),Nt=G.getParameter(3316),dt=G.getParameter(3315),An=G.getParameter(32877);G.pixelStorei(3314,Re),G.pixelStorei(32878,xe),G.pixelStorei(3316,M.min.x),G.pixelStorei(3315,M.min.y),G.pixelStorei(32877,M.min.z),G.texSubImage3D(Ie,te,O.x,O.y,O.z,M.max.x-M.min.x+1,M.max.y-M.min.y+1,M.max.z-M.min.z+1,ze,we,be),G.pixelStorei(3314,ye),G.pixelStorei(32878,Ne),G.pixelStorei(3316,Nt),G.pixelStorei(3315,dt),G.pixelStorei(32877,An),te===0&&H.generateMipmaps&&G.generateMipmap(Ie),pe.unbindTexture()},this.initTexture=function(M){Te.setTexture2D(M,0),pe.unbindTexture()},this.resetState=function(){g=0,p=0,w=null,pe.reset(),Q.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}var za=class extends Oe{};za.prototype.isWebGL1Renderer=!0;var Is=class s{constructor(e,t=25e-5){this.name=``,this.color=new se(e),this.density=t}clone(){return new s(this.color,this.density)}toJSON(){return{type:`FogExp2`,color:this.color.getHex(),density:this.density}}};Is.prototype.isFogExp2=!0;var Ds=class s{constructor(e,t=1,n=1e3){this.name=``,this.color=new se(e),this.near=t,this.far=n}clone(){return new s(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,color:this.color.getHex(),near:this.near,far:this.far}}};Ds.prototype.isFog=!0;var dr=class extends Ae{constructor(){super(),this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.overrideMaterial=null,this.autoUpdate=!0,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.autoUpdate=e.autoUpdate,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.background!==null&&(t.object.background=this.background.toJSON(e)),this.environment!==null&&(t.object.environment=this.environment.toJSON(e)),this.fog!==null&&(t.object.fog=this.fog.toJSON()),t}};dr.prototype.isScene=!0;var vn=class s{constructor(e,t){this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=nr,this.updateRange={offset:0,count:-1},this.version=0,this.uuid=Mt(),this.onUploadCallback=function(){}}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Mt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new s(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Mt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.prototype.slice.call(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}};vn.prototype.isInterleavedBuffer=!0;var qe=new _;var kn=class s{constructor(e,t,n,i){this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=i===!0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)qe.x=this.getX(t),qe.y=this.getY(t),qe.z=this.getZ(t),qe.applyMatrix4(e),this.setXYZ(t,qe.x,qe.y,qe.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)qe.x=this.getX(t),qe.y=this.getY(t),qe.z=this.getZ(t),qe.applyNormalMatrix(e),this.setXYZ(t,qe.x,qe.y,qe.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)qe.x=this.getX(t),qe.y=this.getY(t),qe.z=this.getZ(t),qe.transformDirection(e),this.setXYZ(t,qe.x,qe.y,qe.z);return this}setX(e,t){return this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){return this.data.array[e*this.data.stride+this.offset]}getY(e){return this.data.array[e*this.data.stride+this.offset+1]}getZ(e){return this.data.array[e*this.data.stride+this.offset+2]}getW(e){return this.data.array[e*this.data.stride+this.offset+3]}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log(`THREE.InterleavedBufferAttribute.clone(): Cloning an interlaved buffer attribute will deinterleave buffer data.`);let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new Me(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new s(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log(`THREE.InterleavedBufferAttribute.toJSON(): Serializing an interlaved buffer attribute will deinterleave buffer data.`);let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}};kn.prototype.isInterleavedBufferAttribute=!0;var fr=class extends tt{constructor(e){super(),this.type=`SpriteMaterial`,this.color=new se(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this}};fr.prototype.isSpriteMaterial=!0;var si;var Hi=new _;var oi=new _;var ai=new _;var li=new W;var Gi=new W;var du=new le;var $r=new _;var ki=new _;var Qr=new _;var Cc=new W;var ca=new W;var Pc=new W;var pr=class extends Ae{constructor(e){if(super(),this.type=`Sprite`,si===void 0){si=new ue;let n=new vn(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);si.setIndex([0,1,2,0,2,3]),si.setAttribute(`position`,new kn(n,3,0,!1)),si.setAttribute(`uv`,new kn(n,2,3,!1))}this.geometry=si,this.material=e!==void 0?e:new fr,this.center=new W(.5,.5)}raycast(e,t){e.camera===null&&console.error(`THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),oi.setFromMatrixScale(this.matrixWorld),du.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ai.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&oi.multiplyScalar(-ai.z);let n=this.material.rotation,i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));let o=this.center;Kr($r.set(-.5,-.5,0),ai,o,oi,i,r),Kr(ki.set(.5,-.5,0),ai,o,oi,i,r),Kr(Qr.set(.5,.5,0),ai,o,oi,i,r),Cc.set(0,0),ca.set(1,0),Pc.set(1,1);let a=e.ray.intersectTriangle($r,ki,Qr,!1,Hi);if(a===null&&(Kr(ki.set(-.5,.5,0),ai,o,oi,i,r),ca.set(0,1),a=e.ray.intersectTriangle($r,Qr,ki,!1,Hi),a===null))return;let c=e.ray.origin.distanceTo(Hi);c<e.near||c>e.far||t.push({distance:c,point:Hi.clone(),uv:ht.getUV(Hi,$r,ki,Qr,Cc,ca,Pc,new W),face:null,object:this})}copy(e){return super.copy(e),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};pr.prototype.isSprite=!0;function Kr(s,e,t,n,i,r){li.subVectors(s,t).addScalar(.5).multiply(n),i!==void 0?(Gi.x=r*li.x-i*li.y,Gi.y=i*li.x+r*li.y):Gi.copy(li),s.copy(e),s.x+=Gi.x,s.y+=Gi.y,s.applyMatrix4(du)}var es=new _;var Ic=new _;var Oa=class extends Ae{constructor(){super(),this._currentLevel=0,this.type=`LOD`,Object.defineProperties(this,{levels:{enumerable:!0,value:[]},isLOD:{value:!0}}),this.autoUpdate=!0}copy(e){super.copy(e,!1);let t=e.levels;for(let n=0,i=t.length;n<i;n++){let r=t[n];this.addLevel(r.object.clone(),r.distance)}return this.autoUpdate=e.autoUpdate,this}addLevel(e,t=0){t=Math.abs(t);let n=this.levels,i;for(i=0;i<n.length&&!(t<n[i].distance);i++);return n.splice(i,0,{distance:t,object:e}),this.add(e),this}getCurrentLevel(){return this._currentLevel}getObjectForDistance(e){let t=this.levels;if(t.length>0){let n,i;for(n=1,i=t.length;n<i&&!(e<t[n].distance);n++);return t[n-1].object}return null}raycast(e,t){if(this.levels.length>0){es.setFromMatrixPosition(this.matrixWorld);let i=e.ray.origin.distanceTo(es);this.getObjectForDistance(i).raycast(e,t)}}update(e){let t=this.levels;if(t.length>1){es.setFromMatrixPosition(e.matrixWorld),Ic.setFromMatrixPosition(this.matrixWorld);let n=es.distanceTo(Ic)/e.zoom;t[0].object.visible=!0;let i,r;for(i=1,r=t.length;i<r&&n>=t[i].distance;i++)t[i-1].object.visible=!1,t[i].object.visible=!0;for(this._currentLevel=i-1;i<r;i++)t[i].object.visible=!1}}toJSON(e){let t=super.toJSON(e);this.autoUpdate===!1&&(t.object.autoUpdate=!1),t.object.levels=[];let n=this.levels;for(let i=0,r=n.length;i<r;i++){let o=n[i];t.object.levels.push({object:o.object.uuid,distance:o.distance})}return t}};var Dc=new _;var Fc=new De;var Nc=new De;var Ox=new _;var Bc=new le;var mr=class extends Ye{constructor(e,t){super(e,t),this.type=`SkinnedMesh`,this.bindMode=`attached`,this.bindMatrix=new le,this.bindMatrixInverse=new le}copy(e){return super.copy(e),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new De,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.x=t.getX(n),e.y=t.getY(n),e.z=t.getZ(n),e.w=t.getW(n);let r=1/e.manhattanLength();r!==Infinity?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===`attached`?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===`detached`?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn(`THREE.SkinnedMesh: Unrecognized bindMode: `+this.bindMode)}boneTransform(e,t){let n=this.skeleton,i=this.geometry;Fc.fromBufferAttribute(i.attributes.skinIndex,e),Nc.fromBufferAttribute(i.attributes.skinWeight,e),Dc.fromBufferAttribute(i.attributes.position,e).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){let o=Nc.getComponent(r);if(o!==0){let a=Fc.getComponent(r);Bc.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Ox.copy(Dc).applyMatrix4(Bc),o)}}return t.applyMatrix4(this.bindMatrixInverse)}};mr.prototype.isSkinnedMesh=!0;var gr=class extends Ae{constructor(){super(),this.type=`Bone`}};gr.prototype.isBone=!0;var zc=new le;var Ux=new le;var Ua=class s{constructor(e=[],t=[]){this.uuid=Mt(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.boneTextureSize=0,this.frame=-1,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn(`THREE.Skeleton: Number of inverse bone matrices does not match amount of bones.`),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new le)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new le;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:Ux;zc.multiplyMatrices(a,t[r]),zc.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new s(this.bones,this.boneInverses)}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){let r=e.bones[n],o=t[r];o===void 0&&(console.warn(`THREE.Skeleton: No bone found with UUID:`,r),o=new gr),this.bones.push(o),this.boneInverses.push(new le().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.5,type:`Skeleton`,generator:`Skeleton.toJSON`},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){let o=t[i];e.bones.push(o.uuid);let a=n[i];e.boneInverses.push(a.toArray())}return e}};var Oc=new le;var Uc=new le;var ts=[];var Vi=new Ye;var Fs=class extends Ye{constructor(e,t,n){super(e,t),this.instanceMatrix=new Me(new Float32Array(n*16),16),this.instanceColor=null,this.count=n,this.frustumCulled=!1}copy(e){return super.copy(e),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){let n=this.matrixWorld,i=this.count;if(Vi.geometry=this.geometry,Vi.material=this.material,Vi.material!==void 0)for(let r=0;r<i;r++){this.getMatrixAt(r,Oc),Uc.multiplyMatrices(n,Oc),Vi.matrixWorld=Uc,Vi.raycast(e,ts);for(let o=0,a=ts.length;o<a;o++){let c=ts[o];c.instanceId=r,c.object=this,t.push(c)}ts.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Me(new Float32Array(this.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:`dispose`})}};Fs.prototype.isInstancedMesh=!0;var nt=class extends tt{constructor(e){super(),this.type=`LineBasicMaterial`,this.color=new se(16777215),this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.morphTargets=!1,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.morphTargets=e.morphTargets,this}};nt.prototype.isLineBasicMaterial=!0;var Hc=new _;var Gc=new _;var kc=new le;var ha=new nn;var ns=new tn;var Vt=class extends Ae{constructor(e=new ue,t=new nt){super(),this.type=`Line`,this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e){return super.copy(e),this.material=e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.isBufferGeometry)if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Hc.fromBufferAttribute(t,i-1),Gc.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Hc.distanceTo(Gc);e.setAttribute(`lineDistance`,new oe(n,1))}else console.warn(`THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);else e.isGeometry&&console.error(`THREE.Line.computeLineDistances() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.`);return this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ns.copy(n.boundingSphere),ns.applyMatrix4(i),ns.radius+=r,e.ray.intersectsSphere(ns)===!1)return;kc.copy(i).invert(),ha.copy(e.ray).applyMatrix4(kc);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=new _,u=new _,h=new _,d=new _,f=this.isLineSegments?2:1;if(n.isBufferGeometry){let m=n.index,y=n.attributes.position;if(m!==null){let g=Math.max(0,o.start),p=Math.min(m.count,o.start+o.count);for(let w=g,b=p-1;w<b;w+=f){let E=m.getX(w),v=m.getX(w+1);if(l.fromBufferAttribute(y,E),u.fromBufferAttribute(y,v),ha.distanceSqToSegment(l,u,d,h)>c)continue;d.applyMatrix4(this.matrixWorld);let L=e.ray.origin.distanceTo(d);L<e.near||L>e.far||t.push({distance:L,point:h.clone().applyMatrix4(this.matrixWorld),index:w,face:null,faceIndex:null,object:this})}}else{let g=Math.max(0,o.start),p=Math.min(y.count,o.start+o.count);for(let w=g,b=p-1;w<b;w+=f){if(l.fromBufferAttribute(y,w),u.fromBufferAttribute(y,w+1),ha.distanceSqToSegment(l,u,d,h)>c)continue;d.applyMatrix4(this.matrixWorld);let v=e.ray.origin.distanceTo(d);v<e.near||v>e.far||t.push({distance:v,point:h.clone().applyMatrix4(this.matrixWorld),index:w,face:null,faceIndex:null,object:this})}}}else n.isGeometry&&console.error(`THREE.Line.raycast() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.`)}updateMorphTargets(){let e=this.geometry;if(e.isBufferGeometry){let t=e.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}else{let t=e.morphTargets;t!==void 0&&t.length>0&&console.error(`THREE.Line.updateMorphTargets() does not support THREE.Geometry. Use THREE.BufferGeometry instead.`)}}};Vt.prototype.isLine=!0;var Vc=new _;var Wc=new _;var gt=class extends Vt{constructor(e,t){super(e,t),this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.isBufferGeometry)if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Vc.fromBufferAttribute(t,i),Wc.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Vc.distanceTo(Wc);e.setAttribute(`lineDistance`,new oe(n,1))}else console.warn(`THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);else e.isGeometry&&console.error(`THREE.LineSegments.computeLineDistances() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.`);return this}};gt.prototype.isLineSegments=!0;var Ns=class extends Vt{constructor(e,t){super(e,t),this.type=`LineLoop`}};Ns.prototype.isLineLoop=!0;var _n=class extends tt{constructor(e){super(),this.type=`PointsMaterial`,this.color=new se(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.morphTargets=!1,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.morphTargets=e.morphTargets,this}};_n.prototype.isPointsMaterial=!0;var qc=new le;var Ha=new nn;var is=new tn;var rs=new _;var bi=class extends Ae{constructor(e=new ue,t=new _n){super(),this.type=`Points`,this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e){return super.copy(e),this.material=e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),is.copy(n.boundingSphere),is.applyMatrix4(i),is.radius+=r,e.ray.intersectsSphere(is)===!1)return;qc.copy(i).invert(),Ha.copy(e.ray).applyMatrix4(qc);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a;if(n.isBufferGeometry){let l=n.index,h=n.attributes.position;if(l!==null){let d=Math.max(0,o.start),f=Math.min(l.count,o.start+o.count);for(let m=d,x=f;m<x;m++){let y=l.getX(m);rs.fromBufferAttribute(h,y),Xc(rs,y,c,i,e,t,this)}}else{let d=Math.max(0,o.start),f=Math.min(h.count,o.start+o.count);for(let m=d,x=f;m<x;m++)rs.fromBufferAttribute(h,m),Xc(rs,m,c,i,e,t,this)}}else console.error(`THREE.Points.raycast() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.`)}updateMorphTargets(){let e=this.geometry;if(e.isBufferGeometry){let t=e.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}else{let t=e.morphTargets;t!==void 0&&t.length>0&&console.error(`THREE.Points.updateMorphTargets() does not support THREE.Geometry. Use THREE.BufferGeometry instead.`)}}};bi.prototype.isPoints=!0;function Xc(s,e,t,n,i,r,o){let a=Ha.distanceSqToPoint(s);if(a<t){let c=new _;Ha.closestPointToPoint(s,c),c.applyMatrix4(n);let l=i.ray.origin.distanceTo(c);if(l<i.near||l>i.far)return;r.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,object:o})}}var Ga=class extends St{constructor(e,t,n,i,r,o,a,c,l){super(e,t,n,i,r,o,a,c,l),this.format=a!==void 0?a:zn,this.minFilter=o!==void 0?o:st,this.magFilter=r!==void 0?r:st,this.generateMipmaps=!1;let u=this;function h(){u.needsUpdate=!0,e.requestVideoFrameCallback(h)}`requestVideoFrameCallback`in e&&e.requestVideoFrameCallback(h)}clone(){return new this.constructor(this.image).copy(this)}update(){let e=this.image;`requestVideoFrameCallback`in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}};Ga.prototype.isVideoTexture=!0;var Bs=class extends St{constructor(e,t,n,i,r,o,a,c,l,u,h,d){super(null,o,a,c,l,u,i,r,h,d),this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}};Bs.prototype.isCompressedTexture=!0;var ka=class extends St{constructor(e,t,n,i,r,o,a,c,l){super(e,t,n,i,r,o,a,c,l),this.needsUpdate=!0}};ka.prototype.isCanvasTexture=!0;var Va=class extends St{constructor(e,t,n,i,r,o,a,c,l,u){if(u=u!==void 0?u:1026,u!==1026&&u!==1027)throw new Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);n===void 0&&u===1026&&(n=1012),n===void 0&&u===1027&&(n=1020),super(null,i,r,o,a,c,u,n,l),this.image={width:e,height:t},this.magFilter=a!==void 0?a:rt,this.minFilter=c!==void 0?c:rt,this.flipY=!1,this.generateMipmaps=!1}};Va.prototype.isDepthTexture=!0;var zs=class extends ue{constructor(e=1,t=8,n=0,i=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);let r=[],o=[],a=[],c=[],l=new _,u=new W;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){let f=n+h/t*i;l.x=e*Math.cos(f),l.y=e*Math.sin(f),o.push(l.x,l.y,l.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,c.push(u.x,u.y)}for(let h=1;h<=t;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute(`position`,new oe(o,3)),this.setAttribute(`normal`,new oe(a,3)),this.setAttribute(`uv`,new oe(c,2))}};var Mi=class extends ue{constructor(e=1,t=1,n=1,i=8,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let l=this;i=Math.floor(i),r=Math.floor(r);let u=[],h=[],d=[],f=[],m=0,x=[],y=n/2,g=0;p(),o===!1&&(e>0&&w(!0),t>0&&w(!1)),this.setIndex(u),this.setAttribute(`position`,new oe(h,3)),this.setAttribute(`normal`,new oe(d,3)),this.setAttribute(`uv`,new oe(f,2));function p(){let b=new _,E=new _,v=0,A=(t-e)/n;for(let L=0;L<=r;L++){let I=[],N=L/r,U=N*(t-e)+e;for(let z=0;z<=i;z++){let R=z/i,D=R*c+a,F=Math.sin(D),P=Math.cos(D);E.x=U*F,E.y=-N*n+y,E.z=U*P,h.push(E.x,E.y,E.z),b.set(F,A,P).normalize(),d.push(b.x,b.y,b.z),f.push(R,1-N),I.push(m++)}x.push(I)}for(let L=0;L<i;L++)for(let I=0;I<r;I++){let N=x[I][L],U=x[I+1][L],z=x[I+1][L+1],R=x[I][L+1];u.push(N,U,R),u.push(U,z,R),v+=6}l.addGroup(g,v,0),g+=v}function w(b){let E=m,v=new W,A=new _,L=0,I=b===!0?e:t,N=b===!0?1:-1;for(let z=1;z<=i;z++)h.push(0,y*N,0),d.push(0,N,0),f.push(.5,.5),m++;let U=m;for(let z=0;z<=i;z++){let D=z/i*c+a,F=Math.cos(D),P=Math.sin(D);A.x=I*P,A.y=y*N,A.z=I*F,h.push(A.x,A.y,A.z),d.push(0,N,0),v.x=F*.5+.5,v.y=P*.5*N+.5,f.push(v.x,v.y),m++}for(let z=0;z<i;z++){let R=E+z,D=U+z;b===!0?u.push(D,D+1,R):u.push(D+1,D,R),L+=3}l.addGroup(g,L,b===!0?1:2),g+=L}}};var Os=class extends Mi{constructor(e=1,t=1,n=8,i=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,i,r,o,a),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}};var wn=class extends ue{constructor(e,t,n=1,i=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:i};let r=[],o=[];a(i),l(n),u(),this.setAttribute(`position`,new oe(r,3)),this.setAttribute(`normal`,new oe(r.slice(),3)),this.setAttribute(`uv`,new oe(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(p){let w=new _,b=new _,E=new _;for(let v=0;v<t.length;v+=3)f(t[v+0],w),f(t[v+1],b),f(t[v+2],E),c(w,b,E,p)}function c(p,w,b,E){let v=E+1,A=[];for(let L=0;L<=v;L++){A[L]=[];let I=p.clone().lerp(b,L/v),N=w.clone().lerp(b,L/v),U=v-L;for(let z=0;z<=U;z++)z===0&&L===v?A[L][z]=I:A[L][z]=I.clone().lerp(N,z/U)}for(let L=0;L<v;L++)for(let I=0;I<2*(v-L)-1;I++){let N=Math.floor(I/2);I%2===0?(d(A[L][N+1]),d(A[L+1][N]),d(A[L][N])):(d(A[L][N+1]),d(A[L+1][N+1]),d(A[L+1][N]))}}function l(p){let w=new _;for(let b=0;b<r.length;b+=3)w.x=r[b+0],w.y=r[b+1],w.z=r[b+2],w.normalize().multiplyScalar(p),r[b+0]=w.x,r[b+1]=w.y,r[b+2]=w.z}function u(){let p=new _;for(let w=0;w<r.length;w+=3){p.x=r[w+0],p.y=r[w+1],p.z=r[w+2];let b=y(p)/2/Math.PI+.5,E=g(p)/Math.PI+.5;o.push(b,1-E)}m(),h()}function h(){for(let p=0;p<o.length;p+=6){let w=o[p+0],b=o[p+2],E=o[p+4];Math.max(w,b,E)>.9&&Math.min(w,b,E)<.1&&(w<.2&&(o[p+0]+=1),b<.2&&(o[p+2]+=1),E<.2&&(o[p+4]+=1))}}function d(p){r.push(p.x,p.y,p.z)}function f(p,w){let b=p*3;w.x=e[b+0],w.y=e[b+1],w.z=e[b+2]}function m(){let p=new _,w=new _,b=new _,E=new _,v=new W,A=new W,L=new W;for(let I=0,N=0;I<r.length;I+=9,N+=6){p.set(r[I+0],r[I+1],r[I+2]),w.set(r[I+3],r[I+4],r[I+5]),b.set(r[I+6],r[I+7],r[I+8]),v.set(o[N+0],o[N+1]),A.set(o[N+2],o[N+3]),L.set(o[N+4],o[N+5]),E.copy(p).add(w).add(b).divideScalar(3);let U=y(E);x(v,N+0,p,U),x(A,N+2,w,U),x(L,N+4,b,U)}}function x(p,w,b,E){E<0&&p.x===1&&(o[w]=p.x-1),b.x===0&&b.z===0&&(o[w]=E/2/Math.PI+.5)}function y(p){return Math.atan2(p.z,-p.x)}function g(p){return Math.atan2(-p.y,Math.sqrt(p.x*p.x+p.z*p.z))}}};var Us=class extends wn{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i];super(r,[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type=`DodecahedronGeometry`,this.parameters={radius:e,detail:t}}};var ss=new _;var os=new _;var ua=new _;var as=new ht;var Hs=class extends ue{constructor(e,t){if(super(),this.type=`EdgesGeometry`,this.parameters={thresholdAngle:t},t=t!==void 0?t:1,e.isGeometry===!0){console.error(`THREE.EdgesGeometry no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.`);return}let i=Math.pow(10,4),r=Math.cos(On*t),o=e.getIndex(),a=e.getAttribute(`position`),c=o?o.count:a.count,l=[0,0,0],u=[`a`,`b`,`c`],h=new Array(3),d={},f=[];for(let m=0;m<c;m+=3){o?(l[0]=o.getX(m),l[1]=o.getX(m+1),l[2]=o.getX(m+2)):(l[0]=m,l[1]=m+1,l[2]=m+2);let{a:x,b:y,c:g}=as;if(x.fromBufferAttribute(a,l[0]),y.fromBufferAttribute(a,l[1]),g.fromBufferAttribute(a,l[2]),as.getNormal(ua),h[0]=`${Math.round(x.x*i)},${Math.round(x.y*i)},${Math.round(x.z*i)}`,h[1]=`${Math.round(y.x*i)},${Math.round(y.y*i)},${Math.round(y.z*i)}`,h[2]=`${Math.round(g.x*i)},${Math.round(g.y*i)},${Math.round(g.z*i)}`,!(h[0]===h[1]||h[1]===h[2]||h[2]===h[0]))for(let p=0;p<3;p++){let w=(p+1)%3,b=h[p],E=h[w],v=as[u[p]],A=as[u[w]],L=`${b}_${E}`,I=`${E}_${b}`;I in d&&d[I]?(ua.dot(d[I].normal)<=r&&(f.push(v.x,v.y,v.z),f.push(A.x,A.y,A.z)),d[I]=null):L in d||(d[L]={index0:l[p],index1:l[w],normal:ua.clone()})}}for(let m in d)if(d[m]){let{index0:x,index1:y}=d[m];ss.fromBufferAttribute(a,x),os.fromBufferAttribute(a,y),f.push(ss.x,ss.y,ss.z),f.push(os.x,os.y,os.z)}this.setAttribute(`position`,new oe(f,3))}};var Hx={triangulate:function(s,e,t){t=t||2;let n=e&&e.length,i=n?e[0]*t:s.length,r=fu(s,0,i,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,c,l,u,h,d,f;if(n&&(r=qx(s,e,r,t)),s.length>80*t){a=l=s[0],c=u=s[1];for(let m=t;m<i;m+=t)h=s[m],d=s[m+1],h<a&&(a=h),d<c&&(c=d),h>l&&(l=h),d>u&&(u=d);f=Math.max(l-a,u-c),f=f!==0?1/f:0}return xr(r,o,t,a,c,f),o}};function fu(s,e,t,n,i){let r,o;if(i===ny(s,e,t,n)>0)for(r=e;r<t;r+=n)o=Yc(r,s[r],s[r+1],o);else for(r=t-n;r>=e;r-=n)o=Yc(r,s[r],s[r+1],o);return o&&Fo(o,o.next)&&(vr(o),o=o.next),o}function bn(s,e){if(!s)return s;e||(e=s);let t=s,n;do if(n=!1,!t.steiner&&(Fo(t,t.next)||ke(t.prev,t,t.next)===0)){if(vr(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function xr(s,e,t,n,i,r,o){if(!s)return;!o&&r&&jx(s,n,i,r);let a=s,c,l;for(;s.prev!==s.next;){if(c=s.prev,l=s.next,r?kx(s,n,i,r):Gx(s)){e.push(c.i/t),e.push(s.i/t),e.push(l.i/t),vr(s),s=l.next,a=l.next;continue}if(s=l,s===a){o?o===1?(s=Vx(bn(s),e,t),xr(s,e,t,n,i,r,2)):o===2&&Wx(s,e,t,n,i,r):xr(bn(s),e,t,n,i,r,1);break}}}function Gx(s){let e=s.prev,t=s,n=s.next;if(ke(e,t,n)>=0)return!1;let i=s.next.next;for(;i!==s.prev;){if(pi(e.x,e.y,t.x,t.y,n.x,n.y,i.x,i.y)&&ke(i.prev,i,i.next)>=0)return!1;i=i.next}return!0}function kx(s,e,t,n){let i=s.prev,r=s,o=s.next;if(ke(i,r,o)>=0)return!1;let a=i.x<r.x?i.x<o.x?i.x:o.x:r.x<o.x?r.x:o.x,c=i.y<r.y?i.y<o.y?i.y:o.y:r.y<o.y?r.y:o.y,l=i.x>r.x?i.x>o.x?i.x:o.x:r.x>o.x?r.x:o.x,u=i.y>r.y?i.y>o.y?i.y:o.y:r.y>o.y?r.y:o.y,h=Wa(a,c,e,t,n),d=Wa(l,u,e,t,n),f=s.prevZ,m=s.nextZ;for(;f&&f.z>=h&&m&&m.z<=d;){if(f!==s.prev&&f!==s.next&&pi(i.x,i.y,r.x,r.y,o.x,o.y,f.x,f.y)&&ke(f.prev,f,f.next)>=0||(f=f.prevZ,m!==s.prev&&m!==s.next&&pi(i.x,i.y,r.x,r.y,o.x,o.y,m.x,m.y)&&ke(m.prev,m,m.next)>=0))return!1;m=m.nextZ}for(;f&&f.z>=h;){if(f!==s.prev&&f!==s.next&&pi(i.x,i.y,r.x,r.y,o.x,o.y,f.x,f.y)&&ke(f.prev,f,f.next)>=0)return!1;f=f.prevZ}for(;m&&m.z<=d;){if(m!==s.prev&&m!==s.next&&pi(i.x,i.y,r.x,r.y,o.x,o.y,m.x,m.y)&&ke(m.prev,m,m.next)>=0)return!1;m=m.nextZ}return!0}function Vx(s,e,t){let n=s;do{let i=n.prev,r=n.next.next;!Fo(i,r)&&pu(i,n,n.next,r)&&yr(i,r)&&yr(r,i)&&(e.push(i.i/t),e.push(n.i/t),e.push(r.i/t),vr(n),vr(n.next),n=s=r),n=n.next}while(n!==s);return bn(n)}function Wx(s,e,t,n,i,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Kx(o,a)){let c=mu(o,a);o=bn(o,o.next),c=bn(c,c.next),xr(o,e,t,n,i,r),xr(c,e,t,n,i,r);return}a=a.next}o=o.next}while(o!==s)}function qx(s,e,t,n){let i=[],r,o,a,c,l;for(r=0,o=e.length;r<o;r++)a=e[r]*n,c=r<o-1?e[r+1]*n:s.length,l=fu(s,a,c,n,!1),l===l.next&&(l.steiner=!0),i.push(Qx(l));for(i.sort(Xx),r=0;r<i.length;r++)Yx(i[r],t),t=bn(t,t.next);return t}function Xx(s,e){return s.x-e.x}function Yx(s,e){if(e=Zx(s,e),e){let t=mu(e,s);bn(e,e.next),bn(t,t.next)}}function Zx(s,e){let t=e,n=s.x,i=s.y,r=-Infinity,o;do{if(i<=t.y&&i>=t.next.y&&t.next.y!==t.y){let d=t.x+(i-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=n&&d>r){if(r=d,d===n){if(i===t.y)return t;if(i===t.next.y)return t.next}o=t.x<t.next.x?t:t.next}}t=t.next}while(t!==e);if(!o)return null;if(n===r)return o;let a=o,c=o.x,l=o.y,u=Infinity,h;t=o;do n>=t.x&&t.x>=c&&n!==t.x&&pi(i<l?n:r,i,c,l,i<l?r:n,i,t.x,t.y)&&(h=Math.abs(i-t.y)/(n-t.x),yr(t,s)&&(h<u||h===u&&(t.x>o.x||t.x===o.x&&Jx(o,t)))&&(o=t,u=h)),t=t.next;while(t!==a);return o}function Jx(s,e){return ke(s.prev,s,e.prev)<0&&ke(e.next,s,s.next)<0}function jx(s,e,t,n){let i=s;do i.z===null&&(i.z=Wa(i.x,i.y,e,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,$x(i)}function $x(s){let e,t,n,i,r,o,a,c,l=1;do{for(t=s,s=null,r=null,o=0;t;){for(o++,n=t,a=0,e=0;e<l&&(a++,n=n.nextZ,!!n);e++);for(c=l;a>0||c>0&&n;)a!==0&&(c===0||!n||t.z<=n.z)?(i=t,t=t.nextZ,a--):(i=n,n=n.nextZ,c--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;t=n}r.nextZ=null,l*=2}while(o>1);return s}function Wa(s,e,t,n,i){return s=32767*(s-t)*i,e=32767*(e-n)*i,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function Qx(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function pi(s,e,t,n,i,r,o,a){return(i-o)*(e-a)-(s-o)*(r-a)>=0&&(s-o)*(n-a)-(t-o)*(e-a)>=0&&(t-o)*(r-a)-(i-o)*(n-a)>=0}function Kx(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!ey(s,e)&&(yr(s,e)&&yr(e,s)&&ty(s,e)&&(ke(s.prev,s,e.prev)||ke(s,e.prev,e))||Fo(s,e)&&ke(s.prev,s,s.next)>0&&ke(e.prev,e,e.next)>0)}function ke(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function Fo(s,e){return s.x===e.x&&s.y===e.y}function pu(s,e,t,n){let i=cs(ke(s,e,t)),r=cs(ke(s,e,n)),o=cs(ke(t,n,s)),a=cs(ke(t,n,e));return!!(i!==r&&o!==a||i===0&&ls(s,t,e)||r===0&&ls(s,n,e)||o===0&&ls(t,s,n)||a===0&&ls(t,e,n))}function ls(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function cs(s){return s>0?1:s<0?-1:0}function ey(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&pu(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function yr(s,e){return ke(s.prev,s,s.next)<0?ke(s,e,s.next)>=0&&ke(s,s.prev,e)>=0:ke(s,e,s.prev)<0||ke(s,s.next,e)<0}function ty(s,e){let t=s,n=!1,i=(s.x+e.x)/2,r=(s.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&i<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==s);return n}function mu(s,e){let t=new qa(s.i,s.x,s.y),n=new qa(e.i,e.x,e.y),i=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=i,i.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Yc(s,e,t,n){let i=new qa(s,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function vr(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function qa(s,e,t){this.i=s,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=null,this.prevZ=null,this.nextZ=null,this.steiner=!1}function ny(s,e,t,n){let i=0;for(let r=e,o=t-n;r<t;r+=n)i+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return i}var Qt=class s{static area(e){let t=e.length,n=0;for(let i=t-1,r=0;r<t;i=r++)n+=e[i].x*e[r].y-e[r].x*e[i].y;return n*.5}static isClockWise(e){return s.area(e)<0}static triangulateShape(e,t){let n=[],i=[],r=[];Zc(e),Jc(n,e);let o=e.length;t.forEach(Zc);for(let c=0;c<t.length;c++)i.push(o),o+=t[c].length,Jc(n,t[c]);let a=Hx.triangulate(n,i);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}};function Zc(s){let e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function Jc(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}var rn=class extends ue{constructor(e,t){super(),this.type=`ExtrudeGeometry`,this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,i=[],r=[];for(let a=0,c=e.length;a<c;a++){let l=e[a];o(l)}this.setAttribute(`position`,new oe(i,3)),this.setAttribute(`uv`,new oe(r,2)),this.computeVertexNormals();function o(a){let c=[],l=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:100,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:6,m=t.bevelSize!==void 0?t.bevelSize:f-2,x=t.bevelOffset!==void 0?t.bevelOffset:0,y=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,p=t.UVGenerator!==void 0?t.UVGenerator:iy;t.amount!==void 0&&(console.warn(`THREE.ExtrudeBufferGeometry: amount has been renamed to depth.`),h=t.amount);let w,b=!1,E,v,A,L;g&&(w=g.getSpacedPoints(u),b=!0,d=!1,E=g.computeFrenetFrames(u,!1),v=new _,A=new _,L=new _),d||(y=0,f=0,m=0,x=0);let I=a.extractPoints(l),N=I.shape,U=I.holes;if(!Qt.isClockWise(N)){N=N.reverse();for(let Y=0,j=U.length;Y<j;Y++){let ee=U[Y];Qt.isClockWise(ee)&&(U[Y]=ee.reverse())}}let R=Qt.triangulateShape(N,U),D=N;for(let Y=0,j=U.length;Y<j;Y++){let ee=U[Y];N=N.concat(ee)}function F(Y,j,ee){return j||console.error(`THREE.ExtrudeGeometry: vec does not exist`),j.clone().multiplyScalar(ee).add(Y)}let P=N.length,X=R.length;function $(Y,j,ee){let he,ne,T,S=Y.x-j.x,k=Y.y-j.y,V=ee.x-Y.x,ie=ee.y-Y.y,ce=S*S+k*k,Pe=S*ie-k*V;if(Math.abs(Pe)>Number.EPSILON){let ge=Math.sqrt(ce),C=Math.sqrt(V*V+ie*ie),J=j.x-k/ge,Q=j.y+S/ge,de=ee.x-ie/C,q=ee.y+V/C,me=((de-J)*ie-(q-Q)*V)/(S*ie-k*V);he=J+S*me-Y.x,ne=Q+k*me-Y.y;let Fe=he*he+ne*ne;if(Fe<=2)return new W(he,ne);T=Math.sqrt(Fe/2)}else{let ge=!1;S>Number.EPSILON?V>Number.EPSILON&&(ge=!0):S<-Number.EPSILON?V<-Number.EPSILON&&(ge=!0):Math.sign(k)===Math.sign(ie)&&(ge=!0),ge?(he=-k,ne=S,T=Math.sqrt(ce)):(he=S,ne=k,T=Math.sqrt(ce/2))}return new W(he/T,ne/T)}let Z=[];for(let Y=0,j=D.length,ee=j-1,he=Y+1;Y<j;Y++,ee++,he++)ee===j&&(ee=0),he===j&&(he=0),Z[Y]=$(D[Y],D[ee],D[he]);let ae=[],re,fe=Z.concat();for(let Y=0,j=U.length;Y<j;Y++){let ee=U[Y];re=[];for(let he=0,ne=ee.length,T=ne-1,S=he+1;he<ne;he++,T++,S++)T===ne&&(T=0),S===ne&&(S=0),re[he]=$(ee[he],ee[T],ee[S]);ae.push(re),fe=fe.concat(re)}for(let Y=0;Y<y;Y++){let j=Y/y,ee=f*Math.cos(j*Math.PI/2),he=m*Math.sin(j*Math.PI/2)+x;for(let ne=0,T=D.length;ne<T;ne++){let S=F(D[ne],Z[ne],he);_e(S.x,S.y,-ee)}for(let ne=0,T=U.length;ne<T;ne++){let S=U[ne];re=ae[ne];for(let k=0,V=S.length;k<V;k++){let ie=F(S[k],re[k],he);_e(ie.x,ie.y,-ee)}}}let ve=m+x;for(let Y=0;Y<P;Y++){let j=d?F(N[Y],fe[Y],ve):N[Y];b?(A.copy(E.normals[0]).multiplyScalar(j.x),v.copy(E.binormals[0]).multiplyScalar(j.y),L.copy(w[0]).add(A).add(v),_e(L.x,L.y,L.z)):_e(j.x,j.y,0)}for(let Y=1;Y<=u;Y++)for(let j=0;j<P;j++){let ee=d?F(N[j],fe[j],ve):N[j];b?(A.copy(E.normals[Y]).multiplyScalar(ee.x),v.copy(E.binormals[Y]).multiplyScalar(ee.y),L.copy(w[Y]).add(A).add(v),_e(L.x,L.y,L.z)):_e(ee.x,ee.y,h/u*Y)}for(let Y=y-1;Y>=0;Y--){let j=Y/y,ee=f*Math.cos(j*Math.PI/2),he=m*Math.sin(j*Math.PI/2)+x;for(let ne=0,T=D.length;ne<T;ne++){let S=F(D[ne],Z[ne],he);_e(S.x,S.y,h+ee)}for(let ne=0,T=U.length;ne<T;ne++){let S=U[ne];re=ae[ne];for(let k=0,V=S.length;k<V;k++){let ie=F(S[k],re[k],he);b?_e(ie.x,ie.y+w[u-1].y,w[u-1].x+ee):_e(ie.x,ie.y,h+ee)}}}G(),Be();function G(){let Y=i.length/3;if(d){let j=0,ee=P*j;for(let he=0;he<X;he++){let ne=R[he];pe(ne[2]+ee,ne[1]+ee,ne[0]+ee)}j=u+y*2,ee=P*j;for(let he=0;he<X;he++){let ne=R[he];pe(ne[0]+ee,ne[1]+ee,ne[2]+ee)}}else{for(let j=0;j<X;j++){let ee=R[j];pe(ee[2],ee[1],ee[0])}for(let j=0;j<X;j++){let ee=R[j];pe(ee[0]+P*u,ee[1]+P*u,ee[2]+P*u)}}n.addGroup(Y,i.length/3-Y,0)}function Be(){let Y=i.length/3,j=0;Le(D,j),j+=D.length;for(let ee=0,he=U.length;ee<he;ee++){let ne=U[ee];Le(ne,j),j+=ne.length}n.addGroup(Y,i.length/3-Y,1)}function Le(Y,j){let ee=Y.length;for(;--ee>=0;){let he=ee,ne=ee-1;ne<0&&(ne=Y.length-1);for(let T=0,S=u+y*2;T<S;T++){let k=P*T,V=P*(T+1);Ce(j+he+k,j+ne+k,j+ne+V,j+he+V)}}}function _e(Y,j,ee){c.push(Y),c.push(j),c.push(ee)}function pe(Y,j,ee){Se(Y),Se(j),Se(ee);let he=i.length/3,ne=p.generateTopUV(n,i,he-3,he-2,he-1);Te(ne[0]),Te(ne[1]),Te(ne[2])}function Ce(Y,j,ee,he){Se(Y),Se(j),Se(he),Se(j),Se(ee),Se(he);let ne=i.length/3,T=p.generateSideWallUV(n,i,ne-6,ne-3,ne-2,ne-1);Te(T[0]),Te(T[1]),Te(T[3]),Te(T[1]),Te(T[2]),Te(T[3])}function Se(Y){i.push(c[Y*3+0]),i.push(c[Y*3+1]),i.push(c[Y*3+2])}function Te(Y){r.push(Y.x),r.push(Y.y)}}}toJSON(){let e=ue.prototype.toJSON.call(this),t=this.parameters.shapes,n=this.parameters.options;return ry(t,n,e)}};var iy={generateTopUV:function(s,e,t,n,i){let r=e[t*3],o=e[t*3+1],a=e[n*3],c=e[n*3+1],l=e[i*3],u=e[i*3+1];return[new W(r,o),new W(a,c),new W(l,u)]},generateSideWallUV:function(s,e,t,n,i,r){let o=e[t*3],a=e[t*3+1],c=e[t*3+2],l=e[n*3],u=e[n*3+1],h=e[n*3+2],d=e[i*3],f=e[i*3+1],m=e[i*3+2],x=e[r*3],y=e[r*3+1],g=e[r*3+2];return Math.abs(a-u)<.01?[new W(o,1-c),new W(l,1-h),new W(d,1-m),new W(x,1-g)]:[new W(a,1-c),new W(u,1-h),new W(f,1-m),new W(y,1-g)]}};function ry(s,e,t){if(t.shapes=[],Array.isArray(s))for(let n=0,i=s.length;n<i;n++){let r=s[n];t.shapes.push(r.uuid)}else t.shapes.push(s.uuid);return e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Gs=class extends wn{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(i,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}};var ks=class extends ue{constructor(e,t=12,n=0,i=Math.PI*2){super(),this.type=`LatheGeometry`,this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=at(i,0,Math.PI*2);let r=[],o=[],a=[],c=1/t,l=new _,u=new W;for(let h=0;h<=t;h++){let d=n+h*c*i,f=Math.sin(d),m=Math.cos(d);for(let x=0;x<=e.length-1;x++)l.x=e[x].x*f,l.y=e[x].y,l.z=e[x].x*m,o.push(l.x,l.y,l.z),u.x=h/t,u.y=x/(e.length-1),a.push(u.x,u.y)}for(let h=0;h<t;h++)for(let d=0;d<e.length-1;d++){let f=d+h*e.length,m=f,x=f+e.length,y=f+e.length+1,g=f+1;r.push(m,x,g),r.push(x,y,g)}if(this.setIndex(r),this.setAttribute(`position`,new oe(o,3)),this.setAttribute(`uv`,new oe(a,2)),this.computeVertexNormals(),i===Math.PI*2){let h=this.attributes.normal.array,d=new _,f=new _,m=new _,x=t*e.length*3;for(let y=0,g=0;y<e.length;y++,g+=3)d.x=h[g+0],d.y=h[g+1],d.z=h[g+2],f.x=h[x+g+0],f.y=h[x+g+1],f.z=h[x+g+2],m.addVectors(d,f).normalize(),h[g+0]=h[x+g+0]=m.x,h[g+1]=h[x+g+1]=m.y,h[g+2]=h[x+g+2]=m.z}}};var _r=class extends wn{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type=`OctahedronGeometry`,this.parameters={radius:e,detail:t}}};var Vs=class extends ue{constructor(e,t,n){super(),this.type=`ParametricGeometry`,this.parameters={func:e,slices:t,stacks:n};let i=[],r=[],o=[],a=[],c=1e-5,l=new _,u=new _,h=new _,d=new _,f=new _;e.length<3&&console.error(`THREE.ParametricGeometry: Function must now modify a Vector3 as third parameter.`);let m=t+1;for(let x=0;x<=n;x++){let y=x/n;for(let g=0;g<=t;g++){let p=g/t;e(p,y,u),r.push(u.x,u.y,u.z),p-c>=0?(e(p-c,y,h),d.subVectors(u,h)):(e(p+c,y,h),d.subVectors(h,u)),y-c>=0?(e(p,y-c,h),f.subVectors(u,h)):(e(p,y+c,h),f.subVectors(h,u)),l.crossVectors(d,f).normalize(),o.push(l.x,l.y,l.z),a.push(p,y)}}for(let x=0;x<n;x++)for(let y=0;y<t;y++){let g=x*m+y,p=x*m+y+1,w=(x+1)*m+y+1,b=(x+1)*m+y;i.push(g,p,b),i.push(p,w,b)}this.setIndex(i),this.setAttribute(`position`,new oe(r,3)),this.setAttribute(`normal`,new oe(o,3)),this.setAttribute(`uv`,new oe(a,2))}};var Ws=class extends ue{constructor(e=.5,t=1,n=8,i=1,r=0,o=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:o},n=Math.max(3,n),i=Math.max(1,i);let a=[],c=[],l=[],u=[],h=e,d=(t-e)/i,f=new _,m=new W;for(let x=0;x<=i;x++){for(let y=0;y<=n;y++){let g=r+y/n*o;f.x=h*Math.cos(g),f.y=h*Math.sin(g),c.push(f.x,f.y,f.z),l.push(0,0,1),m.x=(f.x/t+1)/2,m.y=(f.y/t+1)/2,u.push(m.x,m.y)}h+=d}for(let x=0;x<i;x++){let y=x*(n+1);for(let g=0;g<n;g++){let p=g+y,w=p,b=p+n+1,E=p+n+2,v=p+1;a.push(w,b,v),a.push(b,E,v)}}this.setIndex(a),this.setAttribute(`position`,new oe(c,3)),this.setAttribute(`normal`,new oe(l,3)),this.setAttribute(`uv`,new oe(u,2))}};var wr=class extends ue{constructor(e,t=12){super(),this.type=`ShapeGeometry`,this.parameters={shapes:e,curveSegments:t};let n=[],i=[],r=[],o=[],a=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let u=0;u<e.length;u++)l(e[u]),this.addGroup(a,c,u),a+=c,c=0;this.setIndex(n),this.setAttribute(`position`,new oe(i,3)),this.setAttribute(`normal`,new oe(r,3)),this.setAttribute(`uv`,new oe(o,2));function l(u){let h=i.length/3,d=u.extractPoints(t),f=d.shape,m=d.holes;Qt.isClockWise(f)===!1&&(f=f.reverse());for(let y=0,g=m.length;y<g;y++){let p=m[y];Qt.isClockWise(p)===!0&&(m[y]=p.reverse())}let x=Qt.triangulateShape(f,m);for(let y=0,g=m.length;y<g;y++){let p=m[y];f=f.concat(p)}for(let y=0,g=f.length;y<g;y++){let p=f[y];i.push(p.x,p.y,0),r.push(0,0,1),o.push(p.x,p.y)}for(let y=0,g=x.length;y<g;y++){let p=x[y],w=p[0]+h,b=p[1]+h,E=p[2]+h;n.push(w,b,E),c+=3}}}toJSON(){let e=ue.prototype.toJSON.call(this),t=this.parameters.shapes;return sy(t,e)}};function sy(s,e){if(e.shapes=[],Array.isArray(s))for(let t=0,n=s.length;t<n;t++){let i=s[t];e.shapes.push(i.uuid)}else e.shapes.push(s.uuid);return e}var br=class extends ue{constructor(e=1,t=8,n=6,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(o+a,Math.PI),l=0,u=[],h=new _,d=new _,f=[],m=[],x=[],y=[];for(let g=0;g<=n;g++){let p=[],w=g/n,b=0;g==0&&o==0?b=.5/t:g==n&&c==Math.PI&&(b=-.5/t);for(let E=0;E<=t;E++){let v=E/t;h.x=-e*Math.cos(i+v*r)*Math.sin(o+w*a),h.y=e*Math.cos(o+w*a),h.z=e*Math.sin(i+v*r)*Math.sin(o+w*a),m.push(h.x,h.y,h.z),d.copy(h).normalize(),x.push(d.x,d.y,d.z),y.push(v+b,1-w),p.push(l++)}u.push(p)}for(let g=0;g<n;g++)for(let p=0;p<t;p++){let w=u[g][p+1],b=u[g][p],E=u[g+1][p],v=u[g+1][p+1];(g!==0||o>0)&&f.push(w,b,v),(g!==n-1||c<Math.PI)&&f.push(b,E,v)}this.setIndex(f),this.setAttribute(`position`,new oe(m,3)),this.setAttribute(`normal`,new oe(x,3)),this.setAttribute(`uv`,new oe(y,2))}};var qs=class extends wn{constructor(e=1,t=0){super([1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],[2,1,0,0,3,2,1,3,0,2,3,1],e,t),this.type=`TetrahedronGeometry`,this.parameters={radius:e,detail:t}}};var Xs=class extends rn{constructor(e,t={}){let n=t.font;if(!(n&&n.isFont))return console.error(`THREE.TextGeometry: font parameter is not an instance of THREE.Font.`),new ue;let i=n.generateShapes(e,t.size);t.depth=t.height!==void 0?t.height:50,t.bevelThickness===void 0&&(t.bevelThickness=10),t.bevelSize===void 0&&(t.bevelSize=8),t.bevelEnabled===void 0&&(t.bevelEnabled=!1),super(i,t),this.type=`TextGeometry`}};var Ys=class extends ue{constructor(e=1,t=.4,n=8,i=6,r=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);let o=[],a=[],c=[],l=[],u=new _,h=new _,d=new _;for(let f=0;f<=n;f++)for(let m=0;m<=i;m++){let x=m/i*r,y=f/n*Math.PI*2;h.x=(e+t*Math.cos(y))*Math.cos(x),h.y=(e+t*Math.cos(y))*Math.sin(x),h.z=t*Math.sin(y),a.push(h.x,h.y,h.z),u.x=e*Math.cos(x),u.y=e*Math.sin(x),d.subVectors(h,u).normalize(),c.push(d.x,d.y,d.z),l.push(m/i),l.push(f/n)}for(let f=1;f<=n;f++)for(let m=1;m<=i;m++){let x=(i+1)*f+m-1,y=(i+1)*(f-1)+m-1,g=(i+1)*(f-1)+m,p=(i+1)*f+m;o.push(x,y,p),o.push(y,g,p)}this.setIndex(o),this.setAttribute(`position`,new oe(a,3)),this.setAttribute(`normal`,new oe(c,3)),this.setAttribute(`uv`,new oe(l,2))}};var Zs=class extends ue{constructor(e=1,t=.4,n=64,i=8,r=2,o=3){super(),this.type=`TorusKnotGeometry`,this.parameters={radius:e,tube:t,tubularSegments:n,radialSegments:i,p:r,q:o},n=Math.floor(n),i=Math.floor(i);let a=[],c=[],l=[],u=[],h=new _,d=new _,f=new _,m=new _,x=new _,y=new _,g=new _;for(let w=0;w<=n;++w){let b=w/n*r*Math.PI*2;p(b,r,o,e,f),p(b+.01,r,o,e,m),y.subVectors(m,f),g.addVectors(m,f),x.crossVectors(y,g),g.crossVectors(x,y),x.normalize(),g.normalize();for(let E=0;E<=i;++E){let v=E/i*Math.PI*2,A=-t*Math.cos(v),L=t*Math.sin(v);h.x=f.x+(A*g.x+L*x.x),h.y=f.y+(A*g.y+L*x.y),h.z=f.z+(A*g.z+L*x.z),c.push(h.x,h.y,h.z),d.subVectors(h,f).normalize(),l.push(d.x,d.y,d.z),u.push(w/n),u.push(E/i)}}for(let w=1;w<=n;w++)for(let b=1;b<=i;b++){let E=(i+1)*(w-1)+(b-1),v=(i+1)*w+(b-1),A=(i+1)*w+b,L=(i+1)*(w-1)+b;a.push(E,v,L),a.push(v,A,L)}this.setIndex(a),this.setAttribute(`position`,new oe(c,3)),this.setAttribute(`normal`,new oe(l,3)),this.setAttribute(`uv`,new oe(u,2));function p(w,b,E,v,A){let L=Math.cos(w),I=Math.sin(w),N=E/b*w,U=Math.cos(N);A.x=v*(2+U)*.5*L,A.y=v*(2+U)*I*.5,A.z=v*Math.sin(N)*.5}}};var Js=class extends ue{constructor(e,t=64,n=1,i=8,r=!1){super(),this.type=`TubeGeometry`,this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:r};let o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new _,c=new _,l=new W,u=new _,h=[],d=[],f=[],m=[];x(),this.setIndex(m),this.setAttribute(`position`,new oe(h,3)),this.setAttribute(`normal`,new oe(d,3)),this.setAttribute(`uv`,new oe(f,2));function x(){for(let w=0;w<t;w++)y(w);y(r===!1?t:0),p(),g()}function y(w){u=e.getPointAt(w/t,u);let b=o.normals[w],E=o.binormals[w];for(let v=0;v<=i;v++){let A=v/i*Math.PI*2,L=Math.sin(A),I=-Math.cos(A);c.x=I*b.x+L*E.x,c.y=I*b.y+L*E.y,c.z=I*b.z+L*E.z,c.normalize(),d.push(c.x,c.y,c.z),a.x=u.x+n*c.x,a.y=u.y+n*c.y,a.z=u.z+n*c.z,h.push(a.x,a.y,a.z)}}function g(){for(let w=1;w<=t;w++)for(let b=1;b<=i;b++){let E=(i+1)*(w-1)+(b-1),v=(i+1)*w+(b-1),A=(i+1)*w+b,L=(i+1)*(w-1)+b;m.push(E,v,L),m.push(v,A,L)}}function p(){for(let w=0;w<=t;w++)for(let b=0;b<=i;b++)l.x=w/t,l.y=b/i,f.push(l.x,l.y)}}toJSON(){let e=ue.prototype.toJSON.call(this);return e.path=this.parameters.path.toJSON(),e}};var js=class extends ue{constructor(e){if(super(),this.type=`WireframeGeometry`,e.isGeometry===!0){console.error(`THREE.WireframeGeometry no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.`);return}let t=[],n=[0,0],i={},r=new _;if(e.index!==null){let o=e.attributes.position,a=e.index,c=e.groups;c.length===0&&(c=[{start:0,count:a.count,materialIndex:0}]);for(let l=0,u=c.length;l<u;++l){let h=c[l],d=h.start,f=h.count;for(let m=d,x=d+f;m<x;m+=3)for(let y=0;y<3;y++){let g=a.getX(m+y),p=a.getX(m+(y+1)%3);n[0]=Math.min(g,p),n[1]=Math.max(g,p);let w=n[0]+`,`+n[1];i[w]===void 0&&(i[w]={index1:n[0],index2:n[1]})}}for(let l in i){let u=i[l];r.fromBufferAttribute(o,u.index1),t.push(r.x,r.y,r.z),r.fromBufferAttribute(o,u.index2),t.push(r.x,r.y,r.z)}}else{let o=e.attributes.position;for(let a=0,c=o.count/3;a<c;a++)for(let l=0;l<3;l++){let u=3*a+l;r.fromBufferAttribute(o,u),t.push(r.x,r.y,r.z);let h=3*a+(l+1)%3;r.fromBufferAttribute(o,h),t.push(r.x,r.y,r.z)}}this.setAttribute(`position`,new oe(t,3))}};var ft=Object.freeze({__proto__:null,BoxGeometry:Un,BoxBufferGeometry:Un,CircleGeometry:zs,CircleBufferGeometry:zs,ConeGeometry:Os,ConeBufferGeometry:Os,CylinderGeometry:Mi,CylinderBufferGeometry:Mi,DodecahedronGeometry:Us,DodecahedronBufferGeometry:Us,EdgesGeometry:Hs,ExtrudeGeometry:rn,ExtrudeBufferGeometry:rn,IcosahedronGeometry:Gs,IcosahedronBufferGeometry:Gs,LatheGeometry:ks,LatheBufferGeometry:ks,OctahedronGeometry:_r,OctahedronBufferGeometry:_r,ParametricGeometry:Vs,ParametricBufferGeometry:Vs,PlaneGeometry:cr,PlaneBufferGeometry:cr,PolyhedronGeometry:wn,PolyhedronBufferGeometry:wn,RingGeometry:Ws,RingBufferGeometry:Ws,ShapeGeometry:wr,ShapeBufferGeometry:wr,SphereGeometry:br,SphereBufferGeometry:br,TetrahedronGeometry:qs,TetrahedronBufferGeometry:qs,TextGeometry:Xs,TextBufferGeometry:Xs,TorusGeometry:Ys,TorusBufferGeometry:Ys,TorusKnotGeometry:Zs,TorusKnotBufferGeometry:Zs,TubeGeometry:Js,TubeBufferGeometry:Js,WireframeGeometry:js});var $s=class extends tt{constructor(e){super(),this.type=`ShadowMaterial`,this.color=new se(0),this.transparent=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this}};$s.prototype.isShadowMaterial=!0;var Vn=class extends kt{constructor(e){super(e),this.type=`RawShaderMaterial`}};Vn.prototype.isRawShaderMaterial=!0;var Mr=class extends tt{constructor(e){super(),this.defines={STANDARD:``},this.type=`MeshStandardMaterial`,this.color=new se(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new W(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.skinning=!1,this.morphTargets=!1,this.morphNormals=!1,this.flatShading=!1,this.vertexTangents=!1,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.skinning=e.skinning,this.morphTargets=e.morphTargets,this.morphNormals=e.morphNormals,this.flatShading=e.flatShading,this.vertexTangents=e.vertexTangents,this}};Mr.prototype.isMeshStandardMaterial=!0;var Qs=class extends Mr{constructor(e){super(),this.defines={STANDARD:``,PHYSICAL:``},this.type=`MeshPhysicalMaterial`,this.clearcoat=0,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new W(1,1),this.clearcoatNormalMap=null,this.reflectivity=.5,Object.defineProperty(this,"ior",{get:function(){return(1+.4*this.reflectivity)/(1-.4*this.reflectivity)},set:function(t){this.reflectivity=at(2.5*(t-1)/(t+1),0,1)}}),this.sheen=null,this.transmission=0,this.transmissionMap=null,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``,PHYSICAL:``},this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.reflectivity=e.reflectivity,e.sheen?this.sheen=(this.sheen||new se).copy(e.sheen):this.sheen=null,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this}};Qs.prototype.isMeshPhysicalMaterial=!0;var Ks=class extends tt{constructor(e){super(),this.type=`MeshPhongMaterial`,this.color=new se(16777215),this.specular=new se(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new W(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.skinning=!1,this.morphTargets=!1,this.morphNormals=!1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.skinning=e.skinning,this.morphTargets=e.morphTargets,this.morphNormals=e.morphNormals,this.flatShading=e.flatShading,this}};Ks.prototype.isMeshPhongMaterial=!0;var eo=class extends tt{constructor(e){super(),this.defines={TOON:``},this.type=`MeshToonMaterial`,this.color=new se(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new W(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.skinning=!1,this.morphTargets=!1,this.morphNormals=!1,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.skinning=e.skinning,this.morphTargets=e.morphTargets,this.morphNormals=e.morphNormals,this}};eo.prototype.isMeshToonMaterial=!0;var to=class extends tt{constructor(e){super(),this.type=`MeshNormalMaterial`,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new W(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.skinning=!1,this.morphTargets=!1,this.morphNormals=!1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.skinning=e.skinning,this.morphTargets=e.morphTargets,this.morphNormals=e.morphNormals,this.flatShading=e.flatShading,this}};to.prototype.isMeshNormalMaterial=!0;var no=class extends tt{constructor(e){super(),this.type=`MeshLambertMaterial`,this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.skinning=!1,this.morphTargets=!1,this.morphNormals=!1,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.skinning=e.skinning,this.morphTargets=e.morphTargets,this.morphNormals=e.morphNormals,this}};no.prototype.isMeshLambertMaterial=!0;var io=class extends tt{constructor(e){super(),this.defines={MATCAP:``},this.type=`MeshMatcapMaterial`,this.color=new se(16777215),this.matcap=null,this.map=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new W(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.skinning=!1,this.morphTargets=!1,this.morphNormals=!1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.defines={MATCAP:``},this.color.copy(e.color),this.matcap=e.matcap,this.map=e.map,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.skinning=e.skinning,this.morphTargets=e.morphTargets,this.morphNormals=e.morphNormals,this.flatShading=e.flatShading,this}};io.prototype.isMeshMatcapMaterial=!0;var ro=class extends nt{constructor(e){super(),this.type=`LineDashedMaterial`,this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(e)}copy(e){return super.copy(e),this.scale=e.scale,this.dashSize=e.dashSize,this.gapSize=e.gapSize,this}};ro.prototype.isLineDashedMaterial=!0;var oy=Object.freeze({__proto__:null,ShadowMaterial:$s,SpriteMaterial:fr,RawShaderMaterial:Vn,ShaderMaterial:kt,PointsMaterial:_n,MeshPhysicalMaterial:Qs,MeshStandardMaterial:Mr,MeshPhongMaterial:Ks,MeshToonMaterial:eo,MeshNormalMaterial:to,MeshLambertMaterial:no,MeshDepthMaterial:hr,MeshDistanceMaterial:ur,MeshBasicMaterial:Gt,MeshMatcapMaterial:io,LineDashedMaterial:ro,LineBasicMaterial:nt,Material:tt});var Ge={arraySlice:function(s,e,t){return Ge.isTypedArray(s)?new s.constructor(s.subarray(e,t!==void 0?t:s.length)):s.slice(e,t)},convertArray:function(s,e,t){return!s||!t&&s.constructor===e?s:typeof e.BYTES_PER_ELEMENT==`number`?new e(s):Array.prototype.slice.call(s)},isTypedArray:function(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)},getKeyframeOrder:function(s){function e(i,r){return s[i]-s[r]}let t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n},sortedArray:function(s,e,t){let n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let c=0;c!==e;++c)i[o++]=s[a+c]}return i},flattenJSON:function(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push.apply(t,o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=s[i++];while(r!==void 0)},subclip:function(s,e,t,n,i=30){let r=s.clone();r.name=e;let o=[];for(let c=0;c<r.tracks.length;++c){let l=r.tracks[c],u=l.getValueSize(),h=[],d=[];for(let f=0;f<l.times.length;++f){let m=l.times[f]*i;if(!(m<t||m>=n)){h.push(l.times[f]);for(let x=0;x<u;++x)d.push(l.values[f*u+x])}}h.length!==0&&(l.times=Ge.convertArray(h,l.times.constructor),l.values=Ge.convertArray(d,l.values.constructor),o.push(l))}r.tracks=o;let a=Infinity;for(let c=0;c<r.tracks.length;++c)a>r.tracks[c].times[0]&&(a=r.tracks[c].times[0]);for(let c=0;c<r.tracks.length;++c)r.tracks[c].shift(-1*a);return r.resetDuration(),r},makeClipAdditive:function(s,e=0,t=s,n=30){n<=0&&(n=30);let i=t.tracks.length,r=e/n;for(let o=0;o<i;++o){let a=t.tracks[o],c=a.ValueTypeName;if(c===`bool`||c===`string`)continue;let l=s.tracks.find(function(g){return g.name===a.name&&g.ValueTypeName===c});if(l===void 0)continue;let u=0,h=a.getValueSize();a.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(u=h/3);let d=0,f=l.getValueSize();l.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(d=f/3);let m=a.times.length-1,x;if(r<=a.times[0]){let g=u,p=h-u;x=Ge.arraySlice(a.values,g,p)}else if(r>=a.times[m]){let g=m*h+u,p=g+h-u;x=Ge.arraySlice(a.values,g,p)}else{let g=a.createInterpolant(),p=u,w=h-u;g.evaluate(r),x=Ge.arraySlice(g.resultBuffer,p,w)}c===`quaternion`&&new et().fromArray(x).normalize().conjugate().toArray(x);let y=l.times.length;for(let g=0;g<y;++g){let p=g*f+d;if(c===`quaternion`)et.multiplyQuaternionsFlat(l.values,p,x,0,l.values,p);else{let w=f-d*2;for(let b=0;b<w;++b)l.values[p+b]-=x[b]}}}return s.blendMode=jh,s}};var Wt=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let o;n:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.afterEnd_(n-1,e,r)}if(n===a)break;if(r=i,i=t[++n],e<i)break t}o=t.length;break n}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.beforeStart_(0,e,i);if(n===c)break;if(i=r,r=t[--n-1],e>=r)break t}o=n,n=0;break n}break e}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.beforeStart_(0,e,i);if(i===void 0)return n=t.length,this._cachedIndex=n,this.afterEnd_(n-1,r,e)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let o=0;o!==i;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error(`call to abstract method`)}intervalChanged_(){}};Wt.prototype.beforeStart_=Wt.prototype.copySampleValue_;Wt.prototype.afterEnd_=Wt.prototype.copySampleValue_;var Xa=class extends Wt{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:di,endingEnd:di}}intervalChanged_(e,t,n){let i=this.parameterPositions,r=e-2,o=e+1,a=i[r],c=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case fi:r=e,a=2*t-n;break;case As:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case fi:o=e,c=2*n-t;break;case As:o=1,c=n+i[1]-i[0];break;default:o=e-1,c=t}let l=(n-t)*.5,u=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(n-t)/(i-t),x=m*m,y=x*m,g=-d*y+2*d*x-d*m,p=(1+d)*y+(-1.5-2*d)*x+(-.5+d)*m+1,w=(-1-f)*y+(1.5+f)*x+.5*m,b=f*y-f*x;for(let E=0;E!==a;++E)r[E]=g*o[u+E]+p*o[l+E]+w*o[c+E]+b*o[h+E];return r}};var so=class extends Wt{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=(n-t)/(i-t),h=1-u;for(let d=0;d!==a;++d)r[d]=o[l+d]*h+o[c+d]*u;return r}};var Ya=class extends Wt{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}};var At=class{constructor(e,t,n,i){if(e===void 0)throw new Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw new Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Ge.convertArray(t,this.TimeBufferType),this.values=Ge.convertArray(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ge.convertArray(e.times,Array),values:Ge.convertArray(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ya(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new so(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Xa(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Es:t=this.InterpolantFactoryMethodDiscrete;break;case Ts:t=this.InterpolantFactoryMethodLinear;break;case zo:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn(`THREE.KeyframeTrack:`,n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Es;case this.InterpolantFactoryMethodLinear:return Ts;case this.InterpolantFactoryMethodSmooth:return zo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,r=0,o=i-1;for(;r!==i&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=Ge.arraySlice(n,r,o),this.values=Ge.arraySlice(this.values,r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error(`THREE.KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,i=this.values,r=n.length;r===0&&(console.error(`THREE.KeyframeTrack: Track is empty.`,this),e=!1);let o=null;for(let a=0;a!==r;a++){let c=n[a];if(typeof c==`number`&&isNaN(c)){console.error(`THREE.KeyframeTrack: Time is not a valid number.`,this,a,c),e=!1;break}if(o!==null&&o>c){console.error(`THREE.KeyframeTrack: Out of order keys.`,this,a,c,o),e=!1;break}o=c}if(i!==void 0&&Ge.isTypedArray(i))for(let a=0,c=i.length;a!==c;++a){let l=i[a];if(isNaN(l)){console.error(`THREE.KeyframeTrack: Value is not a valid number.`,this,a,l),e=!1;break}}return e}optimize(){let e=Ge.arraySlice(this.times),t=Ge.arraySlice(this.values),n=this.getValueSize(),i=this.getInterpolation()===zo,r=e.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=e[a];if(l!==e[a+1]&&(a!==1||l!==e[0]))if(i)c=!0;else{let h=a*n,d=h-n,f=h+n;for(let m=0;m!==n;++m){let x=t[h+m];if(x!==t[d+m]||x!==t[f+m]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];let h=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=Ge.arraySlice(e,0,o),this.values=Ge.arraySlice(t,0,o*n)):(this.times=e,this.values=t),this}clone(){let e=Ge.arraySlice(this.times,0),t=Ge.arraySlice(this.values,0),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}};At.prototype.TimeBufferType=Float32Array;At.prototype.ValueBufferType=Float32Array;At.prototype.DefaultInterpolation=Ts;var Mn=class extends At{};Mn.prototype.ValueTypeName=`bool`;Mn.prototype.ValueBufferType=Array;Mn.prototype.DefaultInterpolation=Es;Mn.prototype.InterpolantFactoryMethodLinear=void 0;Mn.prototype.InterpolantFactoryMethodSmooth=void 0;var oo=class extends At{};oo.prototype.ValueTypeName=`color`;var Si=class extends At{};Si.prototype.ValueTypeName=`number`;var Za=class extends Wt{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-t)/(i-t),l=e*a;for(let u=l+a;l!==u;l+=4)et.slerpFlat(r,0,o,l-a,o,l,c);return r}};var Wn=class extends At{InterpolantFactoryMethodLinear(e){return new Za(this.times,this.values,this.getValueSize(),e)}};Wn.prototype.ValueTypeName=`quaternion`;Wn.prototype.DefaultInterpolation=Ts;Wn.prototype.InterpolantFactoryMethodSmooth=void 0;var Sn=class extends At{};Sn.prototype.ValueTypeName=`string`;Sn.prototype.ValueBufferType=Array;Sn.prototype.DefaultInterpolation=Es;Sn.prototype.InterpolantFactoryMethodLinear=void 0;Sn.prototype.InterpolantFactoryMethodSmooth=void 0;var Ei=class extends At{};Ei.prototype.ValueTypeName=`vector`;var Ti=class{constructor(e,t=-1,n,i=El){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Mt(),this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(ly(n[o]).scale(i));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){let t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=n.length;r!==o;++r)t.push(At.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){let r=t.length,o=[];for(let a=0;a<r;a++){let c=[],l=[];c.push((a+r-1)%r,a,(a+1)%r),l.push(0,1,0);let u=Ge.getKeyframeOrder(c);c=Ge.sortedArray(c,1,u),l=Ge.sortedArray(l,1,u),!i&&c[0]===0&&(c.push(r),l.push(l[0])),o.push(new Si(`.morphTargetInfluences[`+t[a].name+`]`,c,l).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){let l=e[a],u=l.name.match(r);if(u&&u.length>1){let h=u[1],d=i[h];d||(i[h]=d=[]),d.push(l)}}let o=[];for(let a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}static parseAnimation(e,t){if(!e)return console.error(`THREE.AnimationClip: No animation in JSONLoader data.`),null;let n=function(h,d,f,m,x){if(f.length!==0){let y=[],g=[];Ge.flattenJSON(f,y,g,m),y.length!==0&&x.push(new h(d,y,g))}},i=[],r=e.name||`default`,o=e.fps||30,a=e.blendMode,c=e.length||-1,l=e.hierarchy||[];for(let h=0;h<l.length;h++){let d=l[h].keys;if(!(!d||d.length===0))if(d[0].morphTargets){let f={},m;for(m=0;m<d.length;m++)if(d[m].morphTargets)for(let x=0;x<d[m].morphTargets.length;x++)f[d[m].morphTargets[x]]=-1;for(let x in f){let y=[],g=[];for(let p=0;p!==d[m].morphTargets.length;++p){let w=d[m];y.push(w.time),g.push(w.morphTarget===x?1:0)}i.push(new Si(`.morphTargetInfluence[`+x+`]`,y,g))}c=f.length*(o||1)}else{let f=`.bones[`+t[h].name+`]`;n(Ei,f+`.position`,d,`pos`,i),n(Wn,f+`.quaternion`,d,`rot`,i),n(Ei,f+`.scale`,d,`scl`,i)}}return i.length===0?null:new this(r,c,i,a)}resetDuration(){let e=this.tracks,t=0;for(let n=0,i=e.length;n!==i;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}};function ay(s){switch(s.toLowerCase()){case`scalar`:case`double`:case`float`:case`number`:case`integer`:return Si;case`vector`:case`vector2`:case`vector3`:case`vector4`:return Ei;case`color`:return oo;case`quaternion`:return Wn;case`bool`:case`boolean`:return Mn;case`string`:return Sn}throw new Error(`THREE.KeyframeTrack: Unsupported typeName: `+s)}function ly(s){if(s.type===void 0)throw new Error(`THREE.KeyframeTrack: track type undefined, can not parse`);let e=ay(s.type);if(s.times===void 0){let t=[],n=[];Ge.flattenJSON(s.keys,t,n,`value`),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}var Ai={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};var ao=class{constructor(e,t,n){let i=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(u){a++,r===!1&&i.onStart!==void 0&&i.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,i.onProgress!==void 0&&i.onProgress(u,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){let h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=l.length;h<d;h+=2){let f=l[h],m=l[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return m}return null}}};var cy=new ao;var lt=class{constructor(e){this.manager=e!==void 0?e:cy,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};var Dt={};var Ft=class extends lt{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Ai.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;if(Dt[e]!==void 0){Dt[e].push({onLoad:t,onProgress:n,onError:i});return}let c=e.match(/^data:(.*?)(;base64)?,(.*)$/),l;if(c){let u=c[1],h=!!c[2],d=c[3];d=decodeURIComponent(d),h&&(d=atob(d));try{let f,m=(this.responseType||``).toLowerCase();switch(m){case`arraybuffer`:case`blob`:let x=new Uint8Array(d.length);for(let g=0;g<d.length;g++)x[g]=d.charCodeAt(g);m===`blob`?f=new Blob([x.buffer],{type:u}):f=x.buffer;break;case`document`:f=new DOMParser().parseFromString(d,u);break;case`json`:f=JSON.parse(d);break;default:f=d;break}setTimeout(function(){t&&t(f),r.manager.itemEnd(e)},0)}catch(f){setTimeout(function(){i&&i(f),r.manager.itemError(e),r.manager.itemEnd(e)},0)}}else{Dt[e]=[],Dt[e].push({onLoad:t,onProgress:n,onError:i}),l=new XMLHttpRequest,l.open(`GET`,e,!0),l.addEventListener(`load`,function(u){let h=this.response,d=Dt[e];if(delete Dt[e],this.status===200||this.status===0){this.status===0&&console.warn(`THREE.FileLoader: HTTP Status 0 received.`),Ai.add(e,h);for(let f=0,m=d.length;f<m;f++){let x=d[f];x.onLoad&&x.onLoad(h)}r.manager.itemEnd(e)}else{for(let f=0,m=d.length;f<m;f++){let x=d[f];x.onError&&x.onError(u)}r.manager.itemError(e),r.manager.itemEnd(e)}},!1),l.addEventListener(`progress`,function(u){let h=Dt[e];for(let d=0,f=h.length;d<f;d++){let m=h[d];m.onProgress&&m.onProgress(u)}},!1),l.addEventListener(`error`,function(u){let h=Dt[e];delete Dt[e];for(let d=0,f=h.length;d<f;d++){let m=h[d];m.onError&&m.onError(u)}r.manager.itemError(e),r.manager.itemEnd(e)},!1),l.addEventListener(`abort`,function(u){let h=Dt[e];delete Dt[e];for(let d=0,f=h.length;d<f;d++){let m=h[d];m.onError&&m.onError(u)}r.manager.itemError(e),r.manager.itemEnd(e)},!1),this.responseType!==void 0&&(l.responseType=this.responseType),this.withCredentials!==void 0&&(l.withCredentials=this.withCredentials),l.overrideMimeType&&l.overrideMimeType(this.mimeType!==void 0?this.mimeType:`text/plain`);for(let u in this.requestHeader)l.setRequestHeader(u,this.requestHeader[u]);l.send(null)}return r.manager.itemStart(e),l}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}};var jc=class extends lt{constructor(e){super(e)}load(e,t,n,i){let r=this,o=new Ft(this.manager);o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(a){try{t(r.parse(JSON.parse(a)))}catch(c){i?i(c):console.error(c),r.manager.itemError(e)}},n,i)}parse(e){let t=[];for(let n=0;n<e.length;n++){let i=Ti.parse(e[n]);t.push(i)}return t}};var $c=class extends lt{constructor(e){super(e)}load(e,t,n,i){let r=this,o=[],a=new Bs,c=new Ft(this.manager);c.setPath(this.path),c.setResponseType(`arraybuffer`),c.setRequestHeader(this.requestHeader),c.setWithCredentials(r.withCredentials);let l=0;function u(h){c.load(e[h],function(d){let f=r.parse(d,!0);o[h]={width:f.width,height:f.height,format:f.format,mipmaps:f.mipmaps},l+=1,l===6&&(f.mipmapCount===1&&(a.minFilter=1006),a.image=o,a.format=f.format,a.needsUpdate=!0,t&&t(a))},n,i)}if(Array.isArray(e))for(let h=0,d=e.length;h<d;++h)u(h);else c.load(e,function(h){let d=r.parse(h,!0);if(d.isCubemap){let f=d.mipmaps.length/d.mipmapCount;for(let m=0;m<f;m++){o[m]={mipmaps:[]};for(let x=0;x<d.mipmapCount;x++)o[m].mipmaps.push(d.mipmaps[m*d.mipmapCount+x]),o[m].format=d.format,o[m].width=d.width,o[m].height=d.height}a.image=o}else a.image.width=d.width,a.image.height=d.height,a.mipmaps=d.mipmaps;d.mipmapCount===1&&(a.minFilter=1006),a.format=d.format,a.needsUpdate=!0,t&&t(a)},n,i);return a}};var Sr=class extends lt{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Ai.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;let a=document.createElementNS(`http://www.w3.org/1999/xhtml`,`img`);function c(){a.removeEventListener(`load`,c,!1),a.removeEventListener(`error`,l,!1),Ai.add(e,this),t&&t(this),r.manager.itemEnd(e)}function l(u){a.removeEventListener(`load`,c,!1),a.removeEventListener(`error`,l,!1),i&&i(u),r.manager.itemError(e),r.manager.itemEnd(e)}return a.addEventListener(`load`,c,!1),a.addEventListener(`error`,l,!1),e.substr(0,5)!==`data:`&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}};var Ja=class extends lt{constructor(e){super(e)}load(e,t,n,i){let r=new Hn,o=new Sr(this.manager);o.setCrossOrigin(this.crossOrigin),o.setPath(this.path);let a=0;function c(l){o.load(e[l],function(u){r.images[l]=u,a++,a===6&&(r.needsUpdate=!0,t&&t(r))},void 0,i)}for(let l=0;l<e.length;++l)c(l);return r}};var ja=class extends lt{constructor(e){super(e)}load(e,t,n,i){let r=this,o=new Gn,a=new Ft(this.manager);return a.setResponseType(`arraybuffer`),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(r.withCredentials),a.load(e,function(c){let l=r.parse(c);l&&(l.image!==void 0?o.image=l.image:l.data!==void 0&&(o.image.width=l.width,o.image.height=l.height,o.image.data=l.data),o.wrapS=l.wrapS!==void 0?l.wrapS:1001,o.wrapT=l.wrapT!==void 0?l.wrapT:1001,o.magFilter=l.magFilter!==void 0?l.magFilter:1006,o.minFilter=l.minFilter!==void 0?l.minFilter:1006,o.anisotropy=l.anisotropy!==void 0?l.anisotropy:1,l.encoding!==void 0&&(o.encoding=l.encoding),l.flipY!==void 0&&(o.flipY=l.flipY),l.format!==void 0&&(o.format=l.format),l.type!==void 0&&(o.type=l.type),l.mipmaps!==void 0&&(o.mipmaps=l.mipmaps,o.minFilter=1008),l.mipmapCount===1&&(o.minFilter=1006),l.generateMipmaps!==void 0&&(o.generateMipmaps=l.generateMipmaps),o.needsUpdate=!0,t&&t(o,l))},n,i),o}};var $a=class extends lt{constructor(e){super(e)}load(e,t,n,i){let r=new St,o=new Sr(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a;let c=e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0;r.format=c?zn:Tt,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}};var _t=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200}getPoint(){return console.warn(`THREE.Curve: .getPoint() not implemented.`),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,i=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),i=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,c=r-1,l;for(;a<=c;)if(i=Math.floor(a+(c-a)/2),l=n[i]-o,l<0)a=i+1;else if(l>0)c=i-1;else{c=i;break}if(i=c,n[i]===o)return i/(r-1);let u=n[i],d=n[i+1]-u,f=(o-u)/d;return(i+f)/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);let o=this.getPoint(i),a=this.getPoint(r),c=t||(o.isVector2?new W:new _);return c.copy(a).sub(o).normalize(),c}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new _,i=[],r=[],o=[],a=new _,c=new le;for(let f=0;f<=e;f++){let m=f/e;i[f]=this.getTangentAt(m,new _),i[f].normalize()}r[0]=new _,o[0]=new _;let l=Number.MAX_VALUE,u=Math.abs(i[0].x),h=Math.abs(i[0].y),d=Math.abs(i[0].z);u<=l&&(l=u,n.set(1,0,0)),h<=l&&(l=h,n.set(0,1,0)),d<=l&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],a),o[0].crossVectors(i[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(i[f-1],i[f]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(at(i[f-1].dot(i[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(a,m))}o[f].crossVectors(i[f],r[f])}if(t===!0){let f=Math.acos(at(r[0].dot(r[e]),-1,1));f/=e,i[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let m=1;m<=e;m++)r[m].applyMatrix4(c.makeRotationAxis(i[m],f*m)),o[m].crossVectors(i[m],r[m])}return{tangents:i,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.5,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}};var Li=class extends _t{constructor(e=0,t=0,n=1,i=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(e,t){let n=t||new W,i=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(o?r=0:r=i),this.aClockwise===!0&&!o&&(r===i?r=-i:r=r-i);let a=this.aStartAngle+e*r,c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=c-this.aX,f=l-this.aY;c=d*u-f*h+this.aX,l=d*h+f*u+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}};Li.prototype.isEllipseCurve=!0;var lo=class extends Li{constructor(e,t,n,i,r,o){super(e,t,n,n,i,r,o),this.type=`ArcCurve`}};lo.prototype.isArcCurve=!0;function Rl(){let s=0,e=0,t=0,n=0;function i(r,o,a,c){s=r,e=a,t=-3*r+3*o-2*a-c,n=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){i(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,u,h){let d=(o-r)/l-(a-r)/(l+u)+(a-o)/u,f=(a-o)/u-(c-o)/(u+h)+(c-a)/h;d*=u,f*=u,i(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return s+e*r+t*o+n*a}}}var hs=new _;var da=new Rl;var fa=new Rl;var pa=new Rl;var co=class extends _t{constructor(e=[],t=!1,n=`centripetal`,i=.5){super(),this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new _){let n=t,i=this.points,r=i.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,u;this.closed||a>0?l=i[(a-1)%r]:(hs.subVectors(i[0],i[1]).add(i[0]),l=hs);let h=i[a%r],d=i[(a+1)%r];if(this.closed||a+2<r?u=i[(a+2)%r]:(hs.subVectors(i[r-1],i[r-2]).add(i[r-1]),u=hs),this.curveType===`centripetal`||this.curveType===`chordal`){let f=this.curveType===`chordal`?.5:.25,m=Math.pow(l.distanceToSquared(h),f),x=Math.pow(h.distanceToSquared(d),f),y=Math.pow(d.distanceToSquared(u),f);x<1e-4&&(x=1),m<1e-4&&(m=x),y<1e-4&&(y=x),da.initNonuniformCatmullRom(l.x,h.x,d.x,u.x,m,x,y),fa.initNonuniformCatmullRom(l.y,h.y,d.y,u.y,m,x,y),pa.initNonuniformCatmullRom(l.z,h.z,d.z,u.z,m,x,y)}else this.curveType===`catmullrom`&&(da.initCatmullRom(l.x,h.x,d.x,u.x,this.tension),fa.initCatmullRom(l.y,h.y,d.y,u.y,this.tension),pa.initCatmullRom(l.z,h.z,d.z,u.z,this.tension));return n.set(da.calc(c),fa.calc(c),pa.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new _().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};co.prototype.isCatmullRomCurve3=!0;function Qc(s,e,t,n,i){let r=(n-e)*.5,o=(i-t)*.5,a=s*s,c=s*a;return(2*t-2*n+r+o)*c+(-3*t+3*n-2*r-o)*a+r*s+t}function hy(s,e){let t=1-s;return t*t*e}function uy(s,e){return 2*(1-s)*s*e}function dy(s,e){return s*s*e}function Ki(s,e,t,n){return hy(s,e)+uy(s,t)+dy(s,n)}function fy(s,e){let t=1-s;return t*t*t*e}function py(s,e){let t=1-s;return 3*t*t*s*e}function my(s,e){return 3*(1-s)*s*s*e}function gy(s,e){return s*s*s*e}function er(s,e,t,n,i){return fy(s,e)+py(s,t)+my(s,n)+gy(s,i)}var Er=class extends _t{constructor(e=new W,t=new W,n=new W,i=new W){super(),this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new W){let n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(er(e,i.x,r.x,o.x,a.x),er(e,i.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}};Er.prototype.isCubicBezierCurve=!0;var ho=class extends _t{constructor(e=new _,t=new _,n=new _,i=new _){super(),this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new _){let n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(er(e,i.x,r.x,o.x,a.x),er(e,i.y,r.y,o.y,a.y),er(e,i.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}};ho.prototype.isCubicBezierCurve3=!0;var Ri=class extends _t{constructor(e=new W,t=new W){super(),this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new W){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t){let n=t||new W;return n.copy(this.v2).sub(this.v1).normalize(),n}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}};Ri.prototype.isLineCurve=!0;var Qa=class extends _t{constructor(e=new _,t=new _){super(),this.type=`LineCurve3`,this.isLineCurve3=!0,this.v1=e,this.v2=t}getPoint(e,t=new _){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}};var Tr=class extends _t{constructor(e=new W,t=new W,n=new W){super(),this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new W){let n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(Ki(e,i.x,r.x,o.x),Ki(e,i.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}};Tr.prototype.isQuadraticBezierCurve=!0;var uo=class extends _t{constructor(e=new _,t=new _,n=new _){super(),this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new _){let n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(Ki(e,i.x,r.x,o.x),Ki(e,i.y,r.y,o.y),Ki(e,i.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}};uo.prototype.isQuadraticBezierCurve3=!0;var Ar=class extends _t{constructor(e=[]){super(),this.type=`SplineCurve`,this.points=e}getPoint(e,t=new W){let n=t,i=this.points,r=(i.length-1)*e,o=Math.floor(r),a=r-o,c=i[o===0?o:o-1],l=i[o],u=i[o>i.length-2?i.length-1:o+1],h=i[o>i.length-3?i.length-1:o+2];return n.set(Qc(a,c.x,l.x,u.x,h.x),Qc(a,c.y,l.y,u.y,h.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new W().fromArray(i))}return this}};Ar.prototype.isSplineCurve=!0;var Ka=Object.freeze({__proto__:null,ArcCurve:lo,CatmullRomCurve3:co,CubicBezierCurve:Er,CubicBezierCurve3:ho,EllipseCurve:Li,LineCurve:Ri,LineCurve3:Qa,QuadraticBezierCurve:Tr,QuadraticBezierCurve3:uo,SplineCurve:Ar});var el=class extends _t{constructor(){super(),this.type=`CurvePath`,this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);e.equals(t)||this.curves.push(new Ri(t,e))}getPoint(e){let t=e*this.getLength(),n=this.getCurveLengths(),i=0;for(;i<n.length;){if(n[i]>=t){let r=n[i]-t,o=this.curves[i],a=o.getLength(),c=a===0?0:1-r/a;return o.getPointAt(c)}i++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let i=0,r=this.curves;i<r.length;i++){let o=r[i],a=o&&o.isEllipseCurve?e*2:o&&(o.isLineCurve||o.isLineCurve3)?1:o&&o.isSplineCurve?e*o.points.length:e,c=o.getPoints(a);for(let l=0;l<c.length;l++){let u=c[l];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(new Ka[i.type]().fromJSON(i))}return this}};var Ci=class extends el{constructor(e){super(),this.type=`Path`,this.currentPoint=new W,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Ri(this.currentPoint.clone(),new W(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){let r=new Tr(this.currentPoint.clone(),new W(e,t),new W(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,r,o){let a=new Er(this.currentPoint.clone(),new W(e,t),new W(n,i),new W(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let n=new Ar([this.currentPoint.clone()].concat(e));return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,r,o){let a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+a,t+c,n,i,r,o),this}absarc(e,t,n,i,r,o){return this.absellipse(e,t,n,n,i,r,o),this}ellipse(e,t,n,i,r,o,a,c){let l=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+l,t+u,n,i,r,o,a,c),this}absellipse(e,t,n,i,r,o,a,c){let l=new Li(e,t,n,i,r,o,a,c);if(this.curves.length>0){let h=l.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(l);let u=l.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}};var Kt=class extends Ci{constructor(e){super(e),this.uuid=Mt(),this.type=`Shape`,this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(new Ci().fromJSON(i))}return this}};var Lt=class extends Ae{constructor(e,t=1){super(),this.type=`Light`,this.color=new se(e),this.intensity=t}dispose(){}copy(e){return super.copy(e),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}};Lt.prototype.isLight=!0;var fo=class extends Lt{constructor(e,t,n){super(e,n),this.type=`HemisphereLight`,this.position.copy(Ae.DefaultUp),this.updateMatrix(),this.groundColor=new se(t)}copy(e){return Lt.prototype.copy.call(this,e),this.groundColor.copy(e.groundColor),this}};fo.prototype.isHemisphereLight=!0;var Kc=new le;var eh=new _;var th=new _;var Lr=class{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.mapSize=new W(512,512),this.map=null,this.mapPass=null,this.matrix=new le,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new wi,this._frameExtents=new W(1,1),this._viewportCount=1,this._viewports=[new De(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;eh.setFromMatrixPosition(e.matrixWorld),t.position.copy(eh),th.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(th),t.updateMatrixWorld(),Kc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Kc),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(t.projectionMatrix),n.multiply(t.matrixWorldInverse)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var po=class extends Lr{constructor(){super(new Ke(50,1,.5,500)),this.focus=1}updateMatrices(e){let t=this.camera,n=rr*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}};po.prototype.isSpotLightShadow=!0;var mo=class extends Lt{constructor(e,t,n=0,i=Math.PI/3,r=0,o=1){super(e,t),this.type=`SpotLight`,this.position.copy(Ae.DefaultUp),this.updateMatrix(),this.target=new Ae,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.shadow=new po}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};mo.prototype.isSpotLight=!0;var nh=new le;var Wi=new _;var ma=new _;var go=class extends Lr{constructor(){super(new Ke(90,1,.5,500)),this._frameExtents=new W(4,2),this._viewportCount=6,this._viewports=[new De(2,1,1,1),new De(0,1,1,1),new De(3,1,1,1),new De(1,1,1,1),new De(3,0,1,1),new De(1,0,1,1)],this._cubeDirections=[new _(1,0,0),new _(-1,0,0),new _(0,0,1),new _(0,0,-1),new _(0,1,0),new _(0,-1,0)],this._cubeUps=[new _(0,1,0),new _(0,1,0),new _(0,1,0),new _(0,1,0),new _(0,0,1),new _(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Wi.setFromMatrixPosition(e.matrixWorld),n.position.copy(Wi),ma.copy(n.position),ma.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(ma),n.updateMatrixWorld(),i.makeTranslation(-Wi.x,-Wi.y,-Wi.z),nh.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(nh)}};go.prototype.isPointLightShadow=!0;var xo=class extends Lt{constructor(e,t,n=0,i=1){super(e,t),this.type=`PointLight`,this.distance=n,this.decay=i,this.shadow=new go}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}};xo.prototype.isPointLight=!0;var Pi=class extends _i{constructor(e=-1,t=1,n=1,i=-1,r=.1,o=2e3){super(),this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-e,o=n+e,a=i+t,c=i-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}};Pi.prototype.isOrthographicCamera=!0;var yo=class extends Lr{constructor(){super(new Pi(-5,5,5,-5,.5,500))}};yo.prototype.isDirectionalLightShadow=!0;var vo=class extends Lt{constructor(e,t){super(e,t),this.type=`DirectionalLight`,this.position.copy(Ae.DefaultUp),this.updateMatrix(),this.target=new Ae,this.shadow=new yo}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};vo.prototype.isDirectionalLight=!0;var _o=class extends Lt{constructor(e,t){super(e,t),this.type=`AmbientLight`}};_o.prototype.isAmbientLight=!0;var wo=class extends Lt{constructor(e,t,n=10,i=10){super(e,t),this.type=`RectAreaLight`,this.width=n,this.height=i}copy(e){return super.copy(e),this.width=e.width,this.height=e.height,this}toJSON(e){let t=super.toJSON(e);return t.object.width=this.width,t.object.height=this.height,t}};wo.prototype.isRectAreaLight=!0;var bo=class{constructor(){this.coefficients=[];for(let e=0;e<9;e++)this.coefficients.push(new _)}set(e){for(let t=0;t<9;t++)this.coefficients[t].copy(e[t]);return this}zero(){for(let e=0;e<9;e++)this.coefficients[e].set(0,0,0);return this}getAt(e,t){let n=e.x,i=e.y,r=e.z,o=this.coefficients;return t.copy(o[0]).multiplyScalar(.282095),t.addScaledVector(o[1],.488603*i),t.addScaledVector(o[2],.488603*r),t.addScaledVector(o[3],.488603*n),t.addScaledVector(o[4],1.092548*(n*i)),t.addScaledVector(o[5],1.092548*(i*r)),t.addScaledVector(o[6],.315392*(3*r*r-1)),t.addScaledVector(o[7],1.092548*(n*r)),t.addScaledVector(o[8],.546274*(n*n-i*i)),t}getIrradianceAt(e,t){let n=e.x,i=e.y,r=e.z,o=this.coefficients;return t.copy(o[0]).multiplyScalar(.886227),t.addScaledVector(o[1],2*.511664*i),t.addScaledVector(o[2],2*.511664*r),t.addScaledVector(o[3],2*.511664*n),t.addScaledVector(o[4],2*.429043*n*i),t.addScaledVector(o[5],2*.429043*i*r),t.addScaledVector(o[6],.743125*r*r-.247708),t.addScaledVector(o[7],2*.429043*n*r),t.addScaledVector(o[8],.429043*(n*n-i*i)),t}add(e){for(let t=0;t<9;t++)this.coefficients[t].add(e.coefficients[t]);return this}addScaledSH(e,t){for(let n=0;n<9;n++)this.coefficients[n].addScaledVector(e.coefficients[n],t);return this}scale(e){for(let t=0;t<9;t++)this.coefficients[t].multiplyScalar(e);return this}lerp(e,t){for(let n=0;n<9;n++)this.coefficients[n].lerp(e.coefficients[n],t);return this}equals(e){for(let t=0;t<9;t++)if(!this.coefficients[t].equals(e.coefficients[t]))return!1;return!0}copy(e){return this.set(e.coefficients)}clone(){return new this.constructor().copy(this)}fromArray(e,t=0){let n=this.coefficients;for(let i=0;i<9;i++)n[i].fromArray(e,t+i*3);return this}toArray(e=[],t=0){let n=this.coefficients;for(let i=0;i<9;i++)n[i].toArray(e,t+i*3);return e}static getBasisAt(e,t){let n=e.x,i=e.y,r=e.z;t[0]=.282095,t[1]=.488603*i,t[2]=.488603*r,t[3]=.488603*n,t[4]=1.092548*n*i,t[5]=1.092548*i*r,t[6]=.315392*(3*r*r-1),t[7]=1.092548*n*r,t[8]=.546274*(n*n-i*i)}};bo.prototype.isSphericalHarmonics3=!0;var Ii=class extends Lt{constructor(e=new bo,t=1){super(void 0,t),this.sh=e}copy(e){return super.copy(e),this.sh.copy(e.sh),this}fromJSON(e){return this.intensity=e.intensity,this.sh.fromArray(e.sh),this}toJSON(e){let t=super.toJSON(e);return t.object.sh=this.sh.toArray(),t}};Ii.prototype.isLightProbe=!0;var tl=class extends lt{constructor(e){super(e),this.textures={}}load(e,t,n,i){let r=this,o=new Ft(r.manager);o.setPath(r.path),o.setRequestHeader(r.requestHeader),o.setWithCredentials(r.withCredentials),o.load(e,function(a){try{t(r.parse(JSON.parse(a)))}catch(c){i?i(c):console.error(c),r.manager.itemError(e)}},n,i)}parse(e){let t=this.textures;function n(r){return t[r]===void 0&&console.warn(`THREE.MaterialLoader: Undefined texture`,r),t[r]}let i=new oy[e.type];if(e.uuid!==void 0&&(i.uuid=e.uuid),e.name!==void 0&&(i.name=e.name),e.color!==void 0&&i.color!==void 0&&i.color.setHex(e.color),e.roughness!==void 0&&(i.roughness=e.roughness),e.metalness!==void 0&&(i.metalness=e.metalness),e.sheen!==void 0&&(i.sheen=new se().setHex(e.sheen)),e.emissive!==void 0&&i.emissive!==void 0&&i.emissive.setHex(e.emissive),e.specular!==void 0&&i.specular!==void 0&&i.specular.setHex(e.specular),e.shininess!==void 0&&(i.shininess=e.shininess),e.clearcoat!==void 0&&(i.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=e.clearcoatRoughness),e.fog!==void 0&&(i.fog=e.fog),e.flatShading!==void 0&&(i.flatShading=e.flatShading),e.blending!==void 0&&(i.blending=e.blending),e.combine!==void 0&&(i.combine=e.combine),e.side!==void 0&&(i.side=e.side),e.shadowSide!==void 0&&(i.shadowSide=e.shadowSide),e.opacity!==void 0&&(i.opacity=e.opacity),e.transparent!==void 0&&(i.transparent=e.transparent),e.alphaTest!==void 0&&(i.alphaTest=e.alphaTest),e.depthTest!==void 0&&(i.depthTest=e.depthTest),e.depthWrite!==void 0&&(i.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(i.colorWrite=e.colorWrite),e.stencilWrite!==void 0&&(i.stencilWrite=e.stencilWrite),e.stencilWriteMask!==void 0&&(i.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(i.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(i.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(i.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(i.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(i.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(i.stencilZPass=e.stencilZPass),e.wireframe!==void 0&&(i.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(i.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(i.rotation=e.rotation),e.linewidth!==1&&(i.linewidth=e.linewidth),e.dashSize!==void 0&&(i.dashSize=e.dashSize),e.gapSize!==void 0&&(i.gapSize=e.gapSize),e.scale!==void 0&&(i.scale=e.scale),e.polygonOffset!==void 0&&(i.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(i.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(i.polygonOffsetUnits=e.polygonOffsetUnits),e.skinning!==void 0&&(i.skinning=e.skinning),e.morphTargets!==void 0&&(i.morphTargets=e.morphTargets),e.morphNormals!==void 0&&(i.morphNormals=e.morphNormals),e.dithering!==void 0&&(i.dithering=e.dithering),e.alphaToCoverage!==void 0&&(i.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(i.premultipliedAlpha=e.premultipliedAlpha),e.vertexTangents!==void 0&&(i.vertexTangents=e.vertexTangents),e.visible!==void 0&&(i.visible=e.visible),e.toneMapped!==void 0&&(i.toneMapped=e.toneMapped),e.userData!==void 0&&(i.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors==`number`?i.vertexColors=e.vertexColors>0:i.vertexColors=e.vertexColors),e.uniforms!==void 0)for(let r in e.uniforms){let o=e.uniforms[r];switch(i.uniforms[r]={},o.type){case`t`:i.uniforms[r].value=n(o.value);break;case`c`:i.uniforms[r].value=new se().setHex(o.value);break;case`v2`:i.uniforms[r].value=new W().fromArray(o.value);break;case`v3`:i.uniforms[r].value=new _().fromArray(o.value);break;case`v4`:i.uniforms[r].value=new De().fromArray(o.value);break;case`m3`:i.uniforms[r].value=new je().fromArray(o.value);break;case`m4`:i.uniforms[r].value=new le().fromArray(o.value);break;default:i.uniforms[r].value=o.value}}if(e.defines!==void 0&&(i.defines=e.defines),e.vertexShader!==void 0&&(i.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(i.fragmentShader=e.fragmentShader),e.extensions!==void 0)for(let r in e.extensions)i.extensions[r]=e.extensions[r];if(e.shading!==void 0&&(i.flatShading=e.shading===1),e.size!==void 0&&(i.size=e.size),e.sizeAttenuation!==void 0&&(i.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(i.map=n(e.map)),e.matcap!==void 0&&(i.matcap=n(e.matcap)),e.alphaMap!==void 0&&(i.alphaMap=n(e.alphaMap)),e.bumpMap!==void 0&&(i.bumpMap=n(e.bumpMap)),e.bumpScale!==void 0&&(i.bumpScale=e.bumpScale),e.normalMap!==void 0&&(i.normalMap=n(e.normalMap)),e.normalMapType!==void 0&&(i.normalMapType=e.normalMapType),e.normalScale!==void 0){let r=e.normalScale;Array.isArray(r)===!1&&(r=[r,r]),i.normalScale=new W().fromArray(r)}return e.displacementMap!==void 0&&(i.displacementMap=n(e.displacementMap)),e.displacementScale!==void 0&&(i.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(i.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(i.roughnessMap=n(e.roughnessMap)),e.metalnessMap!==void 0&&(i.metalnessMap=n(e.metalnessMap)),e.emissiveMap!==void 0&&(i.emissiveMap=n(e.emissiveMap)),e.emissiveIntensity!==void 0&&(i.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(i.specularMap=n(e.specularMap)),e.envMap!==void 0&&(i.envMap=n(e.envMap)),e.envMapIntensity!==void 0&&(i.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(i.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(i.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(i.lightMap=n(e.lightMap)),e.lightMapIntensity!==void 0&&(i.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(i.aoMap=n(e.aoMap)),e.aoMapIntensity!==void 0&&(i.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(i.gradientMap=n(e.gradientMap)),e.clearcoatMap!==void 0&&(i.clearcoatMap=n(e.clearcoatMap)),e.clearcoatRoughnessMap!==void 0&&(i.clearcoatRoughnessMap=n(e.clearcoatRoughnessMap)),e.clearcoatNormalMap!==void 0&&(i.clearcoatNormalMap=n(e.clearcoatNormalMap)),e.clearcoatNormalScale!==void 0&&(i.clearcoatNormalScale=new W().fromArray(e.clearcoatNormalScale)),e.transmission!==void 0&&(i.transmission=e.transmission),e.transmissionMap!==void 0&&(i.transmissionMap=n(e.transmissionMap)),i}setTextures(e){return this.textures=e,this}};var Mo=class{static decodeText(e){if(typeof TextDecoder<`u`)return new TextDecoder().decode(e);let t=``;for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){let t=e.lastIndexOf(`/`);return t===-1?`./`:e.substr(0,t+1)}};var So=class extends ue{constructor(){super(),this.type=`InstancedBufferGeometry`,this.instanceCount=Infinity}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}clone(){return new this.constructor().copy(this)}toJSON(){let e=super.toJSON(this);return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}};So.prototype.isInstancedBufferGeometry=!0;var Eo=class extends Me{constructor(e,t,n,i){typeof n==`number`&&(i=n,n=!1,console.error(`THREE.InstancedBufferAttribute: The constructor now expects normalized as the third argument.`)),super(e,t,n),this.meshPerAttribute=i||1}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}};Eo.prototype.isInstancedBufferAttribute=!0;var nl=class extends lt{constructor(e){super(e)}load(e,t,n,i){let r=this,o=new Ft(r.manager);o.setPath(r.path),o.setRequestHeader(r.requestHeader),o.setWithCredentials(r.withCredentials),o.load(e,function(a){try{t(r.parse(JSON.parse(a)))}catch(c){i?i(c):console.error(c),r.manager.itemError(e)}},n,i)}parse(e){let t={},n={};function i(f,m){if(t[m]!==void 0)return t[m];let y=f.interleavedBuffers[m],g=r(f,y.buffer),w=new vn(Yi(y.type,g),y.stride);return w.uuid=y.uuid,t[m]=w,w}function r(f,m){if(n[m]!==void 0)return n[m];let y=f.arrayBuffers[m],g=new Uint32Array(y).buffer;return n[m]=g,g}let o=e.isInstancedBufferGeometry?new So:new ue,a=e.data.index;if(a!==void 0){let f=Yi(a.type,a.array);o.setIndex(new Me(f,1))}let c=e.data.attributes;for(let f in c){let m=c[f],x;if(m.isInterleavedBufferAttribute)x=new kn(i(e.data,m.data),m.itemSize,m.offset,m.normalized);else{let y=Yi(m.type,m.array);x=new(m.isInstancedBufferAttribute?Eo:Me)(y,m.itemSize,m.normalized)}m.name!==void 0&&(x.name=m.name),m.usage!==void 0&&x.setUsage(m.usage),m.updateRange!==void 0&&(x.updateRange.offset=m.updateRange.offset,x.updateRange.count=m.updateRange.count),o.setAttribute(f,x)}let l=e.data.morphAttributes;if(l)for(let f in l){let m=l[f],x=[];for(let y=0,g=m.length;y<g;y++){let p=m[y],w;if(p.isInterleavedBufferAttribute)w=new kn(i(e.data,p.data),p.itemSize,p.offset,p.normalized);else w=new Me(Yi(p.type,p.array),p.itemSize,p.normalized);p.name!==void 0&&(w.name=p.name),x.push(w)}o.morphAttributes[f]=x}e.data.morphTargetsRelative&&(o.morphTargetsRelative=!0);let h=e.data.groups||e.data.drawcalls||e.data.offsets;if(h!==void 0)for(let f=0,m=h.length;f!==m;++f){let x=h[f];o.addGroup(x.start,x.count,x.materialIndex)}let d=e.data.boundingSphere;if(d!==void 0){let f=new _;d.center!==void 0&&f.fromArray(d.center),o.boundingSphere=new tn(f,d.radius)}return e.name&&(o.name=e.name),e.userData&&(o.userData=e.userData),o}};var ih=class extends lt{constructor(e){super(e)}load(e,t,n,i){let r=this,o=this.path===``?Mo.extractUrlBase(e):this.path;this.resourcePath=this.resourcePath||o;let a=new Ft(this.manager);a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(c){let l=null;try{l=JSON.parse(c)}catch(h){i!==void 0&&i(h),console.error(`THREE:ObjectLoader: Can't parse `+e+`.`,h.message);return}let u=l.metadata;if(u===void 0||u.type===void 0||u.type.toLowerCase()===`geometry`){console.error(`THREE.ObjectLoader: Can't load `+e);return}r.parse(l,t)},n,i)}parse(e,t){let n=this.parseAnimations(e.animations),i=this.parseShapes(e.shapes),r=this.parseGeometries(e.geometries,i),o=this.parseImages(e.images,function(){t!==void 0&&t(l)}),a=this.parseTextures(e.textures,o),c=this.parseMaterials(e.materials,a),l=this.parseObject(e.object,r,c,n),u=this.parseSkeletons(e.skeletons,l);if(this.bindSkeletons(l,u),t!==void 0){let h=!1;for(let d in o)if(o[d]instanceof HTMLImageElement){h=!0;break}h===!1&&t(l)}return l}parseShapes(e){let t={};if(e!==void 0)for(let n=0,i=e.length;n<i;n++){let r=new Kt().fromJSON(e[n]);t[r.uuid]=r}return t}parseSkeletons(e,t){let n={},i={};if(t.traverse(function(r){r.isBone&&(i[r.uuid]=r)}),e!==void 0)for(let r=0,o=e.length;r<o;r++){let a=new Ua().fromJSON(e[r],i);n[a.uuid]=a}return n}parseGeometries(e,t){let n={},i;if(e!==void 0){let r=new nl;for(let o=0,a=e.length;o<a;o++){let c,l=e[o];switch(l.type){case`PlaneGeometry`:case`PlaneBufferGeometry`:c=new ft[l.type](l.width,l.height,l.widthSegments,l.heightSegments);break;case`BoxGeometry`:case`BoxBufferGeometry`:c=new ft[l.type](l.width,l.height,l.depth,l.widthSegments,l.heightSegments,l.depthSegments);break;case`CircleGeometry`:case`CircleBufferGeometry`:c=new ft[l.type](l.radius,l.segments,l.thetaStart,l.thetaLength);break;case`CylinderGeometry`:case`CylinderBufferGeometry`:c=new ft[l.type](l.radiusTop,l.radiusBottom,l.height,l.radialSegments,l.heightSegments,l.openEnded,l.thetaStart,l.thetaLength);break;case`ConeGeometry`:case`ConeBufferGeometry`:c=new ft[l.type](l.radius,l.height,l.radialSegments,l.heightSegments,l.openEnded,l.thetaStart,l.thetaLength);break;case`SphereGeometry`:case`SphereBufferGeometry`:c=new ft[l.type](l.radius,l.widthSegments,l.heightSegments,l.phiStart,l.phiLength,l.thetaStart,l.thetaLength);break;case`DodecahedronGeometry`:case`DodecahedronBufferGeometry`:case`IcosahedronGeometry`:case`IcosahedronBufferGeometry`:case`OctahedronGeometry`:case`OctahedronBufferGeometry`:case`TetrahedronGeometry`:case`TetrahedronBufferGeometry`:c=new ft[l.type](l.radius,l.detail);break;case`RingGeometry`:case`RingBufferGeometry`:c=new ft[l.type](l.innerRadius,l.outerRadius,l.thetaSegments,l.phiSegments,l.thetaStart,l.thetaLength);break;case`TorusGeometry`:case`TorusBufferGeometry`:c=new ft[l.type](l.radius,l.tube,l.radialSegments,l.tubularSegments,l.arc);break;case`TorusKnotGeometry`:case`TorusKnotBufferGeometry`:c=new ft[l.type](l.radius,l.tube,l.tubularSegments,l.radialSegments,l.p,l.q);break;case`TubeGeometry`:case`TubeBufferGeometry`:c=new ft[l.type](new Ka[l.path.type]().fromJSON(l.path),l.tubularSegments,l.radius,l.radialSegments,l.closed);break;case`LatheGeometry`:case`LatheBufferGeometry`:c=new ft[l.type](l.points,l.segments,l.phiStart,l.phiLength);break;case`PolyhedronGeometry`:case`PolyhedronBufferGeometry`:c=new ft[l.type](l.vertices,l.indices,l.radius,l.details);break;case`ShapeGeometry`:case`ShapeBufferGeometry`:i=[];for(let h=0,d=l.shapes.length;h<d;h++){let f=t[l.shapes[h]];i.push(f)}c=new ft[l.type](i,l.curveSegments);break;case`ExtrudeGeometry`:case`ExtrudeBufferGeometry`:i=[];for(let h=0,d=l.shapes.length;h<d;h++){let f=t[l.shapes[h]];i.push(f)}let u=l.options.extrudePath;u!==void 0&&(l.options.extrudePath=new Ka[u.type]().fromJSON(u)),c=new ft[l.type](i,l.options);break;case`BufferGeometry`:case`InstancedBufferGeometry`:c=r.parse(l);break;case`Geometry`:console.error(`THREE.ObjectLoader: Loading "Geometry" is not supported anymore.`);break;default:console.warn(`THREE.ObjectLoader: Unsupported geometry type "`+l.type+`"`);continue}c.uuid=l.uuid,l.name!==void 0&&(c.name=l.name),c.isBufferGeometry===!0&&l.userData!==void 0&&(c.userData=l.userData),n[l.uuid]=c}}return n}parseMaterials(e,t){let n={},i={};if(e!==void 0){let r=new tl;r.setTextures(t);for(let o=0,a=e.length;o<a;o++){let c=e[o];if(c.type===`MultiMaterial`){let l=[];for(let u=0;u<c.materials.length;u++){let h=c.materials[u];n[h.uuid]===void 0&&(n[h.uuid]=r.parse(h)),l.push(n[h.uuid])}i[c.uuid]=l}else n[c.uuid]===void 0&&(n[c.uuid]=r.parse(c)),i[c.uuid]=n[c.uuid]}}return i}parseAnimations(e){let t={};if(e!==void 0)for(let n=0;n<e.length;n++){let i=e[n],r=Ti.parse(i);t[r.uuid]=r}return t}parseImages(e,t){let n=this,i={},r;function o(c){return n.manager.itemStart(c),r.load(c,function(){n.manager.itemEnd(c)},void 0,function(){n.manager.itemError(c),n.manager.itemEnd(c)})}function a(c){if(typeof c==`string`){let l=c;return o(/^(\/\/)|([a-z]+:(\/\/)?)/i.test(l)?l:n.resourcePath+l)}else return c.data?{data:Yi(c.type,c.data),width:c.width,height:c.height}:null}if(e!==void 0&&e.length>0){r=new Sr(new ao(t)),r.setCrossOrigin(this.crossOrigin);for(let l=0,u=e.length;l<u;l++){let h=e[l],d=h.url;if(Array.isArray(d)){i[h.uuid]=[];for(let f=0,m=d.length;f<m;f++){let x=d[f],y=a(x);y!==null&&(y instanceof HTMLImageElement?i[h.uuid].push(y):i[h.uuid].push(new Gn(y.data,y.width,y.height)))}}else{let f=a(h.url);f!==null&&(i[h.uuid]=f)}}}return i}parseTextures(e,t){function n(r,o){return typeof r==`number`?r:(console.warn(`THREE.ObjectLoader.parseTexture: Constant should be in numeric form.`,r),o[r])}let i={};if(e!==void 0)for(let r=0,o=e.length;r<o;r++){let a=e[r];a.image===void 0&&console.warn(`THREE.ObjectLoader: No "image" specified for`,a.uuid),t[a.image]===void 0&&console.warn(`THREE.ObjectLoader: Undefined image`,a.image);let c,l=t[a.image];Array.isArray(l)?(c=new Hn(l),l.length===6&&(c.needsUpdate=!0)):(l&&l.data?c=new Gn(l.data,l.width,l.height):c=new St(l),l&&(c.needsUpdate=!0)),c.uuid=a.uuid,a.name!==void 0&&(c.name=a.name),a.mapping!==void 0&&(c.mapping=n(a.mapping,xy)),a.offset!==void 0&&c.offset.fromArray(a.offset),a.repeat!==void 0&&c.repeat.fromArray(a.repeat),a.center!==void 0&&c.center.fromArray(a.center),a.rotation!==void 0&&(c.rotation=a.rotation),a.wrap!==void 0&&(c.wrapS=n(a.wrap[0],rh),c.wrapT=n(a.wrap[1],rh)),a.format!==void 0&&(c.format=a.format),a.type!==void 0&&(c.type=a.type),a.encoding!==void 0&&(c.encoding=a.encoding),a.minFilter!==void 0&&(c.minFilter=n(a.minFilter,sh)),a.magFilter!==void 0&&(c.magFilter=n(a.magFilter,sh)),a.anisotropy!==void 0&&(c.anisotropy=a.anisotropy),a.flipY!==void 0&&(c.flipY=a.flipY),a.premultiplyAlpha!==void 0&&(c.premultiplyAlpha=a.premultiplyAlpha),a.unpackAlignment!==void 0&&(c.unpackAlignment=a.unpackAlignment),i[a.uuid]=c}return i}parseObject(e,t,n,i){let r;function o(u){return t[u]===void 0&&console.warn(`THREE.ObjectLoader: Undefined geometry`,u),t[u]}function a(u){if(u!==void 0){if(Array.isArray(u)){let h=[];for(let d=0,f=u.length;d<f;d++){let m=u[d];n[m]===void 0&&console.warn(`THREE.ObjectLoader: Undefined material`,m),h.push(n[m])}return h}return n[u]===void 0&&console.warn(`THREE.ObjectLoader: Undefined material`,u),n[u]}}let c,l;switch(e.type){case`Scene`:r=new dr,e.background!==void 0&&Number.isInteger(e.background)&&(r.background=new se(e.background)),e.fog!==void 0&&(e.fog.type===`Fog`?r.fog=new Ds(e.fog.color,e.fog.near,e.fog.far):e.fog.type===`FogExp2`&&(r.fog=new Is(e.fog.color,e.fog.density)));break;case`PerspectiveCamera`:r=new Ke(e.fov,e.aspect,e.near,e.far),e.focus!==void 0&&(r.focus=e.focus),e.zoom!==void 0&&(r.zoom=e.zoom),e.filmGauge!==void 0&&(r.filmGauge=e.filmGauge),e.filmOffset!==void 0&&(r.filmOffset=e.filmOffset),e.view!==void 0&&(r.view=Object.assign({},e.view));break;case`OrthographicCamera`:r=new Pi(e.left,e.right,e.top,e.bottom,e.near,e.far),e.zoom!==void 0&&(r.zoom=e.zoom),e.view!==void 0&&(r.view=Object.assign({},e.view));break;case`AmbientLight`:r=new _o(e.color,e.intensity);break;case`DirectionalLight`:r=new vo(e.color,e.intensity);break;case`PointLight`:r=new xo(e.color,e.intensity,e.distance,e.decay);break;case`RectAreaLight`:r=new wo(e.color,e.intensity,e.width,e.height);break;case`SpotLight`:r=new mo(e.color,e.intensity,e.distance,e.angle,e.penumbra,e.decay);break;case`HemisphereLight`:r=new fo(e.color,e.groundColor,e.intensity);break;case`LightProbe`:r=new Ii().fromJSON(e);break;case`SkinnedMesh`:c=o(e.geometry),l=a(e.material),r=new mr(c,l),e.bindMode!==void 0&&(r.bindMode=e.bindMode),e.bindMatrix!==void 0&&r.bindMatrix.fromArray(e.bindMatrix),e.skeleton!==void 0&&(r.skeleton=e.skeleton);break;case`Mesh`:c=o(e.geometry),l=a(e.material),r=new Ye(c,l);break;case`InstancedMesh`:c=o(e.geometry),l=a(e.material);let u=e.count,h=e.instanceMatrix,d=e.instanceColor;r=new Fs(c,l,u),r.instanceMatrix=new Me(new Float32Array(h.array),16),d!==void 0&&(r.instanceColor=new Me(new Float32Array(d.array),d.itemSize));break;case`LOD`:r=new Oa;break;case`Line`:r=new Vt(o(e.geometry),a(e.material));break;case`LineLoop`:r=new Ns(o(e.geometry),a(e.material));break;case`LineSegments`:r=new gt(o(e.geometry),a(e.material));break;case`PointCloud`:case`Points`:r=new bi(o(e.geometry),a(e.material));break;case`Sprite`:r=new pr(a(e.material));break;case`Group`:r=new pn;break;case`Bone`:r=new gr;break;default:r=new Ae}if(r.uuid=e.uuid,e.name!==void 0&&(r.name=e.name),e.matrix!==void 0?(r.matrix.fromArray(e.matrix),e.matrixAutoUpdate!==void 0&&(r.matrixAutoUpdate=e.matrixAutoUpdate),r.matrixAutoUpdate&&r.matrix.decompose(r.position,r.quaternion,r.scale)):(e.position!==void 0&&r.position.fromArray(e.position),e.rotation!==void 0&&r.rotation.fromArray(e.rotation),e.quaternion!==void 0&&r.quaternion.fromArray(e.quaternion),e.scale!==void 0&&r.scale.fromArray(e.scale)),e.castShadow!==void 0&&(r.castShadow=e.castShadow),e.receiveShadow!==void 0&&(r.receiveShadow=e.receiveShadow),e.shadow&&(e.shadow.bias!==void 0&&(r.shadow.bias=e.shadow.bias),e.shadow.normalBias!==void 0&&(r.shadow.normalBias=e.shadow.normalBias),e.shadow.radius!==void 0&&(r.shadow.radius=e.shadow.radius),e.shadow.mapSize!==void 0&&r.shadow.mapSize.fromArray(e.shadow.mapSize),e.shadow.camera!==void 0&&(r.shadow.camera=this.parseObject(e.shadow.camera))),e.visible!==void 0&&(r.visible=e.visible),e.frustumCulled!==void 0&&(r.frustumCulled=e.frustumCulled),e.renderOrder!==void 0&&(r.renderOrder=e.renderOrder),e.userData!==void 0&&(r.userData=e.userData),e.layers!==void 0&&(r.layers.mask=e.layers),e.children!==void 0){let u=e.children;for(let h=0;h<u.length;h++)r.add(this.parseObject(u[h],t,n,i))}if(e.animations!==void 0){let u=e.animations;for(let h=0;h<u.length;h++){let d=u[h];r.animations.push(i[d])}}if(e.type===`LOD`){e.autoUpdate!==void 0&&(r.autoUpdate=e.autoUpdate);let u=e.levels;for(let h=0;h<u.length;h++){let d=u[h],f=r.getObjectByProperty(`uuid`,d.object);f!==void 0&&r.addLevel(f,d.distance)}}return r}bindSkeletons(e,t){Object.keys(t).length!==0&&e.traverse(function(n){if(n.isSkinnedMesh===!0&&n.skeleton!==void 0){let i=t[n.skeleton];i===void 0?console.warn(`THREE.ObjectLoader: No skeleton found with UUID:`,n.skeleton):n.bind(i,n.bindMatrix)}})}setTexturePath(e){return console.warn(`THREE.ObjectLoader: .setTexturePath() has been renamed to .setResourcePath().`),this.setResourcePath(e)}};var xy={UVMapping:300,CubeReflectionMapping:301,CubeRefractionMapping:302,EquirectangularReflectionMapping:303,EquirectangularRefractionMapping:304,CubeUVReflectionMapping:306,CubeUVRefractionMapping:307};var rh={RepeatWrapping:ws,ClampToEdgeWrapping:yt,MirroredRepeatWrapping:bs};var sh={NearestFilter:rt,NearestMipmapNearestFilter:Sa,NearestMipmapLinearFilter:Ea,LinearFilter:st,LinearMipmapNearestFilter:Jh,LinearMipmapLinearFilter:Pr};var il=class extends lt{constructor(e){super(e),typeof createImageBitmap>`u`&&console.warn(`THREE.ImageBitmapLoader: createImageBitmap() not supported.`),typeof fetch>`u`&&console.warn(`THREE.ImageBitmapLoader: fetch() not supported.`),this.options={premultiplyAlpha:`none`}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Ai.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;let a={};a.credentials=this.crossOrigin===`anonymous`?`same-origin`:`include`,a.headers=this.requestHeader,fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:`none`}))}).then(function(c){Ai.add(e,c),t&&t(c),r.manager.itemEnd(e)}).catch(function(c){i&&i(c),r.manager.itemError(e),r.manager.itemEnd(e)}),r.manager.itemStart(e)}};il.prototype.isImageBitmapLoader=!0;var rl=class{constructor(){this.type=`ShapePath`,this.color=new se,this.subPaths=[],this.currentPath=null}moveTo(e,t){return this.currentPath=new Ci,this.subPaths.push(this.currentPath),this.currentPath.moveTo(e,t),this}lineTo(e,t){return this.currentPath.lineTo(e,t),this}quadraticCurveTo(e,t,n,i){return this.currentPath.quadraticCurveTo(e,t,n,i),this}bezierCurveTo(e,t,n,i,r,o){return this.currentPath.bezierCurveTo(e,t,n,i,r,o),this}splineThru(e){return this.currentPath.splineThru(e),this}toShapes(e,t){function n(p){let w=[];for(let b=0,E=p.length;b<E;b++){let v=p[b],A=new Kt;A.curves=v.curves,w.push(A)}return w}function i(p,w){let b=w.length,E=!1;for(let v=b-1,A=0;A<b;v=A++){let L=w[v],I=w[A],N=I.x-L.x,U=I.y-L.y;if(Math.abs(U)>Number.EPSILON){if(U<0&&(L=w[A],N=-N,I=w[v],U=-U),p.y<L.y||p.y>I.y)continue;if(p.y===L.y){if(p.x===L.x)return!0}else{let z=U*(p.x-L.x)-N*(p.y-L.y);if(z===0)return!0;if(z<0)continue;E=!E}}else{if(p.y!==L.y)continue;if(I.x<=p.x&&p.x<=L.x||L.x<=p.x&&p.x<=I.x)return!0}}return E}let r=Qt.isClockWise,o=this.subPaths;if(o.length===0)return[];if(t===!0)return n(o);let a,c,l,u=[];if(o.length===1)return c=o[0],l=new Kt,l.curves=c.curves,u.push(l),u;let h=!r(o[0].getPoints());h=e?!h:h;let d=[],f=[],m=[],x=0,y;f[x]=void 0,m[x]=[];for(let p=0,w=o.length;p<w;p++)c=o[p],y=c.getPoints(),a=r(y),a=e?!a:a,a?(!h&&f[x]&&x++,f[x]={s:new Kt,p:y},f[x].s.curves=c.curves,h&&x++,m[x]=[]):m[x].push({h:c,p:y[0]});if(!f[0])return n(o);if(f.length>1){let p=!1,w=[];for(let b=0,E=f.length;b<E;b++)d[b]=[];for(let b=0,E=f.length;b<E;b++){let v=m[b];for(let A=0;A<v.length;A++){let L=v[A],I=!0;for(let N=0;N<f.length;N++)i(L.p,f[N].p)&&(b!==N&&w.push({froms:b,tos:N,hole:A}),I?(I=!1,d[N].push(L)):p=!0);I&&d[b].push(L)}}w.length>0&&(p||(m=d))}let g;for(let p=0,w=f.length;p<w;p++){l=f[p].s,u.push(l),g=m[p];for(let b=0,E=g.length;b<E;b++)l.holes.push(g[b].h)}return u}};var To=class{constructor(e){this.type=`Font`,this.data=e}generateShapes(e,t=100){let n=[],i=yy(e,t,this.data);for(let r=0,o=i.length;r<o;r++)Array.prototype.push.apply(n,i[r].toShapes());return n}};function yy(s,e,t){let n=Array.from(s),i=e/t.resolution,r=(t.boundingBox.yMax-t.boundingBox.yMin+t.underlineThickness)*i,o=[],a=0,c=0;for(let l=0;l<n.length;l++){let u=n[l];if(u===`
`)a=0,c-=r;else{let h=vy(u,i,a,c,t);a+=h.offsetX,o.push(h.path)}}return o}function vy(s,e,t,n,i){let r=i.glyphs[s]||i.glyphs[`?`];if(!r){console.error(`THREE.Font: character "`+s+`" does not exists in font family `+i.familyName+`.`);return}let o=new rl,a,c,l,u,h,d,f,m;if(r.o){let x=r._cachedOutline||(r._cachedOutline=r.o.split(` `));for(let y=0,g=x.length;y<g;)switch(x[y++]){case`m`:a=x[y++]*e+t,c=x[y++]*e+n,o.moveTo(a,c);break;case`l`:a=x[y++]*e+t,c=x[y++]*e+n,o.lineTo(a,c);break;case`q`:l=x[y++]*e+t,u=x[y++]*e+n,h=x[y++]*e+t,d=x[y++]*e+n,o.quadraticCurveTo(h,d,l,u);break;case`b`:l=x[y++]*e+t,u=x[y++]*e+n,h=x[y++]*e+t,d=x[y++]*e+n,f=x[y++]*e+t,m=x[y++]*e+n,o.bezierCurveTo(h,d,f,m,l,u);break}}return{offsetX:r.ha*e,path:o}}To.prototype.isFont=!0;var oh=class extends lt{constructor(e){super(e)}load(e,t,n,i){let r=this,o=new Ft(this.manager);o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(r.withCredentials),o.load(e,function(a){let c;try{c=JSON.parse(a)}catch{console.warn(`THREE.FontLoader: typeface.js support is being deprecated. Use typeface.json instead.`),c=JSON.parse(a.substring(65,a.length-2))}let l=r.parse(c);t&&t(l)},n,i)}parse(e){return new To(e)}};var us;var gu={getContext:function(){return us===void 0&&(us=new(window.AudioContext||window.webkitAudioContext)),us},setContext:function(s){us=s}};var sl=class extends lt{constructor(e){super(e)}load(e,t,n,i){let r=this,o=new Ft(this.manager);o.setResponseType(`arraybuffer`),o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(a){try{let c=a.slice(0);gu.getContext().decodeAudioData(c,function(u){t(u)})}catch(c){i?i(c):console.error(c),r.manager.itemError(e)}},n,i)}};var ol=class extends Ii{constructor(e,t,n=1){super(void 0,n);let i=new se().set(e),r=new se().set(t),o=new _(i.r,i.g,i.b),a=new _(r.r,r.g,r.b),c=Math.sqrt(Math.PI),l=c*Math.sqrt(.75);this.sh.coefficients[0].copy(o).add(a).multiplyScalar(c),this.sh.coefficients[1].copy(o).sub(a).multiplyScalar(l)}};ol.prototype.isHemisphereLightProbe=!0;var al=class extends Ii{constructor(e,t=1){super(void 0,t);let n=new se().set(e);this.sh.coefficients[0].set(n.r,n.g,n.b).multiplyScalar(2*Math.sqrt(Math.PI))}};al.prototype.isAmbientLightProbe=!0;var ah=new le;var lh=new le;var ch=class{constructor(){this.type=`StereoCamera`,this.aspect=1,this.eyeSep=.064,this.cameraL=new Ke,this.cameraL.layers.enable(1),this.cameraL.matrixAutoUpdate=!1,this.cameraR=new Ke,this.cameraR.layers.enable(2),this.cameraR.matrixAutoUpdate=!1,this._cache={focus:null,fov:null,aspect:null,near:null,far:null,zoom:null,eyeSep:null}}update(e){let t=this._cache;if(t.focus!==e.focus||t.fov!==e.fov||t.aspect!==e.aspect*this.aspect||t.near!==e.near||t.far!==e.far||t.zoom!==e.zoom||t.eyeSep!==this.eyeSep){t.focus=e.focus,t.fov=e.fov,t.aspect=e.aspect*this.aspect,t.near=e.near,t.far=e.far,t.zoom=e.zoom,t.eyeSep=this.eyeSep;let i=e.projectionMatrix.clone(),r=t.eyeSep/2,o=r*t.near/t.focus,a=t.near*Math.tan(On*t.fov*.5)/t.zoom,c,l;lh.elements[12]=-r,ah.elements[12]=r,c=-a*t.aspect+o,l=a*t.aspect+o,i.elements[0]=2*t.near/(l-c),i.elements[8]=(l+c)/(l-c),this.cameraL.projectionMatrix.copy(i),c=-a*t.aspect-o,l=a*t.aspect-o,i.elements[0]=2*t.near/(l-c),i.elements[8]=(l+c)/(l-c),this.cameraR.projectionMatrix.copy(i)}this.cameraL.matrixWorld.copy(e.matrixWorld).multiply(lh),this.cameraR.matrixWorld.copy(e.matrixWorld).multiply(ah)}};var ll=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=hh(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=hh();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};function hh(){return(typeof performance>`u`?Date:performance).now()}var Pn=new _;var uh=new et;var _y=new _;var In=new _;var dh=class extends Ae{constructor(){super(),this.type=`AudioListener`,this.context=gu.getContext(),this.gain=this.context.createGain(),this.gain.connect(this.context.destination),this.filter=null,this.timeDelta=0,this._clock=new ll}getInput(){return this.gain}removeFilter(){return this.filter!==null&&(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination),this.gain.connect(this.context.destination),this.filter=null),this}getFilter(){return this.filter}setFilter(e){return this.filter!==null?(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination)):this.gain.disconnect(this.context.destination),this.filter=e,this.gain.connect(this.filter),this.filter.connect(this.context.destination),this}getMasterVolume(){return this.gain.gain.value}setMasterVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}updateMatrixWorld(e){super.updateMatrixWorld(e);let t=this.context.listener,n=this.up;if(this.timeDelta=this._clock.getDelta(),this.matrixWorld.decompose(Pn,uh,_y),In.set(0,0,-1).applyQuaternion(uh),t.positionX){let i=this.context.currentTime+this.timeDelta;t.positionX.linearRampToValueAtTime(Pn.x,i),t.positionY.linearRampToValueAtTime(Pn.y,i),t.positionZ.linearRampToValueAtTime(Pn.z,i),t.forwardX.linearRampToValueAtTime(In.x,i),t.forwardY.linearRampToValueAtTime(In.y,i),t.forwardZ.linearRampToValueAtTime(In.z,i),t.upX.linearRampToValueAtTime(n.x,i),t.upY.linearRampToValueAtTime(n.y,i),t.upZ.linearRampToValueAtTime(n.z,i)}else t.setPosition(Pn.x,Pn.y,Pn.z),t.setOrientation(In.x,In.y,In.z,n.x,n.y,n.z)}};var Ao=class extends Ae{constructor(e){super(),this.type=`Audio`,this.listener=e,this.context=e.context,this.gain=this.context.createGain(),this.gain.connect(e.getInput()),this.autoplay=!1,this.buffer=null,this.detune=0,this.loop=!1,this.loopStart=0,this.loopEnd=0,this.offset=0,this.duration=void 0,this.playbackRate=1,this.isPlaying=!1,this.hasPlaybackControl=!0,this.source=null,this.sourceType=`empty`,this._startedAt=0,this._progress=0,this._connected=!1,this.filters=[]}getOutput(){return this.gain}setNodeSource(e){return this.hasPlaybackControl=!1,this.sourceType=`audioNode`,this.source=e,this.connect(),this}setMediaElementSource(e){return this.hasPlaybackControl=!1,this.sourceType=`mediaNode`,this.source=this.context.createMediaElementSource(e),this.connect(),this}setMediaStreamSource(e){return this.hasPlaybackControl=!1,this.sourceType=`mediaStreamNode`,this.source=this.context.createMediaStreamSource(e),this.connect(),this}setBuffer(e){return this.buffer=e,this.sourceType=`buffer`,this.autoplay&&this.play(),this}play(e=0){if(this.isPlaying===!0){console.warn(`THREE.Audio: Audio is already playing.`);return}if(this.hasPlaybackControl===!1){console.warn(`THREE.Audio: this Audio has no playback control.`);return}this._startedAt=this.context.currentTime+e;let t=this.context.createBufferSource();return t.buffer=this.buffer,t.loop=this.loop,t.loopStart=this.loopStart,t.loopEnd=this.loopEnd,t.onended=this.onEnded.bind(this),t.start(this._startedAt,this._progress+this.offset,this.duration),this.isPlaying=!0,this.source=t,this.setDetune(this.detune),this.setPlaybackRate(this.playbackRate),this.connect()}pause(){if(this.hasPlaybackControl===!1){console.warn(`THREE.Audio: this Audio has no playback control.`);return}return this.isPlaying===!0&&(this._progress+=Math.max(this.context.currentTime-this._startedAt,0)*this.playbackRate,this.loop===!0&&(this._progress=this._progress%(this.duration||this.buffer.duration)),this.source.stop(),this.source.onended=null,this.isPlaying=!1),this}stop(){if(this.hasPlaybackControl===!1){console.warn(`THREE.Audio: this Audio has no playback control.`);return}return this._progress=0,this.source.stop(),this.source.onended=null,this.isPlaying=!1,this}connect(){if(this.filters.length>0){this.source.connect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].connect(this.filters[e]);this.filters[this.filters.length-1].connect(this.getOutput())}else this.source.connect(this.getOutput());return this._connected=!0,this}disconnect(){if(this.filters.length>0){this.source.disconnect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].disconnect(this.filters[e]);this.filters[this.filters.length-1].disconnect(this.getOutput())}else this.source.disconnect(this.getOutput());return this._connected=!1,this}getFilters(){return this.filters}setFilters(e){return e||(e=[]),this._connected===!0?(this.disconnect(),this.filters=e.slice(),this.connect()):this.filters=e.slice(),this}setDetune(e){if(this.detune=e,this.source.detune!==void 0)return this.isPlaying===!0&&this.source.detune.setTargetAtTime(this.detune,this.context.currentTime,.01),this}getDetune(){return this.detune}getFilter(){return this.getFilters()[0]}setFilter(e){return this.setFilters(e?[e]:[])}setPlaybackRate(e){if(this.hasPlaybackControl===!1){console.warn(`THREE.Audio: this Audio has no playback control.`);return}return this.playbackRate=e,this.isPlaying===!0&&this.source.playbackRate.setTargetAtTime(this.playbackRate,this.context.currentTime,.01),this}getPlaybackRate(){return this.playbackRate}onEnded(){this.isPlaying=!1}getLoop(){return this.hasPlaybackControl===!1?(console.warn(`THREE.Audio: this Audio has no playback control.`),!1):this.loop}setLoop(e){if(this.hasPlaybackControl===!1){console.warn(`THREE.Audio: this Audio has no playback control.`);return}return this.loop=e,this.isPlaying===!0&&(this.source.loop=this.loop),this}setLoopStart(e){return this.loopStart=e,this}setLoopEnd(e){return this.loopEnd=e,this}getVolume(){return this.gain.gain.value}setVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}};var Dn=new _;var fh=new et;var wy=new _;var Fn=new _;var ph=class extends Ao{constructor(e){super(e),this.panner=this.context.createPanner(),this.panner.panningModel=`HRTF`,this.panner.connect(this.gain)}getOutput(){return this.panner}getRefDistance(){return this.panner.refDistance}setRefDistance(e){return this.panner.refDistance=e,this}getRolloffFactor(){return this.panner.rolloffFactor}setRolloffFactor(e){return this.panner.rolloffFactor=e,this}getDistanceModel(){return this.panner.distanceModel}setDistanceModel(e){return this.panner.distanceModel=e,this}getMaxDistance(){return this.panner.maxDistance}setMaxDistance(e){return this.panner.maxDistance=e,this}setDirectionalCone(e,t,n){return this.panner.coneInnerAngle=e,this.panner.coneOuterAngle=t,this.panner.coneOuterGain=n,this}updateMatrixWorld(e){if(super.updateMatrixWorld(e),this.hasPlaybackControl===!0&&this.isPlaying===!1)return;this.matrixWorld.decompose(Dn,fh,wy),Fn.set(0,0,1).applyQuaternion(fh);let t=this.panner;if(t.positionX){let n=this.context.currentTime+this.listener.timeDelta;t.positionX.linearRampToValueAtTime(Dn.x,n),t.positionY.linearRampToValueAtTime(Dn.y,n),t.positionZ.linearRampToValueAtTime(Dn.z,n),t.orientationX.linearRampToValueAtTime(Fn.x,n),t.orientationY.linearRampToValueAtTime(Fn.y,n),t.orientationZ.linearRampToValueAtTime(Fn.z,n)}else t.setPosition(Dn.x,Dn.y,Dn.z),t.setOrientation(Fn.x,Fn.y,Fn.z)}};var cl=class{constructor(e,t=2048){this.analyser=e.context.createAnalyser(),this.analyser.fftSize=t,this.data=new Uint8Array(this.analyser.frequencyBinCount),e.getOutput().connect(this.analyser)}getFrequencyData(){return this.analyser.getByteFrequencyData(this.data),this.data}getAverageFrequency(){let e=0,t=this.getFrequencyData();for(let n=0;n<t.length;n++)e+=t[n];return e/t.length}};var hl=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,o;switch(t){case`quaternion`:i=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case`string`:case`bool`:i=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,i=this.valueSize,r=e*i+i,o=this.cumulativeWeight;if(o===0){for(let a=0;a!==i;++a)n[r+a]=n[a];o=t}else{o+=t;let a=t/o;this._mixBufferRegion(n,r,0,a,i)}this.cumulativeWeight=o}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let c=t*this._origIndex;this._mixBufferRegion(n,i,c,1-r,t)}o>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let c=t,l=t+t;c!==l;++c)if(n[c]!==n[c+t]){a.setValue(n,i);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,o=i;r!==o;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let o=0;o!==r;++o)e[t+o]=e[n+o]}_slerp(e,t,n,i){et.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){let o=this._workIndex*r;et.multiplyQuaternionsFlat(e,o,e,t,e,n),et.slerpFlat(e,t,e,t,e,o,i)}_lerp(e,t,n,i,r){let o=1-i;for(let a=0;a!==r;++a){let c=t+a;e[c]=e[c]*o+e[n+a]*i}}_lerpAdditive(e,t,n,i,r){for(let o=0;o!==r;++o){let a=t+o;e[a]=e[a]+e[n+o]*i}}};var Cl=`\\[\\]\\.:\\/`;var by=new RegExp(`[`+Cl+`]`,`g`);var Pl=`[^`+Cl+`]`;var My=`[^`+Cl.replace(`\\.`,``)+`]`;var Sy=/((?:WC+[\/:])*)/.source.replace(`WC`,Pl);var Ey=/(WCOD+)?/.source.replace(`WCOD`,My);var Ty=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace(`WC`,Pl);var Ay=/\.(WC+)(?:\[(.+)\])?/.source.replace(`WC`,Pl);var Ly=new RegExp(`^`+Sy+Ey+Ty+Ay+`$`);var Ry=[`material`,`materials`,`bones`];var ul=class{constructor(e,t,n){let i=n||He.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}};var He=(()=>{class s{constructor(t,n,i){this.path=n,this.parsedPath=i||s.parseTrackName(n),this.node=s.findNode(t,this.parsedPath.nodeName)||t,this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,i){return t&&t.isAnimationObjectGroup?new s.Composite(t,n,i):new s(t,n,i)}static sanitizeNodeName(t){return t.replace(/\s/g,`_`).replace(by,``)}static parseTrackName(t){let n=Ly.exec(t);if(!n)throw new Error(`PropertyBinding: Cannot parse trackName: `+t);let i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},r=i.nodeName&&i.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let o=i.nodeName.substring(r+1);Ry.indexOf(o)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=o)}if(i.propertyName===null||i.propertyName.length===0)throw new Error(`PropertyBinding: can not parse propertyName from trackName: `+t);return i}static findNode(t,n){if(!n||n===``||n===`.`||n===-1||n===t.name||n===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(n);if(i!==void 0)return i}if(t.children){let i=function(o){for(let a=0;a<o.length;a++){let c=o[a];if(c.name===n||c.uuid===n)return c;let l=i(c.children);if(l)return l}return null},r=i(t.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,n){t[n]=this.node[this.propertyName]}_getValue_array(t,n){let i=this.resolvedProperty;for(let r=0,o=i.length;r!==o;++r)t[n++]=i[r]}_getValue_arrayElement(t,n){t[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,n){this.resolvedProperty.toArray(t,n)}_setValue_direct(t,n){this.targetObject[this.propertyName]=t[n]}_setValue_direct_setNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,n){let i=this.resolvedProperty;for(let r=0,o=i.length;r!==o;++r)i[r]=t[n++]}_setValue_array_setNeedsUpdate(t,n){let i=this.resolvedProperty;for(let r=0,o=i.length;r!==o;++r)i[r]=t[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,n){let i=this.resolvedProperty;for(let r=0,o=i.length;r!==o;++r)i[r]=t[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,n){this.resolvedProperty[this.propertyIndex]=t[n]}_setValue_arrayElement_setNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,n){this.resolvedProperty.fromArray(t,n)}_setValue_fromArray_setNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,n){this.bind(),this.getValue(t,n)}_setValue_unbound(t,n){this.bind(),this.setValue(t,n)}bind(){let t=this.node,n=this.parsedPath,i=n.objectName,r=n.propertyName,o=n.propertyIndex;if(t||(t=s.findNode(this.rootNode,n.nodeName)||this.rootNode,this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.error(`THREE.PropertyBinding: Trying to update node for track: `+this.path+` but it wasn't found.`);return}if(i){let u=n.objectIndex;switch(i){case`materials`:if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){console.error(`THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){console.error(`THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===u){u=h;break}break;default:if(t[i]===void 0){console.error(`THREE.PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[i]}if(u!==void 0){if(t[u]===void 0){console.error(`THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[u]}}let a=t[r];if(a===void 0){let u=n.nodeName;console.error(`THREE.PropertyBinding: Trying to update property for track: `+u+`.`+r+` but it wasn't found.`,t);return}let c=this.Versioning.None;this.targetObject=t,t.needsUpdate!==void 0?c=this.Versioning.NeedsUpdate:t.matrixWorldNeedsUpdate!==void 0&&(c=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(o!==void 0){if(r===`morphTargetInfluences`){if(!t.geometry){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(t.geometry.isBufferGeometry){if(!t.geometry.morphAttributes){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[o]!==void 0&&(o=t.morphTargetDictionary[o])}else{console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences on THREE.Geometry. Use THREE.BufferGeometry instead.`,this);return}}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=o}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][c]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}return s.Composite=ul,s})();He.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};He.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};He.prototype.GetterByBindingType=[He.prototype._getValue_direct,He.prototype._getValue_array,He.prototype._getValue_arrayElement,He.prototype._getValue_toArray];He.prototype.SetterByBindingTypeAndVersioning=[[He.prototype._setValue_direct,He.prototype._setValue_direct_setNeedsUpdate,He.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[He.prototype._setValue_array,He.prototype._setValue_array_setNeedsUpdate,He.prototype._setValue_array_setMatrixWorldNeedsUpdate],[He.prototype._setValue_arrayElement,He.prototype._setValue_arrayElement_setNeedsUpdate,He.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[He.prototype._setValue_fromArray,He.prototype._setValue_fromArray_setNeedsUpdate,He.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var dl=class{constructor(){this.uuid=Mt(),this._objects=Array.prototype.slice.call(arguments),this.nCachedObjects_=0;let e={};this._indicesByUUID=e;for(let n=0,i=arguments.length;n!==i;++n)e[arguments[n].uuid]=n;this._paths=[],this._parsedPaths=[],this._bindings=[],this._bindingsIndicesByPath={};let t=this;this.stats={objects:{get total(){return t._objects.length},get inUse(){return this.total-t.nCachedObjects_}},get bindingsPerObject(){return t._bindings.length}}}add(){let e=this._objects,t=this._indicesByUUID,n=this._paths,i=this._parsedPaths,r=this._bindings,o=r.length,a,c=e.length,l=this.nCachedObjects_;for(let u=0,h=arguments.length;u!==h;++u){let d=arguments[u],f=d.uuid,m=t[f];if(m===void 0){m=c++,t[f]=m,e.push(d);for(let x=0,y=o;x!==y;++x)r[x].push(new He(d,n[x],i[x]))}else if(m<l){a=e[m];let x=--l,y=e[x];t[y.uuid]=m,e[m]=y,t[f]=x,e[x]=d;for(let g=0,p=o;g!==p;++g){let w=r[g],b=w[x],E=w[m];w[m]=b,E===void 0&&(E=new He(d,n[g],i[g])),w[x]=E}}else e[m]!==a&&console.error(`THREE.AnimationObjectGroup: Different objects with the same UUID detected. Clean the caches or recreate your infrastructure when reloading scenes.`)}this.nCachedObjects_=l}remove(){let e=this._objects,t=this._indicesByUUID,n=this._bindings,i=n.length,r=this.nCachedObjects_;for(let o=0,a=arguments.length;o!==a;++o){let c=arguments[o],l=c.uuid,u=t[l];if(u!==void 0&&u>=r){let h=r++,d=e[h];t[d.uuid]=u,e[u]=d,t[l]=h,e[h]=c;for(let f=0,m=i;f!==m;++f){let x=n[f],y=x[h],g=x[u];x[u]=y,x[h]=g}}}this.nCachedObjects_=r}uncache(){let e=this._objects,t=this._indicesByUUID,n=this._bindings,i=n.length,r=this.nCachedObjects_,o=e.length;for(let a=0,c=arguments.length;a!==c;++a){let u=arguments[a].uuid,h=t[u];if(h!==void 0)if(delete t[u],h<r){let d=--r,f=e[d],m=--o,x=e[m];t[f.uuid]=h,e[h]=f,t[x.uuid]=d,e[d]=x,e.pop();for(let y=0,g=i;y!==g;++y){let p=n[y],w=p[d],b=p[m];p[h]=w,p[d]=b,p.pop()}}else{let d=--o,f=e[d];d>0&&(t[f.uuid]=h),e[h]=f,e.pop();for(let m=0,x=i;m!==x;++m){let y=n[m];y[h]=y[d],y.pop()}}}this.nCachedObjects_=r}subscribe_(e,t){let n=this._bindingsIndicesByPath,i=n[e],r=this._bindings;if(i!==void 0)return r[i];let o=this._paths,a=this._parsedPaths,c=this._objects,l=c.length,u=this.nCachedObjects_,h=new Array(l);i=r.length,n[e]=i,o.push(e),a.push(t),r.push(h);for(let d=u,f=c.length;d!==f;++d){let m=c[d];h[d]=new He(m,e,t)}return h}unsubscribe_(e){let t=this._bindingsIndicesByPath,n=t[e];if(n!==void 0){let i=this._paths,r=this._parsedPaths,o=this._bindings,a=o.length-1,c=o[a],l=e[a];t[l]=n,o[n]=c,o.pop(),r[n]=r[a],r.pop(),i[n]=i[a],i.pop()}}};dl.prototype.isAnimationObjectGroup=!0;var fl=class{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;let r=t.tracks,o=r.length,a=new Array(o),c={endingStart:di,endingEnd:di};for(let l=0;l!==o;++l){let u=r[l].createInterpolant(null);a[l]=u,u.settings=c}this._interpolantSettings=c,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=Yd,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=Infinity,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n){if(e.fadeOut(t),this.fadeIn(t),n){let i=this._clip.duration,r=e._clip.duration,o=r/i,a=i/r;e.warp(1,o,t),this.warp(a,1,t)}return this}crossFadeTo(e,t,n){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let i=this._mixer,r=i.time,o=this.timeScale,a=this._timeScaleInterpolant;a===null&&(a=i._lendControlInterpolant(),this._timeScaleInterpolant=a);let c=a.parameterPositions,l=a.sampleValues;return c[0]=r,c[1]=r+n,l[0]=e/o,l[1]=t/o,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let c=(e-r)*n;if(c<0||n===0)return;this._startTime=null,t=n*c}t*=this._updateTimeScale(e);let o=this._updateTime(t),a=this._updateWeight(e);if(a>0){let c=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case jh:for(let u=0,h=c.length;u!==h;++u)c[u].evaluate(o),l[u].accumulateAdditive(a);break;case El:default:for(let u=0,h=c.length;u!==h;++u)c[u].evaluate(o),l[u].accumulate(i,a)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,i=this.time+e,r=this._loopCount,o=n===Zd;if(e===0)return r===-1?i:o&&(r&1)===1?t-i:i;if(n===2200){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:`finished`,action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),i>=t||i<0){let a=Math.floor(i/t);i-=t*a,r+=Math.abs(a);let c=this.repetitions-r;if(c<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:`finished`,action:this,direction:e>0?1:-1});else{if(c===1){let l=e<0;this._setEndings(l,!l,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:`loop`,action:this,loopDelta:a})}}else this.time=i;if(o&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){let i=this._interpolantSettings;n?(i.endingStart=fi,i.endingEnd=fi):(e?i.endingStart=this.zeroSlopeAtStart?fi:di:i.endingStart=As,t?i.endingEnd=this.zeroSlopeAtEnd?fi:di:i.endingEnd=As)}_scheduleFading(e,t,n){let i=this._mixer,r=i.time,o=this._weightInterpolant;o===null&&(o=i._lendControlInterpolant(),this._weightInterpolant=o);let a=o.parameterPositions,c=o.sampleValues;return a[0]=r,c[0]=t,a[1]=r+e,c[1]=n,this}};var pl=class extends en{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){let n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,o=e._propertyBindings,a=e._interpolants,c=n.uuid,l=this._bindingsByRootAndName,u=l[c];u===void 0&&(u={},l[c]=u);for(let h=0;h!==r;++h){let d=i[h],f=d.name,m=u[f];if(m!==void 0)o[h]=m;else{if(m=o[h],m!==void 0){m._cacheIndex===null&&(++m.referenceCount,this._addInactiveBinding(m,c,f));continue}let x=t&&t._propertyBindings[h].binding.parsedPath;m=new hl(He.create(n,f,x),d.ValueTypeName,d.getValueSize()),++m.referenceCount,this._addInactiveBinding(m,c,f),o[h]=m}a[h].resultBuffer=m.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let i=this._actions,r=this._actionsByClip,o=r[t];if(o===void 0)o={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=o;else{let a=o.knownActions;e._byClipCacheIndex=a.length,a.push(e)}e._cacheIndex=i.length,i.push(e),o.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,o=this._actionsByClip,a=o[r],c=a.knownActions,l=c[c.length-1],u=e._byClipCacheIndex;l._byClipCacheIndex=u,c[u]=l,c.pop(),e._byClipCacheIndex=null;let h=a.actionByRoot,d=(e._localRoot||this._root).uuid;delete h[d],c.length===0&&delete o[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let i=this._bindingsByRootAndName,r=this._bindings,o=i[t];o===void 0&&(o={},i[t]=o),o[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[i],c=t[t.length-1],l=e._cacheIndex;c._cacheIndex=l,t[l]=c,t.pop(),delete a[r],Object.keys(a).length===0&&delete o[i]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new so(new Float32Array(2),new Float32Array(2),1,this._controlInterpolantsResultBuffer),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let i=t||this._root,r=i.uuid,o=typeof e==`string`?Ti.findByName(i,e):e,a=o!==null?o.uuid:e,c=this._actionsByClip[a],l=null;if(n===void 0&&(o!==null?n=o.blendMode:n=2500),c!==void 0){let h=c.actionByRoot[r];if(h!==void 0&&h.blendMode===n)return h;l=c.knownActions[0],o===null&&(o=l._clip)}if(o===null)return null;let u=new fl(this,o,t,n);return this._bindAction(u,l),this._addInactiveAction(u,a,r),u}existingAction(e,t){let n=t||this._root,i=n.uuid,r=typeof e==`string`?Ti.findByName(n,e):e,o=r?r.uuid:e,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[i]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),o=this._accuIndex^=1;for(let l=0;l!==n;++l)t[l]._update(i,e,r,o);let a=this._bindings,c=this._nActiveBindings;for(let l=0;l!==c;++l)a[l].apply(o);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){let o=r.knownActions;for(let a=0,c=o.length;a!==c;++a){let l=o[a];this._deactivateAction(l);let u=l._cacheIndex,h=t[t.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,h._cacheIndex=u,t[u]=h,t.pop(),this._removeInactiveBindingsForAction(l)}delete i[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let o in n){let c=n[o].actionByRoot[t];c!==void 0&&(this._deactivateAction(c),this._removeInactiveAction(c))}let r=this._bindingsByRootAndName[t];if(r!==void 0)for(let o in r){let a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};pl.prototype._controlInterpolantsResultBuffer=new Float32Array(1);var ml=class s{constructor(e){typeof e==`string`&&(console.warn(`THREE.Uniform: Type parameter is no longer needed.`),e=arguments[1]),this.value=e}clone(){return new s(this.value.clone===void 0?this.value:this.value.clone())}};var gl=class extends vn{constructor(e,t,n=1){super(e,t),this.meshPerAttribute=n||1}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){let t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){let t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}};gl.prototype.isInstancedInterleavedBuffer=!0;var xl=class{constructor(e,t,n,i,r){this.buffer=e,this.type=t,this.itemSize=n,this.elementSize=i,this.count=r,this.version=0}set needsUpdate(e){e===!0&&this.version++}setBuffer(e){return this.buffer=e,this}setType(e,t){return this.type=e,this.elementSize=t,this}setItemSize(e){return this.itemSize=e,this}setCount(e){return this.count=e,this}};xl.prototype.isGLBufferAttribute=!0;var mh=class{constructor(e,t,n=0,i=Infinity){this.ray=new nn(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new Ls,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t&&t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t&&t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error(`THREE.Raycaster: Unsupported camera type: `+t.type)}intersectObject(e,t=!1,n=[]){return yl(e,this,n,t),n.sort(gh),n}intersectObjects(e,t=!1,n=[]){for(let i=0,r=e.length;i<r;i++)yl(e[i],this,n,t);return n.sort(gh),n}};function gh(s,e){return s.distance-e.distance}function yl(s,e,t,n){if(s.layers.test(e.layers)&&s.raycast(e,t),n===!0){let i=s.children;for(let r=0,o=i.length;r<o;r++)yl(i[r],e,t,!0)}}var xh=class{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(at(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var yh=class{constructor(e=1,t=0,n=0){return this.radius=e,this.theta=t,this.y=n,this}set(e,t,n){return this.radius=e,this.theta=t,this.y=n,this}copy(e){return this.radius=e.radius,this.theta=e.theta,this.y=e.y,this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+n*n),this.theta=Math.atan2(e,n),this.y=t,this}clone(){return new this.constructor().copy(this)}};var vh=new W;var qn=class{constructor(e=new W(Infinity,Infinity),t=new W(-Infinity,-Infinity)){this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=vh.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=Infinity,this.max.x=this.max.y=-Infinity,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y}getCenter(e){return e===void 0&&(console.warn(`THREE.Box2: .getCenter() target is now required`),e=new W),this.isEmpty()?e.set(0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return e===void 0&&(console.warn(`THREE.Box2: .getSize() target is now required`),e=new W),this.isEmpty()?e.set(0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y}getParameter(e,t){return t===void 0&&(console.warn(`THREE.Box2: .getParameter() target is now required`),t=new W),t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y)}clampPoint(e,t){return t===void 0&&(console.warn(`THREE.Box2: .clampPoint() target is now required`),t=new W),t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return vh.copy(e).clamp(this.min,this.max).sub(e).length()}intersect(e){return this.min.max(e.min),this.max.min(e.max),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}};qn.prototype.isBox2=!0;var _h=new _;var ds=new _;var vl=class{constructor(e=new _,t=new _){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e===void 0&&(console.warn(`THREE.Line3: .getCenter() target is now required`),e=new _),e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e===void 0&&(console.warn(`THREE.Line3: .delta() target is now required`),e=new _),e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return t===void 0&&(console.warn(`THREE.Line3: .at() target is now required`),t=new _),this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){_h.subVectors(e,this.start),ds.subVectors(this.end,this.start);let n=ds.dot(ds),r=ds.dot(_h)/n;return t&&(r=at(r,0,1)),r}closestPointToPoint(e,t,n){let i=this.closestPointToPointParameter(e,t);return n===void 0&&(console.warn(`THREE.Line3: .closestPointToPoint() target is now required`),n=new _),this.delta(n).multiplyScalar(i).add(this.start)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}};var _l=class extends Ae{constructor(e){super(),this.material=e,this.render=function(){},this.hasPositions=!1,this.hasNormals=!1,this.hasColors=!1,this.hasUvs=!1,this.positionArray=null,this.normalArray=null,this.colorArray=null,this.uvArray=null,this.count=0}};_l.prototype.isImmediateRenderObject=!0;var wh=new _;var bh=class extends Ae{constructor(e,t){super(),this.light=e,this.light.updateMatrixWorld(),this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.color=t;let n=new ue,i=[0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,-1,0,1,0,0,0,0,1,1,0,0,0,0,-1,1];for(let o=0,a=1,c=32;o<c;o++,a++){let l=o/c*Math.PI*2,u=a/c*Math.PI*2;i.push(Math.cos(l),Math.sin(l),1,Math.cos(u),Math.sin(u),1)}n.setAttribute(`position`,new oe(i,3));let r=new nt({fog:!1,toneMapped:!1});this.cone=new gt(n,r),this.add(this.cone),this.update()}dispose(){this.cone.geometry.dispose(),this.cone.material.dispose()}update(){this.light.updateMatrixWorld();let e=this.light.distance?this.light.distance:1e3,t=e*Math.tan(this.light.angle);this.cone.scale.set(t,t,e),wh.setFromMatrixPosition(this.light.target.matrixWorld),this.cone.lookAt(wh),this.color!==void 0?this.cone.material.color.set(this.color):this.cone.material.color.copy(this.light.color)}};var dn=new _;var fs=new le;var ga=new le;var wl=class extends gt{constructor(e){let t=xu(e),n=new ue,i=[],r=[],o=new se(0,0,1),a=new se(0,1,0);for(let l=0;l<t.length;l++){let u=t[l];u.parent&&u.parent.isBone&&(i.push(0,0,0),i.push(0,0,0),r.push(o.r,o.g,o.b),r.push(a.r,a.g,a.b))}n.setAttribute(`position`,new oe(i,3)),n.setAttribute(`color`,new oe(r,3));let c=new nt({vertexColors:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,transparent:!0});super(n,c),this.type=`SkeletonHelper`,this.isSkeletonHelper=!0,this.root=e,this.bones=t,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1}updateMatrixWorld(e){let t=this.bones,n=this.geometry,i=n.getAttribute(`position`);ga.copy(this.root.matrixWorld).invert();for(let r=0,o=0;r<t.length;r++){let a=t[r];a.parent&&a.parent.isBone&&(fs.multiplyMatrices(ga,a.matrixWorld),dn.setFromMatrixPosition(fs),i.setXYZ(o,dn.x,dn.y,dn.z),fs.multiplyMatrices(ga,a.parent.matrixWorld),dn.setFromMatrixPosition(fs),i.setXYZ(o+1,dn.x,dn.y,dn.z),o+=2)}n.getAttribute(`position`).needsUpdate=!0,super.updateMatrixWorld(e)}};function xu(s){let e=[];s&&s.isBone&&e.push(s);for(let t=0;t<s.children.length;t++)e.push.apply(e,xu(s.children[t]));return e}var Mh=class extends Ye{constructor(e,t,n){let i=new br(t,4,2),r=new Gt({wireframe:!0,fog:!1,toneMapped:!1});super(i,r),this.light=e,this.light.updateMatrixWorld(),this.color=n,this.type=`PointLightHelper`,this.matrix=this.light.matrixWorld,this.matrixAutoUpdate=!1,this.update()}dispose(){this.geometry.dispose(),this.material.dispose()}update(){this.color!==void 0?this.material.color.set(this.color):this.material.color.copy(this.light.color)}};var Cy=new _;var Sh=new se;var Eh=new se;var Th=class extends Ae{constructor(e,t,n){super(),this.light=e,this.light.updateMatrixWorld(),this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.color=n;let i=new _r(t);i.rotateY(Math.PI*.5),this.material=new Gt({wireframe:!0,fog:!1,toneMapped:!1}),this.color===void 0&&(this.material.vertexColors=!0);let r=i.getAttribute(`position`),o=new Float32Array(r.count*3);i.setAttribute(`color`,new Me(o,3)),this.add(new Ye(i,this.material)),this.update()}dispose(){this.children[0].geometry.dispose(),this.children[0].material.dispose()}update(){let e=this.children[0];if(this.color!==void 0)this.material.color.set(this.color);else{let t=e.geometry.getAttribute(`color`);Sh.copy(this.light.color),Eh.copy(this.light.groundColor);for(let n=0,i=t.count;n<i;n++){let r=n<i/2?Sh:Eh;t.setXYZ(n,r.r,r.g,r.b)}t.needsUpdate=!0}e.lookAt(Cy.setFromMatrixPosition(this.light.matrixWorld).negate())}};var bl=class extends gt{constructor(e=10,t=10,n=4473924,i=8947848){n=new se(n),i=new se(i);let r=t/2,o=e/t,a=e/2,c=[],l=[];for(let d=0,f=0,m=-a;d<=t;d++,m+=o){c.push(-a,0,m,a,0,m),c.push(m,0,-a,m,0,a);let x=d===r?n:i;x.toArray(l,f),f+=3,x.toArray(l,f),f+=3,x.toArray(l,f),f+=3,x.toArray(l,f),f+=3}let u=new ue;u.setAttribute(`position`,new oe(c,3)),u.setAttribute(`color`,new oe(l,3));let h=new nt({vertexColors:!0,toneMapped:!1});super(u,h),this.type=`GridHelper`}};var Ah=class extends gt{constructor(e=10,t=16,n=8,i=64,r=4473924,o=8947848){r=new se(r),o=new se(o);let a=[],c=[];for(let h=0;h<=t;h++){let d=h/t*(Math.PI*2),f=Math.sin(d)*e,m=Math.cos(d)*e;a.push(0,0,0),a.push(f,0,m);let x=h&1?r:o;c.push(x.r,x.g,x.b),c.push(x.r,x.g,x.b)}for(let h=0;h<=n;h++){let d=h&1?r:o,f=e-e/n*h;for(let m=0;m<i;m++){let x=m/i*(Math.PI*2),y=Math.sin(x)*f,g=Math.cos(x)*f;a.push(y,0,g),c.push(d.r,d.g,d.b),x=(m+1)/i*(Math.PI*2),y=Math.sin(x)*f,g=Math.cos(x)*f,a.push(y,0,g),c.push(d.r,d.g,d.b)}}let l=new ue;l.setAttribute(`position`,new oe(a,3)),l.setAttribute(`color`,new oe(c,3));let u=new nt({vertexColors:!0,toneMapped:!1});super(l,u),this.type=`PolarGridHelper`}};var Lh=new _;var ps=new _;var Rh=new _;var Ch=class extends Ae{constructor(e,t,n){super(),this.light=e,this.light.updateMatrixWorld(),this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.color=n,t===void 0&&(t=1);let i=new ue;i.setAttribute(`position`,new oe([-t,t,0,t,t,0,t,-t,0,-t,-t,0,-t,t,0],3));let r=new nt({fog:!1,toneMapped:!1});this.lightPlane=new Vt(i,r),this.add(this.lightPlane),i=new ue,i.setAttribute(`position`,new oe([0,0,0,0,0,1],3)),this.targetLine=new Vt(i,r),this.add(this.targetLine),this.update()}dispose(){this.lightPlane.geometry.dispose(),this.lightPlane.material.dispose(),this.targetLine.geometry.dispose(),this.targetLine.material.dispose()}update(){Lh.setFromMatrixPosition(this.light.matrixWorld),ps.setFromMatrixPosition(this.light.target.matrixWorld),Rh.subVectors(ps,Lh),this.lightPlane.lookAt(ps),this.color!==void 0?(this.lightPlane.material.color.set(this.color),this.targetLine.material.color.set(this.color)):(this.lightPlane.material.color.copy(this.light.color),this.targetLine.material.color.copy(this.light.color)),this.targetLine.lookAt(ps),this.targetLine.scale.z=Rh.length()}};var ms=new _;var Ve=new _i;var Ph=class extends gt{constructor(e){let t=new ue,n=new nt({color:16777215,vertexColors:!0,toneMapped:!1}),i=[],r=[],o={},a=new se(16755200),c=new se(16711680),l=new se(43775),u=new se(16777215),h=new se(3355443);d(`n1`,`n2`,a),d(`n2`,`n4`,a),d(`n4`,`n3`,a),d(`n3`,`n1`,a),d(`f1`,`f2`,a),d(`f2`,`f4`,a),d(`f4`,`f3`,a),d(`f3`,`f1`,a),d(`n1`,`f1`,a),d(`n2`,`f2`,a),d(`n3`,`f3`,a),d(`n4`,`f4`,a),d(`p`,`n1`,c),d(`p`,`n2`,c),d(`p`,`n3`,c),d(`p`,`n4`,c),d(`u1`,`u2`,l),d(`u2`,`u3`,l),d(`u3`,`u1`,l),d(`c`,`t`,u),d(`p`,`c`,h),d(`cn1`,`cn2`,h),d(`cn3`,`cn4`,h),d(`cf1`,`cf2`,h),d(`cf3`,`cf4`,h);function d(m,x,y){f(m,y),f(x,y)}function f(m,x){i.push(0,0,0),r.push(x.r,x.g,x.b),o[m]===void 0&&(o[m]=[]),o[m].push(i.length/3-1)}t.setAttribute(`position`,new oe(i,3)),t.setAttribute(`color`,new oe(r,3)),super(t,n),this.type=`CameraHelper`,this.camera=e,this.camera.updateProjectionMatrix&&this.camera.updateProjectionMatrix(),this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.pointMap=o,this.update()}update(){let e=this.geometry,t=this.pointMap,n=1,i=1;Ve.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse),Xe(`c`,t,e,Ve,0,0,-1),Xe(`t`,t,e,Ve,0,0,1),Xe(`n1`,t,e,Ve,-1,-1,-1),Xe(`n2`,t,e,Ve,n,-1,-1),Xe(`n3`,t,e,Ve,-1,i,-1),Xe(`n4`,t,e,Ve,n,i,-1),Xe(`f1`,t,e,Ve,-1,-1,1),Xe(`f2`,t,e,Ve,n,-1,1),Xe(`f3`,t,e,Ve,-1,i,1),Xe(`f4`,t,e,Ve,n,i,1),Xe(`u1`,t,e,Ve,n*.7,i*1.1,-1),Xe(`u2`,t,e,Ve,-1*.7,i*1.1,-1),Xe(`u3`,t,e,Ve,0,i*2,-1),Xe(`cf1`,t,e,Ve,-1,0,1),Xe(`cf2`,t,e,Ve,n,0,1),Xe(`cf3`,t,e,Ve,0,-1,1),Xe(`cf4`,t,e,Ve,0,i,1),Xe(`cn1`,t,e,Ve,-1,0,-1),Xe(`cn2`,t,e,Ve,n,0,-1),Xe(`cn3`,t,e,Ve,0,-1,-1),Xe(`cn4`,t,e,Ve,0,i,-1),e.getAttribute(`position`).needsUpdate=!0}dispose(){this.geometry.dispose(),this.material.dispose()}};function Xe(s,e,t,n,i,r,o){ms.set(i,r,o).unproject(n);let a=e[s];if(a!==void 0){let c=t.getAttribute(`position`);for(let l=0,u=a.length;l<u;l++)c.setXYZ(a[l],ms.x,ms.y,ms.z)}}var gs=new pt,Ml=class extends gt{constructor(e,t=16776960){let n=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),i=new Float32Array(24),r=new ue;r.setIndex(new Me(n,1)),r.setAttribute(`position`,new Me(i,3)),super(r,new nt({color:t,toneMapped:!1})),this.object=e,this.type=`BoxHelper`,this.matrixAutoUpdate=!1,this.update()}update(e){if(e!==void 0&&console.warn(`THREE.BoxHelper: .update() has no longer arguments.`),this.object!==void 0&&gs.setFromObject(this.object),gs.isEmpty())return;let t=gs.min,n=gs.max,i=this.geometry.attributes.position,r=i.array;r[0]=n.x,r[1]=n.y,r[2]=n.z,r[3]=t.x,r[4]=n.y,r[5]=n.z,r[6]=t.x,r[7]=t.y,r[8]=n.z,r[9]=n.x,r[10]=t.y,r[11]=n.z,r[12]=n.x,r[13]=n.y,r[14]=t.z,r[15]=t.x,r[16]=n.y,r[17]=t.z,r[18]=t.x,r[19]=t.y,r[20]=t.z,r[21]=n.x,r[22]=t.y,r[23]=t.z,i.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(e){return this.object=e,this.update(),this}copy(e){return gt.prototype.copy.call(this,e),this.object=e.object,this}},Ih=class extends gt{constructor(e,t=16776960){let n=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),i=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],r=new ue;r.setIndex(new Me(n,1)),r.setAttribute(`position`,new oe(i,3)),super(r,new nt({color:t,toneMapped:!1})),this.box=e,this.type=`Box3Helper`,this.geometry.computeBoundingSphere()}updateMatrixWorld(e){let t=this.box;t.isEmpty()||(t.getCenter(this.position),t.getSize(this.scale),this.scale.multiplyScalar(.5),super.updateMatrixWorld(e))}},Dh=class extends Vt{constructor(e,t=1,n=16776960){let i=n,r=[1,-1,1,-1,1,1,-1,-1,1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,0,0,1,0,0,0],o=new ue;o.setAttribute(`position`,new oe(r,3)),o.computeBoundingSphere(),super(o,new nt({color:i,toneMapped:!1})),this.type=`PlaneHelper`,this.plane=e,this.size=t;let a=[1,1,1,-1,1,1,-1,-1,1,1,1,1,-1,-1,1,1,-1,1],c=new ue;c.setAttribute(`position`,new oe(a,3)),c.computeBoundingSphere(),this.add(new Ye(c,new Gt({color:i,opacity:.2,transparent:!0,depthWrite:!1,toneMapped:!1})))}updateMatrixWorld(e){let t=-this.plane.constant;Math.abs(t)<1e-8&&(t=1e-8),this.scale.set(.5*this.size,.5*this.size,t),this.children[0].material.side=t<0?1:0,this.lookAt(this.plane.normal),super.updateMatrixWorld(e)}},Fh=new _,xs,xa,Nh=class extends Ae{constructor(e=new _(0,0,1),t=new _(0,0,0),n=1,i=16776960,r=n*.2,o=r*.2){super(),this.type=`ArrowHelper`,xs===void 0&&(xs=new ue,xs.setAttribute(`position`,new oe([0,0,0,0,1,0],3)),xa=new Mi(0,.5,1,5,1),xa.translate(0,-.5,0)),this.position.copy(t),this.line=new Vt(xs,new nt({color:i,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new Ye(xa,new Gt({color:i,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(n,r,o)}setDirection(e){if(e.y>.99999)this.quaternion.set(0,0,0,1);else if(e.y<-.99999)this.quaternion.set(1,0,0,0);else{Fh.set(e.z,0,-e.x).normalize();let t=Math.acos(e.y);this.quaternion.setFromAxisAngle(Fh,t)}}setLength(e,t=e*.2,n=t*.2){this.line.scale.set(1,Math.max(1e-4,e-t),1),this.line.updateMatrix(),this.cone.scale.set(n,t,n),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}},Sl=class extends gt{constructor(e=1){let t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],i=new ue;i.setAttribute(`position`,new oe(t,3)),i.setAttribute(`color`,new oe(n,3));let r=new nt({vertexColors:!0,toneMapped:!1});super(i,r),this.type=`AxesHelper`}dispose(){this.geometry.dispose(),this.material.dispose()}},yu=new Float32Array(1),Py=new Int32Array(yu.buffer),Bh=class{static toHalfFloat(e){yu[0]=e;let t=Py[0],n=t>>16&32768,i=t>>12&2047,r=t>>23&255;return r<103?n:r>142?(n|=31744,n|=(r==255?0:1)&&t&8388607,n):r<113?(i|=2048,n|=(i>>114-r)+(i>>113-r&1),n):(n|=r-112<<10|i>>1,n+=i&1,n)}},xi=4,xn=8,zt=Math.pow(2,xn),vu=[.125,.215,.35,.446,.526,.582],_u=xn-xi+1+vu.length,ci=20,Ut={[vt]:0,[Do]:1,[Al]:2,[$h]:3,[Qh]:4,[Kh]:5,[Tl]:6},Nn=new Gt({side:1,depthWrite:!1,depthTest:!1}),Iy=new Ye(new Un,Nn),ya=new Pi,{_lodPlanes:qi,_sizeLods:zh,_sigmas:ys}=Fy(),Oh=new se,va=null,Bn=(1+Math.sqrt(5))/2,hi=1/Bn,Uh=[new _(1,1,1),new _(-1,1,1),new _(1,1,-1),new _(-1,1,-1),new _(0,Bn,hi),new _(0,Bn,-hi),new _(hi,0,Bn),new _(-hi,0,Bn),new _(Bn,hi,0),new _(-Bn,hi,0)];function Hh(s){let e=Math.max(s.r,s.g,s.b),t=Math.min(Math.max(Math.ceil(Math.log2(e)),-128),127);return s.multiplyScalar(Math.pow(2,-t)),(t+128)/255}var Gh=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._blurMaterial=Ny(ci),this._equirectShader=null,this._cubemapShader=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){va=this._renderer.getRenderTarget();let r=this._allocateTargets();return this._sceneToCubeUV(e,n,i,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e){return this._fromTexture(e)}fromCubemap(e){return this._fromTexture(e)}compileCubemapShader(){this._cubemapShader===null&&(this._cubemapShader=Wh(),this._compileMaterial(this._cubemapShader))}compileEquirectangularShader(){this._equirectShader===null&&(this._equirectShader=Vh(),this._compileMaterial(this._equirectShader))}dispose(){this._blurMaterial.dispose(),this._cubemapShader!==null&&this._cubemapShader.dispose(),this._equirectShader!==null&&this._equirectShader.dispose();for(let e=0;e<qi.length;e++)qi[e].dispose()}_cleanup(e){this._pingPongRenderTarget.dispose(),this._renderer.setRenderTarget(va),e.scissorTest=!1,vs(e,0,0,e.width,e.height)}_fromTexture(e){va=this._renderer.getRenderTarget();let t=this._allocateTargets(e);return this._textureToCubeUV(e,t),this._applyPMREM(t),this._cleanup(t),t}_allocateTargets(e){let t={magFilter:rt,minFilter:rt,generateMipmaps:!1,type:Ir,format:cd,encoding:Dy(e)?e.encoding:Al,depthBuffer:!1},n=kh(t);return n.depthBuffer=!e,this._pingPongRenderTarget=kh(t),n}_compileMaterial(e){let t=new Ye(qi[0],e);this._renderer.compile(t,ya)}_sceneToCubeUV(e,t,n,i){let a=new Ke(90,1,t,n),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.outputEncoding,f=u.toneMapping;u.getClearColor(Oh),u.toneMapping=0,u.outputEncoding=vt,u.autoClear=!1;let m=!1,x=e.background;if(x){if(x.isColor){Nn.color.copy(x).convertSRGBToLinear(),e.background=null;Nn.opacity=Hh(Nn.color),m=!0}}else{Nn.color.copy(Oh).convertSRGBToLinear();Nn.opacity=Hh(Nn.color),m=!0}for(let y=0;y<6;y++){let g=y%3;g==0?(a.up.set(0,c[y],0),a.lookAt(l[y],0,0)):g==1?(a.up.set(0,0,c[y]),a.lookAt(0,l[y],0)):(a.up.set(0,c[y],0),a.lookAt(0,0,l[y])),vs(i,g*zt,y>2?zt:0,zt,zt),u.setRenderTarget(i),m&&u.render(Iy,a),u.render(e,a)}u.toneMapping=f,u.outputEncoding=d,u.autoClear=h}_textureToCubeUV(e,t){let n=this._renderer;e.isCubeTexture?this._cubemapShader??=Wh():this._equirectShader??=Vh();let i=e.isCubeTexture?this._cubemapShader:this._equirectShader,r=new Ye(qi[0],i),o=i.uniforms;o.envMap.value=e,e.isCubeTexture||o.texelSize.value.set(1/e.image.width,1/e.image.height),o.inputEncoding.value=Ut[e.encoding],o.outputEncoding.value=Ut[t.texture.encoding],vs(t,0,0,3*zt,2*zt),n.setRenderTarget(t),n.render(r,ya)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let i=1;i<_u;i++){let r=Math.sqrt(ys[i]*ys[i]-ys[i-1]*ys[i-1]),o=Uh[(i-1)%Uh.length];this._blur(e,i-1,i,r,o)}t.autoClear=n}_blur(e,t,n,i,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,i,`latitudinal`,r),this._halfBlur(o,e,n,n,i,`longitudinal`,r)}_halfBlur(e,t,n,i,r,o,a){let c=this._renderer,l=this._blurMaterial;o!==`latitudinal`&&o!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let u=3,h=new Ye(qi[i],l),d=l.uniforms,f=zh[n]-1,m=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*ci-1),x=r/m,y=isFinite(r)?1+Math.floor(u*x):ci;y>ci&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${y} samples when the maximum is set to ${ci}`);let g=[],p=0;for(let v=0;v<ci;++v){let A=v/x,L=Math.exp(-A*A/2);g.push(L),v==0?p+=L:v<y&&(p+=2*L)}for(let v=0;v<g.length;v++)g[v]=g[v]/p;d.envMap.value=e.texture,d.samples.value=y,d.weights.value=g,d.latitudinal.value=o===`latitudinal`,a&&(d.poleAxis.value=a),d.dTheta.value=m,d.mipInt.value=xn-n,d.inputEncoding.value=Ut[e.texture.encoding],d.outputEncoding.value=Ut[e.texture.encoding];let w=zh[i];vs(t,3*Math.max(0,zt-2*w),(i===0?0:2*zt)+2*w*(i>xn-xi?i-xn+xi:0),3*w,2*w),c.setRenderTarget(t),c.render(h,ya)}};function Dy(s){return s===void 0||s.type!==1009?!1:s.encoding===3e3||s.encoding===3001||s.encoding===3007}function Fy(){let s=[],e=[],t=[],n=xn;for(let i=0;i<_u;i++){let r=Math.pow(2,n);e.push(r);let o=1/r;i>xn-xi?o=vu[i-xn+xi-1]:i==0&&(o=0),t.push(o);let a=1/(r-1),c=-a/2,l=1+a/2,u=[c,c,l,c,l,l,c,c,l,l,c,l],h=6,d=6,f=3,m=2,x=1,y=new Float32Array(f*d*h),g=new Float32Array(m*d*h),p=new Float32Array(x*d*h);for(let b=0;b<h;b++){let E=b%3*2/3-1,v=b>2?0:-1,A=[E,v,0,E+2/3,v,0,E+2/3,v+1,0,E,v,0,E+2/3,v+1,0,E,v+1,0];y.set(A,f*d*b),g.set(u,m*d*b);let L=[b,b,b,b,b,b];p.set(L,x*d*b)}let w=new ue;w.setAttribute(`position`,new Me(y,f)),w.setAttribute(`uv`,new Me(g,m)),w.setAttribute(`faceIndex`,new Me(p,x)),s.push(w),n>xi&&n--}return{_lodPlanes:s,_sizeLods:e,_sigmas:t}}function kh(s){let e=new Ht(3*zt,3*zt,s);return e.texture.mapping=306,e.texture.name=`PMREM.cubeUv`,e.scissorTest=!0,e}function vs(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function Ny(s){let e=new Float32Array(s),t=new _(0,1,0);return new Vn({name:`SphericalGaussianBlur`,defines:{n:s},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:e},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:t},inputEncoding:{value:Ut[vt]},outputEncoding:{value:Ut[vt]}},vertexShader:Il(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			${Dl()}

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

				gl_FragColor = linearToOutputTexel( gl_FragColor );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Vh(){return new Vn({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null},texelSize:{value:new W(1,1)},inputEncoding:{value:Ut[vt]},outputEncoding:{value:Ut[vt]}},vertexShader:Il(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform vec2 texelSize;

			${Dl()}

			#include <common>

			void main() {

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				vec2 f = fract( uv / texelSize - 0.5 );
				uv -= f * texelSize;
				vec3 tl = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;
				uv.x += texelSize.x;
				vec3 tr = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;
				uv.y += texelSize.y;
				vec3 br = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;
				uv.x -= texelSize.x;
				vec3 bl = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;

				vec3 tm = mix( tl, tr, f.x );
				vec3 bm = mix( bl, br, f.x );
				gl_FragColor.rgb = mix( tm, bm, f.y );

				gl_FragColor = linearToOutputTexel( gl_FragColor );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Wh(){return new Vn({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},inputEncoding:{value:Ut[vt]},outputEncoding:{value:Ut[vt]}},vertexShader:Il(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			${Dl()}

			void main() {

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb = envMapTexelToLinear( textureCube( envMap, vec3( - vOutputDirection.x, vOutputDirection.yz ) ) ).rgb;
				gl_FragColor = linearToOutputTexel( gl_FragColor );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Il(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 position;
		attribute vec2 uv;
		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Dl(){return`

		uniform int inputEncoding;
		uniform int outputEncoding;

		#include <encodings_pars_fragment>

		vec4 inputTexelToLinear( vec4 value ) {

			if ( inputEncoding == 0 ) {

				return value;

			} else if ( inputEncoding == 1 ) {

				return sRGBToLinear( value );

			} else if ( inputEncoding == 2 ) {

				return RGBEToLinear( value );

			} else if ( inputEncoding == 3 ) {

				return RGBMToLinear( value, 7.0 );

			} else if ( inputEncoding == 4 ) {

				return RGBMToLinear( value, 16.0 );

			} else if ( inputEncoding == 5 ) {

				return RGBDToLinear( value, 256.0 );

			} else {

				return GammaToLinear( value, 2.2 );

			}

		}

		vec4 linearToOutputTexel( vec4 value ) {

			if ( outputEncoding == 0 ) {

				return value;

			} else if ( outputEncoding == 1 ) {

				return LinearTosRGB( value );

			} else if ( outputEncoding == 2 ) {

				return LinearToRGBE( value );

			} else if ( outputEncoding == 3 ) {

				return LinearToRGBM( value, 7.0 );

			} else if ( outputEncoding == 4 ) {

				return LinearToRGBM( value, 16.0 );

			} else if ( outputEncoding == 5 ) {

				return LinearToRGBD( value, 256.0 );

			} else {

				return LinearToGamma( value, 2.2 );

			}

		}

		vec4 envMapTexelToLinear( vec4 color ) {

			return inputTexelToLinear( color );

		}
	`}var xv=0;var yv=1;var vv=0;var _v=1;var wv=2;function bv(s){return console.warn(`THREE.MeshFaceMaterial has been removed. Use an Array instead.`),s}function Mv(s=[]){return console.warn(`THREE.MultiMaterial has been removed. Use an Array instead.`),s.isMultiMaterial=!0,s.materials=s,s.clone=function(){return s.slice()},s}function Sv(s,e){return console.warn(`THREE.PointCloud has been renamed to THREE.Points.`),new bi(s,e)}function Ev(s){return console.warn(`THREE.Particle has been renamed to THREE.Sprite.`),new pr(s)}function Tv(s,e){return console.warn(`THREE.ParticleSystem has been renamed to THREE.Points.`),new bi(s,e)}function Av(s){return console.warn(`THREE.PointCloudMaterial has been renamed to THREE.PointsMaterial.`),new _n(s)}function Lv(s){return console.warn(`THREE.ParticleBasicMaterial has been renamed to THREE.PointsMaterial.`),new _n(s)}function Rv(s){return console.warn(`THREE.ParticleSystemMaterial has been renamed to THREE.PointsMaterial.`),new _n(s)}function Cv(s,e,t){return console.warn(`THREE.Vertex has been removed. Use THREE.Vector3 instead.`),new _(s,e,t)}function Pv(s,e){return console.warn(`THREE.DynamicBufferAttribute has been removed. Use new THREE.BufferAttribute().setUsage( THREE.DynamicDrawUsage ) instead.`),new Me(s,e).setUsage(ir)}function Iv(s,e){return console.warn(`THREE.Int8Attribute has been removed. Use new THREE.Int8BufferAttribute() instead.`),new La(s,e)}function Dv(s,e){return console.warn(`THREE.Uint8Attribute has been removed. Use new THREE.Uint8BufferAttribute() instead.`),new Ra(s,e)}function Fv(s,e){return console.warn(`THREE.Uint8ClampedAttribute has been removed. Use new THREE.Uint8ClampedBufferAttribute() instead.`),new Ca(s,e)}function Nv(s,e){return console.warn(`THREE.Int16Attribute has been removed. Use new THREE.Int16BufferAttribute() instead.`),new Pa(s,e)}function Bv(s,e){return console.warn(`THREE.Uint16Attribute has been removed. Use new THREE.Uint16BufferAttribute() instead.`),new sr(s,e)}function zv(s,e){return console.warn(`THREE.Int32Attribute has been removed. Use new THREE.Int32BufferAttribute() instead.`),new Ia(s,e)}function Ov(s,e){return console.warn(`THREE.Uint32Attribute has been removed. Use new THREE.Uint32BufferAttribute() instead.`),new or(s,e)}function Uv(s,e){return console.warn(`THREE.Float32Attribute has been removed. Use new THREE.Float32BufferAttribute() instead.`),new oe(s,e)}function Hv(s,e){return console.warn(`THREE.Float64Attribute has been removed. Use new THREE.Float64BufferAttribute() instead.`),new Fa(s,e)}_t.create=function(s,e){return console.log(`THREE.Curve.create() has been deprecated`),s.prototype=Object.create(_t.prototype),s.prototype.constructor=s,s.prototype.getPoint=e,s};Ci.prototype.fromPoints=function(s){return console.warn(`THREE.Path: .fromPoints() has been renamed to .setFromPoints().`),this.setFromPoints(s)};function Gv(s){return console.warn(`THREE.AxisHelper has been renamed to THREE.AxesHelper.`),new Sl(s)}function kv(s,e){return console.warn(`THREE.BoundingBoxHelper has been deprecated. Creating a THREE.BoxHelper instead.`),new Ml(s,e)}function Vv(s,e){return console.warn(`THREE.EdgesHelper has been removed. Use THREE.EdgesGeometry instead.`),new gt(new Hs(s.geometry),new nt({color:e!==void 0?e:16777215}))}bl.prototype.setColors=function(){console.error(`THREE.GridHelper: setColors() has been deprecated, pass them in the constructor instead.`)};wl.prototype.update=function(){console.error(`THREE.SkeletonHelper: update() no longer needs to be called.`)};function Wv(s,e){return console.warn(`THREE.WireframeHelper has been removed. Use THREE.WireframeGeometry instead.`),new gt(new js(s.geometry),new nt({color:e!==void 0?e:16777215}))}lt.prototype.extractUrlBase=function(s){return console.warn(`THREE.Loader: .extractUrlBase() has been deprecated. Use THREE.LoaderUtils.extractUrlBase() instead.`),Mo.extractUrlBase(s)};lt.Handlers={add:function(){console.error(`THREE.Loader: Handlers.add() has been removed. Use LoadingManager.addHandler() instead.`)},get:function(){console.error(`THREE.Loader: Handlers.get() has been removed. Use LoadingManager.getHandler() instead.`)}};function qv(s){return console.warn(`THREE.XHRLoader has been renamed to THREE.FileLoader.`),new Ft(s)}function Xv(s){return console.warn(`THREE.BinaryTextureLoader has been renamed to THREE.DataTextureLoader.`),new ja(s)}qn.prototype.center=function(s){return console.warn(`THREE.Box2: .center() has been renamed to .getCenter().`),this.getCenter(s)};qn.prototype.empty=function(){return console.warn(`THREE.Box2: .empty() has been renamed to .isEmpty().`),this.isEmpty()};qn.prototype.isIntersectionBox=function(s){return console.warn(`THREE.Box2: .isIntersectionBox() has been renamed to .intersectsBox().`),this.intersectsBox(s)};qn.prototype.size=function(s){return console.warn(`THREE.Box2: .size() has been renamed to .getSize().`),this.getSize(s)};pt.prototype.center=function(s){return console.warn(`THREE.Box3: .center() has been renamed to .getCenter().`),this.getCenter(s)};pt.prototype.empty=function(){return console.warn(`THREE.Box3: .empty() has been renamed to .isEmpty().`),this.isEmpty()};pt.prototype.isIntersectionBox=function(s){return console.warn(`THREE.Box3: .isIntersectionBox() has been renamed to .intersectsBox().`),this.intersectsBox(s)};pt.prototype.isIntersectionSphere=function(s){return console.warn(`THREE.Box3: .isIntersectionSphere() has been renamed to .intersectsSphere().`),this.intersectsSphere(s)};pt.prototype.size=function(s){return console.warn(`THREE.Box3: .size() has been renamed to .getSize().`),this.getSize(s)};tn.prototype.empty=function(){return console.warn(`THREE.Sphere: .empty() has been renamed to .isEmpty().`),this.isEmpty()};wi.prototype.setFromMatrix=function(s){return console.warn(`THREE.Frustum: .setFromMatrix() has been renamed to .setFromProjectionMatrix().`),this.setFromProjectionMatrix(s)};vl.prototype.center=function(s){return console.warn(`THREE.Line3: .center() has been renamed to .getCenter().`),this.getCenter(s)};je.prototype.flattenToArrayOffset=function(s,e){return console.warn(`THREE.Matrix3: .flattenToArrayOffset() has been deprecated. Use .toArray() instead.`),this.toArray(s,e)};je.prototype.multiplyVector3=function(s){return console.warn(`THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead.`),s.applyMatrix3(this)};je.prototype.multiplyVector3Array=function(){console.error(`THREE.Matrix3: .multiplyVector3Array() has been removed.`)};je.prototype.applyToBufferAttribute=function(s){return console.warn(`THREE.Matrix3: .applyToBufferAttribute() has been removed. Use attribute.applyMatrix3( matrix ) instead.`),s.applyMatrix3(this)};je.prototype.applyToVector3Array=function(){console.error(`THREE.Matrix3: .applyToVector3Array() has been removed.`)};je.prototype.getInverse=function(s){return console.warn(`THREE.Matrix3: .getInverse() has been removed. Use matrixInv.copy( matrix ).invert(); instead.`),this.copy(s).invert()};le.prototype.extractPosition=function(s){return console.warn(`THREE.Matrix4: .extractPosition() has been renamed to .copyPosition().`),this.copyPosition(s)};le.prototype.flattenToArrayOffset=function(s,e){return console.warn(`THREE.Matrix4: .flattenToArrayOffset() has been deprecated. Use .toArray() instead.`),this.toArray(s,e)};le.prototype.getPosition=function(){return console.warn(`THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead.`),new _().setFromMatrixColumn(this,3)};le.prototype.setRotationFromQuaternion=function(s){return console.warn(`THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion().`),this.makeRotationFromQuaternion(s)};le.prototype.multiplyToArray=function(){console.warn(`THREE.Matrix4: .multiplyToArray() has been removed.`)};le.prototype.multiplyVector3=function(s){return console.warn(`THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) instead.`),s.applyMatrix4(this)};le.prototype.multiplyVector4=function(s){return console.warn(`THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead.`),s.applyMatrix4(this)};le.prototype.multiplyVector3Array=function(){console.error(`THREE.Matrix4: .multiplyVector3Array() has been removed.`)};le.prototype.rotateAxis=function(s){console.warn(`THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead.`),s.transformDirection(this)};le.prototype.crossVector=function(s){return console.warn(`THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead.`),s.applyMatrix4(this)};le.prototype.translate=function(){console.error(`THREE.Matrix4: .translate() has been removed.`)};le.prototype.rotateX=function(){console.error(`THREE.Matrix4: .rotateX() has been removed.`)};le.prototype.rotateY=function(){console.error(`THREE.Matrix4: .rotateY() has been removed.`)};le.prototype.rotateZ=function(){console.error(`THREE.Matrix4: .rotateZ() has been removed.`)};le.prototype.rotateByAxis=function(){console.error(`THREE.Matrix4: .rotateByAxis() has been removed.`)};le.prototype.applyToBufferAttribute=function(s){return console.warn(`THREE.Matrix4: .applyToBufferAttribute() has been removed. Use attribute.applyMatrix4( matrix ) instead.`),s.applyMatrix4(this)};le.prototype.applyToVector3Array=function(){console.error(`THREE.Matrix4: .applyToVector3Array() has been removed.`)};le.prototype.makeFrustum=function(s,e,t,n,i,r){return console.warn(`THREE.Matrix4: .makeFrustum() has been removed. Use .makePerspective( left, right, top, bottom, near, far ) instead.`),this.makePerspective(s,e,n,t,i,r)};le.prototype.getInverse=function(s){return console.warn(`THREE.Matrix4: .getInverse() has been removed. Use matrixInv.copy( matrix ).invert(); instead.`),this.copy(s).invert()};Et.prototype.isIntersectionLine=function(s){return console.warn(`THREE.Plane: .isIntersectionLine() has been renamed to .intersectsLine().`),this.intersectsLine(s)};et.prototype.multiplyVector3=function(s){return console.warn(`THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead.`),s.applyQuaternion(this)};et.prototype.inverse=function(){return console.warn(`THREE.Quaternion: .inverse() has been renamed to invert().`),this.invert()};nn.prototype.isIntersectionBox=function(s){return console.warn(`THREE.Ray: .isIntersectionBox() has been renamed to .intersectsBox().`),this.intersectsBox(s)};nn.prototype.isIntersectionPlane=function(s){return console.warn(`THREE.Ray: .isIntersectionPlane() has been renamed to .intersectsPlane().`),this.intersectsPlane(s)};nn.prototype.isIntersectionSphere=function(s){return console.warn(`THREE.Ray: .isIntersectionSphere() has been renamed to .intersectsSphere().`),this.intersectsSphere(s)};ht.prototype.area=function(){return console.warn(`THREE.Triangle: .area() has been renamed to .getArea().`),this.getArea()};ht.prototype.barycoordFromPoint=function(s,e){return console.warn(`THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord().`),this.getBarycoord(s,e)};ht.prototype.midpoint=function(s){return console.warn(`THREE.Triangle: .midpoint() has been renamed to .getMidpoint().`),this.getMidpoint(s)};ht.prototypenormal=function(s){return console.warn(`THREE.Triangle: .normal() has been renamed to .getNormal().`),this.getNormal(s)};ht.prototype.plane=function(s){return console.warn(`THREE.Triangle: .plane() has been renamed to .getPlane().`),this.getPlane(s)};ht.barycoordFromPoint=function(s,e,t,n,i){return console.warn(`THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord().`),ht.getBarycoord(s,e,t,n,i)};ht.normal=function(s,e,t,n){return console.warn(`THREE.Triangle: .normal() has been renamed to .getNormal().`),ht.getNormal(s,e,t,n)};Kt.prototype.extractAllPoints=function(s){return console.warn(`THREE.Shape: .extractAllPoints() has been removed. Use .extractPoints() instead.`),this.extractPoints(s)};Kt.prototype.extrude=function(s){return console.warn(`THREE.Shape: .extrude() has been removed. Use ExtrudeGeometry() instead.`),new rn(this,s)};Kt.prototype.makeGeometry=function(s){return console.warn(`THREE.Shape: .makeGeometry() has been removed. Use ShapeGeometry() instead.`),new wr(this,s)};W.prototype.fromAttribute=function(s,e,t){return console.warn(`THREE.Vector2: .fromAttribute() has been renamed to .fromBufferAttribute().`),this.fromBufferAttribute(s,e,t)};W.prototype.distanceToManhattan=function(s){return console.warn(`THREE.Vector2: .distanceToManhattan() has been renamed to .manhattanDistanceTo().`),this.manhattanDistanceTo(s)};W.prototype.lengthManhattan=function(){return console.warn(`THREE.Vector2: .lengthManhattan() has been renamed to .manhattanLength().`),this.manhattanLength()};_.prototype.setEulerFromRotationMatrix=function(){console.error(`THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.`)};_.prototype.setEulerFromQuaternion=function(){console.error(`THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.`)};_.prototype.getPositionFromMatrix=function(s){return console.warn(`THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition().`),this.setFromMatrixPosition(s)};_.prototype.getScaleFromMatrix=function(s){return console.warn(`THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale().`),this.setFromMatrixScale(s)};_.prototype.getColumnFromMatrix=function(s,e){return console.warn(`THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn().`),this.setFromMatrixColumn(e,s)};_.prototype.applyProjection=function(s){return console.warn(`THREE.Vector3: .applyProjection() has been removed. Use .applyMatrix4( m ) instead.`),this.applyMatrix4(s)};_.prototype.fromAttribute=function(s,e,t){return console.warn(`THREE.Vector3: .fromAttribute() has been renamed to .fromBufferAttribute().`),this.fromBufferAttribute(s,e,t)};_.prototype.distanceToManhattan=function(s){return console.warn(`THREE.Vector3: .distanceToManhattan() has been renamed to .manhattanDistanceTo().`),this.manhattanDistanceTo(s)};_.prototype.lengthManhattan=function(){return console.warn(`THREE.Vector3: .lengthManhattan() has been renamed to .manhattanLength().`),this.manhattanLength()};De.prototype.fromAttribute=function(s,e,t){return console.warn(`THREE.Vector4: .fromAttribute() has been renamed to .fromBufferAttribute().`),this.fromBufferAttribute(s,e,t)};De.prototype.lengthManhattan=function(){return console.warn(`THREE.Vector4: .lengthManhattan() has been renamed to .manhattanLength().`),this.manhattanLength()};Ae.prototype.getChildByName=function(s){return console.warn(`THREE.Object3D: .getChildByName() has been renamed to .getObjectByName().`),this.getObjectByName(s)};Ae.prototype.renderDepth=function(){console.warn(`THREE.Object3D: .renderDepth has been removed. Use .renderOrder, instead.`)};Ae.prototype.translate=function(s,e){return console.warn(`THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead.`),this.translateOnAxis(e,s)};Ae.prototype.getWorldRotation=function(){console.error(`THREE.Object3D: .getWorldRotation() has been removed. Use THREE.Object3D.getWorldQuaternion( target ) instead.`)};Ae.prototype.applyMatrix=function(s){return console.warn(`THREE.Object3D: .applyMatrix() has been renamed to .applyMatrix4().`),this.applyMatrix4(s)};Object.defineProperties(Ae.prototype,{eulerOrder:{get:function(){return console.warn(`THREE.Object3D: .eulerOrder is now .rotation.order.`),this.rotation.order},set:function(s){console.warn(`THREE.Object3D: .eulerOrder is now .rotation.order.`),this.rotation.order=s}},useQuaternion:{get:function(){console.warn(`THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.`)},set:function(){console.warn(`THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.`)}}});Ye.prototype.setDrawMode=function(){console.error(`THREE.Mesh: .setDrawMode() has been removed. The renderer now always assumes THREE.TrianglesDrawMode. Transform your geometry via BufferGeometryUtils.toTrianglesDrawMode() if necessary.`)};Object.defineProperties(Ye.prototype,{drawMode:{get:function(){return console.error(`THREE.Mesh: .drawMode has been removed. The renderer now always assumes THREE.TrianglesDrawMode.`),0},set:function(){console.error(`THREE.Mesh: .drawMode has been removed. The renderer now always assumes THREE.TrianglesDrawMode. Transform your geometry via BufferGeometryUtils.toTrianglesDrawMode() if necessary.`)}}});mr.prototype.initBones=function(){console.error(`THREE.SkinnedMesh: initBones() has been removed.`)};Ke.prototype.setLens=function(s,e){console.warn(`THREE.PerspectiveCamera.setLens is deprecated. Use .setFocalLength and .filmGauge for a photographic setup.`),e!==void 0&&(this.filmGauge=e),this.setFocalLength(s)};Object.defineProperties(Lt.prototype,{onlyShadow:{set:function(){console.warn(`THREE.Light: .onlyShadow has been removed.`)}},shadowCameraFov:{set:function(s){console.warn(`THREE.Light: .shadowCameraFov is now .shadow.camera.fov.`),this.shadow.camera.fov=s}},shadowCameraLeft:{set:function(s){console.warn(`THREE.Light: .shadowCameraLeft is now .shadow.camera.left.`),this.shadow.camera.left=s}},shadowCameraRight:{set:function(s){console.warn(`THREE.Light: .shadowCameraRight is now .shadow.camera.right.`),this.shadow.camera.right=s}},shadowCameraTop:{set:function(s){console.warn(`THREE.Light: .shadowCameraTop is now .shadow.camera.top.`),this.shadow.camera.top=s}},shadowCameraBottom:{set:function(s){console.warn(`THREE.Light: .shadowCameraBottom is now .shadow.camera.bottom.`),this.shadow.camera.bottom=s}},shadowCameraNear:{set:function(s){console.warn(`THREE.Light: .shadowCameraNear is now .shadow.camera.near.`),this.shadow.camera.near=s}},shadowCameraFar:{set:function(s){console.warn(`THREE.Light: .shadowCameraFar is now .shadow.camera.far.`),this.shadow.camera.far=s}},shadowCameraVisible:{set:function(){console.warn(`THREE.Light: .shadowCameraVisible has been removed. Use new THREE.CameraHelper( light.shadow.camera ) instead.`)}},shadowBias:{set:function(s){console.warn(`THREE.Light: .shadowBias is now .shadow.bias.`),this.shadow.bias=s}},shadowDarkness:{set:function(){console.warn(`THREE.Light: .shadowDarkness has been removed.`)}},shadowMapWidth:{set:function(s){console.warn(`THREE.Light: .shadowMapWidth is now .shadow.mapSize.width.`),this.shadow.mapSize.width=s}},shadowMapHeight:{set:function(s){console.warn(`THREE.Light: .shadowMapHeight is now .shadow.mapSize.height.`),this.shadow.mapSize.height=s}}});Object.defineProperties(Me.prototype,{length:{get:function(){return console.warn(`THREE.BufferAttribute: .length has been deprecated. Use .count instead.`),this.array.length}},dynamic:{get:function(){return console.warn(`THREE.BufferAttribute: .dynamic has been deprecated. Use .usage instead.`),this.usage===ir},set:function(){console.warn(`THREE.BufferAttribute: .dynamic has been deprecated. Use .usage instead.`),this.setUsage(ir)}}});Me.prototype.setDynamic=function(s){return console.warn(`THREE.BufferAttribute: .setDynamic() has been deprecated. Use .setUsage() instead.`),this.setUsage(s===!0?ir:nr),this};Me.prototype.copyIndicesArray=function(){console.error(`THREE.BufferAttribute: .copyIndicesArray() has been removed.`)},Me.prototype.setArray=function(){console.error(`THREE.BufferAttribute: .setArray has been removed. Use BufferGeometry .setAttribute to replace/resize attribute buffers`)};ue.prototype.addIndex=function(s){console.warn(`THREE.BufferGeometry: .addIndex() has been renamed to .setIndex().`),this.setIndex(s)};ue.prototype.addAttribute=function(s,e){return console.warn(`THREE.BufferGeometry: .addAttribute() has been renamed to .setAttribute().`),!(e&&e.isBufferAttribute)&&!(e&&e.isInterleavedBufferAttribute)?(console.warn(`THREE.BufferGeometry: .addAttribute() now expects ( name, attribute ).`),this.setAttribute(s,new Me(arguments[1],arguments[2]))):s===`index`?(console.warn(`THREE.BufferGeometry.addAttribute: Use .setIndex() for index attribute.`),this.setIndex(e),this):this.setAttribute(s,e)};ue.prototype.addDrawCall=function(s,e,t){t!==void 0&&console.warn(`THREE.BufferGeometry: .addDrawCall() no longer supports indexOffset.`),console.warn(`THREE.BufferGeometry: .addDrawCall() is now .addGroup().`),this.addGroup(s,e)};ue.prototype.clearDrawCalls=function(){console.warn(`THREE.BufferGeometry: .clearDrawCalls() is now .clearGroups().`),this.clearGroups()};ue.prototype.computeOffsets=function(){console.warn(`THREE.BufferGeometry: .computeOffsets() has been removed.`)};ue.prototype.removeAttribute=function(s){return console.warn(`THREE.BufferGeometry: .removeAttribute() has been renamed to .deleteAttribute().`),this.deleteAttribute(s)};ue.prototype.applyMatrix=function(s){return console.warn(`THREE.BufferGeometry: .applyMatrix() has been renamed to .applyMatrix4().`),this.applyMatrix4(s)};Object.defineProperties(ue.prototype,{drawcalls:{get:function(){return console.error(`THREE.BufferGeometry: .drawcalls has been renamed to .groups.`),this.groups}},offsets:{get:function(){return console.warn(`THREE.BufferGeometry: .offsets has been renamed to .groups.`),this.groups}}});vn.prototype.setDynamic=function(s){return console.warn(`THREE.InterleavedBuffer: .setDynamic() has been deprecated. Use .setUsage() instead.`),this.setUsage(s===!0?ir:nr),this};vn.prototype.setArray=function(){console.error(`THREE.InterleavedBuffer: .setArray has been removed. Use BufferGeometry .setAttribute to replace/resize attribute buffers`)};rn.prototype.getArrays=function(){console.error(`THREE.ExtrudeGeometry: .getArrays() has been removed.`)};rn.prototype.addShapeList=function(){console.error(`THREE.ExtrudeGeometry: .addShapeList() has been removed.`)};rn.prototype.addShape=function(){console.error(`THREE.ExtrudeGeometry: .addShape() has been removed.`)};dr.prototype.dispose=function(){console.error(`THREE.Scene: .dispose() has been removed.`)};ml.prototype.onUpdate=function(){return console.warn(`THREE.Uniform: .onUpdate() has been removed. Use object.onBeforeRender() instead.`),this};Object.defineProperties(tt.prototype,{wrapAround:{get:function(){console.warn(`THREE.Material: .wrapAround has been removed.`)},set:function(){console.warn(`THREE.Material: .wrapAround has been removed.`)}},overdraw:{get:function(){console.warn(`THREE.Material: .overdraw has been removed.`)},set:function(){console.warn(`THREE.Material: .overdraw has been removed.`)}},wrapRGB:{get:function(){return console.warn(`THREE.Material: .wrapRGB has been removed.`),new se}},shading:{get:function(){console.error(`THREE.`+this.type+`: .shading has been removed. Use the boolean .flatShading instead.`)},set:function(s){console.warn(`THREE.`+this.type+`: .shading has been removed. Use the boolean .flatShading instead.`),this.flatShading=s===1}},stencilMask:{get:function(){return console.warn(`THREE.`+this.type+`: .stencilMask has been removed. Use .stencilFuncMask instead.`),this.stencilFuncMask},set:function(s){console.warn(`THREE.`+this.type+`: .stencilMask has been removed. Use .stencilFuncMask instead.`),this.stencilFuncMask=s}}});Object.defineProperties(kt.prototype,{derivatives:{get:function(){return console.warn(`THREE.ShaderMaterial: .derivatives has been moved to .extensions.derivatives.`),this.extensions.derivatives},set:function(s){console.warn(`THREE. ShaderMaterial: .derivatives has been moved to .extensions.derivatives.`),this.extensions.derivatives=s}}});Oe.prototype.clearTarget=function(s,e,t,n){console.warn(`THREE.WebGLRenderer: .clearTarget() has been deprecated. Use .setRenderTarget() and .clear() instead.`),this.setRenderTarget(s),this.clear(e,t,n)};Oe.prototype.animate=function(s){console.warn(`THREE.WebGLRenderer: .animate() is now .setAnimationLoop().`),this.setAnimationLoop(s)};Oe.prototype.getCurrentRenderTarget=function(){return console.warn(`THREE.WebGLRenderer: .getCurrentRenderTarget() is now .getRenderTarget().`),this.getRenderTarget()};Oe.prototype.getMaxAnisotropy=function(){return console.warn(`THREE.WebGLRenderer: .getMaxAnisotropy() is now .capabilities.getMaxAnisotropy().`),this.capabilities.getMaxAnisotropy()};Oe.prototype.getPrecision=function(){return console.warn(`THREE.WebGLRenderer: .getPrecision() is now .capabilities.precision.`),this.capabilities.precision};Oe.prototype.resetGLState=function(){return console.warn(`THREE.WebGLRenderer: .resetGLState() is now .state.reset().`),this.state.reset()};Oe.prototype.supportsFloatTextures=function(){return console.warn(`THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( 'OES_texture_float' ).`),this.extensions.get(`OES_texture_float`)};Oe.prototype.supportsHalfFloatTextures=function(){return console.warn(`THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( 'OES_texture_half_float' ).`),this.extensions.get(`OES_texture_half_float`)};Oe.prototype.supportsStandardDerivatives=function(){return console.warn(`THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( 'OES_standard_derivatives' ).`),this.extensions.get(`OES_standard_derivatives`)};Oe.prototype.supportsCompressedTextureS3TC=function(){return console.warn(`THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( 'WEBGL_compressed_texture_s3tc' ).`),this.extensions.get(`WEBGL_compressed_texture_s3tc`)};Oe.prototype.supportsCompressedTexturePVRTC=function(){return console.warn(`THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( 'WEBGL_compressed_texture_pvrtc' ).`),this.extensions.get(`WEBGL_compressed_texture_pvrtc`)};Oe.prototype.supportsBlendMinMax=function(){return console.warn(`THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( 'EXT_blend_minmax' ).`),this.extensions.get(`EXT_blend_minmax`)};Oe.prototype.supportsVertexTextures=function(){return console.warn(`THREE.WebGLRenderer: .supportsVertexTextures() is now .capabilities.vertexTextures.`),this.capabilities.vertexTextures};Oe.prototype.supportsInstancedArrays=function(){return console.warn(`THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( 'ANGLE_instanced_arrays' ).`),this.extensions.get(`ANGLE_instanced_arrays`)};Oe.prototype.enableScissorTest=function(s){console.warn(`THREE.WebGLRenderer: .enableScissorTest() is now .setScissorTest().`),this.setScissorTest(s)};Oe.prototype.initMaterial=function(){console.warn(`THREE.WebGLRenderer: .initMaterial() has been removed.`)};Oe.prototype.addPrePlugin=function(){console.warn(`THREE.WebGLRenderer: .addPrePlugin() has been removed.`)};Oe.prototype.addPostPlugin=function(){console.warn(`THREE.WebGLRenderer: .addPostPlugin() has been removed.`)};Oe.prototype.updateShadowMap=function(){console.warn(`THREE.WebGLRenderer: .updateShadowMap() has been removed.`)};Oe.prototype.setFaceCulling=function(){console.warn(`THREE.WebGLRenderer: .setFaceCulling() has been removed.`)};Oe.prototype.allocTextureUnit=function(){console.warn(`THREE.WebGLRenderer: .allocTextureUnit() has been removed.`)};Oe.prototype.setTexture=function(){console.warn(`THREE.WebGLRenderer: .setTexture() has been removed.`)};Oe.prototype.setTexture2D=function(){console.warn(`THREE.WebGLRenderer: .setTexture2D() has been removed.`)};Oe.prototype.setTextureCube=function(){console.warn(`THREE.WebGLRenderer: .setTextureCube() has been removed.`)};Oe.prototype.getActiveMipMapLevel=function(){return console.warn(`THREE.WebGLRenderer: .getActiveMipMapLevel() is now .getActiveMipmapLevel().`),this.getActiveMipmapLevel()};Object.defineProperties(Oe.prototype,{shadowMapEnabled:{get:function(){return this.shadowMap.enabled},set:function(s){console.warn(`THREE.WebGLRenderer: .shadowMapEnabled is now .shadowMap.enabled.`),this.shadowMap.enabled=s}},shadowMapType:{get:function(){return this.shadowMap.type},set:function(s){console.warn(`THREE.WebGLRenderer: .shadowMapType is now .shadowMap.type.`),this.shadowMap.type=s}},shadowMapCullFace:{get:function(){console.warn(`THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead.`)},set:function(){console.warn(`THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead.`)}},context:{get:function(){return console.warn(`THREE.WebGLRenderer: .context has been removed. Use .getContext() instead.`),this.getContext()}},vr:{get:function(){return console.warn(`THREE.WebGLRenderer: .vr has been renamed to .xr`),this.xr}},gammaInput:{get:function(){return console.warn(`THREE.WebGLRenderer: .gammaInput has been removed. Set the encoding for textures via Texture.encoding instead.`),!1},set:function(){console.warn(`THREE.WebGLRenderer: .gammaInput has been removed. Set the encoding for textures via Texture.encoding instead.`)}},gammaOutput:{get:function(){return console.warn(`THREE.WebGLRenderer: .gammaOutput has been removed. Set WebGLRenderer.outputEncoding instead.`),!1},set:function(s){console.warn(`THREE.WebGLRenderer: .gammaOutput has been removed. Set WebGLRenderer.outputEncoding instead.`),this.outputEncoding=s===!0?Do:vt}},toneMappingWhitePoint:{get:function(){return console.warn(`THREE.WebGLRenderer: .toneMappingWhitePoint has been removed.`),1},set:function(){console.warn(`THREE.WebGLRenderer: .toneMappingWhitePoint has been removed.`)}}});Object.defineProperties(uu.prototype,{cullFace:{get:function(){console.warn(`THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead.`)},set:function(){console.warn(`THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead.`)}},renderReverseSided:{get:function(){console.warn(`THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead.`)},set:function(){console.warn(`THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead.`)}},renderSingleSided:{get:function(){console.warn(`THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead.`)},set:function(){console.warn(`THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead.`)}}});function Yv(s,e,t){return console.warn(`THREE.WebGLRenderTargetCube( width, height, options ) is now WebGLCubeRenderTarget( size, options ).`),new lr(s,t)}Object.defineProperties(Ht.prototype,{wrapS:{get:function(){return console.warn(`THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS.`),this.texture.wrapS},set:function(s){console.warn(`THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS.`),this.texture.wrapS=s}},wrapT:{get:function(){return console.warn(`THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT.`),this.texture.wrapT},set:function(s){console.warn(`THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT.`),this.texture.wrapT=s}},magFilter:{get:function(){return console.warn(`THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter.`),this.texture.magFilter},set:function(s){console.warn(`THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter.`),this.texture.magFilter=s}},minFilter:{get:function(){return console.warn(`THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter.`),this.texture.minFilter},set:function(s){console.warn(`THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter.`),this.texture.minFilter=s}},anisotropy:{get:function(){return console.warn(`THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy.`),this.texture.anisotropy},set:function(s){console.warn(`THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy.`),this.texture.anisotropy=s}},offset:{get:function(){return console.warn(`THREE.WebGLRenderTarget: .offset is now .texture.offset.`),this.texture.offset},set:function(s){console.warn(`THREE.WebGLRenderTarget: .offset is now .texture.offset.`),this.texture.offset=s}},repeat:{get:function(){return console.warn(`THREE.WebGLRenderTarget: .repeat is now .texture.repeat.`),this.texture.repeat},set:function(s){console.warn(`THREE.WebGLRenderTarget: .repeat is now .texture.repeat.`),this.texture.repeat=s}},format:{get:function(){return console.warn(`THREE.WebGLRenderTarget: .format is now .texture.format.`),this.texture.format},set:function(s){console.warn(`THREE.WebGLRenderTarget: .format is now .texture.format.`),this.texture.format=s}},type:{get:function(){return console.warn(`THREE.WebGLRenderTarget: .type is now .texture.type.`),this.texture.type},set:function(s){console.warn(`THREE.WebGLRenderTarget: .type is now .texture.type.`),this.texture.type=s}},generateMipmaps:{get:function(){return console.warn(`THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps.`),this.texture.generateMipmaps},set:function(s){console.warn(`THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps.`),this.texture.generateMipmaps=s}}});Ao.prototype.load=function(s){console.warn(`THREE.Audio: .load has been deprecated. Use THREE.AudioLoader instead.`);let e=this;return new sl().load(s,function(n){e.setBuffer(n)}),this};cl.prototype.getData=function(){return console.warn(`THREE.AudioAnalyser: .getData() is now .getFrequencyData().`),this.getFrequencyData()};ar.prototype.updateCubeMap=function(s,e){return console.warn(`THREE.CubeCamera: .updateCubeMap() is now .update().`),this.update(s,e)};ar.prototype.clear=function(s,e,t,n){return console.warn(`THREE.CubeCamera: .clear() is now .renderTarget.clear().`),this.renderTarget.clear(s,e,t,n)};yn.crossOrigin=void 0;yn.loadTexture=function(s,e,t,n){console.warn(`THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader() instead.`);let i=new $a;i.setCrossOrigin(this.crossOrigin);let r=i.load(s,t,void 0,n);return e&&(r.mapping=e),r};yn.loadTextureCube=function(s,e,t,n){console.warn(`THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead.`);let i=new Ja;i.setCrossOrigin(this.crossOrigin);let r=i.load(s,t,void 0,n);return e&&(r.mapping=e),r};yn.loadCompressedTexture=function(){console.error(`THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.`)};yn.loadCompressedTextureCube=function(){console.error(`THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.`)};function Zv(){console.error(`THREE.CanvasRenderer has been removed`)}function Jv(){console.error(`THREE.JSONLoader has been removed.`)}var jv={createMultiMaterialObject:function(){console.error(`THREE.SceneUtils has been moved to /examples/jsm/utils/SceneUtils.js`)},detach:function(){console.error(`THREE.SceneUtils has been moved to /examples/jsm/utils/SceneUtils.js`)},attach:function(){console.error(`THREE.SceneUtils has been moved to /examples/jsm/utils/SceneUtils.js`)}};function $v(){console.error(`THREE.LensFlare has been moved to /examples/jsm/objects/Lensflare.js`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`128`}}));typeof window<`u`&&(window.__THREE__?console.warn(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`128`);export{Qu as ACESFilmicToneMapping,ui as AddEquation,Zu as AddOperation,jh as AdditiveAnimationBlendMode,kl as AdditiveBlending,od as AlphaFormat,Gu as AlwaysDepth,ef as AlwaysStencilFunc,_o as AmbientLight,al as AmbientLightProbe,Ti as AnimationClip,jc as AnimationLoader,pl as AnimationMixer,dl as AnimationObjectGroup,Ge as AnimationUtils,lo as ArcCurve,Ps as ArrayCamera,Nh as ArrowHelper,Ao as Audio,cl as AudioAnalyser,gu as AudioContext,dh as AudioListener,sl as AudioLoader,Sl as AxesHelper,Gv as AxisHelper,Qe as BackSide,$d as BasicDepthPacking,Hy as BasicShadowMap,Xv as BinaryTextureLoader,gr as Bone,Mn as BooleanKeyframeTrack,kv as BoundingBoxHelper,qn as Box2,pt as Box3,Ih as Box3Helper,Un as BoxBufferGeometry,Un as BoxGeometry,Ml as BoxHelper,Me as BufferAttribute,ue as BufferGeometry,nl as BufferGeometryLoader,ed as ByteType,Ai as Cache,_i as Camera,Ph as CameraHelper,Zv as CanvasRenderer,ka as CanvasTexture,co as CatmullRomCurve3,$u as CineonToneMapping,zs as CircleBufferGeometry,zs as CircleGeometry,yt as ClampToEdgeWrapping,ll as Clock,se as Color,oo as ColorKeyframeTrack,Bs as CompressedTexture,$c as CompressedTextureLoader,Os as ConeBufferGeometry,Os as ConeGeometry,ar as CubeCamera,Co as CubeReflectionMapping,Po as CubeRefractionMapping,Hn as CubeTexture,Ja as CubeTextureLoader,Cr as CubeUVReflectionMapping,Io as CubeUVRefractionMapping,Er as CubicBezierCurve,ho as CubicBezierCurve3,Xa as CubicInterpolant,Gl as CullFaceBack,Tu as CullFaceFront,Uy as CullFaceFrontBack,Eu as CullFaceNone,_t as Curve,el as CurvePath,Lu as CustomBlending,Ku as CustomToneMapping,Mi as CylinderBufferGeometry,Mi as CylinderGeometry,yh as Cylindrical,Gn as DataTexture,Rs as DataTexture2DArray,Cs as DataTexture3D,ja as DataTextureLoader,Bh as DataUtils,$y as DecrementStencilOp,Ky as DecrementWrapStencilOp,cy as DefaultLoadingManager,gi as DepthFormat,tr as DepthStencilFormat,Va as DepthTexture,vo as DirectionalLight,Ch as DirectionalLightHelper,Ya as DiscreteInterpolant,Us as DodecahedronBufferGeometry,Us as DodecahedronGeometry,Lo as DoubleSide,Nu as DstAlphaFactor,zu as DstColorFactor,Pv as DynamicBufferAttribute,fv as DynamicCopyUsage,ir as DynamicDrawUsage,hv as DynamicReadUsage,Hs as EdgesGeometry,Vv as EdgesHelper,Li as EllipseCurve,Vu as EqualDepth,iv as EqualStencilFunc,ba as EquirectangularReflectionMapping,Ma as EquirectangularRefractionMapping,yi as Euler,en as EventDispatcher,rn as ExtrudeBufferGeometry,rn as ExtrudeGeometry,_v as FaceColors,Ft as FileLoader,Xh as FlatShading,Da as Float16BufferAttribute,Uv as Float32Attribute,oe as Float32BufferAttribute,Hv as Float64Attribute,Fa as Float64BufferAttribute,fn as FloatType,Ds as Fog,Is as FogExp2,To as Font,oh as FontLoader,Rr as FrontSide,wi as Frustum,xl as GLBufferAttribute,mv as GLSL1,ic as GLSL3,Tl as GammaEncoding,qu as GreaterDepth,Wu as GreaterEqualDepth,av as GreaterEqualStencilFunc,sv as GreaterStencilFunc,bl as GridHelper,pn as Group,Ss as HalfFloatType,fo as HemisphereLight,Th as HemisphereLightHelper,ol as HemisphereLightProbe,Gs as IcosahedronBufferGeometry,Gs as IcosahedronGeometry,il as ImageBitmapLoader,Sr as ImageLoader,yn as ImageUtils,_l as ImmediateRenderObject,jy as IncrementStencilOp,Qy as IncrementWrapStencilOp,Eo as InstancedBufferAttribute,So as InstancedBufferGeometry,gl as InstancedInterleavedBuffer,Fs as InstancedMesh,Nv as Int16Attribute,Pa as Int16BufferAttribute,zv as Int32Attribute,Ia as Int32BufferAttribute,Iv as Int8Attribute,La as Int8BufferAttribute,nd as IntType,vn as InterleavedBuffer,kn as InterleavedBufferAttribute,Wt as Interpolant,Es as InterpolateDiscrete,Ts as InterpolateLinear,zo as InterpolateSmooth,ev as InvertStencilOp,Jv as JSONLoader,Oo as KeepStencilOp,At as KeyframeTrack,Oa as LOD,ks as LatheBufferGeometry,ks as LatheGeometry,Ls as Layers,$v as LensFlare,ku as LessDepth,_a as LessEqualDepth,rv as LessEqualStencilFunc,nv as LessStencilFunc,Lt as Light,Ii as LightProbe,Vt as Line,vl as Line3,nt as LineBasicMaterial,Ri as LineCurve,Qa as LineCurve3,ro as LineDashedMaterial,Ns as LineLoop,yv as LinePieces,gt as LineSegments,xv as LineStrip,vt as LinearEncoding,st as LinearFilter,so as LinearInterpolant,qy as LinearMipMapLinearFilter,Wy as LinearMipMapNearestFilter,Pr as LinearMipmapLinearFilter,Jh as LinearMipmapNearestFilter,Ju as LinearToneMapping,lt as Loader,Mo as LoaderUtils,ao as LoadingManager,jd as LogLuvEncoding,Xd as LoopOnce,Zd as LoopPingPong,Yd as LoopRepeat,ld as LuminanceAlphaFormat,ad as LuminanceFormat,zy as MOUSE,tt as Material,tl as MaterialLoader,gv as Math,gv as MathUtils,je as Matrix3,le as Matrix4,Xl as MaxEquation,Ye as Mesh,Gt as MeshBasicMaterial,hr as MeshDepthMaterial,ur as MeshDistanceMaterial,bv as MeshFaceMaterial,no as MeshLambertMaterial,io as MeshMatcapMaterial,to as MeshNormalMaterial,Ks as MeshPhongMaterial,Qs as MeshPhysicalMaterial,Mr as MeshStandardMaterial,eo as MeshToonMaterial,ql as MinEquation,bs as MirroredRepeatWrapping,Yu as MixOperation,Mv as MultiMaterial,Wl as MultiplyBlending,Ro as MultiplyOperation,rt as NearestFilter,Vy as NearestMipMapLinearFilter,ky as NearestMipMapNearestFilter,Ea as NearestMipmapLinearFilter,Sa as NearestMipmapNearestFilter,Hu as NeverDepth,tv as NeverStencilFunc,mn as NoBlending,vv as NoColors,mi as NoToneMapping,El as NormalAnimationBlendMode,Ji as NormalBlending,Xu as NotEqualDepth,ov as NotEqualStencilFunc,Si as NumberKeyframeTrack,Ae as Object3D,ih as ObjectLoader,Kd as ObjectSpaceNormalMap,_r as OctahedronBufferGeometry,_r as OctahedronGeometry,Iu as OneFactor,Bu as OneMinusDstAlphaFactor,Ou as OneMinusDstColorFactor,Zh as OneMinusSrcAlphaFactor,Fu as OneMinusSrcColorFactor,Pi as OrthographicCamera,qh as PCFShadowMap,Au as PCFSoftShadowMap,Gh as PMREMGenerator,Vs as ParametricBufferGeometry,Vs as ParametricGeometry,Ev as Particle,Lv as ParticleBasicMaterial,Tv as ParticleSystem,Rv as ParticleSystemMaterial,Ci as Path,Ke as PerspectiveCamera,Et as Plane,cr as PlaneBufferGeometry,cr as PlaneGeometry,Dh as PlaneHelper,Sv as PointCloud,Av as PointCloudMaterial,xo as PointLight,Mh as PointLightHelper,bi as Points,_n as PointsMaterial,Ah as PolarGridHelper,wn as PolyhedronBufferGeometry,wn as PolyhedronGeometry,ph as PositionalAudio,He as PropertyBinding,hl as PropertyMixer,Tr as QuadraticBezierCurve,uo as QuadraticBezierCurve3,et as Quaternion,Wn as QuaternionKeyframeTrack,Za as QuaternionLinearInterpolant,By as REVISION,Qd as RGBADepthPacking,Tt as RGBAFormat,md as RGBAIntegerFormat,Ld as RGBA_ASTC_10x10_Format,Ed as RGBA_ASTC_10x5_Format,Td as RGBA_ASTC_10x6_Format,Ad as RGBA_ASTC_10x8_Format,Rd as RGBA_ASTC_12x10_Format,Cd as RGBA_ASTC_12x12_Format,xd as RGBA_ASTC_4x4_Format,yd as RGBA_ASTC_5x4_Format,vd as RGBA_ASTC_5x5_Format,_d as RGBA_ASTC_6x5_Format,wd as RGBA_ASTC_6x6_Format,bd as RGBA_ASTC_8x5_Format,Md as RGBA_ASTC_8x6_Format,Sd as RGBA_ASTC_8x8_Format,Pd as RGBA_BPTC_Format,nc as RGBA_ETC2_EAC_Format,ec as RGBA_PVRTC_2BPPV1_Format,Kl as RGBA_PVRTC_4BPPV1_Format,Zl as RGBA_S3TC_DXT1_Format,Jl as RGBA_S3TC_DXT3_Format,jl as RGBA_S3TC_DXT5_Format,Kh as RGBDEncoding,Al as RGBEEncoding,cd as RGBEFormat,zn as RGBFormat,pd as RGBIntegerFormat,Qh as RGBM16Encoding,$h as RGBM7Encoding,gd as RGB_ETC1_Format,tc as RGB_ETC2_Format,Ql as RGB_PVRTC_2BPPV1_Format,$l as RGB_PVRTC_4BPPV1_Format,Yl as RGB_S3TC_DXT1_Format,dd as RGFormat,fd as RGIntegerFormat,Vn as RawShaderMaterial,nn as Ray,mh as Raycaster,wo as RectAreaLight,hd as RedFormat,ud as RedIntegerFormat,ju as ReinhardToneMapping,ws as RepeatWrapping,Jy as ReplaceStencilOp,Cu as ReverseSubtractEquation,Ws as RingBufferGeometry,Ws as RingGeometry,Vd as SRGB8_ALPHA8_ASTC_10x10_Format,Hd as SRGB8_ALPHA8_ASTC_10x5_Format,Gd as SRGB8_ALPHA8_ASTC_10x6_Format,kd as SRGB8_ALPHA8_ASTC_10x8_Format,Wd as SRGB8_ALPHA8_ASTC_12x10_Format,qd as SRGB8_ALPHA8_ASTC_12x12_Format,Id as SRGB8_ALPHA8_ASTC_4x4_Format,Dd as SRGB8_ALPHA8_ASTC_5x4_Format,Fd as SRGB8_ALPHA8_ASTC_5x5_Format,Nd as SRGB8_ALPHA8_ASTC_6x5_Format,Bd as SRGB8_ALPHA8_ASTC_6x6_Format,zd as SRGB8_ALPHA8_ASTC_8x5_Format,Od as SRGB8_ALPHA8_ASTC_8x6_Format,Ud as SRGB8_ALPHA8_ASTC_8x8_Format,dr as Scene,jv as SceneUtils,Ee as ShaderChunk,Ot as ShaderLib,kt as ShaderMaterial,$s as ShadowMaterial,Kt as Shape,wr as ShapeBufferGeometry,wr as ShapeGeometry,rl as ShapePath,Qt as ShapeUtils,td as ShortType,Ua as Skeleton,wl as SkeletonHelper,mr as SkinnedMesh,Gy as SmoothShading,tn as Sphere,br as SphereBufferGeometry,br as SphereGeometry,xh as Spherical,bo as SphericalHarmonics3,Ar as SplineCurve,mo as SpotLight,bh as SpotLightHelper,pr as Sprite,fr as SpriteMaterial,Yh as SrcAlphaFactor,Uu as SrcAlphaSaturateFactor,Du as SrcColorFactor,dv as StaticCopyUsage,nr as StaticDrawUsage,cv as StaticReadUsage,ch as StereoCamera,pv as StreamCopyUsage,lv as StreamDrawUsage,uv as StreamReadUsage,Sn as StringKeyframeTrack,Ru as SubtractEquation,Vl as SubtractiveBlending,Oy as TOUCH,Di as TangentSpaceNormalMap,qs as TetrahedronBufferGeometry,qs as TetrahedronGeometry,Xs as TextBufferGeometry,Xs as TextGeometry,St as Texture,$a as TextureLoader,Ys as TorusBufferGeometry,Ys as TorusGeometry,Zs as TorusKnotBufferGeometry,Zs as TorusKnotGeometry,ht as Triangle,Yy as TriangleFanDrawMode,Xy as TriangleStripDrawMode,Jd as TrianglesDrawMode,Js as TubeBufferGeometry,Js as TubeGeometry,wa as UVMapping,Bv as Uint16Attribute,sr as Uint16BufferAttribute,Ov as Uint32Attribute,or as Uint32BufferAttribute,Dv as Uint8Attribute,Ra as Uint8BufferAttribute,Fv as Uint8ClampedAttribute,Ca as Uint8ClampedBufferAttribute,ml as Uniform,K as UniformsLib,Rf as UniformsUtils,Ir as UnsignedByteType,ji as UnsignedInt248Type,_s as UnsignedIntType,id as UnsignedShort4444Type,rd as UnsignedShort5551Type,sd as UnsignedShort565Type,Ms as UnsignedShortType,Xi as VSMShadowMap,W as Vector2,_ as Vector3,De as Vector4,Ei as VectorKeyframeTrack,Cv as Vertex,wv as VertexColors,Ga as VideoTexture,za as WebGL1Renderer,lr as WebGLCubeRenderTarget,Aa as WebGLMultisampleRenderTarget,Ht as WebGLRenderTarget,Yv as WebGLRenderTargetCube,Oe as WebGLRenderer,Fx as WebGLUtils,js as WireframeGeometry,Wv as WireframeHelper,As as WrapAroundEnding,qv as XHRLoader,di as ZeroCurvatureEnding,Pu as ZeroFactor,fi as ZeroSlopeEnding,Zy as ZeroStencilOp,Do as sRGBEncoding};