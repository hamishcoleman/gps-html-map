// A small set of helper functions to make presenting GPX maps easier
//

//    This code is taken from http://openlayers.org/en/latest/examples/gpx.html
//    and thus is licenced as follows:
//        Code licensed under the 2-Clause BSD. All documentation CC BY 3.0. 

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
            color: '#0f0',
            width: 3
        })
    })
};

var map = new ol.Map({
    target: document.getElementById('map'),
    view: new ol.View({
        center: [0, 0],
        zoom: 1
    })
});
map.addControl(new ol.control.ScaleLine());

var extent = new ol.extent.createEmpty();
map.addControl(new ol.control.ZoomToExtent({
    extent: extent
}));

map.addLayer(new ol.layer.Tile({
    source: new ol.source.OSM({
    })
}));


var add_gpx = function(url) {
    var vector = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: 'test.gpx',
            format: new ol.format.GPX()
        }),
        style: function(feature) {
            return style[feature.getGeometry().getType()];
        }
    });
    map.addLayer(vector);

    vector.on('change', function(event) {
        var new_extent = event.target.getSource().getExtent();
        new_extent = ol.extent.buffer(new_extent, 100);
        ol.extent.extend(extent,new_extent);

        var view = map.getView();
        view.fit(extent, map.getSize());
    });
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

