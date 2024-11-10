// SceneManager.js
import * as THREE from 'three';
import WebGL from "three/addons/capabilities/WebGL.js";
import { DiceFactory } from './Mesh';

export class SceneManager {
    static instance = null;
    static currentScene = null;

    constructor() {
        if (SceneManager.instance) {
            return SceneManager.instance;
        }

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.scenes = new Map(); // Store different scenes
        this.setupEventListeners();
        


        SceneManager.instance = this;

        return this;
    }

    static getInstance() {
        if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager();
        }
        return SceneManager.instance;
    }

    createScene(sceneName, sceneConfig = {}) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        const sceneData = {
            scene,
            camera,
            objects: new Map(),
            config: sceneConfig,
            initialized: false
        };

        this.scenes.set(sceneName, sceneData);
        return sceneData;
    }

    initializeScene(sceneName) {
        const sceneData = this.scenes.get(sceneName);
        if (!sceneData || sceneData.initialized) return;

        // Set up basic scene elements
        sceneData.camera.position.z = 5;
        this.initializeLighting(sceneData.scene);
        
        if (sceneData.config.includeDice) {
            this.setupDice(sceneData);
        }

        sceneData.initialized = true;
    }

    initializeLighting(scene) {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
    }

    setupDice(sceneData) {
        const diceFactory = new DiceFactory();

        const planeGeometry = new THREE.BoxGeometry(8, 8, 1);
        const planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});

        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

        planeMesh.position.set(0,0,-8);

        sceneData.objects.set("plane", planeMesh);
        sceneData.scene.add(planeMesh);
        
        const dice1 = diceFactory.createD6({
            size: 1,
            color: 0xff0000,
            position: { x: 0, y: 0, z: 0 }
        });
        
        const dice2 = diceFactory.createD6({
            size: 1,
            color: 0xff0000,
            position: { x: 2, y: 2, z: 0 }
        });

        sceneData.objects.set('dice1', dice1);
        sceneData.objects.set('dice2', dice2);
        sceneData.scene.add(dice1);
        sceneData.scene.add(dice2);
    }

    loadScene(sceneName) {
        if (!this.scenes.has(sceneName)) {
            console.error(`Scene ${sceneName} not found`);
            return;
        }

        if (SceneManager.currentScene === sceneName) return;

        // Initialize scene if not already done
        this.initializeScene(sceneName);
        SceneManager.currentScene = sceneName;

        // Start animation for new scene
        this.animate();
    }

    reloadCurrentScene() {
        if (SceneManager.currentScene) {
            const sceneData = this.scenes.get(SceneManager.currentScene);
            // Clear existing objects
            sceneData.objects.clear();
            while(sceneData.scene.children.length > 0) { 
                sceneData.scene.remove(sceneData.scene.children[0]); 
            }
            
            // Reinitialize the scene
            sceneData.initialized = false;
            this.initializeScene(SceneManager.currentScene);
        }
    }

    animate = () => {
        if (!SceneManager.currentScene) return;

        const sceneData = this.scenes.get(SceneManager.currentScene);
        if (!sceneData) return;

        requestAnimationFrame(this.animate);

        // Animate objects in the current scene
        const dice1 = sceneData.objects.get('dice1');
        const dice2 = sceneData.objects.get('dice2');
        
        if (dice1) {
            dice1.rotation.x += 0.01;
            dice1.rotation.y += 0.01;
        }
        
        if (dice2) {
            dice2.rotation.z += 0.01;
            dice2.rotation.y += 0.01;
        }

        this.renderer.render(sceneData.scene, sceneData.camera);
    }

    setupEventListeners() {
        window.addEventListener("resize", () => {
            if (!SceneManager.currentScene) return;
            
            const sceneData = this.scenes.get(SceneManager.currentScene);
            if (sceneData) {
                sceneData.camera.aspect = window.innerWidth / window.innerHeight;
                sceneData.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        });
    }

    checkWebGLSupport() {
        if (!WebGL.isWebGL2Available()) {
            console.error("WebGL2 not available");
            const warning = WebGL.getWebGL2ErrorMessage();
            document.getElementById("container").appendChild(warning);
            return false;
        }
        return true;
    }
}