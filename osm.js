map = new OpenLayers.Map("mapdiv");
map.addControl(new OpenLayers.Control.LayerSwitcher());

map.addLayer(new OpenLayers.Layer.OSM());
//map.addLayer(new OpenLayers.Layer.Google("Google Terrain", {type: google.maps.MapTypeId.TERRAIN}));
//map.addLayer(new OpenLayers.Layer.Google("Google Satellite", {type: google.maps.MapTypeId.SATELLITE}));
//map.addLayer(new OpenLayers.Layer.Google("Google Streets", {type: google.maps.MapTypeId.ROADMAP}));
// AIzaSyALf0ZbcJ6_c0cqAEQI1DuJyOZNCpKi7kk

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
        
	//Set start centrepoint and zoom
	kmllayer.events.register('loadend', kmllayer, function(evt){map.zoomToExtent(kmllayer.getDataExtent())})

	map.addLayer(kmllayer);

	//Add a selector control to the kmllayer with popup functions
	var controls = {
		selector: new OpenLayers.Control.SelectFeature(kmllayer, { onSelect: createPopup, onUnselect: destroyPopup })
	};

	function createPopup(feature) {
		feature.popup = new OpenLayers.Popup.FramedCloud("pop",
					feature.geometry.getBounds().getCenterLonLat(),
					null,
					'<div class="markerContent">'+feature.attributes.description+'</div>',
					null,
					true,
					function() { controls['selector'].unselectAll(); });
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
