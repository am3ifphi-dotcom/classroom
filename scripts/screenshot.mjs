import {chromium} from '@playwright/test';
import chromiumBinary from '@sparticuz/chromium';
const browser=await chromium.launch({executablePath:await chromiumBinary.executablePath(),headless:true,args:[...chromiumBinary.args.filter(s=>!s.includes('single-process')&&!s.includes('use-gl=')&&!s.includes('use-angle=')&&!s.includes('in-process-gpu')),'--disable-gpu']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
page.on('pageerror',e=>console.log('ERROR',e));page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
await page.goto('http://localhost:5173');await page.waitForFunction(()=>window.__game);await page.waitForTimeout(1300);await page.screenshot({path:'.work/title.png'});
await page.click('#start-btn');await page.evaluate(()=>{for(let i=0;i<20&&__game.mode==='dialogue';i++)__game.next()});await page.waitForTimeout(1800);await page.screenshot({path:'.work/game.png'});
await page.click('#menu-btn');await page.screenshot({path:'.work/menu.png'});await browser.close();
