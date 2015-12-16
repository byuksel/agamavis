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
    'click .btn-add-sq': 'addSq',
    'click .btn-add-extendedconline': 'addExtendendConline',
    'click .btn-add-conline': 'addConline'
  },

  initialize: function(options) {
    this.StateEnum = this.model.StateEnum;
    this.render();
    this.toggleLineButtons(false);
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
    this.toggleLineButtons(true);
  },
  addHex: function() {
    this.model.set('state', this.StateEnum.ADD_HEX_TEMPLATE);
    this.toggleTemplateButtons(false);
    this.toggleLineButtons(true);
  },
  addExtendedConline: function() {
    this.model.set('state', this.StateEnum.ADD_EXTENDEDCONLINE);
    this.toggleLineButtons(false);
  },
  addConline: function() {
    this.model.set('state', this.StateEnum.ADD_CONLINE);
    this.toggleLineButtons(false);
  },
  toggleTemplateButtons: function(state) {
    this.$el.find('.btn-add-hex').prop('disabled', !state);
    this.$el.find('.btn-add-sq').prop('disabled', !state);
  },
  toggleLineButtons: function(state) {
    this.$el.find('.btn-add-conline').prop('disabled', !state);
    this.$el.find('.btn-add-extendedconline').prop('disabled', !state);
  },
  render: function(){
    var template = _.template( $('#buttons_template').html(), {} );
    this.$el.html( template );
    return this;
  }

});

views.EditorView = Backbone.View.extend({
  el: '#outgraph',
  paper: null,
  Agama: null,
  changed: function() {
    console.log('changed');
  },
  initialize: function(options) {
    this.options = options;
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
  addSquareTemplate: function() {
    var c0 = this.paper.squareTemplate(this.sqTile);
    this.options.historyCollection.add([{actionTag:'Add Square Template'}]);
    this.updateEventListeners();
  },
  addHexTemplate: function() {
    var template = this.paper.hexagonTemplate(this.sqTile);
    var c0 = template.c0, t1 = template.t1, t2 = template.t2, t3 = template.t3,
        t4 = template.t4, t5 = template.t5, t6 = template.t6, t7 = template.t7;
    this.options.historyCollection.add([{actionTag:'Add Hexagon Template'}]);
    this.updateEventListeners();
  },
  addConline: function() {
  },
  addExtendedConline: function() {
  },
  updateEventListeners: function() {
    var points = this.paper.getPoints();
    var elementViewModel = this.options.elementViewModel;
    var editorModel = this.model;
    var stateEnum = this.StateEnum;
    var historyCollection = this.options.historyCollection;
    for (var i = 0; i < points.length; i++) {
      // Add them event listeners
      points[i].toFront();
      if (typeof points[i].agamavisState === 'string') {
        // this point was already on the screen
        // no need to update its event listeners.
        continue;
      }
      points[i].agamavisState = 'init';
      // Hack to make events to fire not only when we are on the circle
      // but inside the circle.
      // Another way to fix this is to use pointer-events
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pointer-events
      points[i].attr({'fill' : 'white', 'fill-opacity': 0});
      points[i].mouseover(function() {
        var owner =  this;
        elementViewModel.set('message', owner.getActualParameters());
        if (editorModel.get('state') !== stateEnum.NOTHING &&
            editorModel.get('state') !== stateEnum.FIRST_POINT_SELECTED &&
            editorModel.get('state') !== stateEnum.SECOND_POINT_SELECTED) {
          // do nothing
          return;
        }
        if (editorModel.get('state') === stateEnum.SECOND_POINT_SELECTED &&
            owner.agamavisState === 'init') {
          // do nothing
          return;
        }
        owner.attr({'fill': 'red', 'fill-opacity': 1});
      });
      points[i].click(function() {
        if (editorModel.get('state') !== stateEnum.NOTHING &&
            editorModel.get('state') !== stateEnum.FIRST_POINT_SELECTED &&
            editorModel.get('state') !== stateEnum.SECOND_POINT_SELECTED) {
          // do nothing
          return;
        }
        var owner = this;
        if (owner.agamavisState === 'init' &&
            editorModel.get('state') !== stateEnum.SECOND_POINT_SELECTED) {
          // select element
          owner.agamavisState = 'selected';
          owner.attr({'fill': '#D7575C', 'fill-opacity': 1});
          historyCollection.add([{actionTag:'Point ' + owner.agamapointid + ' selected'}]);
          if (editorModel.get('state') === stateEnum.NOTHING) {
            editorModel.set('state', stateEnum.FIRST_POINT_SELECTED);
          } else if (editorModel.get('state') === stateEnum.FIRST_POINT_SELECTED) {
            editorModel.set('state', stateEnum.SECOND_POINT_SELECTED);
          }
        } else if (owner.agamavisState === 'selected' ) {
          // unselect element
          owner.agamavisState = 'init';
          historyCollection.add([{actionTag:'Point ' + owner.agamapointid + ' unselected'}]);
          if (editorModel.get('state') === stateEnum.SECOND_POINT_SELECTED) {
            editorModel.set('state', stateEnum.FIRST_POINT_SELECTED);
          } else if (editorModel.get('state') === stateEnum.FIRST_POINT_SELECTED) {
            editorModel.set('state', stateEnum.NOTHING);
          }
        }
      });
      points[i].mouseout(function() {
        elementViewModel.set('message', '');
        var owner = this;
        if (editorModel.get('state') !== stateEnum.NOTHING &&
            editorModel.get('state') !== stateEnum.FIRST_POINT_SELECTED &&
            editorModel.get('state') !== stateEnum.SECOND_POINT_SELECTED) {
          // do nothing
          return;
        }
        if (owner.agamavisState === 'init') {
          // change the color back to what it was only if the element
          // is in init state.
          owner.attr({'fill': 'white', 'fill-opacity': 0});
        } else {
          // remain at selected status
          owner.attr({'fill': '#D7575C', 'fill-opacity': 1});
        }
      });
    };
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
    if (this.model.get('state') === this.StateEnum.ADD_CONLINE) {
    }
    if (this.model.get('state') === this.StateEnum.ADD_EXTENDEDCONLINE) {
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
    // scroll to the bottom
    element.css('overflow', 'hidden');
    element.scrollTop(100000);
    //    element.css('overflow', 'auto');
    return this;
  }
});

views.ElementView = Backbone.View.extend({
  initialize: function(options) {
    this.listenTo(this.model, 'change', this.render);
  },
  render: function() {
    this.$el.html(this.model.get('message').toString());
    return this;
  }
});
