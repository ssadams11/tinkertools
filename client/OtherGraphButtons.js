// Generated by CoffeeScript 2.3.1
var collectRootsAndLowBranchVerts, firstPass, ingestCSVRecordsUsingTemplate, ingestVertices, ingestionScript, ingestionScriptWithBatches, midPass, processCSVTemplateRows, wsUrl;

Template.OtherGraphButtons.rendered = function() {
  $(".graph-script-file-import").click(function() {
    return bootbox.dialog({
      title: "Select a script file to be uploaded into this graph only",
      message: '<input type="file" id="fileName" onchange="startRead()"/>Preview:<textarea id="fileContents" />',
      buttons: {
        success: {
          label: "Import",
          className: "btn-success",
          callback: function() {
            var e, each, i, j, k, l, len, len1, len2, len3, len4, len5, len6, len7, m, n, o, objs, p;
            try {
              objs = JSON.parse($('#fileContents').val());
            } catch (error1) {
              e = error1;
              alert('Syntax error in upload file - Expecting JSON');
              debugger;
              return;
            }
            for (i = 0, len = objs.length; i < len; i++) {
              each = objs[i];
              (each.userID = Session.get('userID'));
            }
            for (j = 0, len1 = objs.length; j < len1; j++) {
              each = objs[j];
              (each.graphName = Session.get('graphName'));
            }
            for (k = 0, len2 = objs.length; k < len2; k++) {
              each = objs[k];
              (each.serverURL = Session.get('serverURL'));
            }
            for (l = 0, len3 = objs.length; l < len3; l++) {
              each = objs[l];
              (each.tinkerPopVersion = Session.get('tinkerPopVersion'));
            }
            if ((Session.get('serverURL')) === window.BluemixGraphService) {
              for (m = 0, len4 = objs.length; m < len4; m++) {
                each = objs[m];
                (each.bluemixAPI = window.bluemixAPI);
              }
              for (n = 0, len5 = objs.length; n < len5; n++) {
                each = objs[n];
                (each.bluemixUsername = window.bluemixUsername);
              }
              for (o = 0, len6 = objs.length; o < len6; o++) {
                each = objs[o];
                (each.bluemixPassword = window.bluemixPassword);
              }
            }
            for (p = 0, len7 = objs.length; p < len7; p++) {
              each = objs[p];
              Scripts.insert(each);
            }
            return console.log(objs);
          }
        }
      }
    });
  });
  $(".graph-script-file-export").click(function() {
    var blob, data, each, i, j, k, l, len, len1, len2, len3, objs;
    objs = Scripts.find({
      userID: Session.get('userID'),
      serverURL: Session.get('serverURL'),
      graphName: Session.get('graphName')
    }).fetch();
    for (i = 0, len = objs.length; i < len; i++) {
      each = objs[i];
      delete each._id;
    }
    for (j = 0, len1 = objs.length; j < len1; j++) {
      each = objs[j];
      delete each.bluemixAPI;
    }
    for (k = 0, len2 = objs.length; k < len2; k++) {
      each = objs[k];
      delete each.bluemixUsername;
    }
    for (l = 0, len3 = objs.length; l < len3; l++) {
      each = objs[l];
      delete each.bluemixPassword;
    }
    data = [JSON.stringify(objs, null, 4)];
    blob = new Blob(data, {
      type: "application/json;charset=utf-8"
    });
    return saveAs(blob, 'gremlin-scripts-from-' + Session.get('graphName') + '.json');
  });
  $(".graph-file-import-form").fileupload({
    url: '/upload'
  });
  $(".graphML-file-import").click(function() {
    return bootbox.dialog({
      title: "Select a GraphML file to be uploaded into this graph",
      message: '<input type="file" id="fileName" onchange="window.fileSelected(this.files)"/>Preview:<textarea id="fileContents" />', //Blaze.toHTML(Template.GraphUploadPopUp)
      buttons: {
        success: {
          label: "Upload and Install",
          className: "btn-success",
          callback: function() {
            var file, formData, i, len, ref, request, results1, uploadName;
            //NProgress.configure({ parent: '.progress-goes-here', showSpinner: true,})
            //NProgress.start()
            formData = new FormData();
            ref = window.FilesToUpload;
            results1 = [];
            for (i = 0, len = ref.length; i < len; i++) {
              file = ref[i];
              uploadName = file.name;
              formData.append('file', file, uploadName);
              request = new XMLHttpRequest();
              request.open("POST", 'http://' + window.thisServerAddress + "/upload");
              console.log('uploading file', file.name);
              request.send(formData);
              results1.push(Meteor.call('onceFileExistsOnServer', window.thisServerAddress, file.name, function(er, rs) {
                var each, script, startTime, uploadNames;
                if (rs) {
                  uploadNames = (function() {
                    var j, len1, ref1, results2;
                    ref1 = window.FilesToUpload;
                    results2 = [];
                    for (j = 0, len1 = ref1.length; j < len1; j++) {
                      each = ref1[j];
                      results2.push(each.name);
                    }
                    return results2;
                  })();
                  if (uploadNames.length > 0) {
                    script = "filesToUpload=" + (JSON.stringify(uploadNames)) + "\n filesToUpload.each{fileName->\n g.loadGraphML('http://" + window.thisServerAddress + "/files/'+fileName)\n println 'Finished loading '+fileName\n }";
                    console.log(script);
                    if (Session.get("usingWebSockets")) {
                      window.socketToJanus.onmessage = function(msg) {
                        var data, endTime, json, results;
                        endTime = Date.now();
                        data = msg.data;
                        json = JSON.parse(data);
                        if (json.status.code >= 500) {
                          return alert("Error in processing Gremlin script: " + json.status.message);
                        } else {
                          if (json.status.code === 204) {
                            results = [];
                          } else {
                            results = json.result.data;
                          }
                          return callback(results);
                        }
                      };
                      request = {
                        requestId: uuid.new(),
                        op: "eval",
                        processor: "",
                        args: {
                          gremlin: script,
                          bindings: {},
                          language: "gremlin-groovy"
                        }
                      };
                      startTime = Date.now();
                      return window.socketToJanus.send(JSON.stringify(request));
                    } else {
                      return Meteor.call('runScript', Session.get('userID'), Session.get('serverURL'), Session.get('tinkerPopVersion'), Session.get('graphName'), 'Built-in GraphML Loader', script, function(er, rs) {
                        console.log(er, rs);
                        if (er) {
                          alert('Failed to load file, try again, or check file');
                        }
                        if (rs.success === true) {
                          return window.deleteFilesOnServer(rs.results);
                        } else {
                          //NProgress.done()
                          //NProgress.done()
                          debugger;
                        }
                      });
                    }
                  }
                } else {
                  //NProgress.done()
                  debugger;
                }
              }));
            }
            return results1;
          }
        }
      }
    });
  });
  $(".graphSON-file-import").click(function() { //NOTE this implementation assumes the target graph can reach out of port 80 to the tinkertools server, be sure of the firewall on the graph server
    return bootbox.dialog({
      title: "Select a GraphSON file to be uploaded into this graph",
      message: '<input type="file" id="fileName" onchange="window.fileSelected(this.files)"/>Preview:<textarea id="fileContents" />', //Blaze.toHTML(Template.GraphUploadPopUp)
      buttons: {
        success: {
          label: "Upload and Install",
          className: "btn-success",
          callback: function() {
            var file, formData, i, len, ref, request, results1, uploadName;
            //NProgress.configure({ parent: '.progress-goes-here', showSpinner: true,})
            // NProgress.start()
            formData = new FormData();
            ref = window.FilesToUpload;
            results1 = [];
            for (i = 0, len = ref.length; i < len; i++) {
              file = ref[i];
              uploadName = file.name;
              formData.append('file', file, uploadName);
              request = new XMLHttpRequest();
              request.open("POST", 'http://' + window.thisServerAddress + "/upload");
              console.log('uploading file', file.name);
              request.send(formData);
              results1.push(Meteor.call('onceFileExistsOnServer', window.thisServerAddress, file.name, function(er, rs) {
                var each, script, startTime, uploadNames;
                if (rs) {
                  uploadNames = (function() {
                    var j, len1, ref1, results2;
                    ref1 = window.FilesToUpload;
                    results2 = [];
                    for (j = 0, len1 = ref1.length; j < len1; j++) {
                      each = ref1[j];
                      results2.push(each.name);
                    }
                    return results2;
                  })();
                  if (uploadNames.length > 0) {
                    script = "filesToUpload=" + (JSON.stringify(uploadNames)) + "\n filesToUpload.each{fileName->\n g.loadGraphSON('http://" + window.thisServerAddress + "/files/'+fileName)\n println 'Finished loading '+fileName\n }";
                    console.log(script);
                    if (Session.get("usingWebSockets")) {
                      window.socketToJanus.onmessage = function(msg) {
                        var data, json, results;
                        data = msg.data;
                        json = JSON.parse(data);
                        if (json.status.code >= 500) {
                          return alert("Error in processing Gremlin script: " + json.status.message);
                        } else {
                          if (json.status.code === 204) {
                            results = [];
                          } else {
                            results = json.result.data;
                          }
                          return callback(results);
                        }
                      };
                      request = {
                        requestId: uuid.new(),
                        op: "eval",
                        processor: "",
                        args: {
                          gremlin: script,
                          bindings: {},
                          language: "gremlin-groovy"
                        }
                      };
                      startTime = Date.now();
                      return window.socketToJanus.send(JSON.stringify(request));
                    } else {
                      return Meteor.call('runScript', Session.get('userID'), Session.get('serverURL'), Session.get('tinkerPopVersion'), Session.get('graphName'), 'Built-in GraphSON Loader', script, function(er, rs) {
                        console.log(er, rs);
                        if (er) {
                          alert('Failed to load file, try again, or check file');
                        }
                        if (rs.success === true) {
                          return window.deleteFilesOnServer(rs.results);
                        } else {

                        }
                      });
                    }
                  }
                }
              }));
            }
            return results1;
          }
        }
      }
    });
  });
  //NProgress.done()
  //NProgress.done()
  return $('.csv-files-import').click(function() {
    return bootbox.dialog({
      title: "Select a CSV Ingestion Template and one or more CSV files to Ingest",
      message: '<input type="file" id="csv-template-file" onchange="window.csvTemplateFileSelected(this.files)" />Preview of CSV Ingest Template:<textarea id="csvTemplateFileContents" /><input type="file" id="files" onchange="window.filesSelected(this.files)" multiple/>Preview:<textarea id="fileContents" />',
      buttons: {
        success: {
          label: "Upload and Install",
          className: "btn-success",
          callback: function() {
            //NProgress.configure({ parent: '.progress-goes-here', showSpinner: false,})
            //NProgress.start()
            Session.set('totalRecordsParsed', 0);
            return $('#csv-template-file').parse({
              config: {
                header: true,
                skipEmptyLines: true,
                chunk: function(chunk, handle) {
                  var file;
                  //NProgress.inc()
                  file = handle.fileBeingParsed;
                  console.log(chunk);
                  return window.CSVIngestTemplate = processCSVTemplateRows(chunk.data);
                }
              },
              before: function(file, inputElem) {
                console.log('Parsing CSV template file:', file.name);
                Session.set('fileBeingParsed', file.name);
                return Session.set('recordsParsed', 0);
              },
              complete: async function(file) {
                if (file) {
                  console.log('Completed', file.name);
                }
                console.log('first...');
                await firstPass();
                console.log('second');
                await midPass();
                console.log('adding twigs and leaves');
                window.prom = wsp.open();
                debugger;
                return $('#files').parse({
                  config: {
                    header: true,
                    skipEmptyLines: true,
                    chunk: function(results, parser) {
                      console.log("parsed chunk = ", results.data);
                      return ingestCSVRecordsUsingTemplate(results.data, window.CSVIngestTemplate, prom, function(err, res) {});
                    },
                    //console.log "Result of ingest = ",res
                    complete: function(results, file) {
                      if (file) {
                        return console.log('Completed', file.name);
                      }
                    }
                  }
                });
              }
            });
          }
        }
      }
    });
  });
};

import WebSocketAsPromised from 'websocket-as-promised';

window.wsap = WebSocketAsPromised;

wsUrl = "ws://localhost:8182/gremlin";

window.wsp = new WebSocketAsPromised(wsUrl, {
  packMessage: function(data) {
    return JSON.stringify(data);
  },
  unpackMessage: function(message) {
    return JSON.parse(message);
  },
  attachRequestId: function(data, requestId) {
    return Object.assign({
      requestId: requestId
    }, data);
  },
  extractRequestId: function(data) {
    return data && data.requestId;
  }
});

window.wsp.onMessage.addListener(function(message) {
  return console.log(JSON.parse(message));
});

ingestCSVRecordsUsingTemplate = function(rows, template, priorPromise, callback) {
  var bindings, eTemp, edge, edges2FindOrCreate, i, incomingValue, j, k1, k2, len, len1, outgoingValue, prop, ref, ref1, ref2, ref3, req, request, requests, respondIt, results1, row, sendIt, vTemp, vert, verts2Create, verts2FindOrCreate, wait;
  requests = [];
  for (i = 0, len = rows.length; i < len; i++) {
    row = rows[i];
    //console.log "row = ",row
    //process verts first
    verts2Create = [];
    verts2FindOrCreate = [];
    ref = template.verts;
    for (k1 in ref) {
      vTemp = ref[k1];
      vert = {
        label: vTemp.label,
        id: Number(vTemp.uid),
        properties: {
          _class: [
            {
              value: vTemp._class
            }
          ]
        },
        propsToMatch: {},
        propsToAdd: {}
      };
      ref1 = vTemp.props;
      for (k2 in ref1) {
        prop = ref1[k2];
        incomingValue = row[prop.property];
        if (incomingValue) {
          if (prop.dataType === "String") {
            outgoingValue = incomingValue.toString();
          }
          if (prop.dataType === "Single") {
            outgoingValue = Number(incomingValue);
          }
          if (prop.dataType === "Double") {
            outgoingValue = Number(incomingValue);
          }
          if (prop.dataType === "Bool") {
            outgoingValue = JSON.parse(incomingValue.toLowerCase());
          }
          vert.properties[prop.property] = [
            {
              value: outgoingValue
            }
          ];
          if (vert.properties[prop.findIt] === "TRUE") {
            vert.propsToMatch[prop.property] = [
              {
                value: outgoingValue
              }
            ];
          } else {
            vert.propsToAdd[prop.property] = [
              {
                value: outgoingValue
              }
            ];
          }
        }
      }
      if (vert.propsToMatch === {}) {
        verts2Create.push(vert);
      } else {
        verts2FindOrCreate.push(vert);
      }
    }
    //process edges
    edges2FindOrCreate = [];
    ref2 = template.edges;
    for (k1 in ref2) {
      eTemp = ref2[k1];
      edge = {
        label: eTemp.label,
        id: Number(eTemp.uid),
        properties: {},
        outV: Number(eTemp.fromV),
        inV: Number(eTemp.toV)
      };
      ref3 = eTemp.props;
      for (k2 in ref3) {
        prop = ref3[k2];
        incomingValue = row[prop.property];
        if (incomingValue) {
          if (prop.dataType === "String") {
            outgoingValue = incomingValue.toString();
          }
          if (prop.dataType === "Single") {
            outgoingValue = JSON.parse(incomingValue);
          }
          if (prop.dataType === "Double") {
            outgoingValue = JSON.parse(incomingValue);
          }
          if (prop.dataType === "Bool") {
            outgoingValue = JSON.parse(incomingValue.toLowerCase());
          }
          edge.properties[prop.property] = outgoingValue;
        }
      }
      edges2FindOrCreate.push(edge);
    }
    //NOTE that edges2Create is ignored in this version
    bindings = {
      verts2Create: verts2Create,
      verts2FindOrCreate: verts2FindOrCreate,
      edges2FindOrCreate: edges2FindOrCreate,
      edges2Create: [],
      transactionContext: "ingesting from CSV"
    };
    //console.log "bindings ready to send = ",bindings
    if (Session.get("usingWebSockets")) {
      request = {
        op: "eval",
        processor: "",
        args: {
          gremlin: ingestionScript(),
          bindings: bindings,
          language: "gremlin-groovy"
        }
      };
      requests.push(JSON.parse(JSON.stringify(request)));
    } else {
      Meteor.call('runScript', Session.get('userID'), Session.get('serverURL'), Session.get('tinkerPopVersion'), Session.get('graphName'), 'CSV Ingester', ingestionScript(), bindings, function(error, result) {
        return callback(result.results);
      });
    }
  }
  //console.log "Requests = ",requests
  wait = function(ms) {
    return new Promise(function(resolve) {
      return setTimeout(resolve, ms);
    });
  };
  sendIt = async function(req) {
    await wait(100);
    return wsp.sendRequest(req, {
      requestId: uuid.new()
    });
  };
  respondIt = function(response) {
    return console.log("resp=", response);
  };
  results1 = [];
  for (j = 0, len1 = requests.length; j < len1; j++) {
    req = requests[j];
    window.prom = window.prom.then(sendIt.bind(null, req));
    results1.push(window.prom = window.prom.then(respondIt));
  }
  return results1;
};

firstPass = function() {
  //First pass to locate and find/create roots and low branch verts
  return new Promise(function(resolve) {
    window.verts2EnsureCreation = {};
    return $('#files').parse({
      config: {
        header: true,
        skipEmptyLines: true,
        step: function(results, parser) {
          var row;
          row = results.data[0];
          return collectRootsAndLowBranchVerts(row, window.CSVIngestTemplate);
        },
        complete: function(results, file) {
          return resolve();
        }
      }
    });
  });
};

midPass = function() {
  return new Promise(function(resolve) {
    return ingestVertices(Object.values(window.verts2EnsureCreation), function(err, res) {
      console.log(res);
      return resolve();
    });
  });
};

ingestVertices = function(verts2Create, callback) {
  var bindings, request, respondIt, sendIt, startTime, wait;
  window.prom = wsp.open();
  bindings = {
    verts2Create: verts2Create,
    verts2FindOrCreate: [],
    edges2FindOrCreate: [],
    edges2Create: [],
    transactionContext: "ingesting from CSV"
  };
  console.log(bindings);
  if (Session.get("usingWebSockets")) {
    request = {
      requestId: uuid.new(),
      op: "eval",
      processor: "",
      args: {
        gremlin: ingestionScript(),
        bindings: bindings,
        language: "gremlin-groovy"
      }
    };
    startTime = Date.now();
    wait = function(ms) {
      return new Promise(function(resolve) {
        return setTimeout(resolve, ms);
      });
    };
    sendIt = async function(req) {
      await wait(100);
      return wsp.sendRequest(req, {
        requestId: uuid.new()
      });
    };
    respondIt = function(response) {
      console.log("resp=", response);
      return callback('no err', response);
    };
    window.prom = window.prom.then(sendIt.bind(null, request));
    return window.prom = window.prom.then(respondIt);
  } else {
    return Meteor.call('runScript', Session.get('userID'), Session.get('serverURL'), Session.get('tinkerPopVersion'), Session.get('graphName'), 'CSV Ingester', ingestionScript(), bindings, function(error, result) {
      return callback(result.results);
    });
  }
};

collectRootsAndLowBranchVerts = function(row, template) {
  var a, incomingValue, k1, k2, outgoingValue, prop, ref, ref1, results1, vTemp, vert;
  console.log("looking for roots=", row);
  ref = template.verts;
  //process verts first
  results1 = [];
  for (k1 in ref) {
    vTemp = ref[k1];
    vert = {
      label: vTemp.label,
      id: Number(vTemp.uid),
      properties: {
        _class: [
          {
            value: vTemp._class
          }
        ]
      },
      propsToMatch: {},
      propsToAdd: {}
    };
    ref1 = vTemp.props;
    for (k2 in ref1) {
      prop = ref1[k2];
      incomingValue = row[prop.property];
      if (incomingValue) {
        if (prop.dataType === "String") {
          outgoingValue = incomingValue.toString();
        }
        if (prop.dataType === "Single") {
          outgoingValue = Number(incomingValue);
        }
        if (prop.dataType === "Double") {
          outgoingValue = Number(incomingValue);
        }
        if (prop.dataType === "Bool") {
          outgoingValue = JSON.parse(incomingValue.toLowerCase());
        }
        vert.properties[prop.property] = [
          {
            value: outgoingValue
          }
        ];
        if (prop.findIt === "TRUE") {
          vert.propsToMatch[prop.property] = [
            {
              value: outgoingValue
            }
          ];
        } else {
          vert.propsToAdd[prop.property] = [
            {
              value: outgoingValue
            }
          ];
        }
      }
    }
    if (Object.keys(vert.propsToMatch).length === 0) {
      results1.push(a = 1);
    } else {
      console.log(vert);
      results1.push(window.verts2EnsureCreation[vert.label + ':' + vert._class + ':' + JSON.stringify(vert.propsToMatch)] = vert);
    }
  }
  return results1;
};

ingestionScript = function() {
  return "//bindings include: {verts2FindOrCreate, edges2FindOrCreate, verts2Create, edges2Create}\nvMap = [:]\nvMapFull = [:]\neMapFull = [:]\neMultimatchMap = [:]\nverts2FindOrCreate.collect { json ->\n    trav = g.V().hasLabel(json.label)\n    json.properties.each { key, val ->\n        trav = trav.has(key, val[0].value)\n        }\n    results = trav.toList()\n   if (results.size == 0) {oldV = null} else {oldV = results[0]}\n    if (oldV == null){\n        //create it\n        newV = g.addV(json.label).next()\n        json.properties.each { key, val ->\n            g.V(newV.id()).property(key, val[0].value).next()\n            }\n    } else {\n        //reference it\n        newV = oldV\n    }\n    vMap[json.id] = newV.id()\n    vMapFull[json.id] = newV\n}\n\n\nverts2Create.collect { json ->\n    newV = g.addV(json.label).next()\n    vMap[json.id] = newV.id()\n    vMapFull[json.id] = newV\n    json.properties.each { key, val ->\n        g.V(newV.id()).property(key, val[0].value).next()\n}}\n\nedges2FindOrCreate.collect { json ->\n    fromID = vMap[json.outV] ? vMap[json.outV] : json.outV\n    toID = vMap[json.inV] ? vMap[json.inV] : json.inV\n    /*cases to consider:\n        1) edge does not exist....create it and its properties\n        2) a single edge exists that matches to/from/label....use it and overwrite/add properties\n        3) multiple edges exist that match from/to/label, pick one and overwrite/add properties, and report it in return via eMultimatchMap[ incoming-json-id: chosen existing edge]\n    */\n\n    oldEdges = g.V(fromID).outE(json.label).as('e').inV().hasId(toID).select('e').toList()\n    if (oldEdges.size() == 0){  //none exists so create a new edge\n        newEdge=g.V(fromID).addE(json.label).to(g.V(toID)).next()\n        theEdge = newEdge\n    } else {\n        if (oldEdges.size() == 1){ //only one exists so use it\n            theEdge = oldEdges[0]\n        } else { //multiple exists so pick first one and use it and record the fact in eMultimatchMap\n            theEdge = oldEdges[0]\n            eMultimatchMap[json.id] = theEdge\n        }\n    }\n\n    eMapFull[json.id] = theEdge\n    json.properties.collect { key, val ->\n        g.E(theEdge.id()).property(key, val.value).next()\n\n}}\n  edges2Create.collect { json ->\n      fromID = vMap[json.outV] //? vMap[json.outV] : json.outV\n      toID = vMap[json.inV] //? vMap[json.inV] : json.inV\n\n\n      newEdge=g.V(fromID).addE(json.label).to(g.V(toID)).next()\n      eMapFull[json.id] = newEdge\n      json.properties.collect { key, val ->\n          g.E(newEdge.id()).property(key, val.value).next()\n      }}\n\n\n//answer the maps of old element ids to new elements\n[vMap: vMap, vertMap: vMapFull, edgeMap: eMapFull, eMultimatchMap: eMultimatchMap]";
};

ingestionScriptWithBatches = function() {
  return "//given arrays of json for verts and edges, generate them into the graph\n//batches =  incoming binding, an array of bindings for the following\n//verts2FindOrCreate = incoming binding, an map of objects of properties to use to find existing vertices, or to create them if needed, keyed by fake vertID\n/* Example:   (needs to be a full description of the verstex in case we need to create it\n[\n    {label: \"Sensor\", id: 0, properties:{\"sensorID\": [{value: \"v000000ktsmkitch\"}]}}\n]\n*/\n//verts2Create = incoming binding, an array of vertex-structured objects\n//edges2Create = incoming binding, an array of edge-structured objects\n//transactionContext = incoming binding, string declaring purpose of graph transaction (comes out in Kafka topic \"graphChange\")\n\nbatches.collect { bindings ->\n    verts2FindOrCreate = bindings.verts2FindOrCreate\n    verts2Create = bindings.verts2Create\n    edges2Create = bindings.edges2Create\n    transactionContext = bindings.transactionContext\n    vMap = [:]\n    vMapFull = [:]\n    eMapFull = [:]\n    verts2FindOrCreate.collect { json ->\n        trav = g.V().hasLabel(json.label)\n        json.properties.each { key, val ->\n            trav = trav.has(key, val[0].value)\n            }\n        results = trav.toList()\n       if (results.size == 0) {oldV = null} else {oldV = results[0]}\n        if (oldV == null){\n            //create it\n            newV = g.addV(json.label).next()\n            json.properties.each { key, val ->\n                g.V(newV.id()).property(key, val[0].value).next()\n                }\n        } else {\n            //reference it\n            newV = oldV\n        }\n        vMap[json.id] = newV.id()\n\n    }\n    verts2Create.collect { json ->\n        newV = g.addV(json.label).next()\n        vMap[json.id] = newV.id()\n        vMapFull[json.id] = newV\n        json.properties.each { key, val ->\n            g.V(newV.id()).property(key, val[0].value).next()\n    }}\n    edges2Create.collect { json ->\n        fromID = vMap[json.outV] ? vMap[json.outV] : json.outV\n        toID = vMap[json.inV] ? vMap[json.inV] : json.inV\n        newEdge=g.V(fromID).addE(json.label).to(g.V(toID)).next()\n        eMapFull[json.id] = newEdge\n        json.properties.collect { key, val ->\n            g.E(newEdge.id()).property(key, val.value).next()\n    }}\n    //answer the maps of old element ids to new elements\n    [vertMap: vMapFull, edgeMap: eMapFull]\n}";
};

window.filesSelected = function(files) {
  window.FilesToUpload = files;
  return startRead();
};

window.csvTemplateFileSelected = function(file) {
  window.CSVTemplateFileToUpload = file[0];
  return startReadingCSVTemplate();
};

window.startReadingCSVTemplate = function(evt) {
  var element;
  element = document.getElementById("csv-template-file");
  if (element) {
    if (element.files[0].size > 10000000) {
      return CSVgetAsTextPreview(element.files[0]);
    } else {
      return CSVgetAsText(element.files[0]);
    }
  }
};

window.CSVgetAsTextPreview = function(readFile) {
  var reader;
  reader = new FileReader;
  reader.readAsText(readFile.slice(0, 10000000), "UTF-8");
  return reader.onload = csvTemplateFileLoaded;
};

window.CSVgetAsText = function(readFile) {
  var reader;
  reader = new FileReader;
  reader.readAsText(readFile, "UTF-8");
  return reader.onload = csvTemplateFileLoaded;
};

window.csvTemplateFileLoaded = function(evt) {
  return $('#csvTemplateFileContents').val(evt.target.result);
};

processCSVTemplateRows = function(rows) {
  var eKey, edgeLabel, edges, i, index, indices, key, len, nextEdgeId, ordered, ref, ref1, result, row, specs, uid, vert, verts;
  verts = {};
  edges = {};
  indices = {};
  for (i = 0, len = rows.length; i < len; i++) {
    row = rows[i];
    if (row.type === 'vertex') {
      uid = row.uid;
      delete row.type;
      delete row.uid;
      if (!verts[uid]) {
        verts[uid] = {
          uid: uid,
          type: 'vertex',
          label: row['label/_class'],
          _class: row['label/_class'],
          props: [],
          edges: {}
        };
      }
      if (row.edgeLabel1) {
        verts[uid]['edges'][row.edgeTo1] = row.edgeLabel1;
      }
      delete row.edgeLabel1;
      delete row.edgeTo1;
      if (row.edgeLabel2) {
        verts[uid]['edges'][row.edgeTo2] = row.edgeLabel2;
      }
      delete row.edgeLabel2;
      delete row.edgeTo2;
      if (row.edgeLabel3) {
        verts[uid]['edges'][row.edgeTo3] = row.edgeLabel3;
      }
      delete row.edgeLabel3;
      delete row.edgeTo3;
      if (row.edgeLabel4) {
        verts[uid]['edges'][row.edgeTo4] = row.edgeLabel4;
      }
      delete row.edgeLabel4;
      delete row.edgeTo4;
      if (row.edgeLabel5) {
        verts[uid]['edges'][row.edgeTo5] = row.edgeLabel5;
      }
      delete row.edgeLabel5;
      delete row.edgeTo5;
      delete row['label/_class'];
      //handle index decls
      if (row.indexName) {
        if (!indices[row.indexName]) {
          indices[row.indexName] = {
            indexName: row.indexName,
            indexType: row.indexType,
            keys: []
          };
        }
        indices[row.indexName].keys.push({
          key: row.property,
          dataType: row.dataType,
          indexOrder: row.indexOrder
        });
      }
      delete row.indexName;
      delete row.indexType;
      delete row.indexOrder;
      //Now add all the rest of the property attributes
      verts[uid]['props'].push(row);
    }
    if (row.type === 'edge') {
      uid = row.uid;
      delete row.type;
      delete row.uid;
      if (!edges[uid]) {
        edges[uid] = {
          uid: uid,
          type: 'edge',
          label: row['label/_class'],
          props: []
        };
      }
      delete row['label/_class'];
      if (row.fromV) {
        edges[uid].fromV = row.fromV;
        delete row.fromV;
      }
      if (row.toV) {
        edges[uid].toV = row.toV;
        delete row.toV;
      }
      edges[uid]['props'].push(row);
    }
  }
  //post-process verts to collect simple edges
  nextEdgeId = 1000;
  for (key in verts) {
    vert = verts[key];
    ref = vert.edges;
    for (eKey in ref) {
      edgeLabel = ref[eKey];
      edges[nextEdgeId] = {
        uid: nextEdgeId,
        type: 'edge',
        label: edgeLabel,
        fromV: vert.uid,
        toV: JSON.parse(eKey)
      };
      nextEdgeId = nextEdgeId + 1;
    }
  }
//post-process the indices to reduce single key cases
  for (key in indices) {
    index = indices[key];
    ordered = true;
    index.dataType = 'Ordered';
    ref1 = index.keys;
    for (key in ref1) {
      specs = ref1[key];
      if (!specs.indexOrder) {
        ordered = false;
        index.dataType = index.keys[0].dataType; //assume they are all the same in this case
      }
    }
    if (!ordered) {
      delete index.keys;
    }
  }
  result = {
    verts: verts,
    edges: edges,
    indices: indices
  };
  console.log(result);
  return result;
};

/*  mostly junk

console.log "Starting 1st pass"
window.verts2EnsureCreation = {}
await firstPass()
console.log "Starting mid pass"
await midPass()
console.log "Starting 2nd pass"
await secondPass()
console.log "done"

firstPass = ()->
#First pass to locate and find/create roots and low branch verts
new Promise (resolve) ->
$('#files').parse
  config:
    header: true
    skipEmptyLines:true
    step: (results, parser)->
      row = results.data
      collectRootsAndLowBranchVerts(row, window.CSVIngestTemplate)
    complete: (results,file)->
      resolve()

midPass = ()->
new Promise (resolve) ->
ingestVertices(Object.values(window.verts2EnsureCreation), (err,res)->
  console.log res
  resolve()
)

secondPass = ()->
#Second pass to add all high branches and leaf verts
new Promise (resolve) ->
$('#files').parse
  config:
    header: true
    skipEmptyLines:true
    chunk: (results, parser)->
      ingestCSVRecordsUsingTemplate(results.data, window.CSVIngestTemplate, (err,res)->
        console.log res
      )
    complete: (results,file)->
      if file
        console.log 'Completed',file.name
      resolve()

ingestVertices = (verts2Create,callback)->
bindings = {verts2Create: verts2Create, verts2FindOrCreate: [], edges2FindOrCreate: [], edges2Create:[], transactionContext: "ingesting from CSV"}
console.log bindings
if (Session.get "usingWebSockets")
window.socketToJanus.onmessage = (msg) ->
  endTime = Date.now()
  data = msg.data
  json = JSON.parse(data)
  if json.status.code >= 500
    alert "Error in processing Gremlin script: "+json.status.message
  else
    if json.status.code == 204
      results = []
    else
      results = json.result.data
    callback(results)
request =
  requestId: uuid.new(),
  op:"eval",
  processor:"",
  args:{gremlin: ingestionScript(), bindings: bindings, language: "gremlin-groovy"}
startTime = Date.now()
window.socketToJanus.send(JSON.stringify(request))
else
Meteor.call 'runScript', Session.get('userID'), Session.get('serverURL'),(Session.get 'tinkerPopVersion'), Session.get('graphName'),'CSV Ingester', ingestionScript(), bindings, (error,result)->
  callback(result.results)

collectRootsAndLowBranchVerts = (row, template) ->
#process verts first
for k1,vTemp of template.verts
vert = {label: vTemp.label, id: Number(vTemp.uid), properties:{_class: [{value:vTemp._class}]}, propsToMatch:{}, propsToAdd:{}}
for k2,prop of vTemp.props
  incomingValue = row[prop.property]
  if incomingValue
    if prop.dataType == "String" then outgoingValue = incomingValue.toString()
    if prop.dataType == "Single" then outgoingValue = Number(incomingValue)
    if prop.dataType == "Double" then outgoingValue = Number(incomingValue)
    if prop.dataType == "Bool" then outgoingValue = JSON.parse(incomingValue.toLowerCase())
    vert.properties[prop.property] = [{value: outgoingValue}]
    if vert.properties[prop.findIt] == "TRUE"
      vert.propsToMatch[prop.property] = [{value: outgoingValue}]
    else
      vert.propsToAdd[prop.property] = [{value: outgoingValue}]
if vert.propsToMatch == {}
else
  window.verts2EnsureCreation[vert.label+':'+vert._class+':'+JSON.stringify(vert.propsToMatch)] = vert

 */

//# sourceMappingURL=OtherGraphButtons.js.map
