// A small set of helper functions to make presenting GPX maps easier
//

//    This code is taken from http://openlayers.org/en/latest/examples/gpx.html
//    and thus is licenced as follows:
//        Code licensed under the 2-Clause BSD. All documentation CC BY 3.0. 

// FIXME - global
var control_extent;

var add_map = function(id) {
    var map = new ol.Map({
        target: document.getElementById(id),
        view: new ol.View({
            center: [0, 0],
            zoom: 1
        })
    });
    map.addControl(new ol.control.ScaleLine());

    control_extent = new ol.extent.createEmpty();
    map.addControl(new ol.control.ZoomToExtent({
        extent: control_extent
    }));

    map.addLayer(new ol.layer.Tile({
        source: new ol.source.OSM({
        })
    }));

    map.on('pointermove', function(evt) {
        if (evt.dragging) {
            return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        displayFeatureInfo(pixel);
    });

    map.on('click', function(evt) {
        displayFeatureInfo(evt.pixel);
    });

    return map;
}

var add_gpx = function(map,url) {
    var style = {
        'Point': new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,0,0.4)'
                }),
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: '#ff0',
                    width: 1
                })
            })
        }),
        'LineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#f00',
                width: 3
            })
        }),
        'MultiLineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#00f',
                width: 3
            })
        })
    };

    var vector = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: url,
            format: new ol.format.GPX()
        }),
        style: function(feature) {
            return style[feature.getGeometry().getType()];
        }
    });
    map.addLayer(vector);

    // FIXME - hardcoded Id
    var status = document.getElementById('status');
    status.innerHTML = status.innerHTML + "Loading(" + url + ")... ";

    vector.getSource().on('change', function(event) {
        var view = map.getView();
        var size = map.getSize();

        var curr_extent;
        if (ol.extent.isEmpty(control_extent)) {
            // extent has never been set, so use the empty one
            curr_extent = control_extent;
        } else {
            // we have a previous extent, use that one
            curr_extent = view.calculateExtent(size);
        }

        var new_extent = event.target.getExtent();
        new_extent = ol.extent.buffer(new_extent, 100);

        ol.extent.extend(curr_extent,new_extent);

        view.fit(curr_extent, size);

        // ensure the control button zooms to the right extent
        control_extent = curr_extent;

        status.innerHTML = status.innerHTML + "Finished(" + url + ") ";
    });

    return vector;
}

var displayFeatureInfo = function(pixel) {
    var features = [];
    map.forEachFeatureAtPixel(pixel, function(feature) {
        features.push(feature);
    });
    if (features.length > 0) {
        var info = [];
        var i, ii;
        for (i = 0, ii = features.length; i < ii; ++i) {
            info.push(features[i].get('desc'));
        }
        document.getElementById('info').innerHTML = info.join(', ') || '(unknown)';
        map.getTarget().style.cursor = 'pointer';
    } else {
        document.getElementById('info').innerHTML = '&nbsp;';
        map.getTarget().style.cursor = '';
    }
};

