"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import * as THREE from "three";

export interface ClawMachineHandle {
  /** Runs the full claw sequence, glowing the prize with `rarityColor`. */
  pull: (rarityColor: string, onDone: () => void) => void;
}

interface Props {
  ref?: Ref<ClawMachineHandle>;
}

// ---- machine dimensions ----------------------------------------------------
const FLOOR_Y = 1.5; // top of the base cabinet
const RAIL_Y = 3.55; // height of the claw trolley
const CAP_R = 0.22; // capsule radius
const MIN_CABLE = 0.35;
const HOLE = { x: 0.85, z: 0.85 }; // drop chute position (claw home)
const GOLD = 0xc8a961;
const NAVY = 0x141c33;
// just 3 capsule colors: red / blue / gold
const CAP_COLORS = [0xd94a4a, 0x3d6fd8, 0xe8b23a];

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Step {
  dur: number;
  update: (k: number) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function ClawMachineCanvas({ ref }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ClawMachineHandle>({ pull: () => {} });

  useImperativeHandle(ref, () => ({ pull: (c, d) => apiRef.current.pull(c, d) }), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ---- renderer / scene / camera ----------------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08120a);
    scene.fog = new THREE.Fog(0x08120a, 10, 23);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.set(0, 3.3, 7.9);
    const lookAt = new THREE.Vector3(0, 2.5, 0);

    // ---- lights ------------------------------------------------------------
    scene.add(new THREE.AmbientLight(0x2e4030, 1.1));
    scene.add(new THREE.HemisphereLight(0x3a5a4a, 0x0c130c, 1.1));
    const key = new THREE.DirectionalLight(0xfff2dd, 2.2);
    key.position.set(5, 9, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = key.shadow.camera.bottom = -6;
    key.shadow.camera.right = key.shadow.camera.top = 6;
    scene.add(key);
    const inner = new THREE.PointLight(0xffd9a0, 6, 6);
    inner.position.set(0, 3.6, 0);
    scene.add(inner);
    const rimBlue = new THREE.PointLight(0x58b06a, 5, 12);
    rimBlue.position.set(-4.5, 2.5, 3.5);
    scene.add(rimBlue);
    const rimGold = new THREE.PointLight(0xffb84d, 5, 12);
    rimGold.position.set(4.5, 2.5, 3.5);
    scene.add(rimGold);

    // ---- materials ----------------------------------------------------------
    const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.85, roughness: 0.3 });
    const navyMat = new THREE.MeshStandardMaterial({ color: NAVY, metalness: 0.4, roughness: 0.5 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0c1020, metalness: 0.3, roughness: 0.7 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xbfd8ff,
      transparent: true,
      opacity: 0.12,
      roughness: 0.05,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
    const track = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(x: T): T => {
      disposables.push(x);
      return x;
    };
    [goldMat, navyMat, darkMat, glassMat].forEach(track);

    const box = (
      w: number, h: number, d: number,
      x: number, y: number, z: number,
      mat: THREE.Material, shadows = true,
    ) => {
      const m = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, d)), mat);
      m.position.set(x, y, z);
      m.castShadow = shadows;
      m.receiveShadow = shadows;
      scene.add(m);
      return m;
    };

    // ---- ground: forest grass ----------------------------------------------
    const grassCanvas = document.createElement("canvas");
    grassCanvas.width = grassCanvas.height = 1024;
    const gctx = grassCanvas.getContext("2d")!;
    gctx.fillStyle = "#26421b";
    gctx.fillRect(0, 0, 1024, 1024);
    // soft mottled patches of light/shadow
    for (let i = 0; i < 70; i++) {
      const px = Math.random() * 1024;
      const py = Math.random() * 1024;
      const pr = 50 + Math.random() * 130;
      const grad = gctx.createRadialGradient(px, py, 0, px, py, pr);
      const tone = Math.random() < 0.5 ? "47, 79, 32" : "18, 33, 12";
      grad.addColorStop(0, `rgba(${tone}, ${0.25 + Math.random() * 0.2})`);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      gctx.fillStyle = grad;
      gctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    }
    // fine directional strokes
    const bladeTones = ["#33591f", "#2a4a19", "#3f6b26", "#1e3811"];
    for (let i = 0; i < 2600; i++) {
      gctx.strokeStyle = bladeTones[Math.floor(Math.random() * bladeTones.length)];
      gctx.globalAlpha = 0.2 + Math.random() * 0.35;
      gctx.lineWidth = 1 + Math.random();
      const bx = Math.random() * 1024;
      const by = Math.random() * 1024;
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const len = 5 + Math.random() * 8;
      gctx.beginPath();
      gctx.moveTo(bx, by);
      gctx.lineTo(bx + Math.cos(ang) * len, by + Math.sin(ang) * len);
      gctx.stroke();
    }
    gctx.globalAlpha = 1;
    const grassTex = track(new THREE.CanvasTexture(grassCanvas));
    grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(3, 3);
    grassTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const ground = new THREE.Mesh(
      track(new THREE.CircleGeometry(11, 48)),
      track(new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1, metalness: 0 })),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 3D grass — soft low-poly mounds (no spiky blades), matching the trees
    const clumpGeo = track(new THREE.IcosahedronGeometry(1, 0));
    const clumpMat = track(
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }),
    );
    const clumpColors = [0x2b4d1a, 0x36611f, 0x1f3a12, 0x417328].map(
      (c) => new THREE.Color(c),
    );
    const TUFTS = 380;
    const tufts = new THREE.InstancedMesh(clumpGeo, clumpMat, TUFTS);
    const dummy = new THREE.Object3D();
    // patch centers, mounds cluster around each
    const patches: { x: number; z: number }[] = [];
    while (patches.length < 40) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.6 + Math.random() * 6.6;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (Math.abs(x) < 2.0 && Math.abs(z) < 2.0) continue; // not inside the machine
      patches.push({ x, z });
    }
    let tuftsPlaced = 0;
    while (tuftsPlaced < TUFTS) {
      const p = patches[tuftsPlaced % patches.length];
      const x = p.x + (Math.random() - 0.5) * 1.2;
      const z = p.z + (Math.random() - 0.5) * 1.2;
      if (Math.abs(x) < 1.9 && Math.abs(z) < 1.9) continue;
      const s = 0.09 + Math.random() * 0.16;
      dummy.position.set(x, s * 0.35, z);
      dummy.rotation.set(Math.random(), Math.random() * Math.PI, Math.random());
      dummy.scale.set(
        s * (1 + Math.random() * 0.6),
        s * (0.45 + Math.random() * 0.3),
        s * (1 + Math.random() * 0.6),
      );
      dummy.updateMatrix();
      tufts.setMatrixAt(tuftsPlaced, dummy.matrix);
      tufts.setColorAt(tuftsPlaced, clumpColors[Math.floor(Math.random() * clumpColors.length)]);
      tuftsPlaced++;
    }
    scene.add(tufts);

    // ---- forest ring: low-poly rounded trees, bushes, rocks ------------------
    const trunkMat = track(
      new THREE.MeshStandardMaterial({ color: 0x5a4228, roughness: 1, flatShading: true }),
    );
    const foliageMats = [0x2c5424, 0x35652b, 0x224a1c].map((c) =>
      track(new THREE.MeshStandardMaterial({ color: c, roughness: 1, flatShading: true })),
    );
    const foliageMat = () => foliageMats[Math.floor(Math.random() * foliageMats.length)];
    const canopyGeo = track(new THREE.IcosahedronGeometry(1, 1));
    const trunkGeo = track(new THREE.CylinderGeometry(0.16, 0.26, 1, 7));
    const tree = (x: number, z: number, s: number) => {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.scale.set(s, 2.0 * s, s);
      trunk.position.y = s;
      g.add(trunk);
      // a cluster of overlapping blobs forms a rounded canopy
      const mainMat = foliageMat();
      const blobs = 4 + Math.floor(Math.random() * 2);
      for (let i = 0; i < blobs; i++) {
        const blob = new THREE.Mesh(canopyGeo, Math.random() < 0.7 ? mainMat : foliageMat());
        blob.scale.setScalar(s * (0.75 + Math.random() * 0.55));
        blob.position.set(
          (Math.random() - 0.5) * s * 1.3,
          2.2 * s + Math.random() * s * 1.1,
          (Math.random() - 0.5) * s * 1.3,
        );
        blob.rotation.set(Math.random(), Math.random() * Math.PI, Math.random());
        g.add(blob);
      }
      g.position.set(x, 0, z);
      scene.add(g);
    };
    let treesPlaced = 0;
    while (treesPlaced < 13) {
      const a = Math.random() * Math.PI * 2;
      const r = 6.2 + Math.random() * 3.8;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (z > 3.2) continue; // keep the camera lane clear
      tree(x, z, 0.9 + Math.random() * 0.9);
      treesPlaced++;
    }
    let bushesPlaced = 0;
    while (bushesPlaced < 9) {
      const a = Math.random() * Math.PI * 2;
      const r = 3.6 + Math.random() * 2.6;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (z > 4.2) continue;
      const b = new THREE.Mesh(canopyGeo, foliageMat());
      b.scale.set(
        0.45 + Math.random() * 0.4,
        0.3 + Math.random() * 0.22,
        0.45 + Math.random() * 0.4,
      );
      b.position.set(x, 0.18, z);
      b.rotation.y = Math.random() * Math.PI;
      scene.add(b);
      bushesPlaced++;
    }
    const rockGeo = track(new THREE.DodecahedronGeometry(1, 0));
    const rockMat = track(
      new THREE.MeshStandardMaterial({ color: 0x525c56, roughness: 0.95, flatShading: true }),
    );
    let rocksPlaced = 0;
    while (rocksPlaced < 5) {
      const a = Math.random() * Math.PI * 2;
      const r = 2.8 + Math.random() * 1.8;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (z > 4.2) continue;
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const rs = 0.15 + Math.random() * 0.2;
      rock.scale.set(rs, rs * 0.75, rs);
      rock.position.set(x, rs * 0.5, z);
      rock.rotation.set(Math.random(), Math.random() * Math.PI, Math.random());
      rock.castShadow = true;
      scene.add(rock);
      rocksPlaced++;
    }

    // glowing rune circle under the machine
    const runeCanvas = document.createElement("canvas");
    runeCanvas.width = runeCanvas.height = 512;
    const rctx = runeCanvas.getContext("2d")!;
    rctx.strokeStyle = "#e8cd8a";
    rctx.translate(256, 256);
    rctx.lineWidth = 6;
    rctx.beginPath();
    rctx.arc(0, 0, 240, 0, Math.PI * 2);
    rctx.stroke();
    rctx.lineWidth = 3;
    rctx.beginPath();
    rctx.arc(0, 0, 205, 0, Math.PI * 2);
    rctx.stroke();
    rctx.setLineDash([14, 10]);
    rctx.beginPath();
    rctx.arc(0, 0, 222, 0, Math.PI * 2);
    rctx.stroke();
    rctx.setLineDash([]);
    for (let i = 0; i < 16; i++) {
      // rune ticks + diamonds around the ring
      const a = (i / 16) * Math.PI * 2;
      rctx.save();
      rctx.rotate(a);
      if (i % 2 === 0) {
        rctx.fillStyle = "#e8cd8a";
        rctx.beginPath();
        rctx.moveTo(0, -186);
        rctx.lineTo(9, -172);
        rctx.lineTo(0, -158);
        rctx.lineTo(-9, -172);
        rctx.closePath();
        rctx.fill();
      } else {
        rctx.lineWidth = 4;
        rctx.beginPath();
        rctx.moveTo(0, -190);
        rctx.lineTo(0, -160);
        rctx.moveTo(-7, -175);
        rctx.lineTo(7, -175);
        rctx.stroke();
      }
      rctx.restore();
    }
    const runeTex = track(new THREE.CanvasTexture(runeCanvas));
    const runeMat = track(
      new THREE.MeshBasicMaterial({
        map: runeTex,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const rune = new THREE.Mesh(track(new THREE.CircleGeometry(3.1, 48)), runeMat);
    rune.rotation.x = -Math.PI / 2;
    rune.position.y = 0.015;
    scene.add(rune);

    // ---- background: stars + rising aether motes ---------------------------
    const starGeo = track(new THREE.BufferGeometry());
    const starPos = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 14 + Math.random() * 9;
      const h = Math.random() * 13 - 1;
      starPos[i * 3] = Math.cos(a) * r;
      starPos[i * 3 + 1] = h;
      starPos[i * 3 + 2] = Math.sin(a) * r;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = track(
      new THREE.PointsMaterial({
        color: 0xaac4ff,
        size: 0.06,
        transparent: true,
        opacity: 0.85,
        fog: false,
      }),
    );
    scene.add(new THREE.Points(starGeo, starMat));

    const MOTES = 70;
    const moteGeo = track(new THREE.BufferGeometry());
    const motePos = new Float32Array(MOTES * 3);
    const moteBase: { x: number; z: number; y0: number; speed: number }[] = [];
    for (let i = 0; i < MOTES; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 2.6 + Math.random() * 4;
      moteBase.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        y0: Math.random() * 5,
        speed: 0.12 + Math.random() * 0.25,
      });
      motePos[i * 3] = moteBase[i].x;
      motePos[i * 3 + 1] = moteBase[i].y0;
      motePos[i * 3 + 2] = moteBase[i].z;
    }
    moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
    const moteMat = track(
      new THREE.PointsMaterial({
        color: 0xd4e26b, // fireflies
        size: 0.05,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    scene.add(new THREE.Points(moteGeo, moteMat));

    // ---- cabinet ------------------------------------------------------------
    box(3.2, FLOOR_Y, 3.2, 0, FLOOR_Y / 2, 0, navyMat); // base
    // gold trims (top + bottom rims of the base)
    for (const y of [FLOOR_Y - 0.03, 0.06]) {
      box(3.3, 0.07, 0.07, 0, y, 1.63, goldMat);
      box(3.3, 0.07, 0.07, 0, y, -1.63, goldMat);
      box(0.07, 0.07, 3.3, 1.63, y, 0, goldMat);
      box(0.07, 0.07, 3.3, -1.63, y, 0, goldMat);
    }
    // front decorative panel, buttons, coin slot, dispenser door
    box(2.9, 1.1, 0.02, 0, 0.78, 1.605, darkMat, false);
    const btnGeo = track(new THREE.CylinderGeometry(0.09, 0.1, 0.06, 24));
    const btnBlue = new THREE.Mesh(
      btnGeo,
      track(new THREE.MeshStandardMaterial({ color: 0x2b5cd8, emissive: 0x2b5cd8, emissiveIntensity: 0.7 })),
    );
    btnBlue.rotation.x = Math.PI / 2;
    btnBlue.position.set(-0.55, 1.15, 1.62);
    scene.add(btnBlue);
    const btnGold = btnBlue.clone();
    btnGold.material = track(
      new THREE.MeshStandardMaterial({ color: 0xdfaa33, emissive: 0xdfaa33, emissiveIntensity: 0.7 }),
    );
    btnGold.position.x = -0.15;
    scene.add(btnGold);
    box(0.1, 0.26, 0.03, 0.35, 1.15, 1.615, goldMat, false); // coin slot
    box(0.74, 0.64, 0.04, 0.85, 0.5, 1.61, darkMat, false); // dispenser recess
    box(0.8, 0.06, 0.06, 0.85, 0.85, 1.63, goldMat, false); // dispenser frame
    box(0.8, 0.06, 0.06, 0.85, 0.16, 1.63, goldMat, false);

    // glass case + gold pillars
    const glass = box(2.9, 2.4, 2.9, 0, FLOOR_Y + 1.2, 0, glassMat, false);
    glass.castShadow = false;
    for (const px of [-1.5, 1.5])
      for (const pz of [-1.5, 1.5]) box(0.14, 2.4, 0.14, px, FLOOR_Y + 1.2, pz, goldMat);

    // ceiling slab + crown + gem
    box(3.3, 0.25, 3.3, 0, 4.02, 0, navyMat);
    box(3.36, 0.06, 3.36, 0, 3.92, 0, goldMat);
    box(2.5, 0.5, 2.5, 0, 4.4, 0, navyMat);
    box(2.56, 0.06, 2.56, 0, 4.68, 0, goldMat);
    const gem = new THREE.Mesh(
      track(new THREE.OctahedronGeometry(0.2)),
      track(new THREE.MeshStandardMaterial({ color: 0x7fd8ff, emissive: 0x4ab8ff, emissiveIntensity: 1.5 })),
    );
    gem.position.set(0, 4.95, 0);
    scene.add(gem);

    // title plate (canvas texture)
    const plate = document.createElement("canvas");
    plate.width = 512;
    plate.height = 128;
    const pctx = plate.getContext("2d")!;
    pctx.fillStyle = "#10162b";
    pctx.fillRect(0, 0, 512, 128);
    pctx.strokeStyle = "#c8a961";
    pctx.lineWidth = 6;
    pctx.strokeRect(6, 6, 500, 116);
    pctx.fillStyle = "#e8cd8a";
    pctx.font = "700 58px Georgia, serif";
    pctx.textAlign = "center";
    pctx.textBaseline = "middle";
    pctx.fillText("✦ AETHER GACHA ✦", 256, 68);
    const plateTex = track(new THREE.CanvasTexture(plate));
    const plateMesh = new THREE.Mesh(
      track(new THREE.PlaneGeometry(2.1, 0.52)),
      track(new THREE.MeshBasicMaterial({ map: plateTex })),
    );
    plateMesh.position.set(0, 4.4, 1.26);
    scene.add(plateMesh);

    // drop chute hole
    const holeMesh = new THREE.Mesh(
      track(new THREE.CircleGeometry(0.3, 32)),
      track(new THREE.MeshBasicMaterial({ color: 0x000000 })),
    );
    holeMesh.rotation.x = -Math.PI / 2;
    holeMesh.position.set(HOLE.x, FLOOR_Y + 0.005, HOLE.z);
    scene.add(holeMesh);
    const ring = new THREE.Mesh(track(new THREE.TorusGeometry(0.31, 0.03, 10, 32)), goldMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(HOLE.x, FLOOR_Y + 0.02, HOLE.z);
    scene.add(ring);

    // ---- moss: the machine is an ancient dungeon relic ---------------------
    const mossMats = [0x3c5a2a, 0x4f7034, 0x2f4a23].map((c) =>
      track(new THREE.MeshStandardMaterial({ color: c, roughness: 1, metalness: 0 })),
    );
    const mossMat = () => mossMats[Math.floor(Math.random() * mossMats.length)];
    const mossGeo = track(new THREE.SphereGeometry(1, 7, 5));
    // cluster of squashed blobs hugging a surface
    const moss = (x: number, y: number, z: number, s: number) => {
      for (let i = 0; i < 3; i++) {
        const m = new THREE.Mesh(mossGeo, mossMat());
        m.position.set(
          x + (Math.random() - 0.5) * s * 1.5,
          y + (Math.random() - 0.5) * s * 0.3,
          z + (Math.random() - 0.5) * s * 1.5,
        );
        m.scale.set(
          s * (0.6 + Math.random() * 0.7),
          s * 0.35 * (0.6 + Math.random() * 0.6),
          s * (0.6 + Math.random() * 0.7),
        );
        m.rotation.set(Math.random() * 0.6, Math.random() * Math.PI, Math.random() * 0.6);
        m.castShadow = true;
        scene.add(m);
      }
    };
    // winding vines (tube along a curve) with little leaves
    const vineMat = track(
      new THREE.MeshStandardMaterial({ color: 0x3f6128, roughness: 0.9 }),
    );
    const leafMat = track(
      new THREE.MeshStandardMaterial({ color: 0x5a8a37, roughness: 0.85 }),
    );
    const leafGeo = track(new THREE.SphereGeometry(1, 6, 4));
    const vine = (pts: THREE.Vector3[], r = 0.024, leaves = 8) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const mesh = new THREE.Mesh(track(new THREE.TubeGeometry(curve, 40, r, 6, false)), vineMat);
      mesh.castShadow = true;
      scene.add(mesh);
      for (let i = 0; i < leaves; i++) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.copy(curve.getPoint(Math.random()));
        leaf.scale.set(0.05 + Math.random() * 0.03, 0.014, 0.03 + Math.random() * 0.02);
        leaf.rotation.set(Math.random(), Math.random() * Math.PI, Math.random());
        scene.add(leaf);
      }
    };
    // spiral wrapping around a pillar
    const helixVine = (px: number, pz: number, y0: number, y1: number, turns: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 24; i++) {
        const k = i / 24;
        const a = k * turns * Math.PI * 2 + (px > 0 ? 1 : 4);
        pts.push(
          new THREE.Vector3(px + Math.cos(a) * 0.15, y0 + (y1 - y0) * k, pz + Math.sin(a) * 0.15),
        );
      }
      vine(pts, 0.026, 10);
    };
    // drooping vine hanging off an edge (curved, not spiky)
    const droopVine = (x: number, y: number, z: number, len: number) => {
      const sway = (Math.random() - 0.5) * 0.25;
      vine(
        [
          new THREE.Vector3(x, y, z - 0.04),
          new THREE.Vector3(x + sway * 0.5, y - len * 0.45, z + 0.07),
          new THREE.Vector3(x + sway, y - len * 0.85, z + 0.1 + Math.random() * 0.08),
          new THREE.Vector3(x + sway * 1.7, y - len, z + 0.04),
        ],
        0.018,
        4,
      );
    };

    // clusters on the base rim, corners and floor line
    moss(-1.55, 1.5, 1.45, 0.22);
    moss(1.45, 1.52, 1.58, 0.18);
    moss(1.58, 1.5, -1.35, 0.2);
    moss(-1.35, 1.52, -1.58, 0.17);
    moss(-1.6, 0.12, 1.25, 0.26);
    moss(1.55, 0.1, 0.7, 0.22);
    moss(-0.7, 0.12, 1.62, 0.24);
    moss(1.3, 0.14, -1.58, 0.2);
    // creeping up the pillars
    moss(-1.5, 2.15, 1.5, 0.14);
    moss(1.5, 2.85, -1.5, 0.12);
    moss(1.5, 1.85, 1.5, 0.13);
    // ceiling trim + crown
    moss(-1.2, 3.95, 1.6, 0.16);
    moss(0.9, 3.96, 1.62, 0.13);
    moss(-0.9, 4.72, 1.05, 0.15);
    moss(1.05, 4.7, -0.6, 0.14);
    moss(0.2, 4.72, 1.15, 0.11);
    // around the dispenser + chute ring
    moss(1.18, 0.9, 1.62, 0.11);
    moss(0.52, 1.52, 1.0, 0.09);
    // vines wrapping the front pillars
    helixVine(-1.5, 1.5, 1.5, 3.3, 2.5);
    helixVine(1.5, 1.5, 1.5, 2.7, 2);
    helixVine(1.5, -1.5, 1.5, 3.6, 3);
    // vine creeping along the front base rim, dipping and rising
    const rimPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const k = i / 8;
      rimPts.push(
        new THREE.Vector3(
          -1.58 + k * 3.0,
          1.5 + Math.sin(k * 9) * 0.06,
          1.63 + Math.sin(k * 5) * 0.025,
        ),
      );
    }
    vine(rimPts, 0.024, 14);
    // vine climbing from the ground up the left front corner
    vine(
      [
        new THREE.Vector3(-1.75, 0.02, 1.35),
        new THREE.Vector3(-1.63, 0.5, 1.55),
        new THREE.Vector3(-1.52, 1.0, 1.62),
        new THREE.Vector3(-1.58, 1.5, 1.5),
      ],
      0.03,
      8,
    );
    // drooping vines hanging off the ceiling edge
    for (let i = 0; i < 5; i++) {
      droopVine(-1.25 + i * 0.62 + Math.random() * 0.1, 3.92, 1.65, 0.2 + Math.random() * 0.25);
    }
    droopVine(-1.66, 3.92, 0.7, 0.35);
    droopVine(1.66, 3.92, -0.3, 0.4);

    // ---- capsules -----------------------------------------------------------
    // real gacha capsule: glossy tinted clear top + white bottom + seam ring
    const topGeo = track(new THREE.SphereGeometry(CAP_R, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2));
    const bottomGeo = track(
      new THREE.SphereGeometry(CAP_R, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    );
    const seamGeo = track(new THREE.TorusGeometry(CAP_R * 0.995, 0.014, 8, 32));
    const bottomMat = track(
      new THREE.MeshStandardMaterial({ color: 0xf5f2ea, roughness: 0.4 }),
    );
    const seamMat = track(
      new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.5 }),
    );
    const capMats = CAP_COLORS.map((color) =>
      track(
        new THREE.MeshPhysicalMaterial({
          color,
          roughness: 0.08,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.12,
        }),
      ),
    );

    const makeCapsule = (topMat: THREE.Material) => {
      const g = new THREE.Group();
      const top = new THREE.Mesh(topGeo, topMat);
      const bottom = new THREE.Mesh(bottomGeo, bottomMat);
      const seam = new THREE.Mesh(seamGeo, seamMat);
      seam.rotation.x = Math.PI / 2;
      top.castShadow = bottom.castShadow = true;
      g.add(top, bottom, seam);
      return g;
    };

    // random spin + slight tilt, but keep the colored half facing up
    const tumble = (g: THREE.Group) =>
      g.rotation.set(
        (Math.random() - 0.5) * 0.6,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.6,
      );

    const capsules: THREE.Group[] = [];
    // find where a new capsule would naturally come to rest on the pile:
    // sample candidate spots, let each settle on the floor or on top of
    // touching neighbours, and keep the lowest (most stable) one
    const restingSpot = (exclude?: THREE.Group) => {
      let best: { x: number; y: number; z: number } | null = null;
      for (let i = 0; i < 140; i++) {
        const x = (Math.random() + Math.random() - 1) * 1.15; // biased to center
        const z = (Math.random() + Math.random() - 1) * 1.15;
        if (Math.abs(x) > 1.2 || Math.abs(z) > 1.2) continue;
        if (Math.hypot(x - HOLE.x, z - HOLE.z) < 0.55) continue;
        let y = FLOOR_Y + CAP_R;
        for (const c of capsules) {
          if (c === exclude || !c.visible) continue;
          const d = Math.hypot(c.position.x - x, c.position.z - z);
          if (d < CAP_R * 1.999)
            y = Math.max(y, c.position.y + Math.sqrt(Math.max(0, (CAP_R * 2) ** 2 - d * d)));
        }
        if (y > FLOOR_Y + CAP_R + CAP_R * 4.4) continue; // keep the pile ~3 layers max
        if (!best || y < best.y) best = { x, y, z };
      }
      return best ?? { x: -0.9, y: FLOOR_Y + CAP_R, z: -0.9 };
    };

    for (let i = 0; i < 30; i++) {
      const c = makeCapsule(capMats[i % capMats.length]);
      const p = restingSpot();
      c.position.set(p.x, p.y, p.z);
      tumble(c);
      scene.add(c);
      capsules.push(c);
    }

    // grab only capsules that aren't buried under others
    const pickTarget = () => {
      const free = capsules.filter(
        (c) =>
          c.visible &&
          !capsules.some(
            (o) =>
              o !== c &&
              o.visible &&
              o.position.y > c.position.y + 0.05 &&
              Math.hypot(o.position.x - c.position.x, o.position.z - c.position.z) <
                CAP_R * 1.8,
          ),
      );
      const pool = free.length ? free : capsules;
      return pool[Math.floor(Math.random() * pool.length)];
    };

    // ---- claw rig -----------------------------------------------------------
    for (const sx of [-1.35, 1.35]) box(0.08, 0.08, 2.7, sx, RAIL_Y + 0.22, 0, goldMat, false);
    const crossRail = box(2.7, 0.07, 0.07, 0, RAIL_Y + 0.22, HOLE.z, goldMat, false);

    const clawGroup = new THREE.Group();
    clawGroup.position.set(HOLE.x, RAIL_Y, HOLE.z);
    scene.add(clawGroup);
    const trolley = new THREE.Mesh(track(new THREE.BoxGeometry(0.3, 0.22, 0.3)), navyMat);
    trolley.position.y = 0.16;
    clawGroup.add(trolley);

    const cableGeo = track(new THREE.CylinderGeometry(0.02, 0.02, 1, 8));
    cableGeo.translate(0, -0.5, 0);
    const cable = new THREE.Mesh(cableGeo, darkMat);
    clawGroup.add(cable);

    const head = new THREE.Group();
    clawGroup.add(head);
    const hub = new THREE.Mesh(track(new THREE.SphereGeometry(0.1, 16, 12)), goldMat);
    head.add(hub);
    const fingerPivots: THREE.Group[] = [];
    const segGeo = track(new THREE.CylinderGeometry(0.032, 0.026, 0.3, 8));
    const tipGeo = track(new THREE.CylinderGeometry(0.026, 0.012, 0.24, 8));
    for (let i = 0; i < 3; i++) {
      const f = new THREE.Group();
      f.rotation.y = (i * Math.PI * 2) / 3;
      const pivot = new THREE.Group();
      const seg = new THREE.Mesh(segGeo, goldMat);
      seg.position.y = -0.15;
      pivot.add(seg);
      const bend = new THREE.Group();
      bend.position.y = -0.3;
      bend.rotation.x = 0.85;
      const tip = new THREE.Mesh(tipGeo, goldMat);
      tip.position.y = -0.11;
      bend.add(tip);
      pivot.add(bend);
      f.add(pivot);
      head.add(f);
      fingerPivots.push(pivot);
    }

    // ---- animation state -----------------------------------------------------
    let clawX = HOLE.x;
    let clawZ = HOLE.z;
    let cableLen = MIN_CABLE;
    let openAmt = 1; // 1 = open, 0 = closed
    let grabbed: THREE.Group | null = null;
    let pulling = false;
    let prize: THREE.Group | null = null;
    let prizeLight: THREE.PointLight | null = null;
    let seq: { steps: Step[]; i: number; t: number; onDone?: () => void } | null = null;

    const clearPrize = () => {
      if (prize) scene.remove(prize);
      if (prizeLight) scene.remove(prizeLight);
      prize = null;
      prizeLight = null;
    };

    apiRef.current.pull = (rarityColor, onDone) => {
      if (pulling) return;
      pulling = true;
      clearPrize();

      const target = pickTarget();
      const tx = target.position.x;
      const tz = target.position.z;
      const grabLen = RAIL_Y - (target.position.y + 0.3);
      const sx = clawX;
      const sz = clawZ;
      const startLen = cableLen; // idle leaves the cable mid-bob
      const open0 = openAmt;
      let fallY0 = 0;

      const steps: Step[] = [
        { // glide over the target capsule
          dur: 1.0,
          update: (k) => {
            const e = easeInOut(k);
            clawX = lerp(sx, tx, e);
            clawZ = lerp(sz, tz, e);
          },
        },
        { // lower the claw, opening fully on the way down
          dur: 0.7,
          update: (k) => {
            cableLen = lerp(startLen, grabLen, easeInOut(k));
            openAmt = Math.min(1, lerp(open0, 1, k * 2.5));
          },
        },
        { // close fingers
          dur: 0.35,
          update: (k) => (openAmt = 1 - k),
          onEnd: () => (grabbed = target),
        },
        { // lift
          dur: 0.7,
          update: (k) => (cableLen = lerp(grabLen, MIN_CABLE, easeInOut(k))),
        },
        { // carry to the chute
          dur: 1.0,
          update: (k) => {
            const e = easeInOut(k);
            clawX = lerp(tx, HOLE.x, e);
            clawZ = lerp(tz, HOLE.z, e);
          },
        },
        { // release
          dur: 0.3,
          update: (k) => (openAmt = k),
          onStart: () => {
            grabbed = null;
            fallY0 = RAIL_Y - MIN_CABLE - 0.3;
          },
        },
        { // free fall into the chute
          dur: 0.65,
          update: (k) => {
            const t = k * 0.65;
            target.position.set(HOLE.x, fallY0 - 4.9 * t * t, HOLE.z);
          },
          onEnd: () => {
            // "refill" the pit: respawn the capsule back onto the pile
            target.visible = false;
            const p = restingSpot(target);
            target.position.set(p.x, p.y, p.z);
            tumble(target);
            target.visible = true;
          },
        },
        { // prize pops out of the dispenser
          dur: 0.9,
          onStart: () => {
            const prizeMat = track(
              new THREE.MeshPhysicalMaterial({
                color: rarityColor,
                roughness: 0.08,
                clearcoat: 1,
                clearcoatRoughness: 0.12,
                emissive: rarityColor,
                emissiveIntensity: 0.8,
              }),
            );
            prize = makeCapsule(prizeMat);
            prize.position.set(HOLE.x, 0.35, 1.7);
            scene.add(prize);
            prizeLight = new THREE.PointLight(new THREE.Color(rarityColor), 0, 4);
            prizeLight.position.set(HOLE.x, 0.6, 2.1);
            scene.add(prizeLight);
          },
          update: (k) => {
            if (!prize || !prizeLight) return;
            prize.scale.setScalar(Math.min(1, k * 4));
            prize.position.z = 1.7 + 0.75 * k;
            prize.position.y = CAP_R + Math.abs(Math.sin(k * Math.PI * 1.5)) * 0.4 * (1 - k);
            prize.rotation.x += 0.1;
            prizeLight.intensity = k < 0.25 ? (k / 0.25) * 9 : 9 - ((k - 0.25) / 0.75) * 6;
          },
        },
      ];
      seq = {
        steps,
        i: -1,
        t: 0,
        onDone: () => {
          pulling = false;
          onDone();
        },
      };
    };

    // ---- render loop ----------------------------------------------------------
    let prevMs = performance.now();
    let t = 0;
    let mx = 0;
    let my = 0;
    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouse);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const nowMs = performance.now();
      const dt = Math.min((nowMs - prevMs) / 1000, 0.05);
      prevMs = nowMs;
      t += dt;

      // advance the pull sequence
      if (seq) {
        if (seq.i === -1) {
          seq.i = 0;
          seq.steps[0].onStart?.();
        }
        seq.t += dt;
        let s = seq.steps[seq.i];
        while (seq && seq.t >= s.dur) {
          s.update(1);
          s.onEnd?.();
          seq.t -= s.dur;
          seq.i++;
          if (seq.i >= seq.steps.length) {
            const done = seq.onDone;
            seq = null;
            done?.();
            break;
          }
          s = seq.steps[seq.i];
          s.onStart?.();
        }
        if (seq) s.update(Math.min(1, seq.t / s.dur));
      }

      // idle: slow patrol over the pit, breathing fingers, gentle cable bob
      if (!pulling) {
        const ix = 0.5 + Math.sin(t * 0.32) * 0.5;
        const iz = 0.5 + Math.cos(t * 0.23) * 0.45;
        clawX += (ix - clawX) * Math.min(1, dt * 0.7);
        clawZ += (iz - clawZ) * Math.min(1, dt * 0.7);
        cableLen = MIN_CABLE + (Math.sin(t * 0.9) * 0.5 + 0.5) * 0.14;
        openAmt = 0.75 + Math.sin(t * 1.3) * 0.25;
      }
      clawGroup.position.set(clawX, RAIL_Y, clawZ);
      crossRail.position.z = clawZ;
      cable.scale.y = cableLen;
      head.position.y = -cableLen;
      // subtle pendulum swing on the claw head
      head.rotation.z = Math.sin(t * 1.4) * 0.045;
      head.rotation.x = Math.cos(t * 1.1) * 0.045;
      for (const p of fingerPivots) p.rotation.x = -(0.16 + 0.42 * openAmt);
      if (grabbed) grabbed.position.set(clawX, RAIL_Y - cableLen - 0.3, clawZ);

      gem.rotation.y = t * 0.8;
      (gem.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.5 + Math.sin(t * 2.5) * 0.6;

      // rune circle spin + pulse, motes drift upward
      rune.rotation.z = t * 0.12;
      runeMat.opacity = 0.5 + Math.sin(t * 1.6) * 0.15;
      const mp = moteGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < MOTES; i++) {
        const m = moteBase[i];
        const y = (m.y0 + t * m.speed) % 5.5;
        mp.setY(i, y);
        mp.setX(i, m.x + Math.sin(t * 0.5 + i) * 0.15);
      }
      mp.needsUpdate = true;
      moteMat.opacity = 0.55 + Math.sin(t * 2) * 0.15;
      if (prizeLight && !pulling) prizeLight.intensity = 2.5 + Math.sin(t * 4) * 1.2;
      if (prize && !pulling) prize.rotation.y = t * 0.6;

      // camera parallax
      camera.position.x += (mx * 0.7 - camera.position.x) * 0.04;
      camera.position.y += (3.3 - my * 0.35 - camera.position.y) * 0.04;
      camera.lookAt(lookAt);

      renderer.render(scene, camera);
    };
    animate();

    // ---- resize / cleanup -------------------------------------------------------
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      // on narrow (portrait) screens pull the camera back so the whole
      // machine still fits horizontally
      const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      camera.position.z = Math.max(7.9, 2.35 / halfW);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      clearPrize();
      tufts.dispose();
      for (const d of disposables) d.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}
