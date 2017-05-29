var gitHub = {};
            
/*
 * Make sure that github is logged in before calling callback
 * if there is an error, call errorCallback with an error param
 */
gitHub.ensureLogin = function(callback, errorCallback) {
    // Determine if there is a current oauth session
    var session = hello('github').getAuthResponse();
    var currentTime = (new Date()).getTime() / 1000;
    var online = session && session.access_token && session.expires > currentTime;

    if(online) {
        // If there is an active session, perform the callback
        callback();
    }
    else {
        // Otherwise, login
        var options = {};
        options.scope = ['user', 'repo', 'gist'];
        options.force = false;

        hello('github', options).login().then(function() {
            // Then call the callback
            callback()
        }, 
        function(e) {
            // If there was an error, send it to the callback 
            errorCallback(e);
        });
    }    
}

/*
 * Download a repo from GitHub
 */
gitHub.getRepo = function(fullName, fileManager, main) {
    gitHub.ensureLogin(function(){
        hello('github').api('/repos/'+fullName).then(function(data) {
            var repo = gitHub.repoFromData(data);
            gitHub.loadRepo(fileManager, repo, main);
        },
        function(e) {
            alert("Could not load + " + fullName + ": " + e.error.message);
        })
    },
    function(e) {
        alert("Could not access " + fullName + ": " + e.error.message);
    })
}

/*
 * Get all of the user's repositories
 */
gitHub.getRepos = function(done, error) {
    /*
     * Handle a repo response from GitHub
     */
    var addAllRepos = function(target, json, done, error) {
        // Add all returned repos to the list
        json.data.forEach(function(data) {
            target.push(gitHub.repoFromData(data));
        });

        // If there are more pages of repos,
        if (json.paging && json.paging.next) {
            // Request the next page of repos
            hello('github').api(json.paging.next).then(
                function(response){
                    console.log("retrieving next page of repos...");
                    // and handle the repos
                    addAllRepos(target, response, done, error);
                },
                function(e) {
                    // If there is an error, report it
                    error(e);
                });
        }
        else {
            // If there are no more pages of repos, send them to the caller
            done(target);
        }
    }

    // Clear out the list of repos
    gitHub.repos = [];

    // Make sure that the user is logged in
    gitHub.ensureLogin (function () {
        // Then request the user's repos
        hello('github').api('/user/repos').then(
            function(response){
                // Once the repos are received, add them to the repo list
                addAllRepos(gitHub.repos, response, done, error);
            },
            function (e) {
                // If there was an error, report it
                error(e);
            });
    },
    function(e) {
        // If there was an error logging in, report it
        error(e);
    });
};

/*
 * Make a repo object from a GitHub Repo JSON description
 */
gitHub.repoFromData = function (data) {
    var repo = {};
    repo.id = data.id;
    repo.owner = data.owner.login;
    repo.name = data.name;
    repo.full_name = data.full_name;
    repo.description = data.description;
    repo.url = data.url;
    repo.branches_url = data.branches_url;
    repo.git_commits_url = data.git_commits_url;
    repo.default_branch = data.default_branch;
    repo.permissions = data.permissions;
    return repo;
};

/*
 * Load the files from a github repo into a FileManager
 */
gitHub.loadRepo = function(fileManager, repo, main) {
    var branch = repo.branches_url.replace(/\{.*\}/, "/" + repo.default_branch);
    hello('github').api(branch).then(function(response) {
        fileManager.empty();
        var folder = fileManager.getRootFolder();
        gitHub.loadTree(folder, response.commit.commit.tree.url, fileManager, main);
    },
    function(e) {
        alert('Error loading Repo branch: ' + e.error.message);
    });
};

gitHub.loadTree = function(folder, tree, fileManager, main) {
    hello('github').api(tree).then(function(response) {
        response.tree.forEach(function(item){
            if (item.type === "tree") {
                var subFolder = new Folder(item.path, folder);
                folder.addFolder(subFolder);
                gitHub.loadTree(subFolder, item.url, fileManager, main);
                
                fileManager.updateDisplay();
            }
            else if (item.type === "blob") {
                gitHub.loadFile(folder, item.path, item.url, fileManager, main);
            }
        });
        
        
        // If there are more pages of items in the tree,
        if (response.paging && response.paging.next) {
            gitHub.loadTree(folder, response.paging.next, fileManager, main);
        }
    },
    function (e){
        alert("Error loading tree: " + e.error.message);
    });    
};

gitHub.loadFile = function(folder, name, url, fileManager, main) {
    hello('github').api(url).then(function(response) {
        var content = window.atob(response.content);
        var file = new SourceFile(name, content);
        folder.addFile(file);
        
        // check if a main method was specified
        if (main === null) {
            // if not, check if the file has a main method
            var isMain = /(public\s+static|static\s+public)\s+void\s+main\s*\(\s*String\s*\[\]/;
            if (isMain.test(file.contents)) {
                // Set the main file if it does
                FileManager.setMainFile(file);
                FileManager.setCurrentFile(file);
                console.log('No main class specified. ' + file.name + ' chosen.');
            }
        }
        else if (main === name) {
            FileManager.setMainFile(file);
            FileManager.setCurrentFile(file);
            console.log('Main file set: ' + name);
        }

        fileManager.updateDisplay();
    },
    function(e) {
        alert("Error loading file: " + e.error.message);
    });
};

/*
 * Callback for auth session starts
 */
function sessionStart() {
    hello('github').api('/me').then(function(json) {
        gitHub.username = json.login;
        gitHub.repos_url = json.repos_url;
    },
    function(e) {

    });
}

/*
 * Prepare for oauth login to github
 */
hello.init({github: 'b80ec7eaa799156bba33'},
           {redirect_uri: 'https://run.mycode.run/redirect.html',
            oauth_proxy: 'https://auth-server.herokuapp.com/proxy'});

hello.on('auth.login', sessionStart);