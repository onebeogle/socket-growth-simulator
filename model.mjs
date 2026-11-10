export function nodes(data,profile='refined_p100') {
 const r=data.records.filter(r=>r.profile_id===profile&&r.is_calibration_node&&r.normal_termination).sort((a,b)=>a.growth_radial_fraction-b.growth_radial_fraction);
 if(r.length!==5||r.some((a,i)=>Math.abs(a.growth_radial_fraction-[0,.001,.002,.003,.005][i])>1e-10))throw Error('Incomplete FEM calibration');
 return r;
}
export function domainErrors({age=9,length=100,radius=20,mass=50}={}) {
 if(![age,length,radius,mass].every(Number.isFinite))return ['All inputs must be finite.'];
 return [!(age>=9&&age<10)&&'Age must be within the calibrated 9-to-10-year trajectory.',Math.abs(length-100)>1e-6&&'The paired baseline limb length must be 100 mm.',Math.abs(radius-20)>.01&&'The proximal radius must be 20 mm (distal radius 15 mm).',Math.abs(mass-50)>1e-6&&'The joint growth calibration uses a 50 g object.'].filter(Boolean);
}
function slopes(x,y){
 const n=x.length,h=x.slice(1).map((v,i)=>v-x[i]),d=h.map((v,i)=>(y[i+1]-y[i])/v),m=Array(n).fill(0);
 for(let i=1;i<n-1;i++)if(d[i-1]*d[i]>0){const w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1];m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i]);}
 const edge=(h0,h1,d0,d1)=>{let a=((2*h0+h1)*d0-h0*d1)/(h0+h1);if(Math.sign(a)!==Math.sign(d0))a=0;else if(Math.sign(d0)!==Math.sign(d1)&&Math.abs(a)>3*Math.abs(d0))a=3*d0;return a;};
 m[0]=edge(h[0],h[1],d[0],d[1]);m[n-1]=edge(h[n-2],h[n-3],d[n-2],d[n-3]);return m;
}
export function interp(data,g,metric='p95_kPa',profile='refined_p100',method='linear'){
 const r=nodes(data,profile),x=r.map(a=>a.growth_radial_fraction),y=r.map(a=>a[metric]);
 if(!Number.isFinite(g)||g<x[0]-1e-12||g>x.at(-1)+1e-12)throw Error('Simulated range exceeded');
 if(!['linear','pchip'].includes(method))throw Error('Unsupported interpolation method');
 g=Math.max(x[0],Math.min(x.at(-1),g));let i=0;while(i<x.length-2&&g>x[i+1])i++;
 const h=x[i+1]-x[i],t=(g-x[i])/h;
 if(method==='linear')return y[i]+t*(y[i+1]-y[i]);
 const m=slopes(x,y);return (2*t**3-3*t*t+1)*y[i]+(t**3-2*t*t+t)*h*m[i]+(-2*t**3+3*t*t)*y[i+1]+(t**3-t*t)*h*m[i+1];
}
export function predict(data,{eta=1,threshold=.3,profile='refined_p100',age=9,method='linear'}={}){
 if(domainErrors({age}).length||![.5,1,1.5].includes(eta)||![.2,.3,.5].includes(threshold))throw Error('Unsupported prediction inputs');
 const r=nodes(data,profile),{kL,kR}=data.rates,end=Math.min(Math.log1p(.005)/(eta*kR),10-age),base=r[0].p95_kPa,target=base*(1+threshold);
 let reviewGrowth=null,reviewDays=null;
 for(let i=0;i<r.length-1;i++){let a=r[i].growth_radial_fraction,b=r[i+1].growth_radial_fraction;if(interp(data,a,'p95_kPa',profile,method)<=target&&target<=interp(data,b,'p95_kPa',profile,method)){
  for(let j=0;j<60;j++){const mid=(a+b)/2;if(interp(data,mid,'p95_kPa',profile,method)<target)a=mid;else b=mid;}reviewGrowth=(a+b)/2;const years=Math.log1p(reviewGrowth)/(eta*kR);if(years<=end+1e-12)reviewDays=years*365.25;else reviewGrowth=null;break;}}
 // Exact solution of the same constant-rate ODE used by the Python/SciPy app.
 const trajectory=Array.from({length:401},(_,i)=>{const t=end*i/400,g=Math.max(0,Math.min(.005,Math.expm1(eta*kR*t)));return {days:t*365.25,length_mm:100*Math.exp(eta*kL*t),proximal_radius_mm:20*Math.exp(eta*kR*t),radial_growth_fraction:g,p95_kPa:interp(data,g,'p95_kPa',profile,method),p95_ratio:interp(data,g,'p95_kPa',profile,method)/base};});
 return {review_days:reviewDays,review_growth:reviewGrowth,domain_days:end*365.25,baseline_p95:base,eta,threshold,profile,age,method,trajectory};
}
