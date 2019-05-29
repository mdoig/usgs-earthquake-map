// 
function createFeatures(earthquakeData) {
    
    // 
    function pointToLayer(feature, latlng) {
        // 
        var magnitude = feature.properties.mag

        // 
        switch (true) {
            case magnitude <= 1:
                fill_color = 'lightgreen';
                break;
            case magnitude > 1 && magnitude <= 2:
                fill_color = 'yellowgreen';
                break;
            case magnitude > 2 && magnitude <=3:
                fill_color = 'gold';
                break;
            case magnitude > 3 && magnitude <=4:
                fill_color = 'darkorange';
                break;
            case magnitude > 4 && magnitude <=5:
                fill_color = 'tomato';
                break;
            case magnitude > 5:
                fill_color = 'red';
                break
        }
        
        // 
        return L.circleMarker(latlng, {
            radius: (magnitude * 4),
            weight: 1,
            color: 'black',
            fillColor: fill_color,
            fillOpacity: 1
        })
    }

    // 
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
            <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
            <p><strong>Time:</strong> ${new Date(feature.properties.time)}</p>
            <p>More info <a href='${feature.properties.url}' target='_blank'>here</a></p>`)
    }

    // 
    const features = L.geoJSON(earthquakeData, {
        onEachFeature : onEachFeature,
        pointToLayer : pointToLayer
    })

    // 
    createMap(features)
}

// 
function createMap(features) {

    // 
    const outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    })

    // 
    const satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    })

    // 
    const baseMaps = {
        'Outdoors map' : outdoorsMap,
        'Satellite map' : satelliteMap
    }

    // 
    const overlayMaps = {
        Earthquakes: features
    }

    // 
    const myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 3,
        layers: [outdoorsMap, features]
    })

    // 
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap)

}

(async function() {
    // Set URL to geojson data
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

    // 
    const data = await d3.json(url)

    // 
    createFeatures(data.features)
})()