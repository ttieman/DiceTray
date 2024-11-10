// SceneManager.js
import * as THREE from 'three';
import WebGL from "three/addons/capabilities/WebGL.js";
import { DiceFactory } from './Mesh';
import * as RAPIER from '@dimforge/rapier3d/rapier';

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
        this.physicsWorld = null;
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
            physicsObjects: new Map(),
            objects: new Map(),
            config: sceneConfig,
            initialized: false
        };

        
        this.scenes.set(sceneName, sceneData);
        return sceneData;
    }

    async initializeScene(sceneName) {
        const sceneData = this.scenes.get(sceneName);
        if (!sceneData || sceneData.initialized) return;
        
        if(!this.physicsWorld) {
            await this.initializePhysics();
        }
        // Set up basic scene elements
        sceneData.camera.position.z = 5;
        this.initializeLighting(sceneData.scene);
        
        if (sceneData.config.includeDice) {
            this.setupDice(sceneData);
        }

        sceneData.initialized = true;
    }

    async initializePhysics() {
        this.physicsWorld = new RAPIER.World({ x: 0.0, y: 0.0 , z: -4.0 }); 
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
        
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(4, 4, 0.5); // Half-dimensions
        const groundRigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
            .setTranslation(0, 0, -8);
        const groundBody = this.physicsWorld.createRigidBody(groundRigidBodyDesc);
        const groundCollider = this.physicsWorld.createCollider(groundColliderDesc, groundBody);

        sceneData.objects.set("plane", planeMesh);
        sceneData.physicsObjects.set("plane", {
            mesh: planeMesh,
            body: groundBody,
            collider: groundCollider
        });
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

        const dice1BodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(0, 0, 0);
        const dice1Body = this.physicsWorld.createRigidBody(dice1BodyDesc);
        const dice1ColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
        this.physicsWorld.createCollider(dice1ColliderDesc, dice1Body);

        // Add physics for dice2
        const dice2BodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(2, 2, 0);
        const dice2Body = this.physicsWorld.createRigidBody(dice2BodyDesc);
        const dice2ColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
        this.physicsWorld.createCollider(dice2ColliderDesc, dice2Body);


        sceneData.objects.set('dice1', dice1);
        sceneData.objects.set('dice2', dice2);

        sceneData.physicsObjects.set('dice1', {
            mesh: dice1,
            body: dice1Body
        });
        sceneData.physicsObjects.set('dice2', {
            mesh: dice2,
            body: dice2Body
        });

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
            
            // Clear physics objects
            sceneData.physicsObjects.forEach((physObj) => {
                if (physObj.body) {
                    this.physicsWorld.removeRigidBody(physObj.body);
                }
            });
            sceneData.physicsObjects.clear();
            
            // Clear visual objects
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

        // Step the physics world
        if (this.physicsWorld) {
            this.physicsWorld.step();

            // Update visual objects based on physics
            sceneData.physicsObjects.forEach((physObj, key) => {
                if (physObj.body && physObj.mesh && key !== 'plane') { // Don't update static ground
                    const position = physObj.body.translation();
                    const rotation = physObj.body.rotation();
                    
                    physObj.mesh.position.set(position.x, position.y, position.z);
                    physObj.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
                }
            });
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