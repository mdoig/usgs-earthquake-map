(async function() {
    // Retrieve earthquake GeoJSON data
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const data = await d3.json(url)

    // Retrieve fault lines GeoJSON data
    const url_plates = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'
    const data_plates = await d3.json(url_plates)

    // Create function to assign color to marker based on magnitude
    function getColor(m) {
        return m > 5 ? 'red':
                m > 4 && m <= 5 ? 'tomato':
                m > 3 && m <= 4 ? 'darkorange':
                m > 2 && m <= 3 ? 'gold':
                m > 1 && m <= 2 ? 'yellowgreen':
                                  'lightgreen'
    }

    // Create function to make circle markers for each earthquake
    function pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
            // Radius of each circle styled to be proportional to magnitude
            radius: (feature.properties.mag * 4),
            stroke: false,
            // Use getColor function to style color
            fillColor: getColor(feature.properties.mag),
            fillOpacity: 1
        })
    }

    // Create function to bind popups with earthquake info to each circle
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
            <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
            <p><strong>Time:</strong> ${new Date(feature.properties.time)}</p>
            <p>More info <a href='${feature.properties.url}' target='_blank'>here</a></p>`)
    }

    // Create function to draw fault lines
    function platesPointToLayer(latlng) {
        return L.polyline(latlng, {})
    }

    // Create GeoJSON layers for earthquake markers and fault lines
    const features = L.geoJSON(data, {
        onEachFeature : onEachFeature,
        pointToLayer : pointToLayer
    })

    const plates = L.geoJSON(data_plates, {
        style: function() {
            return {
                color: 'orange',
                weight: 2,
            }  
        },
        platePointToLayer: platesPointToLayer
    })

    // Define map layers
    const outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    })

    const satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets-satellite",
        accessToken: API_KEY
    })

    // Define baseMaps and overlayMaps objects to hold base and overlay layers
    const baseMaps = {
        'Outdoors' : outdoorsMap,
        'Satellite' : satelliteMap
    }

    const overlayMaps = {
        'Fault Lines': plates,
        Earthquakes: features
    }

    // Create map, specifying layers that will display on page load
    const map = L.map("map", {
        center: [37.09, -95.71],
        zoom: 3,
        layers: [outdoorsMap, plates, features]
    })

    // Create layer control and add to map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map)

    // Create legend and add to map
    const legend = L.control({position: 'bottomright'})

    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend'),
              magnitudes = [0, 1, 2, 3, 4, 5]

        div.innerHTML = '<p><strong>Magnitude</strong></p>'
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
                magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
        }

        return div
    }

    legend.addTo(map)
})()