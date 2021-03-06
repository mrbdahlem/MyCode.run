/*
 * A File Manager singleton, manages source files
 * 
 * @type FileManager
 */
var FileManager = new function() {
    this.folder = new Folder("Files");
    this.currentFile = null;
    this.currentFolder = this.folder;
    this.fileDisplays = [];
    this.editor = null;
    this.startFunc = "start();";
    
    /*
     * Add a file to the current folder
     * 
     * @param {File} file   The file object to add
     * @returns {undefined}
     */
    this.addFile = function(file) {
        this.currentFolder.addFile(file);
        
        // Display the new file
        this.setCurrentFile(file);
        this.updateDisplay();
    };
    
    /*
     * Add a subfolder to the current folder
     * 
     * @param {Folder} folder   The Folder object to add
     * @returns {undefined}
     */
    this.addFolder = function(folder) {
        this.currentFolder.addFolder(folder);
        
        // Open the new folder
        this.currentFolder = folder;
        this.currentFile = null;
        this.updateDisplay();
    };
    
    /*
     * Remove a file from the manager.  if no file is provided,
     * remove the currently selected file.
     * 
     * @param {File} file   the File object to remove
     * @returns {undefined}
     */
    this.removeFile = function(file) {
        file = file || this.currentFile;
        
        // Remove the current file from its parent
        if (file) {
            file.parent.removeFile(file);

            // Empty the file editor
            this.currentFile = null;
        }
        
        this.updateDisplay();
    };
    
    /*
     * Remove a folder from the manager.  if no folder is provided,
     * remove the currently selected folder.
     *
     * @param {Folder} folder   the Folder object to remove
     * @returns {undefined}
     */
    this.removeFolder = function(folder) {
        folder = folder || this.currentFolder;
        
        // Remove the folder from its parent
        if (folder && folder !== this.folder) {
            folder.parent.removeFolder(folder);

            // open the parent folder
            this.currentFolder = folder.parent;
        }
        
        this.updateDisplay();
    };

    /*
     * Remove all files and folders from this project
     * 
     * @returns {undefined}
     */
    this.empty = function() {
        this.rootFolder = new Folder("Files");
        this.folder = this.rootFolder;
        this.currentFolder = this.rootFolder;
        this.setCurrentFile(null);
    };
    
    /*
     * Make a file the currently selected file
     *
     * @param {File} file   the File object to select
     * @returns {undefined}
     */
    this.setCurrentFile = function(file) {
        this.currentFile = file;
    };
    
    /*
     * Make a folder the currently selected folder
     *
     * @param {Folder} folder   the Folder object to select
     * @returns {undefined}
     */
    this.setCurrentFolder = function(folder) {
        this.currentFolder = folder;
    };
    
    /*
     * Get a reference to the currently selected folder
     *
     * @returns {@var;folder.parent|@this;.currentFolder.parent|Folder}
     */
    this.getCurrentFolder = function() {
        return this.currentFolder;
    };
    
    /*
     * Set the function call to make to run the code.
     *
     * @param {String} func   the function call to make to run the code
     * @returns {undefined}
     */
    this.setStartFunction = function(func) {
        this.startFunc = func;
    };
         
    
    /*
     * Retrieve the function call to make in order to run the code.
     *
     * @returns {String}   the function call to make to run the code
     */
    this.getStartFunction = function() {
        return this.startFunc;
    };
          
    /*
     * Retrieve the current file
     *
     * @returns {FileManager.currentFile|File}
     */
    this.getFile = function() {
        return this.currentFile;
    };
    
    /*
     * Get the contents of a file based on its file name.
     * 
     * @param {File} file   the file object to examine
     * @returns {String}
     */
    this.getFileContents = function(file) {
        return file.contents;
    };
    
    
    /*
     * Get the contents of all .js files concatenated together
     * 
     * @returns {String}
     */
    this.getAllJSFileContents = function(folder) {
        let contents = "";
        
        let currFolder = folder || this.folder;

        for (let i = 0; i < currFolder.getNumFiles(); i++) {
            contents += currFolder.getFile(i).contents;
            contents += '\n';
        }
        
        for (let i = 0; i < currFolder.getNumFolders(); i++) {
            let folder = currFolder.getFolder(i);
            
            if ('Test' !== folder.getName()) {
                contents += this.getAllJSFileContents(currFolder.getFolder(i));
            }
        }
        
        return contents;  
    };
    
    /*
     * Get a reference to the root folder
     */
    
    this.getRootFolder = function() {
        return this.folder;
    };
    
    
    /*
     * Get the test case folder
     * 
     * @returns {Folder} the Test folder, or null
     */
    this.getTestFolder = function() {
        for (let i = 0; i < this.folder.getNumFolders(); i++) {
            let folder = this.folder.getFolder(i);
            if (folder.name === 'Test') {
                return folder;
            }
        }
        return null;
    };
    
    /*
     * Replace the contents of a file in the manager, if no file is
     * provided, updates the currently selected file
     */
    this.updateFile = function(contents, file) {
        file = file || this.currentFile;
        
        if (file !== null) {
            file.contents = contents;
            file.changed = true;
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
        
        // If a fileDisplay has been assigned, add a tree of folders and files
        // to the display
        this.fileDisplays.forEach(function(element){
            // Clear any contents of the parent element
            $(element).empty();
            
            // Create a list to hold the tree view
            var list = document.createElement('ul');
            $(list).addClass('list-root');
            $(element).append(list);

            // Add the root folder and its contents to the display
            FileManager.displayFolder(list, FileManager.folder);
        });
    };
    
    /*
     * Add the contents of a folder to a fileDisplay
     */
    this.displayFolder = function(element, folder) {
        // add a list item for this folder
        var folderEl = document.createElement("li");
        $(folderEl).addClass('folder');
        $(element).append(folderEl);
        
        // Add a span to contain the folder's name and icon
        var container = document.createElement('span');
        $(folderEl).append(container);
        
        // Add the folder icon
        var icon = document.createElement('span');
        $(icon).addClass('glyphicon');
        // If the folder is selected, show it as open, otherwise, show it as closed
        if (folder === FileManager.currentFolder) {
            $(icon).addClass('glyphicon-folder-open');
        }
        else {
            $(icon).addClass('glyphicon-folder-close');   
        }
        
        $(container).append(icon);
        
        // Space between the folder icon and name
        $(container).append('&nbsp;&nbsp;');

        // Show the name of the folder
        var title = document.createElement("label");
        $(title).addClass('listfolder');
        $(title).text(folder.getName());
        $(container).append(title);
        
        // Add a click handler to open the folder if its name/icon are clicked
        $(container).click(function() {
            FileManager.setCurrentFolder(folder);
            FileManager.setCurrentFile(null);
            FileManager.updateDisplay();
        });

        // Add a list to contain the folder's contents
        var ul = document.createElement('ul');
        $(ul).addClass('nav')
             .addClass('nav-list')
             .addClass('tree');
        $(folderEl).append(ul);

        // If this folder is open, add any files to the list of this folder's
        //  contents
        if (FileManager.currentFolder === folder) {
            folder.files.forEach(function(file) {
                FileManager.displayFile(ul, file);
            });
        }
        // Add any subfolders to this folder's contents
        folder.folders.forEach(function(subfolder) {    
            FileManager.displayFolder(ul, subfolder);
        });
    };
    
    // Add a file to a folder in the fileDisplay
    this.displayFile = function(element, file) {
        // Add a list item for the file
        var item = document.createElement('li');
        $(element).append(item);
        
        // Create a label to hold the filename
        var title = document.createElement('label');
        
        // Add an icon for the file
        var icon = document.createElement('span');        
        $(icon).addClass('glyphicon');
        $(icon).addClass('glyphicon-file');
             
        $(title).append(icon);
        $(title).append('&nbsp;');
        
        // Add the filename
        $(title).append(file.name);
        $(title).addClass('listFile');
        
        // If the file is open, highlight its name
        if (file === FileManager.currentFile) {
            $(title).addClass('active');
        }
        $(item).append(title);
        
        // Add a click handler to open a file when its name or icon are clicked
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
    this.loadFromGist = function(gist, errorhandler) { 
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
        
        /*
         * When a gist is received
         */
        function handleGist(data) {
            // Get rid of any other files/folders
            FileManager.empty();
            
            // Extract each of the files in the gist
            Object.keys(data.files).map(function(key){
                var gistFile = new SourceFile(key, data.files[key].content);
                
                // add the file to the file manager
                FileManager.addFile(gistFile);                
            });
                        
            FileManager.updateDisplay();
        }
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
    // Establish the name of this folder
    if (name) {
        this.name = name;
    }
    else {
        this.name = "New Folder";
    }
    
    // Link to the parent of this folder
    this.parent = null;
    if (parent) {
        this.parent = parent;
    }
    
    // Lists of file and subfolders contained in this folder
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
        
        // Sort the list of files
        this.files.sort(function(a,b){return (b.name<a.name) ? 1 : -1; });
        
        return file;
    };
           
    /*
     * Add a subfolder to this folder
     */
    this.addFolder = function(folder) {
        this.folders.push(folder);
        folder.parent = this;
        
        // Sort the list of folders
        this.folders.sort(function(a,b){return (b.name<a.name) ? 1 : -1; });
        
        return folder;
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
     * Retrieve a reference to a subfolder by name
     */
    this.findFolder = function(folderName) {
        var found = null;
        this.folders.forEach(function(folder){
            if (folder.getName() === folderName) {
                found = folder;
                return;
            }
        });
        return found;
    };
    
    /*
     * Remove the current file
     */
    this.removeFile = function(file) {
        var parent = file.parent;
        
        if (parent !== null) {
            for (var i = 0; i < parent.files.length; i++) {
                if (parent.files[i] === file) {
                    parent.files.splice(i, 1);
                    break;
                }
            }
        }
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
    };

    /*
     * remove all files and sub folders from this folder
     */
    this.empty = function() {
        this.files = [];
        this.folders = [];
    };
}