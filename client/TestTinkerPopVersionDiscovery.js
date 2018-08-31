// Generated by CoffeeScript 2.3.1
(function() {
  var i, len, test, tests;

  tests = [
    {
      url: 'http://localhost:8182',
      expectedVersion: 0,
      discoveredVersion: null
    }
  ];

  for (i = 0, len = tests.length; i < len; i++) {
    test = tests[i];
    Session.set(test.url, test);
  }

  Template.TestTinkerPopVersionDiscovery.rendered = function() {
    var j, len1, results;
    results = [];
    for (j = 0, len1 = tests.length; j < len1; j++) {
      test = tests[j];
      results.push(Meteor.call('discoverTinkerPopVersionAt', test.url, function(err, dat) {
        var tst, url, version;
        if (!err) {
          url = dat[0];
          version = dat[1];
          tst = Session.get(url);
          tst.discoveredVersion = version;
          return Session.set(url, tst);
        }
      }));
    }
    return results;
  };

  Template.TestTinkerPopVersionDiscovery.helpers({
    results: function() {
      return JSON.stringify((function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = tests.length; j < len1; j++) {
          test = tests[j];
          results.push(Session.get(test.url));
        }
        return results;
      })());
    }
  });

}).call(this);

//# sourceMappingURL=TestTinkerPopVersionDiscovery.js.map