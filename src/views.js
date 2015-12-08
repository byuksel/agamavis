// Views are responsible for rendering stuff on the screen (well,
// into the DOM).
//
// Typically views are instantiated for a model or a collection,
// and they watch for change events in those in order to automatically
// update the data shown on the screen.
var views = {};

views.ButtonsView = Backbone.View.extend({
  events: {
    'click .btn-line': 'drawALine',
    'click .btn-primary': 'transitionDown',
    'click .btn-add-hex': 'addHex',
    'click .btn-add-sq': 'addSq'
  },

  initialize: function(options) {
    this.StateEnum = this.model.StateEnum;
    this.render();
  },

  drawALine: function() {
    this.model.set('state', this.StateEnum.DRAWALINE_FIRSTPOINT);
    console.log(this.model.get('state'));
  },

  transitionDown: function() {
    console.log('Transition down');
  },
  addSq: function() {
    this.model.set('state', this.StateEnum.ADD_SQUARE_TEMPLATE);
    this.toggleTemplateButtons(false);
  },
  addHex: function() {
    this.model.set('state', this.StateEnum.ADD_HEX_TEMPLATE);
    this.toggleTemplateButtons(false);
  },
  toggleTemplateButtons: function(state) {
    this.$el.find('.btn-add-hex').prop('disabled', !state);
    this.$el.find('.btn-add-sq').prop('disabled', !state);
  },
  render: function(){
    var template = _.template( $('#buttons_template').html(), {} );
    this.$el.html( template );
    return this;
  }

});


views.HistoryView = Backbone.View.extend({
  initialize: function() {
  },
  render: function() {
  }
});

views.EditorView = Backbone.View.extend({
  el: '#outgraph',
  paper: null,
  Agama: null,
  events: {
    'click': 'clickMe'
  },
  initialize: function() {
    this.StateEnum = this.model.StateEnum;
    this.listenTo(this.model, 'change', this.modelChanged);
    console.log('init on editorview');
    this.Agama = require('agama');
    var winInfo = this.Agama.getWidthHeight(document, 'outgraph');
    this.paper =  new this.Agama('outgraph', winInfo.width, winInfo.height);
    var sqInfo = this.Agama.getSquareCoorInMiddle(winInfo, 20);
    this.sqTile = this.paper.getSquareTile(sqInfo.topX, sqInfo.topY, sqInfo.bottomX, sqInfo.bottomY);
    var self        = this;
    // Retrieve elements of the collection
    //this.collection.fetch().done(function () {
      // Add circles if the collection is empty
    //  if (self.collection.isEmpty()) {
    //    self.addDefaultCircles();
    //  }

      // Display the snowman
     // self.render();
    //});
  },
  clickMe: function() {
    if (this.model.get('state') === this.StateEnum.DRAWALINE_FIRSTPOINT) {
      console.log('do something');
    }
  },
  addSquareTemplate: function() {
    var c0 = this.paper.squareTemplate(this.sqTile);
  },
  addHexTemplate: function() {
    var template = this.paper.hexagonTemplate(this.sqTile);
    var c0 = template.c0, t1 = template.t1, t2 = template.t2, t3 = template.t3,
        t4 = template.t4, t5 = template.t5, t6 = template.t6, t7 = template.t7;
  },
  modelChanged: function() {
    if (this.model.get('state') === this.StateEnum.ADD_HEX_TEMPLATE) {
      this.addHexTemplate();
      this.model.set('state', this.StateEnum.NOTHING);
    }
    if (this.model.get('state') === this.StateEnum.ADD_SQUARE_TEMPLATE) {
      this.addSquareTemplate();
      this.model.set('state', this.StateEnum.NOTHING);
    }
  },
  render: function() {
    console.log('render is called');
  }

  // ...
});

views.ActionItemView = Backbone.View.extend({
  // Each person will be shown as a table row
  tagName: 'tr',

  initialize: function(options) {
    // Ensure our methods keep the `this` reference to the view itself
    _.bindAll(this, 'render');

    // If the model changes we need to re-render
    this.model.bind('change', this.render);
  },

  render: function() {
    // Clear existing row data if needed
    jQuery(this.el).empty();

    // Write the table columns
    jQuery(this.el).append(jQuery('<td>' + this.model.get('actionTag') + '</td>'));

    return this;
  }
});

views.ActionList = Backbone.View.extend({
  // The collection will be kept here
  collection: null,

  // The people list view is attached to the table body
  el: 'table',

  initialize: function(options) {
    this.collection = options.collection;

    // Ensure our methods keep the `this` reference to the view itself
    _.bindAll(this, 'render');

    // Bind collection changes to re-rendering
    this.collection.bind('reset', this.render);
    this.collection.bind('add', this.render);
    this.collection.bind('remove', this.render);
  },

  render: function() {
    var element = this.$el;
    // Clear potential old entries first
    this.$el.empty();

    // Go through the collection items
    this.collection.forEach(function(item) {

      // Instantiate a PeopleItem view for each
      var itemView = new views.ActionItemView({
        model: item
      });

      // Render the ActionListView, and append its element
      // to the table
      element.append(itemView.render().el);
    });
    element.css('overflow', 'hidden');
    element.scrollTop(100000);
    element.css('overflow', 'auto');
    return this;
  }
});
