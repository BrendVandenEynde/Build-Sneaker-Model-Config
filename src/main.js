import * as THREE from '../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { gsap } from '../node_modules/gsap/index.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMap = cubeTextureLoader.load([
    '/cubeMap/px.png', '/cubeMap/nx.png',
    '/cubeMap/py.png', '/cubeMap/ny.png',
    '/cubeMap/pz.png', '/cubeMap/nz.png'
]);
scene.background = environmentMap;

const stepMapping = [
    { name: "Edit Laces", layer: "laces" },
    { name: "Edit Inside", layer: "inside" },
    { name: "Edit Shoe Cover", layer: "outside_1" },
    { name: "Edit heel tab", layer: "outside_2" },
    { name: "Quarter + inner outlining ", layer: "sole_1" },
    { name: "Edit Sole", layer: "sole_2" }
];

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const gltfLoader = new GLTFLoader();
let shoeBox, mixer;
let compressedShoe;
let currentStep = 1;
let intersectedObject = null;

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const availableColors = [
    "white", "red", "orange", "yellow", "green",
    "blue", "indigo", "violet", "pink", "black", "gray"
];

function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex];
}

gltfLoader.load('/model/shoeBoxSwear.glb', (gltf) => {
    shoeBox = gltf.scene;
    shoeBox.position.set(0, -1, 0);
    shoeBox.rotation.y = Math.PI / 2;
    shoeBox.scale.set(4, 4, 4);
    scene.add(shoeBox);

    // If the model has animations, set up an animation mixer
    if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(shoeBox);
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });
    }

    // Ensure the box lid name is correct
    shoeBox.traverse((child) => {
        if (child.isMesh) {
            console.log('Mesh name:', child.name); // Log mesh names
        }
    });

    openBoxLid(); // Open the box lid by default

    // Create a clock for the animation loop
    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        const delta = clock.getDelta(); // seconds.
        if (mixer) mixer.update(delta); // Update only if mixer exists
        renderer.render(scene, camera);
    };
    animate();
}, undefined, (error) => {
    console.error('Error loading nike_shoe_box.glb:', error);
});

gltfLoader.load('/model/shoe-optimized-arne.glb', (gltf) => {
    compressedShoe = gltf.scene;
    compressedShoe.position.set(0, 0.4, 0);
    compressedShoe.rotation.x = Math.PI / 4;
    compressedShoe.scale.set(0.5, 0.5, 0.5);

    compressedShoe.traverse((child) => {
        if (child.isMesh) {
            const randomColorName = getRandomColor();
            const color = new THREE.Color(randomColorName);
            child.material = new THREE.MeshStandardMaterial({ color });
        }
    });

    scene.add(compressedShoe);

    gsap.to(compressedShoe.position, {
        y: 0.3,
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

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (compressedShoe) {
        const intersects = raycaster.intersectObjects(compressedShoe.children, true);
        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;

            const clickedLayer = stepMapping.find(step => step.layer === selectedObject.name);
            if (clickedLayer) {
                currentStep = stepMapping.indexOf(clickedLayer) + 1;
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

function updateLayer(layerName, newMaterial) {
    if (!compressedShoe) return;
    compressedShoe.traverse((child) => {
        if (child.isMesh && child.name === layerName) {
            child.material = newMaterial;
        }
    });
}

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

const orderForm = document.getElementById('order-form');

document.getElementById('prev-button').addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateStepIndicator();
    }
});

document.getElementById('next-button').addEventListener('click', () => {
    if (currentStep < 7) {
        currentStep++;
        updateStepIndicator();
    }
});

// Function to update the step indicator
function updateStepIndicator() {
    document.getElementById('current-step').textContent = currentStep;

    if (currentStep <= 6) {
        const layerName = stepMapping[currentStep - 1].name;
        document.getElementById('main-text').textContent = layerName;
        orderForm.classList.remove('visible');
    } else if (currentStep === 7) {
        document.getElementById('main-text').textContent = "Complete Your Order";
        orderForm.classList.add('active'); // Show order form for completion
    } else {
        orderForm.classList.remove('active');
    }
}

document.getElementById('main-text').textContent = stepMapping[currentStep - 1].name;

function getCurrentLayerName() {
    const layers = stepMapping.map(step => step.layer);
    return layers[currentStep - 1];
}

// Function to show the overlay
function showOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.color = '#fff';
    overlay.style.fontSize = '2em';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.textContent = "Your order has been send!"; // Customize this text if needed
    document.body.appendChild(overlay);
}

// Final position of the shoe when it goes into the box
const shoeFinalPositionY = -0.9; // Adjust this value to ensure it's inside the box

document.getElementById('complete-order-button').addEventListener('click', () => {
    closeBoxLid(); // Close the box lid before completing the order

    // Remove any existing tweens to prevent conflicts
    gsap.killTweensOf(compressedShoe.position);
    gsap.killTweensOf(compressedShoe.rotation);

    // Animate the shoe going down into the box and rotating it
    gsap.to(compressedShoe.position, {
        y: shoeFinalPositionY, // Move to the desired Y position
        duration: 4, // Duration of the animation (adjust as needed)
        ease: "power1.inOut", // Easing function for smoothness
        onComplete: () => {
            // Ensure the shoe stays at the final position
            compressedShoe.position.y = shoeFinalPositionY; // Set final position explicitly
        }
    });

    gsap.to(compressedShoe.rotation, {
        x: 0, // Set the X rotation to 0 (flat)
        y: 0, // You can also adjust Y if needed
        z: 0, // You can also adjust Z if needed
        duration: 4, // Match the duration to the position animation
        ease: "power1.inOut" // Easing function for smoothness
    });

    showOverlay(); // Show overlay after order completion
});

// Function to open the box lid
function openBoxLid() {
    console.log('Opening the box lid');
    shoeBox.traverse((child) => {
        if (child.isMesh && child.name === "Plane_Plane_002_Material_001_TOP_0") { // Updated name
            // Use GSAP to animate the rotation to -120 degrees
            gsap.to(child.rotation, {
                x: -120 * (Math.PI / 180), // Open to -120 degrees
                duration: 0.1, // Animation duration in seconds
                ease: "power1.inOut" // Easing function for smoothness
            });
        }
    });
    if (mixer) {
        mixer.stopAllAction(); // Stop all animations
    }
}

// Function to close the box lid
function closeBoxLid() {
    console.log('Closing the box lid');
    shoeBox.traverse((child) => {
        if (child.isMesh && child.name === "Plane_Plane_002_Material_001_TOP_0") { // Updated name
            // Use GSAP to animate the rotation to 0 degrees
            gsap.to(child.rotation, {
                x: 0 * (Math.PI / 180), // Close to 0 degrees
                duration: 10, // Animation duration in seconds
                ease: "power1.inOut" // Easing function for smoothness
            });
        }
    });
    if (mixer) {
        mixer.stopAllAction(); // Stop all animations
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
