import { useEffect, useRef, memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as THREE from 'three';

const HeroSection = memo(function HeroSection() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create celestial sphere wireframes
    const createCelestialSphere = (radius, detail) => {
      const group = new THREE.Group();
      const mat = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.6, transparent: true });

      // Latitude lines
      for (let i = 1; i < 8; i++) {
        const phi = (i / 8) * Math.PI;
        const r = radius * Math.sin(phi);
        const y = radius * Math.cos(phi);
        const curve = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0);
        const points = curve.getPoints(64);
        const geo = new THREE.BufferGeometry().setFromPoints(
          points.map((p) => new THREE.Vector3(p.x, y, p.y))
        );
        group.add(new THREE.Line(geo, mat));
      }

      // Longitude lines
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const points = [];
        for (let j = 0; j <= 64; j++) {
          const phi = (j / 64) * Math.PI;
          points.push(new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(angle),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(angle)
          ));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        group.add(new THREE.Line(geo, mat));
      }

      // Ecliptic (tilted ring)
      const eclipticPoints = [];
      for (let i = 0; i <= 128; i++) {
        const t = (i / 128) * Math.PI * 2;
        eclipticPoints.push(new THREE.Vector3(
          radius * 0.95 * Math.cos(t),
          0,
          radius * 0.95 * Math.sin(t)
        ));
      }
      const eclipticGeo = new THREE.BufferGeometry().setFromPoints(eclipticPoints);
      const ecliptic = new THREE.Line(eclipticGeo, new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.35, transparent: true }));
      ecliptic.rotation.x = 0.4;
      group.add(ecliptic);

      return group;
    };

    const sphere1 = createCelestialSphere(2.2, 16);
    const sphere2 = createCelestialSphere(1.4, 12);
    sphere2.position.x = 0.3;
    sphere2.position.y = -0.2;

    scene.add(sphere1);
    scene.add(sphere2);

    // Glitch canvas overlay
    const glitchCanvas = document.createElement('canvas');
    glitchCanvas.width = w;
    glitchCanvas.height = h;
    glitchCanvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;opacity:0.15';
    container.appendChild(glitchCanvas);
    const gCtx = glitchCanvas.getContext('2d');

    let frameId;
    const animate = (time) => {
      frameId = requestAnimationFrame(animate);
      const t = time * 0.001;

      sphere1.rotation.y = t * 0.15;
      sphere1.rotation.x = Math.sin(t * 0.08) * 0.1;
      sphere2.rotation.y = -t * 0.22;
      sphere2.rotation.z = t * 0.1;

      renderer.render(scene, camera);

      // Glitch effect
      gCtx.clearRect(0, 0, w, h);
      if (Math.random() < 0.08) {
        const gw = w * (0.05 + Math.random() * 0.3);
        const gh = 1 + Math.random() * 3;
        const gx = Math.random() * w;
        const gy = Math.random() * h;
        gCtx.fillStyle = '#D5BEE1';
        gCtx.fillRect(gx, gy, gw, gh);
      }
      if (Math.random() < 0.03) {
        for (let i = 0; i < 3; i++) {
          const lx = Math.random() * w;
          const ly = Math.random() * h;
          gCtx.fillStyle = 'rgba(213,190,225,0.4)';
          gCtx.fillRect(lx, ly, Math.random() * 60, 1);
        }
      }
    };
    animate(0);

    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      glitchCanvas.width = nw;
      glitchCanvas.height = nh;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      container.removeChild(glitchCanvas);
    };
  }, []);

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        height: { xs: '70vh', md: '85vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Box
        ref={mountRef}
        sx={{
          position: 'absolute',
          inset: 0,
        }}
      />
      <Box sx={{ position: 'relative', textAlign: 'center', zIndex: 1, pointerEvents: 'none' }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#1a1a1a',
            fontSize: { xs: '2rem', md: '3.5rem' },
            mb: 1,
          }}
        >
          REP0SIT0RY
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', letterSpacing: '0.1em', fontSize: '0.9rem' }}
        >
          archive &middot; memo &middot; record
        </Typography>
      </Box>
    </Box>
  );
});

export default HeroSection;
