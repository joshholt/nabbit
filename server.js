/*globals __dirname connect*/
var server  = require('express').createServer(),
    connect = require('connect'),
    http    = require('http'),
    sys     = require('sys'),
    app     = {
      client: http.createClient(80, 'github.com'),
      baseUrl: '/api/v2/json'
    };
    

app.request = function(path, callback) {
  var req = app.client.request('GET', app.baseUrl + path, {host: 'github.com'});
  
  req.on('response', function (res) {
    res.body = '';
    res.on('data', function (chunk) { res.body += chunk; });
    res.on('end', function () {
      try {
        callback(null, JSON.parse(res.body));
      } catch (err) {
        callback(err);
      }
    });
  });
  
  req.end();
};

app.addCommentsForIssue = function(user, repo, issues) {
  
  issues.forEach(function (issue) {
    var req = app.client.request('GET', 
      app.baseUrl + 
      '/issues/comments/' + 
      user + '/' + 
      repo + '/' + 
      issue.number
    );

    req.on('response', function (res) {
      res.body = "";
      res.on('data', function (chunk) { res.body += chunk; });
      res.on('end', function () {
        issue.comments_data = JSON.parse(res.body);
      });
    });

    req.end();
  });
};

app.sort = function(repos) {
  return repos.sort(function (a,b) {
    if (a.watchers === b.watchers) return 0;
    if (a.watchers > b.watchers) return -1;
    if (a.watchers < b.watchers) return 1;
  });
};

app.totalWatchers = function(repos) {
  return repos.reduce(function (sum, repo) {
    return sum + repo.watchers;
  }, 0);
};

server.get('/', function (req, res) {
  res.render('/repos.html');
});

server.get('/repos', function (req, res) {
  res.render('/repos.html');
});

server.get('/issues', function (req, res) {
  res.render('/issues.html');
});

server.get('/repos/*', function (req, res, params, next) {
  var names = params.splat[0].split('/'),
      users = [];
  
  (function fetchData(name){
    if(name) {
      app.request('/repos/show/' + name, function (err, user) {
        if (err) {
          next(err);
        } else if (!user.repositories) {
          next();
        } else {
          user.totalWatchers = app.totalWatchers(user.repositories);
          user.repos = app.sort(user.repositories);
          user.name = name;
          users.push(user);
          fetchData(names.shift());
        }
      });
    } else {
      res.contentType('application/json');
      res.send(JSON.stringify(users));
    }
  })(names.shift());
});

server.get('/issues/:user/:repo', function (req, res, params, next) {
  var users = params.user.split('/'),
      repos = params.repo.split('/'),
      issues = [];
      
  (function fetchData(user, repo){
    if(user && repo) {
      app.request('/issues/list/' + user + '/' + repo + '/open', function (err, project) {
        if (err) {
          next(err);
        } else {
          project.name = user + '/' + repo;
          project.totalIssues = project.issues.length;
          issues.push(project);
          fetchData(users.shift(),repos.shift());
        }
      });
    } else {
      res.contentType('application/json');
      res.send(JSON.stringify(issues));
    }
  })(users.shift(), repos.shift());
});

server.configure(function(){
  server.use(connect.staticProvider(__dirname + '/public'));  
});

server.listen(3000);
