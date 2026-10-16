// node grid.js <out.png> <factor> <bgHex> <cols> <files...>  — grid preview (no labels)
const fs=require("fs");const {decode,encode}=require("./pngtool.js");
const [out,f_,bg,c_,...files]=process.argv.slice(2);const f=+f_,cols=+c_;const sz=Math.max(...files.map(p=>decode(fs.readFileSync(p)).width));const cell=sz*f+Math.ceil(sz/4)*f;
const b=[1,3,5].map(i=>parseInt(bg.slice(i,i+2),16));const rows=Math.ceil(files.length/cols);
const W=cols*cell,H=rows*cell,d=Buffer.alloc(W*H*4);for(let i=0;i<W*H;i++){d[i*4]=b[0];d[i*4+1]=b[1];d[i*4+2]=b[2];d[i*4+3]=255;}
files.forEach((p,k)=>{const im=decode(fs.readFileSync(p));const pad=Math.ceil(sz/8)*f;const ox=(k%cols)*cell+pad,oy=Math.floor(k/cols)*cell+pad;
for(let y=0;y<im.height*f;y++)for(let x=0;x<im.width*f;x++){const si=(Math.floor(y/f)*im.width+Math.floor(x/f))*4,a=im.rgba[si+3]/255,di=((oy+y)*W+ox+x)*4;
for(let c=0;c<3;c++)d[di+c]=Math.round(im.rgba[si+c]*a+b[c]*(1-a));}});
fs.writeFileSync(out,encode(W,H,d));
