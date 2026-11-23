export type Point={lat:number;lng:number};
export type Supplier=Point & {id:number;name:string;town:string;services:string[];hours:string;contact:string};
const entries:[string,string,number,number,string[]][]=[
 ['Acacia Tyre Assist','Johannesburg',-26.204,28.047,['Mobile call-out','Passenger tyres']],
 ['Copperleaf Roadside','Johannesburg · Sandton',-26.107,28.056,['Mobile call-out','Truck tyres']],
 ['Highveld Wheel Crew','Johannesburg · Germiston',-26.23,28.18,['Truck tyres','Puncture repair']],
 ['Aloe Tyre Station','Johannesburg · Soweto',-26.248,27.855,['Passenger tyres','Puncture repair']],
 ['Jacaranda Tyre Assist','Pretoria',-25.7479,28.2293,['Mobile call-out','Passenger tyres']],
 ['Fynbos Wheel Crew','Cape Town',-33.9249,18.4241,['Mobile call-out','Truck tyres']],
 ['Coral Roadside','Durban',-29.8587,31.0218,['Truck tyres','Puncture repair']],
 ['Baobab Tyre Assist','Polokwane',-23.9045,29.4689,['Mobile call-out','Passenger tyres']],
 ['Karoo Wheel Station','Bloemfontein',-29.0852,26.1596,['Truck tyres','Puncture repair']],
 ['Bayleaf Tyre Assist','Gqeberha',-33.9608,25.6022,['Mobile call-out','Passenger tyres']],
 ['Riverstone Roadside','Mbombela',-25.4753,30.9694,['Truck tyres','Puncture repair']],
 ['Dune Wheel Crew','Kimberley',-28.7282,24.7499,['Passenger tyres','Puncture repair']],
 ['Wildcoast Tyre Assist','East London',-33.0153,27.9116,['Mobile call-out','Truck tyres']]
];
export const suppliers:Supplier[]=entries.map(([name,town,lat,lng,services],i)=>({id:i+1,name,town,lat,lng,services,hours:i%3===0?'24-hour demo availability':'Mon–Sat · 07:00–18:00 SAST',contact:`DEMO-ONLY-${String(i+1).padStart(3,'0')}`}));
export const towns:Record<string,Point>={johannesburg:{lat:-26.2041,lng:28.0473},sandton:{lat:-26.107,lng:28.056},soweto:{lat:-26.248,lng:27.855},germiston:{lat:-26.23,lng:28.18},pretoria:{lat:-25.7479,lng:28.2293},'cape town':{lat:-33.9249,lng:18.4241},durban:{lat:-29.8587,lng:31.0218},gqeberha:{lat:-33.9608,lng:25.6022},polokwane:{lat:-23.9045,lng:29.4689},bloemfontein:{lat:-29.0852,lng:26.1596},mbombela:{lat:-25.4753,lng:30.9694},kimberley:{lat:-28.7282,lng:24.7499},'east london':{lat:-33.0153,lng:27.9116}};
export function validatePoint(p:Point):Point {
 if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||Math.abs(p.lat)>90||Math.abs(p.lng)>180) throw new Error('Use valid latitude (−90 to 90) and longitude (−180 to 180).');
 if(p.lat < -35.5 || p.lat > -22 || p.lng < 16 || p.lng > 33.5) throw new Error('Choose a location in South Africa for this demonstration.');
 return p;
}
const pair=(s:string):Point|null=>{const m=s.trim().match(/^([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)$/);return m?validatePoint({lat:Number(m[1]),lng:Number(m[2])}):null};
export function parseLocation(value:string):{point:Point;label:string}|null{
 const s=value.trim();if(!s)throw new Error('Enter a town, address, coordinates or supported Google Maps link.');
 const coords=pair(s);if(coords)return {point:coords,label:'Pasted coordinates'};
 if(/^https?:\/\//i.test(s)){
  let url:URL;try{url=new URL(s)}catch{throw new Error('This URL is invalid.')}
  if(['maps.app.goo.gl','goo.gl'].includes(url.hostname))throw new Error('Shortened links cannot be resolved here. Open the link in Google Maps and copy the full URL or latitude, longitude.');
  if(!['www.google.com','google.com','maps.google.com','www.google.co.za','google.co.za'].includes(url.hostname)||!(url.pathname.startsWith('/maps')||url.hostname==='maps.google.com'))throw new Error('Use a full Google Maps location URL containing explicit coordinates.');
  if(url.pathname.startsWith('/maps/dir'))throw new Error('Directions links are not supported. Copy coordinates for one breakdown location.');
  const q=url.searchParams.get('q')||url.searchParams.get('query'); const p=q?pair(q):null;
  const marker=url.pathname.match(/!3d([+-]?\d+(?:\.\d+)?)!4d([+-]?\d+(?:\.\d+)?)/);
  const view=url.pathname.match(/@([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)/);
  if(p)return {point:p,label:'Google Maps coordinates'};
  if(marker)return {point:validatePoint({lat:+marker[1],lng:+marker[2]}),label:'Google Maps place'};
  if(view)return {point:validatePoint({lat:+view[1],lng:+view[2]}),label:'Google Maps view centre (confirm pin)'};
  throw new Error('This link has no supported explicit coordinates. Copy latitude, longitude from Google Maps. Directions and place-name links are not resolved.');
 }
 let key=s.toLowerCase().replace(/,?\s*south africa$/,'').trim();
 if(key==='port elizabeth')key='gqeberha';
 if(key==='tshwane'||key==='city of tshwane')throw new Error('Tshwane is a municipality containing Pretoria and other places. Choose Pretoria for its city centre, or enter exact coordinates.');
 return towns[key]?{point:towns[key],label:`${key==='gqeberha'?'Gqeberha / Port Elizabeth':s} · town centre`}:null;
}
export function distance(a:Point,b:Point){const rad=(n:number)=>n*Math.PI/180;const dlat=rad(b.lat-a.lat),dlng=rad(b.lng-a.lng);const h=Math.sin(dlat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dlng/2)**2;return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}
export function nearest(point:Point){return suppliers.map(s=>({...s,distance:distance(point,s)})).sort((a,b)=>a.distance-b.distance||a.id-b.id).slice(0,3)}
