import { SceneManager } from "./objects/SceneManager";

function main() {
    const manager = SceneManager.getInstance();

    if(!manager.checkWebGLSupport()) {
        return;
    }

    manager.createScene("mainScene", { includeDice: true});

    manager.loadScene("mainScene");
}

main();

