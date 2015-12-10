// Models are where actual data is kept. They can also be used
// for communicating between the server and the client through
// methods like save() and fetch().
//
// Models are the abstract data and do not know how they are
// supposed to be visualized. But they can perform validations
// to ensure the data is correct.
var models = {};

// The state of the Editor
models.Editor = Backbone.Model.extend({
  StateEnum : {
    NOTHING: 0,
    DRAWALINE_FIRSTPOINT: 1,
    DRAWALINE_SECONDPOINT: 2,
    ADD_SQUARE_TEMPLATE: 3,
    ADD_HEX_TEMPLATE: 4
  },
  defaults: {
    state: null
  },
  initialize: function() {
  }
});

// Action Item in the History View
models.ActionItem = Backbone.Model.extend({
  defaults: {
    actionTag: ''
  },
  initialize: function() {
  },
  validate: function(attributes) {
    if (typeof attributes.actionTag !== 'string') {
      // Return a failed validation
      return 'ActionTag is mandatory';
    }
    // All validations passed, don't return anything
  }
});

// Action Collection
models.ActionCollection = Backbone.Collection.extend({
  model: models.ActionItem
});

// The model associated with the Element View
models.ElementViewModel = Backbone.Model.extend({
  defaults: {
    message: ''
  }
});

