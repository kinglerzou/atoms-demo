'use client';

import {useEffect, useRef, useState} from 'react';
import {ChevronRight} from 'lucide-react';
import {capabilities} from '../../lib/landing-data';
import './feature-section.css';

const pictures=['main.DGt_P6Ei.png','light-1.D-QZgQBZ.png','light-2.HQudE2Kh.png','light-3.BzA-Yc4H.png','light-4.CrMDqrfR.png','light-5.BoVltOAp.png','5.CvYp2tZM.png'];
export function FeatureSection({english,onTry}:{english:boolean;onTry:(index:number)=>void}){
 const section=useRef<HTMLElement>(null);
 const panels=useRef<(HTMLElement|null)[]>([]);
 const [active,setActive]=useState(0);
 const selected=useRef(0);
 const locked=useRef<{index:number;until:number}|null>(null);
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width: 1199px)');
  let frame=0;
  const update=()=>{
   frame=0;
   const height=window.innerHeight,anchor=height*0.5;
   let nearest=0,distance=Infinity;
   panels.current.forEach((panel,index)=>{
    if(!panel)return;
    const rect=panel.getBoundingClientRect(),center=rect.top+rect.height/2;
    const delta=Math.abs(center-anchor);
    if(delta<distance){distance=delta;nearest=index}
    const progress=Math.max(0,Math.min(1,(height*0.9-rect.top)/(height*0.45)));
    const opacity=mobile.matches?0.25+progress*0.75:Math.max(0.25,1-delta/(height*0.75));
    panel.style.setProperty('--feature-opacity',String(reduced.matches?1:opacity));
    panel.style.setProperty('--feature-shift',`${reduced.matches?0:(1-progress)*50}px`);
    panel.classList.toggle('has-entered',progress>0.6);
   });
   if(locked.current){
    const target=panels.current[locked.current.index];
    if(performance.now()<locked.current.until&&target&&Math.abs(target.getBoundingClientRect().top+target.offsetHeight/2-anchor)>10)nearest=locked.current.index;
    else locked.current=null;
   }
   if(selected.current!==nearest){selected.current=nearest;setActive(nearest)}
   if(section.current){const rect=section.current.getBoundingClientRect();section.current.classList.toggle('feature-heading-visible',rect.top<height*0.9)}
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  reduced.addEventListener('change',schedule);schedule();
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule)};
 },[]);
 function select(index:number){
  locked.current={index,until:performance.now()+1600};selected.current=index;setActive(index);
  panels.current[index]?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
 }
 const copy=(index:number,mobile=false)=>{
  const item=capabilities[index];
  return <div className={mobile?'feature-mobile-copy':'feature-expanded'} id={mobile?undefined:`feature-copy-${index}`}>
   <div className="feature-expanded-inner">
    {mobile&&<h3>{item[0]}</h3>}
    <p>{item[1]}</p>
    <button className="feature-action" onClick={()=>onTry(index)}>{english?'Try now':'立即尝试'}<ChevronRight size={17}/></button>
   </div>
  </div>;
 };
 return <section ref={section} className="feature-revenue landing-section" id="features" aria-labelledby="feature-revenue-title">
  <h2 id="feature-revenue-title">{english?<><span>Everything you need</span><span>to build, launch and monetize</span><span>All in one place</span></>:<><span>你所需的一切</span><span>构建、发布与变现</span><span>收入集中展示</span></>}</h2>
  <div className="feature-revenue-layout">
   <nav className="feature-sticky-nav" aria-label="功能列表">{capabilities.map((item,index)=><div key={item[0]} className={'feature-nav-item'+(active===index?' active':'')}>
    <button className="feature-nav-title" aria-expanded={active===index} aria-controls={`feature-copy-${index}`} onClick={()=>select(index)}>{item[0]}</button>
    <div className="feature-disclosure" inert={active!==index}>{copy(index)}</div>
   </div>)}</nav>
   <div className="feature-visuals">{capabilities.map((item,index)=><article key={item[0]} ref={el=>{panels.current[index]=el}} className={'feature-panel'+(active===index?' active':'')} aria-label={item[0]}>
    <div className={'feature-art '+(index===0?'feature-editor-art':'')}>
     <img className="feature-main-image" src={'/atoms/'+pictures[index]} alt={item[0]+'界面参考'} loading="lazy" width={1000} height={625}/>
     {index===0&&<><img className="feature-editor-toolbar" src="/atoms/1.D886DBu4.png" alt="" aria-hidden="true" loading="lazy"/><img className="feature-editor-settings" src="/atoms/2.DeoBqn1x.png" alt="" aria-hidden="true" loading="lazy"/></>}
    </div>
    {copy(index,true)}
   </article>)}</div>
  </div>
 </section>;
}
