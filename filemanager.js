/*
 * A File Manager singleton, manages source files
 */
var FileManager = new function() {
    this.folder = new Folder("Files");
    this.currentFile = null;
    this.currentFolder = this.folder;
    this.mainFile = "";
    this.fileDisplays = [];
    this.editor = null;
    
    /*
     * Remove a file from the manager.  if no file is provided,
     * remove the currently selected file.
     */ 
    this.removeFile = function(file) {
        file = file || this.currentFile;
        
        if (file) {
            file.parent.removeFile(file);

            if (this.mainFile === file) {
                this.mainFile = null;
            }

            this.currentFile = null;
        }
        
        this.updateDisplay();
    };
    
   /*
     * Remove a folder from the manager.  if no folder is provided,
     * remove the currently selected folder.
     */ 
    this.removeFolder = function(folder) {
        folder = folder || this.currentFolder;
        
        if (folder && folder !== this.folder) {
            folder.parent.removeFolder(folder);

            this.currentFolder = folder.parent;
        }
        
        this.updateDisplay();
    };
    
    /*
     * Remove all files and folders from this project
     */
    this.empty = function() {
        this.rootFolder = null;
        this.folder = null;
        this.currentFolder = null;
    };
    
    /*
     * Add a file to the current folder
     */
    this.addFile = function(file) {
        this.currentFolder.addFile(file);
        this.setCurrentFile(file);
        this.updateDisplay();
    };
    
    /*
     * Retrieve the current file
     */
    this.getFile = function() {
        return this.currentFile;
    };
    
    /*
     * Add a subfolder to the current folder
     */
    this.addFolder = function(folder) {
        this.currentFolder.addFolder(folder); 
        this.currentFolder = folder;
        this.currentFile = null;
        
        this.updateDisplay();
    };
    
    /*
     * Get a reference to the root folder
     */
    
    this.getRootFolder = function() {
        return this.folder;
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
                        
        if (file !== null) {
            file.name = newName;
        }
        
        this.updateDisplay();
    };
    
    
    /*
     * Rename a folder in the file manager.  If no folder is provided, rename the
     * current folder.
     */
    this.renameFolder = function(newName, folder) {
        folder = folder || this.currentFolder;
        
        if (folder !== null) {
            folder.name = newName;
        }
        
        this.updateDisplay();
    };
    
    /*
     * Get the contents of a file based on its file name.
     */
    this.getFileContents = function(file) {
        return file.contents;
    };
    
    /*
     * Making a file the currently selected file
     */
    this.setCurrentFile = function(file) {
        this.currentFile = file;
    };
    
    /*
     * Making a folder the currently selected folder
     */
    this.setCurrentFolder = function(folder) {
        this.currentFolder = folder;
    };
    
    /*
     * Get a reference to the currently selected folder
     */
    this.getCurrentFolder = function() {
        return this.currentFolder;
    };
    
    /*
     * Select the main file to be run]
     */
    this.setMainFile = function(file) {
        this.mainFile = file || this.currentFile;
        
        this.updateDisplay();
    };
    
    /*
     * Retrieve the main file.
     */
    this.getMainFile = function() {
        return this.mainFile;
    };
    
    /*
     * Add a DOM element which will hold a list of files in the manager
     */
    this.addFileDisplay = function(el) {
        this.fileDisplays.push($(el));
        
        this.updateDisplay();
    };
    
    /*
     * Set the editor that will display and edit the currently selected file
     */
    this.setEditor = function(ed) {
        this.editor = ed;
    };
    
    /*
     * Update the file list and the editor to display the names of all files and
     * folders in the manager, and the contents of the currently selected file, 
     * respectively
     */
    this.updateDisplay = function() {
        // If an editor has been assigned, load the contents of the current file
        // into the editor.
        if (this.editor !== null) {
            if (this.currentFile !== null) {
                this.editor.setReadOnly(false);
                this.editor.setValue(this.currentFile.contents, 1);
            }
            else {
                this.editor.setValue("");
                this.editor.setReadOnly(true);
            } 
        }
        
        // If a fileDisplay has been assigned, add buttons to select each of the
        // files to the list
        this.fileDisplays.forEach(function(element){
            // Clear any contents of the parent element
            $(element).empty();
            
            var list = document.createElement('ul');
            $(list).addClass('list-root');
            $(element).append(list);

            FileManager.displayFolder(list, FileManager.folder);
        });
    };
    
    this.displayFolder = function(element, folder) {          
        var folderEl = document.createElement("li");
        $(folderEl).addClass('folder');
        
        $(element).append(folderEl);
        
        var container = document.createElement('span');
        $(folderEl).append(container);
        
        var icon = document.createElement('span');
        $(icon).addClass('glyphicon');
        
        if (folder === FileManager.currentFolder) {
            $(icon).addClass('glyphicon-folder-open');
        }
        else {
            $(icon).addClass('glyphicon-folder-close');   
        }
        
        $(container).append(icon);
        
        $(container).append('&nbsp;&nbsp;');

        var title = document.createElement("label");
        $(title).addClass('listfolder');
        $(title).text(folder.getName());
        $(container).append(title);
        
        $(container).click(function() {
            FileManager.setCurrentFolder(folder);
            FileManager.setCurrentFile(null);
            FileManager.updateDisplay();
        });

        var ul = document.createElement('ul');
        $(ul).addClass('nav')
             .addClass('nav-list')
             .addClass('tree');
        $(folderEl).append(ul);

        if (FileManager.currentFolder === folder) {
            folder.files.forEach(function(file) {
                FileManager.displayFile(ul, file);
            });
        }
        folder.folders.forEach(function(subfolder) {    
            FileManager.displayFolder(ul, subfolder);
        });
    };
    
    this.displayFile = function(element, file) {
        var item = document.createElement('li');
        $(element).append(item);
        
        var title = document.createElement('label');
        
        // If this file is the main file, add a marker
        if (file === this.mainFile) {
            var star = document.createElement('span');
            $(star).addClass('glyphicon')
                   .addClass('glyphicon-play-circle');

            $(title).append(star);
            $(title).append('&nbsp;');
        }
        
        $(title).append(file.name);
        $(title).addClass('listFile');
        
        if (file === FileManager.currentFile) {
            $(title).addClass('active');
        }
        
        $(item).append(title);
        $(title).click(function() {
            $('.file-List').find('label').removeClass('active');
            FileManager.setCurrentFile(file);
            $(this).addClass('active');
            
            FileManager.updateDisplay();
        });
    };
      
    
    /*
     * Download all of the files from a Gist, chosen by id
     */
    this.loadFromGist = function(gist, main, errorhandler) {

        function handleGist(data) {
            FileManager.empty();
            
            /*
            // If a main file was specified, set it
            if (main !== null) {
                FileManager.setMainFile(main);
            }
            */
           
            FileManager.folder = new Folder("Files");
            FileManager.currentFolder = FileManager.folder;
            
            // Extract each of the files in the gist
            Object.keys(data.files).map(function(key){
                var gistFile = new SourceFile(key, data.files[key].content);
                
                // add the file to the file manager
                FileManager.addFile(gistFile);
                
                // check if a main method was specified
                if (main === null) {
                    // if not, check if the file has a main method
                    var isMain = /(public\s+static|static\s+public)\s+void\s+main\s*\(\s*String\s*\[\]/;
                    if (isMain.test(gistFile.contents)) {
                        // Set the main file if it does
                        FileManager.setMainFile(gistFile);
                        console.log('No main class specified. ' + gistFile.name + ' chosen.');
                        main = gistFile;
                    }
                }
                else {
                    if (main === gistFile.name) {
                        FileManager.setMainFile(gistFile);
                        console.log('Main class set to ' + gistFile.name);
                        main = gistFile;
                    }
                }
            });
            
            if (main !== null) {
                FileManager.setCurrentFile(main);
            }
            else {
                FileManager.setCurrentFile(null);
            }
            
            FileManager.updateDisplay();
        }
                    
        // Download the files from the gist asynchronously
        $.ajax({
            url: 'https://api.github.com/gists/' + gist,
            type: 'get',
            dataType: 'json',
            cache: true,
            success: handleGist,
            async: true,
            error: errorhandler
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
    
    this.parent = null;
}

/*
 * A class that represents a folder full of files / a package
 */
function Folder(name, parent) {
    if (name) {
        this.name = name;
    }
    else {
        this.name = "New Folder";
    }
    
    this.parent = null;
    if (parent) {
        this.parent = parent;
    }
    
    this.files = [];
    this.folders = [];
    
    /*
     * Set the name of this folder
     */
    this.setName = function(newName) {
        this.name = newName;
    };
    
    /*
     * Retrieve the name of this folder
     */
    this.getName = function() {
        return this.name;
    };
    
    /*
     * Set this folder's parent folder
     */
    this.setParent = function(parent) {
        this.parent = parent;
    };
    
    /*
     * Get this folder's parent folder
     */
    this.getParent = function() {
        return this.parent;
    };
    
    /*
     * Add a file to this folder
     */
    this.addFile = function(file) {
        file.parent = this;
        
        this.files.push(file);
        this.files.sort(function(a,b){return (b.name<a.name) ? 1 : -1; });
    };
    
    /*
     * Get the number of files stored in this folder
     */
    this.getNumFiles = function () {
        return this.files.length;
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
     * Add a subfolder to this folder
     */
    this.addFolder = function(folder) {
        this.folders.push(folder);
        this.folders.sort(function(a,b){return (b.name<a.name) ? 1 : -1; });
        folder.parent = this;
        
        //FileManager.updateDisplay();
    };
    
    /*
     * Remove the current folder
     */
    this.removeFolder = function(folder) {
        var parent = folder.parent;
        
        if (parent !== null) {
            for (var i = 0; i < parent.folders.length; i++) {
                if (parent.folders[i] === folder) {
                    parent.folders.splice(i, 1);
                    break;
                }
            }
        }
        
        //FileManager.updateDisplay();
    };
    
    
    /*
     * Retrieve the number of subfolders in this folder
     */
    this.getNumFolders = function() {
        return this.folders.length;
    };
    
    /*
     * retrieve a subfolder based on its index
     */
    this.getFolder = function(num) {
        return this.folders[num];
    };
       
    /*
     * remove all files and sub folders from this folder
     */
    this.empty = function() {
        this.files = [];
        this.folders = [];
    };
}