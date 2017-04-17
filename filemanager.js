var FileManager = new function() {
    this.files = [];
    this.currentFile = null;

    this.addFile = function(file) {
        this.files.push(file);
    };
    
    this.removeFile = function(filename) {
        for (var i = this.file.length - 1; i >= 0; i--) {
            if (this.files[i].name === filename) {
                this.files.splice(i, 1);
            }
        }
    };
    
    this.update = function(contents, file) {
        if (file === null) {
            file = this.currentFile;
        }
        
        if (file !== null) {
            file.contents = contents;
        }
    };
    
    this.renameFile = function(newName, file) {
        if (file === null) {
            file = this.currentFile;
        }
        
        if (file !== null) {
            file.name = newName;
        }
    };
    
    this.getFileContents = function(fileName) {
        for (var i = 0; i < this.files.length; i++) {
            if (files[i].name === fileName) {
                return files[i].contents;
            }
        }
        return null;
    };
};

function SourceFile() {
    this.name = "";
    this.contents = "";
    this.editor = null;
}

var mainFile = null;
