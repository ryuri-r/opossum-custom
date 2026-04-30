import * as THREE from 'three';
console.log("Three.js main.js starting...");

// ===== Scene Setup =====
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xE8DDD3);
scene.fog = new THREE.Fog(0xE8DDD3, 12, 25);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3.5, 8);
camera.lookAt(0, 1.2, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ===== Raycaster for Interaction =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;

// ===== Lights =====
const ambientLight = new THREE.AmbientLight(0xFFF5E6, 0.6);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xFFF0D0, 1.8);
sunLight.position.set(2, 6, 4);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 20;
sunLight.shadow.camera.left = -6;
sunLight.shadow.camera.right = 6;
sunLight.shadow.camera.top = 6;
sunLight.shadow.camera.bottom = -3;
scene.add(sunLight);

const fillLight = new THREE.PointLight(0xFFE0B2, 0.5, 15);
fillLight.position.set(-3, 4, 2);
scene.add(fillLight);

// ===== Materials =====
const mat = {
    wall: new THREE.MeshStandardMaterial({ color: 0xF5F0EB, roughness: 0.9 }),
    floor: new THREE.MeshStandardMaterial({ color: 0x8B6B4A, roughness: 0.7 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x7A5C3A, roughness: 0.6 }),
    cushion: new THREE.MeshStandardMaterial({ color: 0xE8E4E0, roughness: 1.0 }),
    fur: new THREE.MeshStandardMaterial({ color: 0x6B6B6B, roughness: 0.95 }),
    furLight: new THREE.MeshStandardMaterial({ color: 0xCCBBAA, roughness: 0.95 }),
    nose: new THREE.MeshStandardMaterial({ color: 0xFFB0C0, roughness: 0.5 }),
    eye: new THREE.MeshStandardMaterial({ color: 0xA83442, roughness: 0.3, emissive: 0x2A0D11 }),
    ear: new THREE.MeshStandardMaterial({ color: 0x443333, roughness: 0.8 }),
    tail: new THREE.MeshStandardMaterial({ color: 0xD4C4B0, roughness: 0.7 }),
    pot: new THREE.MeshStandardMaterial({ color: 0xB87A4B, roughness: 0.6 }),
    potWhite: new THREE.MeshStandardMaterial({ color: 0xEEE8E0, roughness: 0.5 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x4A7C3A, roughness: 0.7 }),
    leafDark: new THREE.MeshStandardMaterial({ color: 0x3A5C2A, roughness: 0.7 }),
    banana: new THREE.MeshStandardMaterial({ color: 0xFFE135, roughness: 0.5 }),
    avocado: new THREE.MeshStandardMaterial({ color: 0x568203, roughness: 0.6 }),
    broccoli: new THREE.MeshStandardMaterial({ color: 0x2E7D32, roughness: 0.8 }),
    brush: new THREE.MeshStandardMaterial({ color: 0xC4A66A, roughness: 0.5 }),
    sponge: new THREE.MeshStandardMaterial({ color: 0xFFD54F, roughness: 0.9 }),
    window: new THREE.MeshStandardMaterial({ color: 0xDDEEFF, roughness: 0.1, transparent: true, opacity: 0.3 }),
    windowFrame: new THREE.MeshStandardMaterial({ color: 0xF0EBE5, roughness: 0.5 }),
    rug: new THREE.MeshStandardMaterial({ color: 0x8B3A3A, roughness: 0.95 }),
    skin: new THREE.MeshStandardMaterial({ color: 0xFFDBAC, roughness: 0.4 }),
    blood: new THREE.MeshBasicMaterial({ color: 0xCC0000 }),
};

// ===== Groups for Scene Management =====
const roomGroup = new THREE.Group();
const bathroomGroup = new THREE.Group();
bathroomGroup.visible = false;
scene.add(roomGroup);
scene.add(bathroomGroup);

// ===== Room =====
// Back wall
const backWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), mat.wall);
backWall.position.set(0, 3, -3);
backWall.receiveShadow = true;
roomGroup.add(backWall);

// Floor
const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 14), mat.floor);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.5;
floor.receiveShadow = true;
roomGroup.add(floor);

// Rug
const rug = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), mat.rug);
rug.rotation.x = -Math.PI / 2;
rug.position.set(0, -0.48, 3);
rug.receiveShadow = true;
roomGroup.add(rug);

// ===== Window =====
function createWindow() {
    const group = new THREE.Group();
    const frameThick = 0.08;
    // Outer frame
    const frameMat = mat.windowFrame;
    const createBar = (w, h, d) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat);

    const top = createBar(3.2, frameThick, 0.1); top.position.set(0, 1.5, 0);
    const bot = createBar(3.2, frameThick, 0.1); bot.position.set(0, -1.5, 0);
    const left = createBar(frameThick, 3, 0.1); left.position.set(-1.6, 0, 0);
    const right = createBar(frameThick, 3, 0.1); right.position.set(1.6, 0, 0);
    const mid = createBar(3.2, frameThick, 0.1); mid.position.set(0, 0, 0);

    [top, bot, left, right, mid].forEach(b => group.add(b));

    // Glass
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 2.9), mat.window);
    glass.position.z = -0.02;
    group.add(glass);

    // Window sill
    const sill = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 0.4), frameMat);
    sill.position.set(0, -1.55, 0.15);
    sill.castShadow = true;
    group.add(sill);

    group.position.set(0, 4.2, -2.95);
    return group;
}
roomGroup.add(createWindow());

// ===== Table =====
const tableTop = new THREE.Mesh(new THREE.BoxGeometry(7, 0.15, 2.5), mat.wood);
tableTop.position.set(0, 0.8, 0);
tableTop.castShadow = true;
tableTop.receiveShadow = true;
roomGroup.add(tableTop);

// ===== Cushion =====
function createCushion() {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.3, 32), mat.cushion);
    base.castShadow = true;
    group.add(base);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.2, 12, 32), mat.cushion);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.1;
    rim.castShadow = true;
    group.add(rim);
    group.position.set(-0.3, 1.05, 0);
    return group;
}
let cushion = createCushion();
roomGroup.add(cushion);

// ===== Opossum & Room Objects =====
let opossum;
let fatness = 1.0;
const opossumReactions = {
    banana: ['냠냠! 바나나 좋아! 🍌', '달콤해~! 😋'],
    avocado: ['아보카도다! 건강해지는 기분! 🥑', '부드럽고 맛있어! 💚'],
    broccoli: ['브로콜리... 음... 🥦', '야채도 먹어야지! 💪'],
    brush: ['빗질해주는 거야? 기분 좋아~ 🪥', '아 시원해~ ✨'],
    talisman: ['뭔가... 이상하다?!', '살이 녹는 느낌...👁️', '몸이 날아갈 것 같아'],
    sponge: ['아야!', '장난치는 거지?!'],
    shower: ['우와 시원해~! 🚿', '물놀이 좋아! ✨', '뽀득뽀득 씻자! 🧼'],
    wheel: ['달려라 달려! 🎡', '운동 중이야! 찍찍!', '살 빼자... 영차!'],
};

function createOpossum() {
    const group = new THREE.Group();

    // Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), mat.fur);
    body.scale.set(1.3, 0.9, 1.0);
    body.castShadow = true;
    group.add(body);

    // Belly
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), mat.furLight);
    belly.position.set(0, -0.1, 0.2);
    belly.scale.set(1.0, 0.7, 0.8);
    group.add(belly);

    // Save references for scaling
    group.body = body;
    group.belly = belly;
    group.headGroup = new THREE.Group();
    group.add(group.headGroup);

    // Head parts
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 10), mat.fur);
    head.position.set(0.65, 0.2, 0);
    head.scale.set(1.1, 0.9, 0.9);
    head.castShadow = true;
    group.headGroup.add(head);

    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 8), mat.furLight);
    snout.rotation.z = -Math.PI / 2;
    snout.position.set(0.97, 0.12, 0);
    group.headGroup.add(snout);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), mat.nose);
    nose.position.set(1.12, 0.12, 0);
    group.headGroup.add(nose);

    // Eyes
    [-1, 1].forEach(side => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mat.eye);
        eye.position.set(0.82, 0.3, side * 0.18);
        group.headGroup.add(eye);
        const eyeHighlight = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 6, 4),
            new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
        );
        eyeHighlight.position.set(0.84, 0.32, side * 0.17);
        group.headGroup.add(eyeHighlight);
    });

    // Ears
    [-1, 1].forEach(side => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), mat.ear);
        ear.position.set(0.55, 0.48, side * 0.22);
        ear.scale.set(0.6, 1, 0.8);
        group.headGroup.add(ear);
    });

    // 별 모양 귀걸이
    [-1, 1].forEach(side => {
        const charmGroup = new THREE.Group();
        const starShape = new THREE.Shape();
        const outerR = 0.07, innerR = 0.03, pts = 8;
        for (let i = 0; i < pts * 2; i++) {
            const angle = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
            const r = i % 2 === 0 ? outerR : innerR;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) starShape.moveTo(x, y);
            else starShape.lineTo(x, y);
        }
        starShape.closePath();
        const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.012, bevelEnabled: false });
        const starMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.4, roughness: 0.2 });
        const star = new THREE.Mesh(starGeo, starMat);
        charmGroup.add(star);
        const holeGeo = new THREE.TorusGeometry(0.018, 0.005, 8, 16);
        const holeMat = new THREE.MeshStandardMaterial({ color: 0xFF4400, metalness: 0.5, roughness: 0.3 });
        const hole = new THREE.Mesh(holeGeo, holeMat);
        hole.position.z = 0.006;
        charmGroup.add(hole);
        const hookGeo = new THREE.TorusGeometry(0.018, 0.004, 6, 12);
        const hookMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.1 });
        const hook = new THREE.Mesh(hookGeo, hookMat);
        hook.position.y = 0.09;
        hook.rotation.x = Math.PI / 2;
        charmGroup.add(hook);
        charmGroup.position.set(0.55, 0.30, side * 0.30);
        charmGroup.rotation.y = side * 0.3;
        group.headGroup.add(charmGroup);
    });

    // Legs
    group.legs = [];
    [[-0.3, -0.35, 0.25], [-0.3, -0.35, -0.25], [0.3, -0.35, 0.25], [0.3, -0.35, -0.25]].forEach(pos => {
        const legGroup = new THREE.Group();
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.25, 8), mat.fur);
        legGroup.add(leg);
        const paw = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), mat.nose);
        paw.position.set(0, -0.12, 0);
        legGroup.add(paw);
        legGroup.position.set(...pos);
        group.add(legGroup);
        group.legs.push({ mesh: legGroup, basePos: new THREE.Vector3(...pos) });
    });

    // Tail
    const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.6, 0, 0),
        new THREE.Vector3(-0.9, -0.1, 0.1),
        new THREE.Vector3(-1.1, -0.3, 0.2),
        new THREE.Vector3(-1.0, -0.5, 0.15),
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 12, 0.04, 6, false);
    const tail = new THREE.Mesh(tailGeo, mat.tail);
    tail.castShadow = true;
    group.add(tail);
    group.tail = tail;

    group.position.set(-0.3, 1.45, 0);
    group.rotation.y = -0.3;

    // Tag body parts for raycasting
    body.userData.type = 'body';
    head.userData.type = 'head';

    return group;
}
opossum = createOpossum();
scene.add(opossum);

// ===== Human Hand (Icon) =====
const handIcon = document.createElement('div');
handIcon.id = 'hand-icon';
handIcon.innerHTML = '🖐️';
document.body.appendChild(handIcon);

// ===== Plants =====
function createPlant(potMat, x, y, z, scale = 1) {
    const group = new THREE.Group();
    // Pot
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.35, 12), potMat);
    pot.castShadow = true;
    group.add(pot);
    // Dirt
    const dirt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.19, 0.04, 12),
        new THREE.MeshStandardMaterial({ color: 0x4A3520, roughness: 1 })
    );
    dirt.position.y = 0.16;
    group.add(dirt);
    // Leaves
    for (let i = 0; i < 5; i++) {
        const leafGeo = new THREE.SphereGeometry(0.15, 8, 6);
        const leafMesh = new THREE.Mesh(leafGeo, i % 2 === 0 ? mat.leaf : mat.leafDark);
        const angle = (i / 5) * Math.PI * 2;
        leafMesh.position.set(Math.cos(angle) * 0.12, 0.3 + Math.random() * 0.2, Math.sin(angle) * 0.12);
        leafMesh.scale.set(0.8, 1.2, 0.8);
        leafMesh.castShadow = true;
        group.add(leafMesh);
    }
    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), mat.leafDark);
    stem.position.y = 0.25;
    group.add(stem);

    group.position.set(x, y, z);
    group.scale.setScalar(scale);
    return group;
}

// Windowsill plants
roomGroup.add(createPlant(mat.pot, -1.2, 2.72, -2.7, 0.8));
roomGroup.add(createPlant(mat.potWhite, 0, 2.72, -2.7, 0.7));
roomGroup.add(createPlant(mat.pot, 1.0, 2.72, -2.7, 0.9));

// Table plants
roomGroup.add(createPlant(mat.potWhite, 2.8, 0.95, -0.3, 1.1));
roomGroup.add(createPlant(mat.pot, -2.8, 0.95, 0.2, 1.0));

// Floor plant (big)
function createBigPlant(x, z) {
    const group = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.7, 12), mat.potWhite);
    pot.position.y = 0.35;
    pot.castShadow = true;
    group.add(pot);
    for (let i = 0; i < 8; i++) {
        const leafGeo = new THREE.SphereGeometry(0.25, 8, 6);
        const leafMesh = new THREE.Mesh(leafGeo, i % 2 === 0 ? mat.leaf : mat.leafDark);
        const angle = (i / 8) * Math.PI * 2;
        const h = 0.8 + Math.random() * 0.5;
        leafMesh.position.set(Math.cos(angle) * 0.3, h, Math.sin(angle) * 0.3);
        leafMesh.scale.set(0.7, 1.3, 0.7);
        leafMesh.castShadow = true;
        group.add(leafMesh);
    }
    group.position.set(x, -0.5, z);
    return group;
}
roomGroup.add(createBigPlant(3.5, 0));
roomGroup.add(createBigPlant(-3.5, -1));

// ===== Throwable Items =====
const thrownItems = [];
const clock = new THREE.Clock();

function createItemMesh(type) {
    let mesh;
    switch (type) {
        case 'banana': {
            const g = new THREE.Group();
            const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.3, 6, 8), mat.banana);
            body.rotation.z = 0.3;
            g.add(body);
            mesh = g;
            break;
        }
        case 'avocado': {
            const g = new THREE.Group();
            const body = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), mat.avocado);
            body.scale.set(0.8, 1, 0.7);
            g.add(body);
            mesh = g;
            break;
        }
        case 'talisman': {
            const g = new THREE.Group();
            const variant = Math.floor(Math.random() * 3);

            // 색상 테마
            const schemes = [
                { body: 0xF5F5F5, accent: 0xA83442, iris: 0x111111, emissive: null },
                { body: 0xBB1A00, accent: 0xFFD700, iris: 0x111111, emissive: null },
                { body: 0x111111, accent: 0xA83442, iris: 0x44CC00, emissive: 0x226600 },
            ];
            const c = schemes[variant];

            // 부적 실루엣 트레이스
            // 상단: 두 뿔 + V노치 / 측면: 넓은 어깨→허리 / 하단: 대각선 두 다리
            const s = new THREE.Shape();
            s.moveTo(-0.06, 0.21);   // 왼쪽 뿔 끝
            s.lineTo(0.00, 0.11);    // 상단 V노치 바닥
            s.lineTo(0.06, 0.21);    // 오른쪽 뿔 끝
            s.lineTo(0.17, 0.15);    // 오른쪽 어깨 끝
            s.lineTo(0.19, 0.06);    // 오른쪽 겨드랑이
            s.lineTo(0.19, -0.01);   // 오른쪽 허리
            s.lineTo(0.23, -0.13);   // 오른쪽 다리 바깥
            s.lineTo(0.23, -0.20);   // 오른쪽 다리 끝 바깥
            s.lineTo(0.14, -0.20);   // 오른쪽 다리 끝 안
            s.lineTo(0.05, -0.08);   // 가랑이 오른쪽
            s.lineTo(-0.05, -0.08);  // 가랑이 왼쪽
            s.lineTo(-0.14, -0.20);  // 왼쪽 다리 끝 안
            s.lineTo(-0.23, -0.20);  // 왼쪽 다리 끝 바깥
            s.lineTo(-0.23, -0.13);  // 왼쪽 다리 바깥
            s.lineTo(-0.19, -0.01);  // 왼쪽 허리
            s.lineTo(-0.19, 0.06);   // 왼쪽 겨드랑이
            s.lineTo(-0.17, 0.15);   // 왼쪽 어깨 끝
            s.closePath();

            const bodyGeo = new THREE.ExtrudeGeometry(s, { depth: 0.018, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004 });
            const bodyMat = new THREE.MeshStandardMaterial({ color: c.body, roughness: 0.4, metalness: 0.05 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.z = -0.009;
            g.add(body);

            // 대각선 빨간 줄 (X자)
            const accentMat = new THREE.MeshStandardMaterial({ color: c.accent, roughness: 0.3, metalness: 0.2 });
            [[-0.07, 0.04, -0.52], [0.07, 0.04, 0.52]].forEach(([x, y, rz]) => {
                const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.14, 0.022), accentMat);
                stripe.position.set(x, y, 0.01);
                stripe.rotation.z = rz;
                g.add(stripe);
            });

            // 눈 흰자 (타원)
            const scleraMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.15 });
            const sclera = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 24), scleraMat);
            sclera.rotation.x = Math.PI / 2;
            sclera.scale.x = 1.7;
            sclera.position.set(0, 0.06, 0.016);
            g.add(sclera);

            // 홍채
            const emissiveOpts = c.emissive ? { emissive: c.emissive, emissiveIntensity: 0.6 } : {};
            const irisMat = new THREE.MeshStandardMaterial({ color: c.iris, roughness: 0.2, ...emissiveOpts });
            const iris = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 20), irisMat);
            iris.rotation.x = Math.PI / 2;
            iris.scale.x = 1.5;
            iris.position.set(0, 0.06, 0.022);
            g.add(iris);

            // 동공
            const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1 });
            const pupil = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.015, 16), pupilMat);
            pupil.rotation.x = Math.PI / 2;
            pupil.position.set(0, 0.06, 0.028);
            g.add(pupil);

            // 눈 하이라이트
            const hlMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const hl = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 4), hlMat);
            hl.position.set(0.012, 0.072, 0.036);
            g.add(hl);

            // 눈썹 라인 (윗부분 검은선)
            const browMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.008, 0.014), browMat);
            brow.position.set(0, 0.115, 0.016);
            brow.rotation.z = 0.0;
            g.add(brow);

            mesh = g;
            break;
        }
        case 'brush': {
            const g = new THREE.Group();
            const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.3), mat.brush);
            g.add(handle);
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.1), mat.brush);
            head.position.z = 0.15;
            g.add(head);
            mesh = g;
            break;
        }
        case 'sponge': {
            mesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.15), mat.sponge);
            break;
        }
        case 'shower': {
            const g = new THREE.Group();
            const head = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12), mat.windowFrame);
            head.rotation.x = Math.PI / 2;
            g.add(head);
            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), mat.windowFrame);
            handle.position.y = -0.15;
            g.add(handle);
            mesh = g;
            break;
        }
        default:
            mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1), mat.banana);
    }
    return mesh;
}

function throwItem(type) {
    const mesh = createItemMesh(type);
    // Start from bottom of screen
    mesh.position.set(
        (Math.random() - 0.5) * 2,
        0.5,
        5
    );
    scene.add(mesh);

    const target = new THREE.Vector3(
        opossum.position.x + (Math.random() - 0.5) * 0.5,
        opossum.position.y + 0.2,
        opossum.position.z
    );

    thrownItems.push({
        mesh,
        type,
        startPos: mesh.position.clone(),
        targetPos: target,
        progress: 0,
        speed: 1.5 + Math.random() * 0.5,
        rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        ),
        done: false,
        fadeOut: false,
        fadeTimer: 0,
    });

    // Button animation
    const btn = document.querySelector(`.item-btn[data-item="${type}"]`);
    if (btn) {
        btn.classList.add('throwing');
        setTimeout(() => btn.classList.remove('throwing'), 600);
    }
}

function showReaction(type) {
    const reactions = opossumReactions[type];
    const text = reactions[Math.floor(Math.random() * reactions.length)];
    const bubble = document.getElementById('reaction-bubble');
    const textEl = document.getElementById('reaction-text');
    textEl.textContent = text;
    bubble.classList.remove('hidden');
    bubble.classList.add('visible');

    clearTimeout(bubble._timeout);
    bubble._timeout = setTimeout(() => {
        bubble.classList.remove('visible');
        bubble.classList.add('hidden');
    }, 2500);
}

// ===== Bathroom Scene Elements =====
const bathMat = {
    tile: new THREE.MeshStandardMaterial({ color: 0xCACACA, roughness: 0.2 }),
    tub: new THREE.MeshStandardMaterial({ color: 0xE8DDD3, roughness: 0.5 }),
    water: new THREE.MeshStandardMaterial({ color: 0x99CCFF, transparent: true, opacity: 0.6 }),
    bubble: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 }),
};

function createBathroom() {
    // Wall
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), bathMat.tile);
    wall.position.set(0, 3, -3);
    bathroomGroup.add(wall);

    // Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 14), bathMat.tile);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    bathroomGroup.add(floor);

    // Bathtub
    const tubGroup = new THREE.Group();
    const tubBase = new THREE.Mesh(new THREE.CylinderGeometry(2, 1.8, 1, 32), bathMat.tub);
    tubBase.scale.set(1.5, 1, 1);
    tubGroup.add(tubBase);

    const water = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.1, 32), bathMat.water);
    water.position.y = 0.3;
    water.scale.set(1.5, 1, 1);
    tubGroup.add(water);

    tubGroup.position.set(0, 0, 0);
    bathroomGroup.add(tubGroup);

    // Palm plant in bathroom
    const palmGroup = createPlant(mat.pot, 2.5, 0, -1.5, 2.5);
    bathroomGroup.add(palmGroup);
}
createBathroom();

// ===== Scene Switching =====
let currentScene = 'room';

function switchToBathroom() {
    currentScene = 'bathroom';
    roomGroup.visible = false;
    bathroomGroup.visible = true;
    opossum.position.set(0, 0.8, 0); // In the tub
    scene.background = new THREE.Color(0xDDDDDD);
    scene.fog.color.set(0xDDDDDD);

    document.getElementById('room-items').classList.add('hidden');
    document.getElementById('sponge-main').classList.add('hidden'); // Hide main sponge
    document.getElementById('bathroom-items').classList.remove('hidden');

    showReaction('sponge_bath');
}

function switchToRoom() {
    currentScene = 'room';
    roomGroup.visible = true;
    bathroomGroup.visible = false;
    opossum.position.set(-0.3, 1.45, 0); // Back on cushion
    scene.background = new THREE.Color(0xE8DDD3);
    scene.fog.color.set(0xE8DDD3);

    document.getElementById('room-items').classList.remove('hidden');
    document.getElementById('sponge-main').classList.remove('hidden');
    document.getElementById('bathroom-items').classList.add('hidden');
}

// ===== Item Tray Event =====
document.querySelectorAll('.item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.item;

        if (type === 'return') {
            switchToRoom();
            return;
        }

        if (currentScene === 'room') {
            if (type === 'sponge') {
                switchToBathroom();
            } else if (type === 'wheel') {
                startExercise();
            } else {
                throwItem(type);
            }
        } else {
            // Bathroom scene
            if (type === 'shower') {
                isPouringWater = true;
                setTimeout(() => { isPouringWater = false; }, 2000);
                showReaction('shower');
            } else {
                throwItem(type);
            }
        }
    });
});

// ===== Bubbles & Water =====
const bubbles = [];
const waterParticles = [];
let isPouringWater = false;

function createWaterParticle() {
    const geo = new THREE.SphereGeometry(0.04, 6, 4);
    const mat = new THREE.MeshStandardMaterial({ color: 0x44AAFF, transparent: true, opacity: 0.6 });
    const p = new THREE.Mesh(geo, mat);

    // Pour from top-ish
    p.position.set(
        opossum.position.x + (Math.random() - 0.5) * 0.5,
        opossum.position.y + 2.5,
        opossum.position.z + (Math.random() - 0.5) * 0.5
    );
    scene.add(p);
    waterParticles.push({
        mesh: p,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.05, -0.15, (Math.random() - 0.5) * 0.05),
        life: 1.0
    });
}
function createBubble() {
    const bubbleGeo = new THREE.SphereGeometry(0.05 + Math.random() * 0.1, 8, 8);
    const bubble = new THREE.Mesh(bubbleGeo, bathMat.bubble);
    bubble.position.set(
        opossum.position.x + (Math.random() - 0.5) * 1,
        opossum.position.y + 0.2,
        opossum.position.z + (Math.random() - 0.5) * 1
    );
    scene.add(bubble);
    bubbles.push({
        mesh: bubble,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.02, 0.02 + Math.random() * 0.05, (Math.random() - 0.5) * 0.02),
        life: 1.0
    });
}
// ===== Exercise Wheel =====
let isExercising = false;
let wheelModel;
function createWheel() {
    const group = new THREE.Group();
    
    // Static base
    const base = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 1.2), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    floor.position.y = -1.5;
    base.add(floor);
    
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0x444444 }));
    stand.position.set(0, -0.75, 0.4);
    base.add(stand);
    group.add(base);

    // Rotating part
    const rotating = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(1.5, 0.1, 16, 50);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 }));
    rotating.add(ring);
    
    // Spokes
    for (let i = 0; i < 4; i++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3, 8), new THREE.MeshStandardMaterial({ color: 0x666666 }));
        spoke.rotation.z = (i / 4) * Math.PI;
        rotating.add(spoke);
    }
    
    group.add(rotating);
    group.rotatingPart = rotating; // Reference for animation
    
    group.position.set(0, 2, -2);
    group.visible = false;
    scene.add(group);
    return group;
}
wheelModel = createWheel();

function startExercise() {
    if (isExercising) return;
    isExercising = true;
    wheelModel.visible = true;
    if (cushion) cushion.visible = false;
    showReaction('wheel');
    
    // Save current pos
    const oldPos = opossum.position.clone();
    opossum.position.set(0, 1.1, -2);
    
    setTimeout(() => {
        isExercising = false;
        wheelModel.visible = false;
        if (cushion) cushion.visible = true;
        opossum.position.copy(oldPos);
        // Fatness is now reduced gradually in animate()
    }, 4000);
}

opossumReactions['sponge_bath'] = ['시원해~!', '보글보글 거품 좋아!', '깨끗해진다!'];

// ===== Animation =====
let time = 0;
let opossumJumping = false;
let opossumJumpTime = 0;

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    time += delta;

    // Opossum idle breathing
    const dynamicBaseY = (currentScene === 'bathroom' ? 0.8 : 1.45) + (fatness - 1) * 0.4;

    // Body only scaling
    const bScale = fatness;
    if (opossum.body) {
        opossum.body.scale.set(1.3 * bScale, 0.9 * bScale, 1.0 * bScale);
        opossum.belly.scale.set(1.0 * bScale, 0.7 * bScale, 0.8 * bScale);
        opossum.headGroup.position.x = 0.65 * (bScale - 1) * 0.8;
        opossum.headGroup.position.y = 0.2 * (bScale - 1) * 0.5;
        opossum.legs.forEach(leg => {
            leg.mesh.position.set(leg.basePos.x * bScale, leg.basePos.y * bScale, leg.basePos.z * bScale);
        });
        opossum.tail.position.x = -0.6 * (bScale - 1);
    }

    if (isExercising) {
        // Burn calories! (Lose 0.15 fatness over 4 seconds)
        fatness = Math.max(1.0, fatness - (0.15 / 4) * delta);
        
        wheelModel.rotatingPart.rotation.z += delta * 12;
        opossum.position.y = dynamicBaseY + Math.sin(time * 25) * 0.08;
        opossum.rotation.z = Math.sin(time * 20) * 0.15;
    } else if (!opossumJumping) {
        opossum.position.y = dynamicBaseY + Math.sin(time * 2) * 0.02;
        opossum.rotation.y = -0.3 + Math.sin(time * 0.8) * 0.1;
    } else {
        opossumJumpTime += delta;
        const jt = opossumJumpTime;
        opossum.position.y = dynamicBaseY + Math.sin(jt * 8) * 0.15 * Math.max(0, 1 - jt);
        opossum.rotation.z = Math.sin(jt * 10) * 0.1 * Math.max(0, 1 - jt);
        if (opossumJumpTime > 1.2) {
            opossumJumping = false;
            opossumJumpTime = 0;
            opossum.rotation.z = 0;
        }
    }

    // Update thrown items
    for (let i = thrownItems.length - 1; i >= 0; i--) {
        const item = thrownItems[i];
        if (item.done) {
            if (item.fadeOut) {
                item.fadeTimer += delta;
                const s = Math.max(0, 1 - item.fadeTimer * 2);
                item.mesh.scale.setScalar(s);
                if (item.fadeTimer > 0.6) {
                    scene.remove(item.mesh);
                    thrownItems.splice(i, 1);
                }
            }
            continue;
        }

        item.progress += delta * item.speed;
        const t = Math.min(item.progress, 1);

        // Parabolic arc
        const arcHeight = 2.5;
        const currentPos = new THREE.Vector3().lerpVectors(item.startPos, item.targetPos, t);
        currentPos.y += Math.sin(t * Math.PI) * arcHeight;

        item.mesh.position.copy(currentPos);
        item.mesh.rotation.x += item.rotSpeed.x * delta;
        item.mesh.rotation.y += item.rotSpeed.y * delta;
        item.mesh.rotation.z += item.rotSpeed.z * delta;

        if (t >= 1) {
            item.done = true;
            item.fadeOut = true;
            // Trigger reaction
            opossumJumping = true;
            opossumJumpTime = 0;
            showReaction(item.type);

            if (item.type === 'banana') {
                fatness += 0.15;
            }
            if (item.type === 'talisman') {
                fatness = Math.max(1.0, fatness - 0.25);
            }

            if (currentScene === 'bathroom') {
                for (let j = 0; j < 10; j++) createBubble();
            }
        }
    }

    // Update Bubbles
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.mesh.position.add(b.velocity);
        b.life -= delta * 0.5;
        b.mesh.scale.setScalar(Math.max(0, b.life));
        if (b.life <= 0) {
            scene.remove(b.mesh);
            bubbles.splice(i, 1);
        }
    }

    // Update Water Particles
    if (isPouringWater && currentScene === 'bathroom') {
        for (let i = 0; i < 3; i++) createWaterParticle();
    }

    for (let i = waterParticles.length - 1; i >= 0; i--) {
        const p = waterParticles[i];
        p.velocity.y -= 0.01; // gravity
        p.mesh.position.add(p.velocity);
        p.life -= delta * 0.8;
        if (p.mesh.position.y < 0.8 && currentScene === 'bathroom') {
            // Hit water/opossum area
            if (Math.random() > 0.8) createBubble();
            scene.remove(p.mesh);
            waterParticles.splice(i, 1);
        } else if (p.life <= 0) {
            scene.remove(p.mesh);
            waterParticles.splice(i, 1);
        }
    }

    // Update Blood
    for (let i = bloodParticles.length - 1; i >= 0; i--) {
        const b = bloodParticles[i];
        b.velocity.y -= 0.01;
        b.mesh.position.add(b.velocity);
        b.life -= delta * 1.5;
        b.mesh.scale.setScalar(Math.max(0, b.life));
        if (b.life <= 0) {
            scene.remove(b.mesh);
            bloodParticles.splice(i, 1);
        }
    }

    // Gentle camera sway
    camera.position.x = Math.sin(time * 0.3) * 0.15;
    camera.lookAt(0, 1.2, 0);

    renderer.render(scene, camera);
}

// ===== Resize =====
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== Hide Loading =====
setTimeout(() => {
    document.getElementById('loading-screen').classList.add('hidden');
}, 800);

// ===== Mouse Interaction for Washing & Petting =====
const bloodParticles = [];
function createBlood(pos) {
    for (let i = 0; i < 15; i++) {
        const g = new THREE.SphereGeometry(0.02 + Math.random() * 0.03, 6, 4);
        const m = new THREE.Mesh(g, mat.blood);
        m.position.copy(pos);
        scene.add(m);
        bloodParticles.push({
            mesh: m,
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2),
            life: 1.0
        });
    }
}

window.addEventListener('mousedown', (event) => {
    isDragging = true;
    handIcon.style.transform = 'translate(-50%, -50%) scale(0.8)';

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(opossum, true);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData.type === 'head') {
            // Bite!
            showReaction('bite');
            createBlood(new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld));
        } else {
            showReaction('pet');
        }
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    handIcon.style.transform = 'translate(-50%, -50%) scale(1)';
});

window.addEventListener('mousemove', (event) => {
    handIcon.style.left = event.clientX + 'px';
    handIcon.style.top = event.clientY + 'px';
    handIcon.style.display = 'block';

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (isDragging) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(opossum, true);
        if (intersects.length > 0) {
            if (currentScene === 'bathroom') {
                createBubble();
            } else {
                if (Math.random() > 0.98) showReaction('pet');
            }
        }
    }
});

opossumReactions['bite'] = ['*아드득*', '*와그작*', '*까드득*'];
opossumReactions['pet'] = ['기분 좋아~ 찍찍', '더 문질러줘!', '쓰담쓰담 조아...'];

animate();
console.log("Three.js main.js finished and animation loop started.");
