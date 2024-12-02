import * as THREE from 'three';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Set up the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

// Set up cube map placeholder (environment)
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMap = cubeTextureLoader.load([
    '/my-threejs-app/cubeMap/px.png', // right
    '/my-threejs-app/cubeMap/nx.png', // left
    '/my-threejs-app/cubeMap/py.png', // top
    '/my-threejs-app/cubeMap/ny.png', // bottom
    '/my-threejs-app/cubeMap/pz.png', // front
    '/my-threejs-app/cubeMap/nz.png'  // back
]);
scene.background = environmentMap;

// Load GLTF models
const gltfLoader = new GLTFLoader();
let shoeBox, compressedShoe;

gltfLoader.load('/my-threejs-app/model/nike_shoe_box.glb', (gltf) => {
    shoeBox = gltf.scene;
    scene.add(shoeBox);

    // If the model has animations, set up an animation mixer
    if (gltf.animations && gltf.animations.length) {
        const mixer = new THREE.AnimationMixer(shoeBox);
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });

        // Update the mixer in the animation loop
        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const delta = clock.getDelta(); // seconds.
            mixer.update(delta);
            renderer.render(scene, camera);
        };
        animate();
    }
}, undefined, (error) => {
    console.error('Error loading nike_shoe_box.glb:', error);
});

// Load the second GLB model
gltfLoader.load('/my-threejs-app/model/shoe-optimized-arne.glb', (gltf) => {
    compressedShoe = gltf.scene;
    compressedShoe.position.set(2, 0, 0); // Adjust position if necessary
    scene.add(compressedShoe);
}, undefined, (error) => {
    console.error('Error loading Shoe_compressed.glb:', error);
});

// Position the camera
camera.position.z = 5;

// Animation function for the renderer
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Start animation
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
