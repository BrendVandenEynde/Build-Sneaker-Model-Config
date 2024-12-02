import * as THREE from 'three';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Import OrbitControls

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

// Add lighting to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Bright white light
directionalLight.position.set(5, 10, 7.5); // Position of the light
directionalLight.castShadow = true; // Enable shadows
scene.add(directionalLight);

// Load GLTF models
const gltfLoader = new GLTFLoader();
let shoeBox, compressedShoe;

gltfLoader.load('/my-threejs-app/model/nike_shoe_box.glb', (gltf) => {
    shoeBox = gltf.scene;
    shoeBox.position.set(0, 0, 0); // Move the shoe box closer to the camera
    shoeBox.rotation.y = Math.PI / 2; // Rotate the shoe box 90 degrees to the left
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
    compressedShoe.position.set(0, 0.8, 0); // Move the shoe closer to the camera above the box
    compressedShoe.rotation.x = Math.PI / 4; // Increased tilt backwards (45 degrees)
    compressedShoe.scale.set(0.2, 0.2, 0.2); // Scale the shoe down to 30%
    scene.add(compressedShoe);

    // Create a yo-yo effect animation for the shoe
    gsap.to(compressedShoe.position, {
        y: 0.5, // Move up
        duration: 5,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1 // Repeat indefinitely
    });
}, undefined, (error) => {
    console.error('Error loading Shoe_compressed.glb:', error);
});

// Position the camera closer to the objects
camera.position.set(0, 1, 0.5); // Move the camera closer for a zoomed-in effect

// Add OrbitControls for camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation effect
controls.dampingFactor = 0.25; // smooth dampening
controls.screenSpacePanning = false; // prevent panning
controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation
controls.minPolarAngle = Math.PI / 2; // Keep vertical angle fixed
controls.enableZoom = false;   // Disable zoom
controls.enablePan = false;    // Disable panning

// Animation function for the renderer
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls on each frame
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
