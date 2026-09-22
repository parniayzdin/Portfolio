const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduce.matches;
reduce.addEventListener('change', () => { paused = reduce.matches; });

document.querySelector('#copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText('pari.yazdinia@gmail.com'); document.querySelector('#copy-status').textContent = 'Email copied.'; } catch { document.querySelector('#copy-status').textContent = 'Please copy the email address above.'; } });
async function ornament() {
 const THREE = await import('./assets/vendor/three.module.js');
 const host = document.querySelector('#ornament');
 const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); host.append(renderer.domElement); host.querySelector('span').hidden = true;
 const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(35,1,.1,100); camera.position.z=7;
 scene.add(new THREE.HemisphereLight(0xfff1cf,0x16382c,3)); const light = new THREE.DirectionalLight(0xffe9bb,4);light.position.set(3,4,5);scene.add(light);
 const group = new THREE.Group(); scene.add(group);
 const gold = new THREE.MeshStandardMaterial({color:0xc9a75d,metalness:.65,roughness:.35});
 const green = new THREE.MeshStandardMaterial({color:0x779572,metalness:.25,roughness:.4});
 for(let ring=0;ring<2;ring++) for(let i=0;i<8;i++) {const a=i*Math.PI/4+ring*Math.PI/8;const petal=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),ring?gold:green);petal.scale.set(.22,.64,.14);petal.position.set(Math.sin(a)*(ring?.65:1),Math.cos(a)*(ring?.65:1),ring*.2);petal.rotation.z=-a;group.add(petal);}
 const center=new THREE.Mesh(new THREE.IcosahedronGeometry(.34,1),gold);center.position.z=.32;group.add(center);
 const halo=new THREE.Mesh(new THREE.TorusGeometry(1.76,.018,8,96),gold);group.add(halo);
 for(let i=0;i<8;i++){const bead=new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),gold);bead.position.set(Math.cos(i*Math.PI/4)*1.76,Math.sin(i*Math.PI/4)*1.76,0);group.add(bead);}
 let dragging=false,lastX=0,lastY=0,visible=true;
 host.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;host.setPointerCapture(e.pointerId);});
 host.addEventListener('pointermove',e=>{if(!dragging)return;group.rotation.y+=(e.clientX-lastX)*.012;group.rotation.x+=(e.clientY-lastY)*.012;lastX=e.clientX;lastY=e.clientY;});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(event,()=>dragging=false);
 host.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();group.rotation.y+=e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0;group.rotation.x+=e.key==='ArrowUp'?-.15:e.key==='ArrowDown'?.15:0;});
 new ResizeObserver(()=>{renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}).observe(host);
 new IntersectionObserver(([entry])=>visible=entry.isIntersecting).observe(host);
 let previous=0;renderer.setAnimationLoop(t=>{const dt=Math.min((t-previous)/1000,.05);previous=t;if(!visible||document.hidden)return;if(!paused&&!dragging)group.rotation.y+=dt*.2;renderer.render(scene,camera);});
}
ornament().catch(error=>console.warn('The decorative 3D ornament is unavailable; showing its static fallback.',error));

import { startLeafTrail } from './leaf-trail.js';
startLeafTrail(reduce);

import { startProjectRopes } from './project-ropes.js';
startProjectRopes(reduce);
