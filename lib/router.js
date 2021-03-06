// Generated by CoffeeScript 2.3.1
(function() {
  Router.route('/', function() {
    var me;
    me = this;
    Meteor.call('getEnvironmentVariable', 'EMBEDDED_GRAPH_SERVER_URL', function(err, result) {
      if (result !== void 0) {
        Session.set('serverURL', result);
        Session.set('tinkerPopVersion', '3');
        Session.set('graphName', 'the default graph');
        return me.render('HomeEmbedded');
      } else {
        return me.render('Home');
      }
    });
    return {
      where: 'server'
    };
  });

  Router.route('/Open', function() {
    this.render('Home');
    return {
      where: 'server'
    };
  });

  Router.route('/Embedded', function() {
    var me;
    me = this;
    Meteor.call('getEnvironmentVariable', 'EMBEDDED_GRAPH_SERVER_URL', function(err, result) {
      if (result !== void 0) {
        Session.set('serverURL', result);
        Session.set('tinkerPopVersion', '3');
        Session.set('graphName', 'the default graph');
        return me.render('HomeEmbedded');
      } else {
        return me.render('Home');
      }
    });
    return {
      where: 'server'
    };
  });

  Router.route('/testTinkerPopVersionDiscovery', function() {
    this.render('TestTinkerPopVersionDiscovery');
    return {
      where: 'server'
    };
  });

  Router.route('/help', function() {
    this.render('Help');
    return {
      where: 'server'
    };
  });

  Router.route('/demo-video', function() {
    this.render('DemoVideo');
    return {
      where: 'server'
    };
  });

  Router.route('/results', function() {
    Session.set('scriptResults', JSON.parse(this.params.query.json));
    console.log(this.params.query);
    Session.set('scriptCode', this.params.query.script);
    this.render('ResultsOnly', {
      data: this.params.query.json
    });
    return {
      where: 'server'
    };
  });

  Router.route('/hostURL', function() {
    var url;
    url = (Meteor.absoluteUrl()).slice(7, -1);
    if (url.slice(-5) === ':3000') {
      url = url.slice(0, -5);
    }
    Session.set('hostURL', url);
    this.render('ReturnHostURL');
    return {
      where: 'server'
    };
  });

  Router.route('/quikvis', function() {
    var serverURL;
    console.log(this.params);
    if (this.params.query.renderingOptions) {
      Session.set('renderingOptions', JSON.parse(this.params.query.renderingOptions));
    } else {
      Session.set('renderingOptions', []);
    }
    if (this.params.query.width) {
      Session.set('visWidth', JSON.parse(this.params.query.width));
    }
    if (this.params.query.height) {
      Session.set('visHeight', JSON.parse(this.params.query.height));
    }
    serverURL = this.params.query.serverURL;
    Session.set('serverURL', serverURL);
    Session.set("usingWebSockets", serverURL.slice(0, 5) === "ws://");
    Session.set('tinkerPopVersion', 3);
    Session.set('scripts', JSON.parse(this.params.query.scripts));
    Session.set('positions', JSON.parse(this.params.query.positions));
    Session.set('graphName', "the default graph");
    if (this.params.query.visOptions) {
      Session.set('visOptions', JSON.parse(this.params.query.visOptions));
    }
    //console.log @params.query
    //console.log @params.query
    this.render('QuikVis', {
      data: this.params.query.renderingOptions
    });
    return {
      where: 'server'
    };
  });

  Router.route('/quikvisiframe', function() {
    var serverURL;
    if (this.params.query.renderingOptions) {
      Session.set('renderingOptions', JSON.parse(this.params.query.renderingOptions));
    } else {
      Session.set('renderingOptions', []);
    }
    if (this.params.query.width) {
      Session.set('visWidth', JSON.parse(this.params.query.width));
    }
    if (this.params.query.height) {
      Session.set('visHeight', JSON.parse(this.params.query.height));
    }
    serverURL = this.params.query.serverURL;
    Session.set('serverURL', serverURL);
    Session.set("usingWebsSockets", serverURL.slice(0, 5) === "ws://");
    Session.set('tinkerPopVersion', 3);
    Session.set('scripts', JSON.parse(this.params.query.scripts));
    Session.set('graphName', "the default graph");
    if (this.params.query.visOptions) {
      Session.set('visOptions', JSON.parse(this.params.query.visOptions));
    }
    //console.log @params.query
    this.render('QuikVisIFrameOnly', {
      data: this.params.query.renderingOptions
    });
    return {
      where: 'server'
    };
  });

  Router.route('/quikvisminimal', function() {
    var serverURL;
    if (this.params.query.width) {
      Session.set('visWidth', JSON.parse(this.params.query.width));
    }
    if (this.params.query.height) {
      Session.set('visHeight', JSON.parse(this.params.query.height));
    }
    if (this.params.query.renderingOptions) {
      Session.set('renderingOptions', JSON.parse(this.params.query.renderingOptions));
    } else {
      Session.set('renderingOptions', []);
    }
    serverURL = this.params.query.serverURL;
    Session.set('serverURL', serverURL);
    Session.set("usingWebSockets", serverURL.slice(0, 5) === "ws://");
    Session.set('tinkerPopVersion', 3);
    Session.set('scripts', JSON.parse(this.params.query.scripts));
    Session.set('graphName', "the default graph");
    if (this.params.query.visOptions) {
      Session.set('visOptions', JSON.parse(this.params.query.visOptions));
    }
    //console.log @params.query
    this.render('QuikVisIFrameOnlyMinimal', {
      data: this.params.query.renderingOptions
    });
    return {
      where: 'server'
    };
  });

}).call(this);

//# sourceMappingURL=router.js.map
