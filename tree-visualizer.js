let _renderer, _scene, _camera, _controls, _rootGroup;

function ensure3D() {
  const canvas = document.getElementById('tree3d');
  if (!_renderer) {
    _renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    resize();
    _scene = new THREE.Scene();
    _scene.background = new THREE.Color(0xffffff);
    _camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);
    _camera.position.set(0, 8, 18);
    _controls = new THREE.OrbitControls(_camera, canvas);
    _controls.enableDamping = true;

    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(10, 15, 10);
    _scene.add(light);
    _scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    window.addEventListener('resize', resize);
    animate();
  }
}

function resize(){
  const canvas = document.getElementById('tree3d');
  if (!canvas || !_renderer) return;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  _renderer.setSize(w, h, false);
  if (_camera) {
    _camera.aspect = w/h;
    _camera.updateProjectionMatrix();
  }
}

function clearGroup(group){
  if (!group) return;
  while (group.children.length) group.remove(group.children[0]);
}

function renderTree3D(tree){
  ensure3D();
  if (_rootGroup) clearGroup(_rootGroup); else { _rootGroup = new THREE.Group(); _scene.add(_rootGroup); }

  const nodeMat = new THREE.MeshPhongMaterial({ color: 0x3a78ff });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x99b6ff });
  const sphereGeo = new THREE.SphereGeometry(0.35, 24, 16);

  function build(node, pos, depth=0, index=0){
    const s = new THREE.Mesh(sphereGeo, nodeMat);
    s.position.copy(pos);
    _rootGroup.add(s);

    const label = makeTextSprite(node.text || 'Node');
    label.position.set(pos.x, pos.y + 0.7, pos.z);
    _rootGroup.add(label);

    const children = (node.children || []);
    const spread = Math.max(2.5, 4 - depth*0.3);
    children.forEach((child, i) => {
      const angle = (i / Math.max(1, children.length)) * Math.PI * 2;
      const childPos = new THREE.Vector3(
        pos.x + Math.cos(angle) * spread,
        pos.y - 1.6,
        pos.z + Math.sin(angle) * spread
      );

      const points = [pos.clone(), childPos.clone()];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, edgeMat);
      _rootGroup.add(line);

      build(child, childPos, depth+1, i);
    });
  }

  build(tree, new THREE.Vector3(0, 5, 0));
}

function makeTextSprite(message) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = '14px Segoe UI';
  const width = ctx.measureText(message).width + 16;
  canvas.width = width;
  canvas.height = 32;
  ctx.font = '14px Segoe UI';
  ctx.fillStyle = '#1a73e8';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, 8, 16);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width/30, 0.8, 1);
  return sprite;
}

function animate(){
  requestAnimationFrame(animate);
  if (_controls) _controls.update();
  if (_renderer && _scene && _camera) _renderer.render(_scene, _camera);
}

window.renderTree3D = renderTree3D;
