/**
 * @copyright Copyright (c) 2015, Baris Yuksel,  All Rights Reserved.
 * @licence [Apache-2.0]{http://www.apache.org/licenses/LICENSE-2.0}
 * @author Baris Yuksel <baris@onehundredyearsofcode.com>
 */
var views = {};

views.ButtonsView = Backbone.View.extend({
  events: {
    'click .btn-line': 'drawALine',
    'click .btn-add-hex': 'addHex',
    'click .btn-add-sq': 'addSq',
    'click .btn-add-extendedconline': 'addExtendedConline',
    'click .btn-add-conline': 'addConline',
    'click .btn-clear': 'clearEverything',
    'click .btn-start-pattern-lines': 'startPatternLines',
    'click .btn-add-patternline': 'addPatternLine'
  },
  initialize: function(options) {
    this.listenTo(this.model, 'change', this.modelChanged);
    this.StateEnum = this.model.StateEnum;
    this.DesignEnum = this.model.DesignEnum;
    this.freshView();
  },
  freshView: function() {
    this.render();
    this.toggleLineButtons(false);
    this.togglePatternButton(false);
    this.toggleStartPatternLinesButton(false);
   },  
  modelChanged: function() {
    if (this.model.get('state') === this.StateEnum.CLEAR) {
      this.freshView();
    }
    if (this.model.get('state') === this.StateEnum.SECOND_POINT_SELECTED) {
      console.log(this.model.get('designstate'));
      if (this.model.get('designstate') === this.DesignEnum.CONSTRUCTION) {
        this.toggleLineButtons(true);
      } else if (this.model.get('designstate') === this.DesignEnum.PATTERN) {
        this.togglePatternButton(true);
      }
    }
    if (this.model.get('state') === this.StateEnum.FIRST_POINT_SELECTED ||
        this.model.get('state') === this.StateEnum.NOTHING) {
      this.toggleLineButtons(false);
      this.togglePatternButton(false);
    }
  },
  addSq: function() {
    this.model.set('state', this.StateEnum.ADD_SQUARE_TEMPLATE);
    this.toggleTemplateButtons(false);
    this.toggleLineButtons(false);
    this.toggleStartPatternLinesButton(true);
   },
  addHex: function() {
    this.model.set('state', this.StateEnum.ADD_HEX_TEMPLATE);
    this.toggleTemplateButtons(false);
    this.toggleLineButtons(false);
    this.toggleStartPatternLinesButton(true);
   },
  addExtendedConline: function() {
    this.model.set('state', this.StateEnum.ADD_EXTENDEDCONLINE);
    this.toggleLineButtons(false);
  },
  addConline: function() {
    this.model.set('state', this.StateEnum.ADD_CONLINE);
    this.toggleLineButtons(false);
  },
  addPatternLine: function() {
    this.model.set('state', this.StateEnum.ADD_PATTERNLINE);
    this.togglePatternButton(false);
  },
  startPatternLines: function() {
    this.model.set('designstate', this.DesignEnum.PATTERN);
    this.toggleLineButtons(false);
    this.$el.find('.btn-start-pattern-lines').html('Pattern Line Mode');
    this.toggleStartPatternLinesButton(false);
  },
  toggleTemplateButtons: function(state) {
    this.$el.find('.btn-add-hex').prop('disabled', !state);
    this.$el.find('.btn-add-sq').prop('disabled', !state);
  },
  toggleLineButtons: function(state) {
    this.$el.find('.btn-add-conline').prop('disabled', !state);
    this.$el.find('.btn-add-extendedconline').prop('disabled', !state);
  },
  togglePatternButton: function(state) {
    this.$el.find('.btn-add-patternline').prop('disabled', !state);
  },
  toggleStartPatternLinesButton: function(state) {
    this.$el.find('.btn-start-pattern-lines').prop('disabled', !state);
  },
  clearEverything: function() {
    this.model.clear();
    this.model.set('state', this.model.StateEnum.CLEAR);
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
  selectedPoints: [],
  initialize: function(options) {
    this.options = options;
    this.StateEnum = this.model.StateEnum;
    this.listenTo(this.model, 'change', this.modelChanged);
    console.log('init on editorview');
    this.Agama = require('agama');
    this.winInfo = this.Agama.getWidthHeight(document, 'outgraph');
    this.paper =  new this.Agama('outgraph', this.winInfo.width, this.winInfo.height);
    this.freshTile(this.winInfo);
  },
  freshTile: function(winInfo) {
    var sqInfo = this.Agama.getSquareCoorInMiddle(winInfo, 20);
    this.sqTile = this.paper.getSquareTile(sqInfo.topX, sqInfo.topY, sqInfo.bottomX, sqInfo.bottomY);
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
    var selectedPoints = this.selectedPoints;
    for (var i = 0; i < points.length; i++) {
      // Add them event listeners
      points[i].toFront();
      if (typeof points[i].tesseravisState === 'string') {
        // this point was already on the screen
        // no need to update its event listeners.
        continue;
      }
      points[i].tesseravisState = 'init';
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
            owner.tesseravisState === 'init') {
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
        if (owner.tesseravisState === 'init' &&
            editorModel.get('state') !== stateEnum.SECOND_POINT_SELECTED) {
          // select element
          owner.tesseravisState = 'selected';
          selectedPoints.push(owner);
          owner.attr({'fill': '#D7575C', 'fill-opacity': 1});
          historyCollection.add([{actionTag:'Point ' + owner.agamapointid + ' selected'}]);
          if (editorModel.get('state') === stateEnum.NOTHING) {
            editorModel.set('state', stateEnum.FIRST_POINT_SELECTED);
          } else if (editorModel.get('state') === stateEnum.FIRST_POINT_SELECTED) {
            editorModel.set('state', stateEnum.SECOND_POINT_SELECTED);
          }
        } else if (owner.tesseravisState === 'selected' ) {
          // unselect element
          owner.tesseravisState = 'init';
          var index = selectedPoints.indexOf(owner);
          if (index > -1) {
            selectedPoints.splice(index, 1);
          }
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
        if (owner.tesseravisState === 'init') {
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
    if (this.model.get('state') === this.StateEnum.NOTHING) {
      return;
    }
    if (this.model.get('state') === this.StateEnum.UPLOAD_JSON) {
      this.paper.remove();
      this.paper =  this.Agama.fromJSON(this.model.get('json'), 'outgraph');
      this.paper.setSize(this.winInfo.width, this.winInfo.height);
      this.freshTile(this.winInfo);
      this.model.set('state', this.StateEnum.NOTHING);
      this.model.set('json', null);
    }
    if (this.model.get('state') === this.StateEnum.DOWNLOAD_JSON) {
      this.paper.remove();
      this.paper =  this.Agama.fromJSON(this.model.get('json'), 'outgraph');
      this.paper.setSize(this.winInfo.width, this.winInfo.height);
      this.freshTile(this.winInfo);
      this.model.set('state', this.StateEnum.NOTHING);
      this.model.set('json', null);
    }
    if (this.model.get('state') === this.StateEnum.CLEAR) {
      this.paper.clear();
      this.freshTile(this.winInfo);
      this.options.historyCollection.reset([]);
      this.model.set('state', this.StateEnum.NOTHING);
    }
    if (this.model.get('state') === this.StateEnum.ADD_HEX_TEMPLATE) {
      this.addHexTemplate();
      this.model.set('state', this.StateEnum.NOTHING);
    }
    if (this.model.get('state') === this.StateEnum.ADD_SQUARE_TEMPLATE) {
      this.addSquareTemplate();
      this.model.set('state', this.StateEnum.NOTHING);
    }
    if (this.model.get('state') === this.StateEnum.ADD_CONLINE) {
      console.log(this.selectedPoints[0], this.selectedPoints[1], this.selectedPoints.length);
      this.paper.conline(this.selectedPoints[0], this.selectedPoints[1]);
      this.options.historyCollection.add([{actionTag:'Conline added'}]);
      this.updateEventListeners();
      this.selectedPoints[0].tesseravisState = 'init';
      this.selectedPoints[0].attr({'fill': 'white', 'fill-opacity': 0});
      this.selectedPoints[1].tesseravisState = 'init';
      this.selectedPoints[1].attr({'fill': 'white', 'fill-opacity': 0});
      this.selectedPoints.splice(0, 2);
      this.model.set('state', this.StateEnum.NOTHING);
    }
    if (this.model.get('state') === this.StateEnum.ADD_EXTENDEDCONLINE) {
      this.paper.extendedconline(this.sqTile, this.selectedPoints[0], this.selectedPoints[1]);
      this.options.historyCollection.add([{actionTag:'Extended-Conline added'}]);
      this.updateEventListeners();
      this.selectedPoints[0].tesseravisState = 'init';
      this.selectedPoints[0].attr({'fill': 'white', 'fill-opacity': 0});
      this.selectedPoints[1].tesseravisState = 'init';
      this.selectedPoints[1].attr({'fill': 'white', 'fill-opacity': 0});
      this.selectedPoints.splice(0, 2);
      this.model.set('state', this.StateEnum.NOTHING);
    }
    if (this.model.get('state') === this.StateEnum.ADD_PATTERNLINE) {
      console.log(this.selectedPoints[0], this.selectedPoints[1], this.selectedPoints.length);
      this.paper.patternline(this.selectedPoints[0], this.selectedPoints[1]);
      this.options.historyCollection.add([{actionTag:'PatternLine added'}]);
      this.selectedPoints[0].tesseravisState = 'init';
      this.selectedPoints[0].attr({'fill': 'white', 'fill-opacity': 0});
      this.selectedPoints[1].tesseravisState = 'init';
      this.selectedPoints[1].attr({'fill': 'white', 'fill-opacity': 0});
      this.selectedPoints.splice(0, 2);
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

views.SaveView = Backbone.View.extend({
  isFileAPIAvailable: false,
  historyCollection: null,
  events: {
    'change #fileUpload': 'upload',
    'click .btn-download': 'downloadButton',
    'click .btn-upload': 'uploadButton',
  },
  initialize: function(options) {
    this.historyCollection = options.historyCollection;
    this.saveFilenameModel = options.saveFilenameModel;
    if (window.File && window.FileReader &&
        window.FileList && window.Blob) {
      this.isFileAPIAvailable = true;
    };
    this.render();
  },
  upload: function(event) {
    console.log('upload is clicked');
    var file = event.target.files[0];
    if (typeof file === 'undefined') {
      // Nothing selected, just return
      return;
    } else{
      if (!file.type.match('application/json')) {
        this.historyCollection.add([{actionTag:'File err: not a json file'}]);        
        return;
      }
      var reader = new FileReader();
      var model = this.model;
      var historyCollection = this.historyCollection;
      reader.onload = function(e) {
        model.set('json', e.target.result);
        model.set('state', model.StateEnum.UPLOAD_JSON);
        historyCollection.add([{actionTag:'Opened:' +
                                escape(file.name).substring(0,10) + '..'}]);
      };
      reader.onerror = function(e) {
        historyCollection.add([{actionTag:'File err:' +
                                e.target.error.name}]);
      };
      reader.readAsText(file);
    }
  },
  download: function(event) {
    console.log('download is clicked');
  },
  downloadButton: function(event) {
    console.log('downloadButton is clicked');
    if (this.saveFilenameModel.get('canSave')) {
      console.log(this.saveFilenameModel.get('filename'));
    }
  },
  uploadButton: function(event) {
    
  },
  render: function(){
    var template = _.template( $('#save_template').html(), {} );
    this.$el.html( template );
    return this;
  }
});

views.SaveFilenameView = Backbone.View.extend({
  events: {
    'click': 'clickOnMain',
    'click #ok': 'clickOk',
    'click #cancel': 'clickCancel',
    'keyup .filename' : 'keyupFilename'
  },
  initialize: function(options) {
    this.popr_cont = '.popr_container_' + this.model.get('mode');
    this.historyCollection = options.historyCollection;
    this.render();
  },
  render: function() {
    var popr_cont = this.popr_cont;
    var d_m = this.model.get('mode');
    var template = _.template( $('#popr_template').html(), {} );
    var out = '<div class="popr_container_' + d_m +
        '"><div class="popr_point_' + d_m +
        '">' + template()+ '</div></div>';
    this.$el.append(out);
        
    var w_t = $(popr_cont).outerWidth();
    var w_e = this.$el.width();
    var m_l = (w_e / 2) - (w_t / 2);
        
    $(popr_cont).css('margin-left', m_l + 'px');

    $(popr_cont).find('.noclick').click(function(event) {
      event.stopPropagation();
    });
    $(popr_cont).hide();
  },
  clickOnMain: function(event) {
    if (!this.model.get('isVisible'))  {
      this.model.set('isVisible', true);
      this.model.set('canSave', false);
      this.$el.find('.popr_content#second').css('z-index', -1);
      $(this.popr_cont).fadeIn(this.model.get('speed'));
    } else {
      this.model.set('isVisible', false);
      if (this.model.get('delay') === true) {
        $(this.popr_cont).delay(1000).fadeOut(50);
        this.model.set('delay', false);
      } else {
        $(this.popr_cont).hide();
      }
    }
    this.model.set('delay', false);
  },
  keyupFilename: function(event) {
    if(event.keyCode === 13){
      this.$el.find('#ok').click();
    }
  },
  clickOk: function() {
    this.model.set('delay', true);
    var filename = this.$el.find('.filename').val();
    var message = 'Saved to ' + filename;
    var canSave = true;
    if (filename.length === 0) {
      message = 'Did not save. Empty filename.';
      canSave = false;
    }
    this.historyCollection.add([{actionTag: message}]);      
    this.$el.find('.popr_content #message').text(message);
    this.$el.find('.popr_content#second').css('z-index', 10);
    if (canSave) {
      this.model.set('filename', this.$el.find('.filename').val());
      this.model.set('canSave', true);
    }
  },
  clickCancel: function() {
    this.model.set('delay', true);
    this.$el.find('.popr_content #message').text('Cancelled!');
    this.$el.find('.popr_content#second').css('z-index', 10);
    this.$el.find('.filename').val(this.model.get('filename'));
  }
});
