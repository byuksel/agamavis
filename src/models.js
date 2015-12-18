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
    FIRST_POINT_SELECTED: 1,
    SECOND_POINT_SELECTED: 2,
    ADD_CONLINE: 3,
    ADD_EXTENDEDCONLINE: 4,
    ADD_SQUARE_TEMPLATE: 5,
    ADD_HEX_TEMPLATE: 6,
    CLEAR: 7,
    ADD_PATTERNLINE: 8
  },
  DesignEnum : {
    CONSTRUCTION: 0,
    PATTERN: 1
  },
  defaults: {
    state: null,
    designstate: null
  },
  initialize: function() {
    this.set('state', this.StateEnum.NOTHING);
    this.set('designstate', this.DesignEnum.CONSTRUCTION);
    
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

