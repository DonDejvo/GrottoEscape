export const textbox = (() => {

    class TextboxHandler {
        constructor(params) {
            this._domElement = params.domElement;
            this._path = params.path;
            this._messages = [];
            this._blocked = false;

            this._domElement.style.display = "none";

            this._images = new Map();
            for(let label in params.images) {
                const img = document.createElement("img");
                img.setAttribute("src", this._path + "/" + params.images[label]);
                this._images.set(label, img);
            }
        }
        AddMessage(image, text) {
            this._messages.push({
                image: image,
                text: text
            });
        }
        _CreateTextbox() {
            if(this._messages.length === 0) {
                return;
            }
            this._domElement.style.display = "block";
            this._blocked = true;
            const message = this._messages.shift();
            this._domElement.innerHTML = "";

            const imageContainer = document.createElement("div");
            imageContainer.classList.add("textbox-image");
            imageContainer.appendChild(this._images.get(message.image));

            this._domElement.appendChild(imageContainer);

            const textContainer = document.createElement("div");
            textContainer.classList.add("textbox-text");

            const text = document.createElement("p");
            text.textContent = message.text;
            textContainer.appendChild(text);

            this._domElement.appendChild(textContainer);
            
        }
        NextMessage() {
            this._blocked = false;
            this._CreateTextbox();
            if(!this._blocked) {
                this._domElement.style.display = "none";
            }
        }
    }

    return {
        TextboxHandler: TextboxHandler
    };

})();