import React, { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import WKT from "ol/format/WKT";
import { OSM, Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";

function Maps({ wkt }) {
  const mapRef = useRef(null);
  const format = new WKT();
  const map = useRef(null);

  useEffect(() => {
    if (map.current) {
      const feature = format.readFeature(wkt, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });

      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [feature],
        }),
      });

      map.current.addLayer(vectorLayer);
      const extent = vectorLayer.getSource().getExtent();
      map.current.getView().fit(extent, map.current.getSize());
    } else {
      map.current = new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        target: mapRef.current,
        view: new View({
          zoom: 1,
        }),
      });

      const format = new WKT();

      const feature = format.readFeature(wkt, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });

      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [feature],
        }),
      });

      map.current.addLayer(vectorLayer);
      const extent = vectorLayer.getSource().getExtent();
      map.current.getView().fit(extent, map.current.getSize());
    }
  }, [wkt]);

  return <div id="map" ref={mapRef} className="map"></div>;
}

export default Maps;
