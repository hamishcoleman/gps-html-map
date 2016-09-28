map = new OpenLayers.Map("mapdiv");
map.addControl(new OpenLayers.Control.LayerSwitcher());

map.addLayer(new OpenLayers.Layer.OSM());

function add_layer(layer) {
    //Set start centrepoint and zoom
    layer.events.register('loadend', layer, function(evt){map.zoomToExtent(layer.getDataExtent())})

    map.addLayer(layer);

    //Add a selector control to the layer with popup functions
    var controls = {
        selector: new OpenLayers.Control.SelectFeature(layer, { onSelect: createPopup, onUnselect: destroyPopup })
    };

    function createPopup(feature) {
        feature.popup = new OpenLayers.Popup.FramedCloud("pop",
            feature.geometry.getBounds().getCenterLonLat(),
            null,
            '<div class="markerContent">'+feature.attributes.description+'</div>',
            null,
            true,
            function() { controls['selector'].unselectAll();
        });
        //feature.popup.closeOnMove = true;
        map.addPopup(feature.popup);
    }

    function destroyPopup(feature) {
        feature.popup.destroy();
        feature.popup = null;
    }

    map.addControl(controls['selector']);
    controls['selector'].activate();
}

function add_kml_url(kml_url) {
    var kmllayer = new OpenLayers.Layer.Vector("KML", {
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.HTTP({
            url: kml_url,
            format: new OpenLayers.Format.KML({
                extractStyles: true,
                extractAttributes: true,
                maxDepth: 2
            })
        })
    });

    add_layer(kmllayer);
}

