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
    // Editor view listens to changes in the editor view.
    this.edView = new views.EditorView({model: this.editorModel});




    // Initialize a list of people
    // In this case we provide an array, but normally you'd
    // instantiate an empty list and call people.fetch()
    // to get the data from your backend
    var people = new models.People([
      {firstname: 'Arthur',
       lastname: 'Dent'
      },{
        firstname: 'Ford',
        lastname: 'Prefect'
      }
    ]);

    // Pass the collection of people to the view
    var view = new views.People({
      collection: people
    });

    // And render it
    view.render();

    // Example of adding a new person afterwards
    // This will fire the 'add' event in the collection
    // which causes the view to re-render
    people.add([
      {
        firstname: 'Zaphod',
        lastname: 'Beeblebrox'
      }
    ]);
  }
});

var router = new Router();
jQuery(document).ready(function() {
  // When the document is ready we instantiate the router
  // And tell Backbone to start routing
  Backbone.history.start();
});
