(async function() {
    // Set URL to geojson data
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

    // 
    const data = await d3.json(url)

    const url_plates = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'

    const data_plates = await d3.json(url_plates)

    function getColor(m) {
        return m > 5 ? 'red':
                m > 4 && m <= 5 ? 'tomato':
                m > 3 && m <= 4 ? 'darkorange':
                m > 2 && m <= 3 ? 'gold':
                m > 1 && m <= 2 ? 'yellowgreen':
                                  'lightgreen'
    }

    // 
    function pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: (feature.properties.mag * 4),
            stroke: false,
            fillColor: getColor(feature.properties.mag),
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
    function platesPointToLayer(latlng) {
        return L.polyline(latlng, {})
    }

    // 
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
        id: "mapbox.streets-satellite",
        accessToken: API_KEY
    })

    // 
    const baseMaps = {
        'Outdoors' : outdoorsMap,
        'Satellite' : satelliteMap
    }

    // 
    const overlayMaps = {
        Earthquakes: features,
        'Fault Lines': plates
    }

    // 
    const myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 3,
        layers: [outdoorsMap, features, plates]
    })

    // 
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap)

    // 
    const legend = L.control({position: 'bottomright'})

    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend'),
              magnitudes = [0, 1, 2, 3, 4, 5]

        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
                magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
        }

        return div
    }

    legend.addTo(myMap)
})()