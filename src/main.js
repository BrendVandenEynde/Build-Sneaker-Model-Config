import * as THREE from 'three';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMap = cubeTextureLoader.load([
    '/my-threejs-app/cubeMap/px.png', '/my-threejs-app/cubeMap/nx.png',
    '/my-threejs-app/cubeMap/py.png', '/my-threejs-app/cubeMap/ny.png',
    '/my-threejs-app/cubeMap/pz.png', '/my-threejs-app/cubeMap/nz.png'
]);
scene.background = environmentMap;

const stepMapping = [
    { name: "Edit Laces", layer: "laces" },
    { name: "Edit Inside", layer: "inside" },
    { name: "Edit Shoe Cover", layer: "outside_1" },
    { name: "Edit Edges", layer: "outside_2" },
    { name: "Edit Sole / Underside", layer: "sole_1" },
    { name: "Edit Sole / Underside 2", layer: "sole_2" }
];

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const gltfLoader = new GLTFLoader();
let shoeBox, compressedShoe, currentStep = 1;
let intersectedObject = null;

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Available colors array
const availableColors = [
    "white", "red", "orange", "yellow", "green",
    "blue", "indigo", "violet", "pink", "black", "gray"
];

// Function to get a random color from available colors
function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex];
}

// Load the shoe box model
gltfLoader.load('/my-threejs-app/model/nike_shoe_box.glb', (gltf) => {
    shoeBox = gltf.scene;
    shoeBox.position.set(0, 0, 0);
    shoeBox.rotation.y = Math.PI / 2;
    scene.add(shoeBox);
}, undefined, (error) => {
    console.error('Error loading nike_shoe_box.glb:', error);
});

// Load the shoe model
gltfLoader.load('/my-threejs-app/model/shoe-optimized-arne.glb', (gltf) => {
    compressedShoe = gltf.scene;
    compressedShoe.position.set(0, 0.8, 0);
    compressedShoe.rotation.x = Math.PI / 4;
    compressedShoe.scale.set(0.2, 0.2, 0.2);

    // Apply random colors to each mesh from available colors
    compressedShoe.traverse((child) => {
        if (child.isMesh) {
            const randomColorName = getRandomColor(); // Get a random color name
            const color = new THREE.Color(randomColorName); // Convert color name to THREE.Color
            child.material = new THREE.MeshStandardMaterial({ color });
        }
    });

    scene.add(compressedShoe);

    // Add yo-yo animation for the shoe
    gsap.to(compressedShoe.position, {
        y: 0.5,
        duration: 5,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1
    });
}, undefined, (error) => {
    console.error('Error loading shoe-optimized-arne.glb:', error);
});

camera.position.set(0, 2, 0.5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 2;
controls.enableZoom = false;
controls.enablePan = false;

// Event Listener for mouse clicks
window.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both axes
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with the shoe model
    if (compressedShoe) {
        const intersects = raycaster.intersectObjects(compressedShoe.children, true);
        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;

            // Identify the clicked layer and jump to the corresponding step
            const clickedLayer = stepMapping.find(step => step.layer === selectedObject.name);
            if (clickedLayer) {
                currentStep = stepMapping.indexOf(clickedLayer) + 1; // Update current step
                updateStepIndicator();
            }
        }
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Update shoe layer color/material
function updateLayer(layerName, newMaterial) {
    if (!compressedShoe) return;
    compressedShoe.traverse((child) => {
        if (child.isMesh && child.name === layerName) {
            child.material = newMaterial;
        }
    });
}

// UI Event Listeners
document.querySelectorAll('.color').forEach((colorButton) => {
    colorButton.addEventListener('click', (e) => {
        const color = e.target.getAttribute('data-color');
        const layerName = getCurrentLayerName();
        if (layerName) {
            const newMaterial = new THREE.MeshStandardMaterial({ color });
            updateLayer(layerName, newMaterial);
        }
    });
});

document.querySelectorAll('.material').forEach((materialButton) => {
    materialButton.addEventListener('click', (e) => {
        const materialImage = e.target.getAttribute('data-material');
        const texture = new THREE.TextureLoader().load(`/shoeMaterial/${materialImage}.jpg`);
        const newMaterial = new THREE.MeshStandardMaterial({ map: texture });
        const layerName = getCurrentLayerName();
        if (layerName) {
            updateLayer(layerName, newMaterial);
        }
    });
});

// Step Navigation
document.getElementById('prev-button').addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateStepIndicator();
    }
});

document.getElementById('next-button').addEventListener('click', () => {
    if (currentStep < 6) {
        currentStep++;
        updateStepIndicator();
    }
});

// Initialize the main text to the first layer's name
document.getElementById('main-text').textContent = stepMapping[currentStep - 1].name;

function updateStepIndicator() {
    document.getElementById('current-step').textContent = currentStep;
    const layerName = stepMapping[currentStep - 1].name;
    document.getElementById('main-text').textContent = layerName;
}

function getCurrentLayerName() {
    const layers = stepMapping.map(step => step.layer);
    return layers[currentStep - 1];
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
