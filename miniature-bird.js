import * as THREE from './assets/vendor/three.module.js';

// A small sculptural bird: layered feathers and gilt details echo manuscript painting.
export function createMiniatureBird(host, reducedMotion) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 30);
  camera.position.set(0, .2, 6.5);
  camera.lookAt(0, .15, 0);
  scene.add(new THREE.HemisphereLight(0xfff2d5, 0x58664f, 2.5));
  const sun = new THREE.DirectionalLight(0xffe9bd, 3);
  sun.position.set(-3, 5, 5);
  scene.add(sun);
  const material = (color, metalness = .1) => new THREE.MeshStandardMaterial({ color, roughness: .58, metalness });
  const sage = material(0x5a806c);
  const lapis = material(0x315a83);
  const teal = material(0x467c7a);
  const rust = material(0xc37b4b);
  const gold = material(0xc4a15b, .5);
  const ivory = material(0xe4d4ac);
  const ink = material(0x182b27);
  const bird = new THREE.Group();
  bird.rotation.y = -.18;
  scene.add(bird);
  function ellipsoid(parent, mat, pos, scale, angle = 0) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat);
    mesh.position.set(...pos); mesh.scale.set(...scale); mesh.rotation.z = angle;
    parent.add(mesh); return mesh;
  }
  function line(parent, points, radius, mat) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, radius, 6, false), mat);
    parent.add(mesh); return mesh;
  }
  ellipsoid(bird, sage, [0, .05, 0], [.7, .48, .39], -.4);
  ellipsoid(bird, rust, [-.35, .15, .21], [.4, .39, .21], -.4);
  const head = new THREE.Group();
  head.position.set(-.55, .62, 0);
  bird.add(head);
  ellipsoid(head, sage, [0, 0, 0], [.3, .32, .29]);
  ellipsoid(head, ivory, [-.09, .055, .245], [.12, .14, .055]);
  ellipsoid(head, ink, [-.115, .08, .286], [.035, .04, .027]);
  ellipsoid(head, ivory, [-.123, .09, .31], [.008, .008, .006]);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(.075, .3, 8), gold);
  beak.rotation.z = Math.PI / 2; beak.position.set(-.39, -.04, .02); head.add(beak);
  for (let i = 0; i < 3; i++) {
    line(head, [[.07 + i * .055, .2, 0], [.14 + i * .06, .4, 0], [.12 + i * .095, .46, 0]], .014, gold);
  }
  const wing = new THREE.Group();
  wing.position.set(.17, .13, .31); bird.add(wing);
  ellipsoid(wing, lapis, [0, 0, 0], [.47, .27, .12], -.4);
  for (let i = 0; i < 5; i++) {
    const x = -.12 + i * .085, y = .025 - i * .048;
    ellipsoid(wing, i % 2 ? teal : lapis, [x + .13, y, .05], [.32, .055, .055], -.37 - i * .075);
    line(wing, [[x - .07, y + .055, .13], [x + .16, y - .015, .13], [x + .37, y - .08, .08]], .008, gold);
  }
  for (let i = 0; i < 4; i++) {
    ellipsoid(bird, i % 2 ? teal : lapis, [.65 + i * .07, -.2 - i * .065, -.03 - i * .035], [.73, .075, .07], -.45 + i * .07);
    line(bird, [[.43, -.06, .045], [.92, -.26 - i * .04, .06], [1.35, -.42 - i * .02, .02]], .007, gold);
  }
  for (const x of [-.24, .1]) {
    line(bird, [[x, -.3, .03], [x + .08, -.64, .03], [x + .03, -.86, .12]], .018, gold);
    for (let i = 0; i < 3; i++) line(bird, [[x + .03, -.84, .1], [x - .07 + i * .06, -.87, .21 + i * .025]], .012, gold);
  }
  host.append(renderer.domElement);
  let visible = true, dragging = false, lastX = 0, lastY = 0;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(host);
  new ResizeObserver(() => {
    renderer.setSize(host.clientWidth, host.clientHeight);
    camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix();
  }).observe(host);
  host.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; host.setPointerCapture(e.pointerId); });
  host.addEventListener('pointermove', e => {
    if (!dragging) return;
    bird.rotation.y += (e.clientX - lastX) * .015;
    bird.rotation.x = THREE.MathUtils.clamp(bird.rotation.x + (e.clientY - lastY) * .008, -.4, .4);
    lastX = e.clientX; lastY = e.clientY;
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) host.addEventListener(event, () => { dragging = false; });
  host.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Home') { bird.rotation.set(0, -.18, 0); return; }
    bird.rotation.y += e.key === 'ArrowLeft' ? -.15 : e.key === 'ArrowRight' ? .15 : 0;
    bird.rotation.x = THREE.MathUtils.clamp(bird.rotation.x + (e.key === 'ArrowUp' ? -.1 : e.key === 'ArrowDown' ? .1 : 0), -.4, .4);
  });
  renderer.setAnimationLoop(time => {
    if (!visible || document.hidden) return;
    head.rotation.z = reducedMotion.matches || dragging ? 0 : Math.sin(time * .001) * .035;
    renderer.render(scene, camera);
  });
}
