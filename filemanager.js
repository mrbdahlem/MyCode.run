var FileManager = new function() {
    this.files = [];
    this.currentFile = null;
    this.mainFile = "";
    this.filelist = null;
    this.editor = null;
    
    this.getNumFiles = function () {
        return this.files.length;
    }
    
    this.addFile = function(file) {
        this.files.push(file);
        this.files.sort(function(a,b){return (b.name<a.name) ? 1 : -1; });
        this.updateDisplay();
    };
    
    this.getFile = function(num) {
        if (num === undefined | num === null) {
            return this.currentFile;
        }
        return this.files[num];
    }
    
    this.removeFile = function(filename) {
        filename = filename || this.currentFile.name;
        
        for (var i = this.files.length - 1; i >= 0; i--) {
            if (this.files[i].name === filename) {
                this.files.splice(i, 1);
            }
        }
        
        if (this.files.length === 0) {
            this.files.push(new SourceFile("New.java"));
            this.mainFile = "New.java";
        }
        
        this.currentFile = this.files[0];
        this.updateDisplay();
    };
    
    this.updateFile = function(contents, file) {
        file = file || this.currentFile;
        
        if (file !== null) {
            file.contents = contents;
        }
    };
    
    this.renameFile = function(newName, file) {
        file = file || this.currentFile;
                
        if (file !== null) {
            file.name = newName;
        }
        
        this.updateDisplay();
    };
    
    this.getFileContents = function(fileName) {
        for (var i = 0; i < this.files.length; i++) {
            if (this.files[i].name === fileName) {
                return this.files[i].contents;
            }
        }
        return null;
    };
    
    this.setCurrentFile = function(fileName) {
        for (var i = 0; i < this.files.length; i++) {
            if (this.files[i].name === fileName) {
                this.currentFile = this.files[i];        
                this.updateDisplay();
                return this.files[i].contents;
            }
        }
        return null;  
    };
    
    this.setMainFile = function(fileName) {
        this.mainFile = fileName || this.currentFile.name;
        
        this.updateDisplay();
    };
    
    this.getMainFile = function() {
        return this.mainFile;
    };
    
    this.setFileList = function(el) {
        this.filelist = $(el);
        
        this.updateDisplay();
    };
    
    this.setEditor = function(ed) {
        this.editor = ed;
    };
    
    this.updateDisplay = function() {
        if (this.editor !== null) {
            this.editor.setValue(this.currentFile.contents, 1);
        }
        
        if (this.filelist !== null) {
            this.filelist.empty();
            
            for (var i = 0; i < this.files.length; i++) {
                var f = document.createElement('a');
                $(f).text(this.files[i].name)
                    .addClass('list-group-item');
                
                if (this.files[i].name === this.mainFile) {
                    var star = document.createElement('span');
                    $(star).addClass('glyphicon')
                           .addClass('glyphicon-star-empty');
                   
                    $(f).html($(f).text() + '&nbsp;');
                    $(f).append(star);
                }
                
                if (this.files[i] === this.currentFile) {
                    $(f).addClass('active');
                }
                else {
                    $(f).addClass('list-group-action')
                        .attr('data-filename', this.files[i].name)
                        .click(function() {
                            FileManager.setCurrentFile($(this).attr('data-filename'));    
                        });
                }
                $(this.filelist).append(f);
            }
        }
    };
};

function SourceFile(name, content) {
    if (name) {
        this.name = name;
    }
    else {
        this.name = "";
    }   
    if (content) {
        this.contents = content;
    }
    else {
        this.contents = "";
    }
}
