
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongoose = require('mongoose')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

mongoose.connect('mongodb://localhost/todo_dev');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Task = new Schema ({
	task: String
});

var Task = mongoose.model('Task', Task);

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.cookieParser());
  app.use(express.session({ secret: "OZhCLfxlGp9TtzSXmJtq" }));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Get Requests
app.get('/', routes.index);

app.get('/users', user.list);
app.get('/tasks', function(req, res){
  Task.find({}, function (err, docs) {
    res.render('tasks/index', { 
      title: 'Todos index view',
      docs: docs
    });
  });
});

app.get('/tasks/new', function(req, res){
  res.render('tasks/new.jade', { 
    title: 'New Task'
  });
});


app.get('/tasks/:id/edit', function(req, res) {
	Task.findById(req.params.id, function(err, doc) {
		res.render('tasks/edit',{
			title: 'Edit Task View',
			task: doc
		});
	});
});

// Post-Requests

app.post('/tasks', function(req, res){
  var task = new Task(req.body.task);
  task.save(function (err) {
    if (!err) {
      res.redirect('/tasks');
    }
    else {
      res.redirect('/tasks/new');
    }
  });
});


app.put('/tasks/:id', function(req, res){
  Task.findById(req.params.id, function (err, doc){
    doc.updated_at = new Date();
    doc.task = req.body.task.task;
    doc.save(function(err) {
      if (!err){
        res.redirect('/tasks');
      }
      else {
        // error handling
      }
    });
  });
});

app.del('/tasks/:id', function(req, res){
	Task.findById(req.params.id, function(err,doc){
		if(!doc) return next(new NotFound('Document not found'));
		doc.remove(function(){
			res.redirect('/tasks');
		});
	});
});



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
