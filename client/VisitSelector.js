// Generated by CoffeeScript 1.12.6
(function() {
  Template.VisitSelector.rendered = function() {
    $(".visitVert").prop('checked', true);
    $(".visitVert").change(function() {
      var checked, label2Visit, verts2Visit, visitCount;
      checked = $(this).prop('checked');
      label2Visit = this.id;
      visitCount = JSON.parse($('input#' + label2Visit + '.visitVertCount').val());
      verts2Visit = Session.get('verts2Visit');
      verts2Visit[label2Visit] = visitCount;
      if (!checked) {
        delete verts2Visit[label2Visit];
      }
      return Session.set('verts2Visit', verts2Visit);
    });
    return $(".visitVertCount").bind('input', function() {
      var label2Count, labelChecked, verts2Visit;
      label2Count = this.id;
      verts2Visit = Session.get('verts2Visit');
      labelChecked = $('input#' + label2Count + '.visitVert.vis-options-checkbox').prop('checked');
      if (labelChecked) {
        verts2Visit[label2Count] = JSON.parse(this.value);
        return Session.set('verts2Visit', verts2Visit);
      }
    });
  };

  Template.VisitSelector.helpers({
    options: function() {
      var i, labels, len, ref, tot, vert;
      labels = {};
      ref = this.allV;
      for (i = 0, len = ref.length; i < len; i++) {
        vert = ref[i];
        if (labels[vert.label] !== void 0) {
          tot = labels[vert.label];
        } else {
          tot = 0;
        }
        labels[vert.label] = tot + 1;
      }
      Session.set('verts2Visit', labels);
      return _.pairs(labels);
    },
    label: function() {
      return this[0];
    },
    count: function() {
      return this[1];
    }
  });

}).call(this);

//# sourceMappingURL=VisitSelector.js.map
