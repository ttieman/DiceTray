

export class Button {

    constructor (id, type) {
        this.btn = document.getElementById(id);
        this.btn.addEventListener("click", () => {

            console.log(type);

        });
    }
    
}

