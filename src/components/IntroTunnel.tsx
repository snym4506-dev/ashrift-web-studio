import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function IntroTunnel({ onDone }: { onDone: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060f, 0.04);

    const camera = new THREE.PerspectiveCamera(78, w / h, 0.1, 1000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x05060f, 1);
    el.appendChild(renderer.domElement);

    // Tunnel rings
    const rings: THREE.LineSegments[] = [];
    const ringCount = 60;
    for (let i = 0; i < ringCount; i++) {
      const geo = new THREE.EdgesGeometry(new THREE.TorusGeometry(3, 0.04, 6, 48));
      const hue = i / ringCount;
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(0.55 + hue * 0.25, 0.9, 0.6),
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.LineSegments(geo, mat);
      ring.position.z = -i * 4;
      ring.rotation.z = i * 0.15;
      scene.add(ring);
      rings.push(ring);
    }

    // Particle stars
    const starCount = 800;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 2.5 + Math.random() * 1.5;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.sin(a) * r;
      positions[i * 3 + 2] = -Math.random() * 240;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x9ee7ff, size: 0.05, transparent: true });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    let raf = 0;
    const start = performance.now();
    const DURATION = 3200;

    const tick = () => {
      const t = performance.now() - start;
      const p = Math.min(t / DURATION, 1);
      // ease-in-out cubic
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

      // accelerate forward
      const speed = 0.4 + eased * 2.2;
      rings.forEach((r) => {
        r.position.z += speed;
        r.rotation.z += 0.003;
        if (r.position.z > 5) r.position.z -= ringCount * 4;
        (r.material as THREE.LineBasicMaterial).opacity = 0.85 * (1 - p * 0.6);
      });

      const sp = stars.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < starCount; i++) {
        sp.array[i * 3 + 2] = (sp.array[i * 3 + 2] as number) + speed * 1.4;
        if ((sp.array[i * 3 + 2] as number) > 2) sp.array[i * 3 + 2] = -240;
      }
      sp.needsUpdate = true;

      // FOV zoom for warp feel
      camera.fov = 78 + eased * 28;
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);

      if (p >= 1) {
        setHide(true);
        setTimeout(onDone, 600);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      rings.forEach((r) => { r.geometry.dispose(); (r.material as THREE.Material).dispose(); });
      starGeo.dispose();
      starMat.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-700 ${hide ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      style={{ background: "#05060f" }}
    >
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="font-display text-5xl md:text-7xl font-bold tracking-[0.2em] text-white/90 animate-pulse">
          ASHRIFT
        </div>
        <div className="mt-4 font-mono text-xs uppercase tracking-[0.4em] text-cyan-300/70">
          Entering the studio
        </div>
      </div>
    </div>
  );
}
