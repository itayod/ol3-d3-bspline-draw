/**
 * Created by itay on 07/09/16.
 */
var map = (function () {
  
  
  
  var mapElem = document.getElementById('map');
  
  const MAP_MIN_X = 0;
  const MAP_MIN_Y = 0;
  const MAP_MAX_X = 18;
  const MAP_MAX_Y = 22;
  const MAP_WIDTH = MAP_MAX_X-MAP_MIN_X;
  const MAP_HEIGHT = MAP_MAX_Y-MAP_MIN_Y;
  const PERMITTED_FLOORS = [0,1,2];
  const MAP_EXTENT = [MAP_MIN_X, MAP_MIN_Y, MAP_MAX_X, MAP_MAX_Y]; //[min x, min y, maxx, maxy] //Defines pan limits
  //Note, that the slippy tiles start from the top-left corner, thus, the map really starts at the top-left, multiplies "map-units" by resolution(zoom) down and right to get to pixel-location
  const MAP_MIN_ZOOM = 0;
  const MAP_MAX_ZOOM = 5;
  const MIN_RESOLUTION_MULTIPLIER_ZOOMS_0TO2 = MAP_MAX_X/(175*Math.pow(2, MAP_MAX_ZOOM - 0)); // Important note: number of pixels is by what is done by MapTiler, and not the source png. maxResolution is the map unit divided by tile pixels that make it in maxZoom per length.
  //Calculated from: in maxzoom (i.e. 8), we have 50 map units (meters) per 2^8=256 tiles X 256 pixels of the minzoom source image, which is to be "divided" i.e. 50 map units per (2^8x256) physical pixels => maxResolution=50/(2^8x256)=0.00076294...
  // const MAX_RESOLUTION_3 = MAP_MAX_X/(768*Math.pow(2, MAP_MAX_ZOOM - 3)); // Important note: number of pixels is by what is done by MapTiler (go to that zoom level, and see how many colums are there, multiply that by 256px), and not the source png. Again, we divide the map unit (50) by pixels in original image (3500) times the number of divisions its going to go - i.e. 2^(its max zoom - its min zoom)
  //
  // const MAX_RESOLUTION_4 = MAP_MAX_X/(3500*Math.pow(2, MAP_MAX_ZOOM - 4)); //Important note: number of pixels is by what is done by MapTiler, and not the source png. Again, we divide the map unit (50) by pixels in original image (3500) times the number of divisions its going to go - i.e. 2^(its max zoom - its min zoom)
  //In case we took 3500 pixels image, and rendered it into zooms (8-4), i.e. final calculation is 50/(2^4*3500) = 0.00089286
  const TILE_EXTENT = MAP_EXTENT;  //Defines which tiles will be loaded, if visible in screen. Usually, we would like it to cover more than the map extent for rotation "paddings"
  const SCREEN_PADDING = 1; //in pixels, how many "out of extent" pixels shall be allowed in view. Used after movmeend fired.
  
  var clientWidth = mapElem.clientWidth;
  var clientHeight = mapElem.clientHeight;
  var currentFloor = 6; //Default floor
  
  var mapResolutions = [];
  for (var z = 0; z <= MAP_MAX_ZOOM; z++) {
    var multiplier;
    // if (z < 3) {                        // Should be done for every source image //TODO: change if source png changed, together with the next lines
    multiplier = MIN_RESOLUTION_MULTIPLIER_ZOOMS_0TO2;
    // } else {
    //     multiplier = MAX_RESOLUTION_3;   //TODO: change if source png changed, together with the if statement
    // }
    mapResolutions.push(Math.pow(2, MAP_MAX_ZOOM - z) * multiplier);
  }
  
  var mapTileGrid = new ol.tilegrid.TileGrid({
    extent: TILE_EXTENT,
    minZoom: MAP_MIN_ZOOM,
    resolutions: mapResolutions
  });
  
  var tileLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      projection: 'PIXELS',
      tileGrid: mapTileGrid,
      url: "./tiles/floor1/{z}/{x}/{y}.png" //z = zoom, x = column, y = row
    })
  });
  
  
  var map = new ol.Map({
    layers: [tileLayer],
    target: mapElem,
    view: new ol.View({
      projection: ol.proj.get('PIXELS'),
      extent: TILE_EXTENT, //TODO: should be dynamic, so to avoid white margins...
      maxResolution: Math.max(MAP_WIDTH/clientWidth, MAP_HEIGHT/clientHeight),
      minResolution: mapResolutions[MAP_MAX_ZOOM]/2
    })
  });
  map.getView().fit(MAP_EXTENT, map.getSize());
  
  map.on("click",function(e) {
  })
  
  
  map.getExtent = function(){
    return MAP_EXTENT;
  }
  
  return map
})()