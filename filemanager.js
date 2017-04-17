/*
 * A File Manager singleton, manages source files
 */
var FileManager = new function() {
    this.files = [];
    this.currentFile = null;
    this.mainFile = "";
    this.filelist = null;
    this.editor = null;
    
    /*
     * Get the number of files stored in the file manager
     */
    this.getNumFiles = function () {
        return this.files.length;
    };
    
    /*
     * Add a file to the file manager, then alphabetize the file list.
     */
    this.addFile = function(file) {
        this.files.push(file);
        this.files.sort(function(a,b){return (b.name<a.name) ? 1 : -1; });
        this.setCurrentFile(file.name);
        this.updateDisplay();
    };
    
    /*
     * Retrieve a file from the manager by its index
     */
    this.getFile = function(num) {
        if (num === undefined | num === null) {
            return this.currentFile;
        }
        return this.files[num];
    };
    
    /*
     * Remove a file from the manager by its name.  if no name is provided,
     * remove the currently selected file.
     */
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
        
        if (this.mainFile === filename) {
            this.mainFile = this.files[0].name;
        }
        
        this.currentFile = this.files[0];
        this.updateDisplay();
    };
    
    /*
     * Replace the contents of a file in the manager, if no file is
     * provided, updates the currently selected file
     */
    this.updateFile = function(contents, file) {
        file = file || this.currentFile;
        
        if (file !== null) {
            file.contents = contents;
        }
    };
    
    /*
     * Rename a file in the file manager.  If no file is provided, rename the
     * current file.
     */    
    this.renameFile = function(newName, file) {
        file = file || this.currentFile;
        
        if (file.name === this.mainFile) {
            this.mainFile = newName;
        }
                
        if (file !== null) {
            file.name = newName;
        }
        
        this.updateDisplay();
    };
    
    /*
     * Get the contents of a file based on its file name.
     */
    this.getFileContents = function(fileName) {
        for (var i = 0; i < this.files.length; i++) {
            if (this.files[i].name === fileName) {
                return this.files[i].contents;
            }
        }
        return null;
    };
    
    /*
     * Select a file, making it the currently selected file based on its name.
     */
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
    
    /*
     * Select the main file to be run, based on its file name.
     */
    this.setMainFile = function(fileName) {
        this.mainFile = fileName || this.currentFile.name;
        
        this.updateDisplay();
    };
    
    /*
     * Retrieve the main file.
     */
    this.getMainFile = function() {
        return this.mainFile;
    };
    
    /*
     * Set the DOM element that will hold a list of files in the manager
     */
    this.setFileList = function(el) {
        this.filelist = $(el);
        
        this.updateDisplay();
    };
    
    /*
     * Set the editor that will display and edit the currently selected file
     */
    this.setEditor = function(ed) {
        this.editor = ed;
    };
    
    /*
     * Update the file list and the editor to display the names of all files
     * in the manager, and the contents of the currently selected file, 
     * respectively
     */
    this.updateDisplay = function() {
        if (this.editor !== null && this.currentFile !== null) {
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
                           .addClass('glyphicon-play-circle');
                   
                    $(f).html($(star).prop('outerHTML') + '&nbsp;' + $(f).text());
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
            
            if (this.files.length <= 1) {
                $(this.filelist).hide("fast");
            }
            else {
                $(this.filelist).show("fast").css("display", "inline-block");
            }
        }
    };
    
    this.loadFromGist = function(gist) {
        function handleGist(data) {
            Object.keys(data.files).map(function(key){
                var gistFile = new SourceFile(key, data.files[key].content);
                
                FileManager.addFile(gistFile);
                var isMain = /(public\s+static|static\s+public)\s+void\s+main\s*\(\s*String\s*\[\]/;
                if (isMain.test(gistFile.contents)) {
                    FileManager.setMainFile(gistFile.name);
                    
                    console.log(gistFile.name);
                }
                
            });
        }
        
        $.ajax({
            url: 'https://api.github.com/gists/' + gist,
            type: 'get',
            dataType: 'json',
            cache: true,
            success: handleGist,
            async: true
        });
    };
};

/*
 * A simple class that will hold a single source file and its filename
 */
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
