// Router is responsible for driving the application. Usually
// this means populating the necessary data into models and
// collections, and then passing those to be displayed by
// appropriate views.
var Router = Backbone.Router.extend({
  routes: {
    '': 'index'  // At first we display the index route
  },

  index: function() {
    // EditorModel keeps the state of the editor screen.
    this.editorModel = new models.Editor();
    // Buttons view controls buttons and updates editor model.
    this.buttonsView = new views.ButtonsView({ el: $('#buttons'), model: this.editorModel });
    // Initialize a list of people
    // In this case we provide an array, but normally you'd
    // instantiate an empty list and call people.fetch()
    // to get the data from your backend
    this.historyCollection = new models.ActionCollection();

    // Pass the collection of people to the view
    this.historyView = new views.ActionList({collection: this.historyCollection, el: $('#history tbody')});

    this.elementViewModel = new models.ElementViewModel();
    this.elementView = new views.ElementView({ el: $('#elementview'), model: this.elementViewModel});
    // Editor view listens to changes in the editor view.
    this.edView = new views.EditorView({model: this.editorModel, elementViewModel: this.elementViewModel,
                                        historyCollection: this.historyCollection});
    this.saveFilenameModel = new models.SaveFilenameModel();
    this.saveView = new views.SaveView({el: $('#save'),
                                        historyCollection: this.historyCollection,
                                        model: this.editorModel,
                                        saveFilenameModel: this.saveFilenameModel});
    this.saveFilenameView = new views.SaveFilenameView({el: $('.popr'),  model: this.saveFilenameModel,
                                                        historyCollection: this.historyCollection});


  }
});

var router = new Router();
jQuery(document).ready(function() {
  // When the document is ready we instantiate the router
  // And tell Backbone to start routing
  Backbone.history.start();
});
