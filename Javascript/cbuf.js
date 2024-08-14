class Dequeue {
    constructor(bufferLength, initialValue) {
        this.buffer = [bufferLength];
        this.bufferLength = bufferLength;
    }

    push(element) {
        for (let i = 0; i < this.bufferLength-1; i++) {
            this.buffer[i] = this.buffer[i+1];
        }
        this.buffer[this.bufferLength-1] = element;
    }

    get(i) {
        return this.buffer[i];
    }

    //Gets the ith element before last one 
    getLast(i) {
        return this.buffer[this.pointer+this.bufferLength-1-i];
    }
}