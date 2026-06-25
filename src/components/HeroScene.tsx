import { useEffect, useRef } from "react";
import * as THREE from "three";

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a14, 0.08);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Central icosahedron with wireframe
    const geo = new THREE.IcosahedronGeometry(2, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x4ad6ff,
      emissive: 0x6a3dff,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: false,
    });
    const core = new THREE.Mesh(geo, mat);
    scene.add(core);

    const wireGeo = new THREE.IcosahedronGeometry(2.4, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xb45cff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // Orbiting rings
    const ringGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(3.2 + i * 0.4, 0.015, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x4ad6ff : 0xb45cff,
        transparent: true,
        opacity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      ring.userData = { speed: 0.002 + i * 0.001, axis: i };
      ringGroup.add(ring);
    }
    scene.add(ringGroup);

    // Particle field
    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 6 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x9bc7ff,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Lights
    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambient);
    const point1 = new THREE.PointLight(0x4ad6ff, 80, 30);
    point1.position.set(5, 5, 5);
    scene.add(point1);
    const point2 = new THREE.PointLight(0xb45cff, 80, 30);
    point2.position.set(-5, -3, 4);
    scene.add(point2);

    // Mouse interaction
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      core.rotation.x = t * 0.15 + mouse.y * 0.3;
      core.rotation.y = t * 0.2 + mouse.x * 0.3;
      wire.rotation.x = -t * 0.1;
      wire.rotation.y = -t * 0.15;

      const scale = 1 + Math.sin(t * 1.5) * 0.04;
      core.scale.setScalar(scale);

      ringGroup.children.forEach((ring, i) => {
        const r = ring as THREE.Mesh;
        r.rotation.x += 0.003 + i * 0.001;
        r.rotation.y += 0.002 + i * 0.0015;
      });

      particles.rotation.y = t * 0.03;
      particles.rotation.x = t * 0.02;

      camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 1.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
