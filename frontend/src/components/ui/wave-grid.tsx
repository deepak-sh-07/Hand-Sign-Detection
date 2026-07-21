'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type WaveGridProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function WaveGrid({ className, ...props }: WaveGridProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const WIDTH = 6000;
		const DEPTH = 9000;
		const SEG_X = 70; // vertices across
		const SEG_Y = 100; // vertices in depth

		const scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x000000, 1500, 9000);

		const camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			1,
			10000,
		);
		camera.position.set(0, 500, 1400);
		camera.lookAt(0, -100, -1500);

		const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000, 0);
		containerRef.current.appendChild(renderer.domElement);

		// Build vertex grid (positions) once
		const positions = new Float32Array(SEG_X * SEG_Y * 3);
		const basePos = new Float32Array(SEG_X * SEG_Y * 2); // stores base x,z for each vertex

		let p = 0;
		for (let iy = 0; iy < SEG_Y; iy++) {
			for (let ix = 0; ix < SEG_X; ix++) {
				const x = (ix / (SEG_X - 1) - 0.5) * WIDTH;
				const z = (iy / (SEG_Y - 1) - 0.5) * DEPTH;
				positions[p * 3] = x;
				positions[p * 3 + 1] = 0;
				positions[p * 3 + 2] = z;
				basePos[p * 2] = x;
				basePos[p * 2 + 1] = z;
				p++;
			}
		}

		// Build line-segment index: horizontal + vertical edges only (once)
		const indices: number[] = [];
		const idx = (ix: number, iy: number) => iy * SEG_X + ix;
		for (let iy = 0; iy < SEG_Y; iy++) {
			for (let ix = 0; ix < SEG_X; ix++) {
				if (ix < SEG_X - 1) {
					indices.push(idx(ix, iy), idx(ix + 1, iy));
				}
				if (iy < SEG_Y - 1) {
					indices.push(idx(ix, iy), idx(ix, iy + 1));
				}
			}
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setIndex(indices);

		const material = new THREE.LineBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.35,
		});

		const lines = new THREE.LineSegments(geometry, material);
		scene.add(lines);

		let count = 0;
		let animationId = 0;
		let active = true;

		const animate = () => {
			if (!active) return;
			animationId = requestAnimationFrame(animate);

			const posAttr = geometry.attributes.position as THREE.BufferAttribute;
			const arr = posAttr.array as Float32Array;
			for (let i = 0; i < SEG_X * SEG_Y; i++) {
				const x = basePos[i * 2];
				const z = basePos[i * 2 + 1];
				arr[i * 3 + 1] =
					Math.sin(x * 0.004 + count) * 60 +
					Math.sin(z * 0.003 + count * 0.8) * 60;
			}
			posAttr.needsUpdate = true;

			renderer.render(scene, camera);
			count += 0.012;
		};

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', handleResize);

		animate();

		return () => {
			active = false;
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationId);

			geometry.dispose();
			material.dispose();
			renderer.dispose();

			if (containerRef.current && renderer.domElement) {
				containerRef.current.removeChild(renderer.domElement);
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