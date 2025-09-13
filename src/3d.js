import * as THREE from "three"
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    window.innerWidth / -2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    window.innerHeight / -2,
    0.1, 1000
);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const { sin, cos, PI, hypot, min, max } = Math;

function rnd(x = 1, dx = 0) {
    return Math.random() * x + dx;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function noise(x, y, t = 101) {
    let w0 = sin(0.3 * x + 1.4 * t + 2.0 + 
                2.5 * sin(0.4 * y + -1.3 * t + 1.0));
    let w1 = sin(0.2 * y + 1.5 * t + 2.8 + 
                2.3 * sin(0.5 * x + -1.2 * t + 0.5));
    return w0 + w1;
}

function pt(x, y) {
    return { x, y };
}

function many(n, f) {
    return [...Array(n)].map((_, i) => f(i));
}

function spawn() {
    const pts = many(333, () => ({
        x: rnd(window.innerWidth) - window.innerWidth / 2,
        y: rnd(window.innerHeight) - window.innerHeight / 2,
        len: 0,
        r: 0,
        mesh: null
    }));

    const pts2 = many(9, (i) => ({
        x: cos((i / 9) * PI * 2),
        y: sin((i / 9) * PI * 2)
    }));

    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pointGeometry = new THREE.SphereGeometry(1, 8, 8);
    pts.forEach(pt => {
        pt.mesh = new THREE.Mesh(pointGeometry, pointMaterial);
        pt.mesh.position.set(pt.x, pt.y, 0);
        scene.add(pt.mesh);
    });

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    let seed = rnd(100);
    let tx = rnd(window.innerWidth) - window.innerWidth / 2;
    let ty = rnd(window.innerHeight) - window.innerHeight / 2;
    let x = rnd(window.innerWidth) - window.innerWidth / 2;
    let y = rnd(window.innerHeight) - window.innerHeight / 2;
    let kx = rnd(0.8, 0.8);
    let ky = rnd(0.8, 0.8);
    let walkRadius = pt(rnd(50, 50), rnd(50, 50));
    let r = window.innerWidth / rnd(100, 150);

    function drawLine(x0, y0, x1, y1) {
        const points = [];
        many(100, (i) => {
            i = (i + 1) / 100;
            let px = lerp(x0, x1, i);
            let py = lerp(y0, y1, i);
            let k = noise(px / 5 + x0, py / 5 + y0) * 2;
            points.push(new THREE.Vector3(px + k, py + k, 0));
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
        return line;
    }

    function paintPt(pt) {
        pts2.forEach((pt2) => {
            if (!pt.len) return;
            drawLine(
                lerp(x + pt2.x * r, pt.x, pt.len * pt.len),
                lerp(y + pt2.y * r, pt.y, pt.len * pt.len),
                x + pt2.x * r,
                y + pt2.y * r
                );
            });
            pt.mesh.scale.setScalar(pt.r);
            pt.mesh.position.set(pt.x, pt.y, 0);
    }

    return {
        follow(x, y) {
            tx = x - window.innerWidth / 2;
            ty = - y + window.innerHeight / 2;
        },
        tick(t) {
            const selfMoveX = cos(t * kx + seed) * walkRadius.x;
            const selfMoveY = sin(t * ky + seed) * walkRadius.y;
            let fx = tx + selfMoveX;
            let fy = ty + selfMoveY;
            x += min(window.innerWidth / 100, (fx - x) / 35); // 35 is the speed i.e higher the number slower the speed
            y += min(window.innerWidth / 100, (fy - y) / 35); // 35 is the speed i.e higher the number slower the speed

            let i = 0;
            pts.forEach((pt) => {
                const dx = pt.x - x;
                const dy = pt.y - y;
                const len = hypot(dx, dy);
                let r = min(2, window.innerWidth / len / 5);
                pt.t = 0;
                const increasing = len < window.innerWidth / 10 && i++ < 8;
                let dir = increasing ? 0.1 : -0.1;
                if (increasing) r *= 1.5;
                pt.r = r;
                pt.len = max(0, min(pt.len + dir, 1));
                paintPt(pt);
            });
        }
    };
 }

const spiders = many(2, spawn);

window.addEventListener('pointermove', (e) => {
    spiders.forEach(spider => {
        spider.follow(e.clientX, e.clientY);
    });
});

window.addEventListener('resize', () => {
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate(t) {
    scene.children = scene.children.filter(child => !(child instanceof THREE.Line));
    renderer.setClearColor(0x000000);
    renderer.clear();
    t /= 1000;
    spiders.forEach(spider => spider.tick(t));
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
 