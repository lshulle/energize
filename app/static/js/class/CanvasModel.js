define([
  "jquery",
  "ResourceLoader",
  "terrainLayer",
  "canvasData",
  "networkCallMap",
  "CityLayer",
  "FacilityLayer"
], function ($, ResourceLoader, terrainLayer, canvasData, networkCallMap, CityLayer, FacilityLayer) {

  return (
    class CanvasModel {
      createTerrainTileMap() {
        return new Promise(resolve => {
          const loaded = ResourceLoader.loadResources([
            { name: canvasData.terrainImageConfig.name, type: "img", path: canvasData.terrainImageConfig.path },
            { name: canvasData.terrainSpriteConfig.name, type: "img", path: canvasData.terrainSpriteConfig.path }
          ]);

          loaded.then((results) => {
            // Convert results array into an object for easier access to data.
            let resources = ResourceLoader.resourcesToObject(results);
            let terrainTileMap = terrainLayer(
              resources[canvasData.terrainImageConfig.name].data,
              resources[canvasData.terrainSpriteConfig.name].data,
              canvasData.terrainImageConfig,
              canvasData.terrainSpriteConfig
            );
            resolve(terrainTileMap);
          });
        });
      }

      createCityTileMap() {
        return new Promise(resolve => {
          const loaded = ResourceLoader.loadResources([
            { name: canvasData.citySpriteConfig.name, type: "img", path: canvasData.citySpriteConfig.path },
            { name: networkCallMap.cityTable.name, type: "ajax", path: networkCallMap.cityTable.path },
          ]);

          loaded.then((results) => {
            let resources = ResourceLoader.resourcesToObject(results);
            let cityLayer = new CityLayer(
              resources[canvasData.citySpriteConfig.name].data,
              canvasData.citySpriteConfig,
              canvasData.terrainImageConfig,
              canvasData.terrainSpriteConfig,
              resources[networkCallMap.cityTable.name].data.cities
            );
            resolve(cityLayer.createTileMap());
          })

        });
      }

      createFacilityTileMap() {
        return new Promise(resolve => {
          const loaded = ResourceLoader.loadResources([
            { name: canvasData.facilitySpriteConfig.name, type: "img", path: canvasData.facilitySpriteConfig.path },
            { name: networkCallMap.facilityTable.name, type: "ajax", path: networkCallMap.facilityTable.path }
          ]);

          loaded.then((results) => {
            let resources = ResourceLoader.resourcesToObject(results);
            let facilityLayer = new FacilityLayer(
              resources[canvasData.facilitySpriteConfig.name].data,
              canvasData.facilitySpriteConfig,
              canvasData.terrainImageConfig,
              canvasData.terrainSpriteConfig,
              resources[networkCallMap.facilityTable.name].data.facilities
            );
            resolve(facilityLayer.createTileMap());
          });
        });
      }
    });
});
