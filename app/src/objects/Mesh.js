import * as THREE from "three";

export class DiceFactory {
    constructor() {
        this.geometryCache = new Map();
        this.materialCache = new Map();
        
        this.defaultConfig = {
            size: 1,
            cornerRadius: 0.1,
            color: 0xffffff,
            dotColor: 0x000000,
            segments: 32,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        };
    }

    createD6({
        size = this.defaultConfig.size,
        color = this.defaultConfig.color,
        dotColor = this.defaultConfig.dotColor,
        position = this.defaultConfig.position,
        rotation = this.defaultConfig.rotation,
        metalness = 0.3,
        roughness = 0.7
    } = {}) {
        // Create the main cube geometry
        const geometry = new THREE.BoxGeometry(size, size, size);
        
        // Create the main material
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: metalness,
            roughness: roughness
        });

        // Create the main dice mesh
        const diceMesh = new THREE.Mesh(geometry, material);
        
        // Add dots to each face
        this.addDotsToFace(diceMesh, 1, size, dotColor); // Front
        this.addDotsToFace(diceMesh, 2, size, dotColor); // Back
        this.addDotsToFace(diceMesh, 3, size, dotColor); // Top
        this.addDotsToFace(diceMesh, 4, size, dotColor); // Bottom
        this.addDotsToFace(diceMesh, 5, size, dotColor); // Right
        this.addDotsToFace(diceMesh, 6, size, dotColor); // Left

        // Set position and rotation
        diceMesh.position.set(position.x, position.y, position.z);
        diceMesh.rotation.set(rotation.x, rotation.y, rotation.z);

        return diceMesh;
    }

    addDotsToFace(diceMesh, faceNumber, size, dotColor) {
        const dotPositions = this.getDotPositionsForFace(faceNumber, size);
        const dotSize = size * 0.1; // Dot size relative to dice size
        
        dotPositions.forEach(pos => {
            const dotGeometry = new THREE.SphereGeometry(dotSize, 16, 16);
            const dotMaterial = new THREE.MeshStandardMaterial({ 
                color: dotColor,
                metalness: 0.5,
                roughness: 0.5
            });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            
            dot.position.set(pos.x, pos.y, pos.z);
            diceMesh.add(dot);
        });
    }

    getDotPositionsForFace(faceNumber, size) {
        const offset = size * 0.25; // Offset from center for dots
        const positions = [];
        const halfSize = size / 2;

        // Helper function to rotate positions based on face
        const rotatePositions = (positions, face) => {
            switch(face) {
                case 1: // Front - no rotation needed
                    return positions.map(p => ({ x: p.x, y: p.y, z: halfSize }));
                case 2: // Back
                    return positions.map(p => ({ x: -p.x, y: p.y, z: -halfSize }));
                case 3: // Top
                    return positions.map(p => ({ x: p.x, y: halfSize, z: -p.y }));
                case 4: // Bottom
                    return positions.map(p => ({ x: p.x, y: -halfSize, z: p.y }));
                case 5: // Right
                    return positions.map(p => ({ x: halfSize, y: p.y, z: -p.x }));
                case 6: // Left
                    return positions.map(p => ({ x: -halfSize, y: p.y, z: p.x }));
            }
        };

        // Base positions before rotation
        switch(faceNumber) {
            case 1: // One dot in center
                positions.push({ x: 0, y: 0, z: 0 });
                break;
            case 2: // Two dots diagonal
                positions.push(
                    { x: -offset, y: -offset, z: 0 },
                    { x: offset, y: offset, z: 0 }
                );
                break;
            case 3: // Three dots diagonal
                positions.push(
                    { x: -offset, y: -offset, z: 0 },
                    { x: 0, y: 0, z: 0 },
                    { x: offset, y: offset, z: 0 }
                );
                break;
            case 4: // Four dots in corners
                positions.push(
                    { x: -offset, y: -offset, z: 0 },
                    { x: -offset, y: offset, z: 0 },
                    { x: offset, y: -offset, z: 0 },
                    { x: offset, y: offset, z: 0 }
                );
                break;
            case 5: // Five dots (four corners + center)
                positions.push(
                    { x: -offset, y: -offset, z: 0 },
                    { x: -offset, y: offset, z: 0 },
                    { x: 0, y: 0, z: 0 },
                    { x: offset, y: -offset, z: 0 },
                    { x: offset, y: offset, z: 0 }
                );
                break;
            case 6: // Six dots
                positions.push(
                    { x: -offset, y: -offset, z: 0 },
                    { x: -offset, y: 0, z: 0 },
                    { x: -offset, y: offset, z: 0 },
                    { x: offset, y: -offset, z: 0 },
                    { x: offset, y: 0, z: 0 },
                    { x: offset, y: offset, z: 0 }
                );
                break;
        }

        return rotatePositions(positions, faceNumber);
    }
}