import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Atoms Demo · 把想法变成产品',description:'通过 AI 团队构建、预览与迭代你的应用。'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
