'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		particles: THREE.Points[];
		animationId: number;
		count: number;
	} | null>(null);

	useEffect(() => {
		console.log('[DottedSurface] effect mounted, container:', containerRef.current);

		if (!containerRef.current) {
			console.log('[DottedSurface] containerRef is null, bailing out');
			return;
		}

		const SEPARATION = 120;
		const AMOUNTX = 60;
		const AMOUNTY = 80;

		// Scene setup
		const scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0xffffff, 2000, 10000);

		const camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			1,
			10000,
		);
		camera.position.set(0, 400, 900);
		camera.lookAt(0, 0, -1200);

		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(scene.fog.color, 0);

		containerRef.current.appendChild(renderer.domElement);
		console.log('[DottedSurface] canvas appended, size:', window.innerWidth, window.innerHeight);

		// Create particles
		const particles: THREE.Points[] = [];
		const positions: number[] = [];
		const colors: number[] = [];

		// Create geometry for all particles
		const geometry = new THREE.BufferGeometry();

		for (let ix = 0; ix < AMOUNTX; ix++) {
			for (let iy = 0; iy < AMOUNTY; iy++) {
				const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
				const y = 0; // Will be animated
				const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

				positions.push(x, y, z);
				// Cyan dots (matches --primary: hsl(186 100% 55%)), values normalized 0-1
				colors.push(0.13, 0.9, 0.95);
			}
		}

		geometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(positions, 3),
		);
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

		// Create material
		const material = new THREE.PointsMaterial({
			size: 6,
			vertexColors: true,
			transparent: true,
			opacity: 0.9,
			sizeAttenuation: true,
		});

		// Create points object
		const points = new THREE.Points(geometry, material);
		scene.add(points);

		let count = 0;
		let animationId: number = 0;
		let active = true;
		let frameCounter = 0;

		// Animation function
		const animate = () => {
			if (!active) {
				console.log('[DottedSurface] animate() called but active=false, stopping');
				return;
			}
			animationId = requestAnimationFrame(animate);

			const positionAttribute = geometry.attributes.position;
			const positions = positionAttribute.array as Float32Array;

			let i = 0;
			for (let ix = 0; ix < AMOUNTX; ix++) {
				for (let iy = 0; iy < AMOUNTY; iy++) {
					const index = i * 3;

					// Animate Y position with sine waves
					positions[index + 1] =
    Math.sin((ix + count) * 0.3) * 40 +
    Math.sin((iy + count) * 0.5) * 40;

					i++;
				}
			}

			positionAttribute.needsUpdate = true;

			renderer.render(scene, camera);
			count += 0.1;

			frameCounter++;
			if (frameCounter % 60 === 0) {
				console.log('[DottedSurface] frame tick, count =', count.toFixed(1), 'frameCounter =', frameCounter);
			}
		};

		// Handle window resize
		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};

		window.addEventListener('resize', handleResize);

		// Start animation
		animate();

		// Store references
		sceneRef.current = {
			scene,
			camera,
			renderer,
			particles: [points],
			animationId,
			count,
		};

		// Cleanup function
		return () => {
			console.log('[DottedSurface] cleanup / unmount running');
			active = false;
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationId);

			if (sceneRef.current) {
				// Clean up Three.js objects
				sceneRef.current.scene.traverse((object: THREE.Object3D) => {
					if (object instanceof THREE.Points) {
						object.geometry.dispose();
						if (Array.isArray(object.material)) {
							object.material.forEach((material: THREE.Material) => material.dispose());
						} else {
							object.material.dispose();
						}
					}
				});

				sceneRef.current.renderer.dispose();

				if (containerRef.current && sceneRef.current.renderer.domElement) {
					try {
						containerRef.current.removeChild(
							sceneRef.current.renderer.domElement,
						);
					} catch (e) {
						console.log('[DottedSurface] removeChild failed:', e);
					}
				}
			}
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn('pointer-events-none fixed inset-0 -z-[1]', className)}
			{...props}
		/>
	);
}