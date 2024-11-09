
// Scene.js
import * as THREE from 'three';
import WebGL from "three/addons/capabilities/WebGL.js";
import { DiceFactory } from './Mesh';

export class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.camera.position.z = 5;

        // Initialize everything
        this.initializeLighting();
        this.setupDice();
        this.handleResize();
        
        // Start animation
        this.animate();
    }

    initializeLighting() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light for better visibility
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
    }

    setupDice() {
        this.diceFactory = new DiceFactory();
        this.dice = this.diceFactory.createD6({
            size: 1,
            color: 0xff0000,
            position: { x: 0, y: 0, z: 0 }
        });

        
        
        this.scene.add(this.dice);
        this.dice2 = this.diceFactory.createD6({
            size: 1,
            color: 0xff0000,
            position: { x: 2, y: 2, z: 0 }
        });
        this.scene.add(this.dice2);
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        if (this.dice) {
            this.dice.rotation.x += 0.01;
            this.dice.rotation.y += 0.01;
            this.dice2.rotation.z += 0.01;
            this.dice2.rotation.y += 0.01;
        }

        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    start() {
        if (WebGL.isWebGL2Available()) {
            console.log("WebGL2 Available, starting animation...");
            this.animate();
        } else {
            console.error("WebGL2 not available");
            const warning = WebGL.getWebGL2ErrorMessage();
            document.getElementById("container").appendChild(warning);
        }
    }
}

