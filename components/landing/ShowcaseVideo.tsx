'use client';

import {useEffect, useRef, useState} from 'react';
import type Hls from 'hls.js';

// Public video URLs observed in the reference module, in showcase order.
const videos = ['09', '10', '03', '08', '05', '07'].map(id =>
  `https://public-frontend-cos.metadl.com/commonfile/home/v1.3.x/videos/founder-build-${id}/720p/index.m3u8`,
);

export function ShowcaseVideo({index, poster, enabled}: {index:number; poster:string; enabled:boolean}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, visible = false, loading = false, failed = false;
    let hls: Hls | undefined;
    const play = () => {
      if (!disposed && visible && !document.hidden && !reduced.matches && !failed) {
        hls?.startLoad();
        void video.play().catch(() => setPlaying(false));
      }
    };
    const sync = async () => {
      if (!visible || document.hidden || reduced.matches || failed) {
        video.pause();
        hls?.stopLoad();
        if (reduced.matches) setPlaying(false);
        return;
      }
      if (!video.src && !loading) {
        loading = true;
        try {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videos[index];
          } else {
            const {default: Player} = await import('hls.js');
            if (disposed) return;
            if (!Player.isSupported()) return;
            hls = new Player({maxBufferLength: 8, maxMaxBufferLength: 16, enableWorker: false});
            hls.on(Player.Events.ERROR, (_event, data) => {
              if (data.fatal) {
                failed = true;
                video.pause();
                setPlaying(false);
                hls?.destroy();
              }
            });
            hls.loadSource(videos[index]);
            hls.attachMedia(video);
            hls.on(Player.Events.MANIFEST_PARSED, play);
          }
        } catch {
          failed = true;
          setPlaying(false);
        }
      }
      play();
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      void sync();
    }, {threshold: 0.1});
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reduced.removeEventListener('change', sync);
      video.pause();
      hls?.destroy();
      video.removeAttribute('src');
      video.load();
      setPlaying(false);
    };
  }, [index, enabled]);

  return <div className={'showcase-picture'+(playing?' is-playing':'')}>
    <img src={poster} alt="" aria-hidden="true" loading="lazy" draggable={false}/>
    <video ref={videoRef} muted loop playsInline preload="none" poster={poster}
      aria-hidden="true" tabIndex={-1} onPlaying={()=>setPlaying(true)} onError={()=>setPlaying(false)}/>
  </div>;
}
