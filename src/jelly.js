import * as THREE from "three"
import * as dat from 'dat.gui';
    let t = 0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(10000 * 3);
    const colors = new Float32Array(10000 * 3);
    const color = new THREE.Color(1, 1, 1);

    for (let i = 0; i < 10000; i++) {
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 1, vertexColors: true, transparent: true, opacity: 0.26 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    camera.position.z = 400;

    function updatePoints() {
      const positions = geometry.attributes.position.array;
      for (let i = 0; i < 10000; i++) {
        const x = i % 200;
        const y = i / 55;
        const k = 9 * Math.cos(x / 8);
        const e = y / 8 - 12.5;
        const d_base_sq = k * k + e * e;
        const d = d_base_sq / 99 + Math.sin(t) / 6 + 0.5;
        const c = d / 2 + e / 69 - t / 16;
        const q = 99 - e * Math.sin(Math.atan2(k, e) * 7) / d + k * (3 + Math.cos(d * d - t) * 2);
        const px = q * Math.sin(c);
        const py = (q + 19 * d) * Math.cos(c);
        positions[i * 3] = px;
        positions[i * 3 + 1] = py;
        positions[i * 3 + 2] = 0;
      }
      geometry.attributes.position.needsUpdate = true;
    }

    function animate() {
      requestAnimationFrame(animate);
      t += Math.PI / 45;
      updatePoints();
      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });



