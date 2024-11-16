// main.js
import { SceneManager } from "./objects/SceneManager";
import { UiManager } from "./ui";

import * as THREE from "three";
import * as RAPIER from '@dimforge/rapier3d/rapier';


async function main() {
    // Get the scene manager instance
    const manager = new UiManager();
    const sceneManager = SceneManager.getInstance();
    
    // Create initial scene
    sceneManager.createScene('mainScene', { includeDice: true });
    

    await sceneManager.loadScene('mainScene');
   
    
        const currentSceneData = sceneManager.scenes.get('mainScene');

        if (currentSceneData  && currentSceneData.config.includeDice == true) {
            console.log(currentSceneData, "this exists")
            // Create a new sphere
            const sphereGeometry = new THREE.SphereGeometry(0.5);
            const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            
           
           const sphereColliderDesc = RAPIER.ColliderDesc.ball(1);
           const sphereRigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
           
           const sphereBody = sceneManager.physicsWorld.createRigidBody(sphereRigidBodyDesc);
           
           const sphereCollider = sceneManager.physicsWorld.createCollider(sphereColliderDesc,sphereBody);
           
                // Add to scene tracking
            currentSceneData.objects.set('sphere', sphere);
            currentSceneData.physicsObjects.set('sphere', {
                mesh: sphere,
                body: sphereBody,
                collider: sphereCollider
            });

    

            currentSceneData.scene.add(sphere);
            
        }

    }

main().catch(console.error);