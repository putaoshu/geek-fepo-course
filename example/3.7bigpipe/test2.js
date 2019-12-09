function test2(id, message) {
    $(id).innerHTML = message;
}

if (BigPipe != undefined) { BigPipe.fileLoaded("test2.js"); }
