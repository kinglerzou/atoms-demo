'use client';

import {useEffect,useRef,useState} from 'react';
import {Pause,Play} from 'lucide-react';
import {workflows} from '../../lib/landing-data';
import './workflow-section.css';

const frames=['','2.cu10e4p4.png','3.xG7SjSLn.png','4.BPQEa1AB.png','5.ImuIZqcW.png'];
const film='https://public-frontend-cos.metadl.com/commonfile/unlogin-home-research-1.mp4';

export function WorkflowSection({english,enabled}:{english:boolean;enabled:boolean}){
 const [active,setActive]=useState(0),[previous,setPrevious]=useState(-1),[direction,setDirection]=useState(1),[paused,setPaused]=useState(false),[visible,setVisible]=useState(false),[reduced,setReduced]=useState(false),[videoReady,setVideoReady]=useState(false);
 const root=useRef<HTMLElement>(null),video=useRef<HTMLVideoElement>(null),current=useRef(0),touch=useRef<{x:number;y:number}|null>(null);
 function select(index:number){if(index===current.current)return;setDirection(index>current.current?1:-1);setPrevious(current.current);current.current=index;setActive(index)}
 useEffect(()=>{
  const query=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(query.matches);update();query.addEventListener('change',update);
  const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:0.2});if(root.current)observer.observe(root.current);
  return()=>{observer.disconnect();query.removeEventListener('change',update)};
 },[]);
 useEffect(()=>{
  if(!enabled||!visible||paused||reduced)return;
  let timer:ReturnType<typeof setTimeout>;
  const schedule=()=>{clearTimeout(timer);if(!document.hidden)timer=setTimeout(()=>{const next=(current.current+1)%workflows.length;setDirection(1);setPrevious(current.current);current.current=next;setActive(next)},8000)};
  schedule();document.addEventListener('visibilitychange',schedule);
  return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',schedule)};
 },[active,enabled,visible,paused,reduced]);
 useEffect(()=>{
  const el=video.current;if(!el)return;
  const sync=()=>{if(enabled&&visible&&!paused&&!reduced&&!document.hidden&&active===0){void el.play().catch(()=>setVideoReady(false))}else el.pause()};
  sync();document.addEventListener('visibilitychange',sync);return()=>{el.pause();document.removeEventListener('visibilitychange',sync)};
 },[active,enabled,visible,paused,reduced]);
 function key(event:React.KeyboardEvent){if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();select((current.current+(event.key==='ArrowRight'?1:4))%5)}else if(event.key==='Home'){event.preventDefault();select(0)}else if(event.key==='End'){event.preventDefault();select(4)}}
 return <section ref={root} id="workflow" className={'workflow-reference landing-section'+(visible?' flow-visible':'')}>
  <h2>{english?<><span>Research, design, coding,</span><span>and growth in one place</span></>:<><span>调研、设计、编程、</span><span>增长，尽在一处</span></>}</h2>
  <div className="flow-panel" onKeyDown={key}>
   <div className="flow-desktop-options" aria-label="工作流程">{workflows.map((item,index)=><div key={item[0]} className={'flow-choice'+(active===index?' selected':'')}>
    <h3><button aria-expanded={active===index} aria-controls={`flow-description-${index}`} onClick={()=>select(index)}>{item[0]}</button></h3>
    <div className="flow-description" id={`flow-description-${index}`} inert={active!==index}><div><p>{item[1]}</p></div></div>
   </div>)}<a className="blue-button flow-try" href="/studio">{english?'Try for free':'免费试用'}</a></div>
   <div className="flow-mobile-copy" onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchEnd={e=>{if(!touch.current)return;const dx=e.changedTouches[0].clientX-touch.current.x,dy=e.changedTouches[0].clientY-touch.current.y;touch.current=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)select((current.current+(dx<0?1:4))%5)}}>
    <div className="flow-mobile-text" key={active}><h3>{workflows[active][0]}</h3><p>{workflows[active][1]}</p></div>
    <div className="flow-mobile-footer"><div className="flow-dots" aria-label="流程分页">{workflows.map((item,index)=><button key={item[0]} aria-label={`流程 ${index+1}：${item[0]}`} aria-pressed={active===index} className={active===index?'active':''} onClick={()=>select(index)}/>)}</div><a className="blue-button" href="/studio">{english?'Try for free':'免费试用'}</a></div>
   </div>
   <div className="flow-media" role="region" aria-label="工作流程演示" aria-roledescription="carousel">
    {workflows.map((item,index)=><div key={item[0]} className={'flow-slide'+(active===index?' active':previous===index?' previous':'')} style={{'--flow-offset':`${(previous===index?-direction:direction)*30}px`} as React.CSSProperties} aria-hidden={active!==index}>
     {index===0?<div className="flow-film-stage"><div className="flow-film-shell"><div className="flow-film-fallback" aria-hidden="true"><span>✳ Atoms</span><strong>{english?'From idea to first version':'从想法，到第一个版本'}</strong><p>{english?'Research → Plan → Build → Preview':'调研 → 规划 → 构建 → 预览'}</p><i/><i/><i/></div><video ref={video} src={visible?film:undefined} muted loop playsInline preload="none" className={videoReady&&!reduced?'ready':''} onPlaying={()=>setVideoReady(true)} onError={()=>setVideoReady(false)} aria-hidden="true" tabIndex={-1}/></div></div>:<img src={'/atoms/'+frames[index]} alt={item[0]+'功能参考画面'} loading="lazy"/>}
    </div>)}
    <button className="flow-pause" aria-label={paused?'播放流程演示':'暂停流程演示'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={16}/>:<Pause size={16}/>}</button>
   </div>
  </div>
 </section>;
}
