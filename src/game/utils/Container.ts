export class Container {
    private domNode: HTMLDivElement;

    constructor() {
        this.domNode = document.createElement('div');
        this.domNode.style.position = 'absolute';
    }

    removeChildren() {
        this.domNode.innerHTML = '';
    }

    appendChild(child: HTMLElement) {
        this.domNode.appendChild(child);
    }

    getChildren() {
        return this.domNode.children;
    }

    destroy() {
        this.domNode.remove();
    }

    getDomNode() {
        return this.domNode;
    }
}
