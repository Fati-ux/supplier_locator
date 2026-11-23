import L from 'leaflet';
import {suppliers,type Point,type Supplier} from './locator';
export interface MapAdapter {update:(point:Point|null,results:(Supplier&{distance:number})[],selected:number|null)=>void;resize:()=>void;destroy:()=>void}
export function createMap(element:HTMLElement,onPick:(p:Point)=>void,onSelect:(id:number)=>void,onTileError:()=>void,onReady:()=>void):MapAdapter{
 const map=L.map(element,{zoomControl:false}).setView([-28.5,25],6);L.control.zoom({position:'bottomright'}).addTo(map);
 const tiles=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
 tiles.once('load',onReady);tiles.on('tileerror',onTileError);map.on('click',e=>onPick(e.latlng));
 const layer=L.layerGroup().addTo(map);let previous='';
 return {update(point,results,selected){layer.clearLayers();if(!point)suppliers.forEach(s=>L.circleMarker([s.lat,s.lng],{radius:7,color:'#fff',weight:2,fillColor:'#087f80',fillOpacity:1}).bindTooltip(`${s.name} · ${s.town} (fictional)`).addTo(layer));results.forEach((s,i)=>L.marker([s.lat,s.lng],{icon:L.divIcon({className:'custom-marker',html:`<span class="supplier-pin ${selected===s.id?'active':''}">${i+1}</span>`,iconSize:[36,36],iconAnchor:[18,18]}),keyboard:true,title:`Supplier ${i+1}: ${s.name}`}).on('click',()=>onSelect(s.id)).addTo(layer));
 if(point){L.marker([point.lat,point.lng],{icon:L.divIcon({className:'custom-marker',html:'<span class="breakdown-pin"><span>+</span></span>',iconSize:[38,46],iconAnchor:[19,44]}),title:'Breakdown location'}).addTo(layer);const key=`${point.lat},${point.lng}`;if(previous!==key){map.fitBounds(L.latLngBounds([point,...results].map(p=>[p.lat,p.lng] as [number,number])),{padding:[70,70],maxZoom:12});previous=key}}
 },resize(){map.invalidateSize()},destroy(){map.remove()}};
}
