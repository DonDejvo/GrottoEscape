export const textbox = (() => {

    class TextboxHandler {
        constructor(params) {
            this._domElement = params.domElement;
            this._path = params.path;
            this._messages = [];
            this._blocked = false;
            this._domElement.style.display = "none";
        }
        AddMessage(imageURL, text) {
            this._messages.push({
                imageURL: imageURL,
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
            this._domElement.innerHTML = `
                <div class="textbox-image">
                    <img src="${this._path + "/" + message.imageURL}" alt="Textbox image">
                </div>
                <div class="textbox-text">
                    <p>${message.text}</p>
                </div>
            `;
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