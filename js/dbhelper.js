/// / This works on all devices/browsers, and uses IndexedDBShim as a final fallback
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

// Open (or create) the database
const open = indexedDB.open("restaurants", 1);

// Create the schema
open.onupgradeneeded = () => {
    let db = open.result;
    let store = db.createObjectStore("restaurants", {keyPath: "id",autoIncrement:true });
    store.createIndex('restaurant_id', 'id', {unique: true});

};
/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
  }

  static fecthFromDb(){
    var db;
    open.onsuccess = function(event) {
        db = event.target.result; 
        alert('hjjjjj');
        let tx = db.transaction("restaurants", "readwrite");
        let store = tx.objectStore("restaurants");
        let index = store.index("restaurant_id");
        let restaurants = index.getAll();
        restaurants.onsuccess = () => {
            return restaurants.result;
        }
    };
  }

  static fecthOneFromDb(id){
    var db;
    alert('hi');
    open.onsuccess = function(event) {
        db = event.target.result; 
        let tx = db.transaction("restaurants", "readwrite");
        let store = tx.objectStore("restaurants");
        let index = store.index("restaurant_id");
        let restaurant = index.get(id);
        restaurant.onsuccess = ()=>{
            return restaurant.result;
        }
    };
  }

  static storeInDb(data){
    var db;
    console.log('hi',data);
    open.onsuccess = function(event) {
      console.log('hiooo',dt);
        db = event.target.result; 
        let tx = db.transaction("restaurants", "readwrite");
        let store = tx.objectStore("restaurants");
        data.forEach(function(dt){
            store.put(dt);
        });
    };
  }


  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    var db;
    open.onsuccess = function(event) {
        db = event.target.result; 
        let tx = db.transaction("restaurants", "readwrite");
        let store = tx.objectStore("restaurants");
        let index = store.index("restaurant_id");
        let restaurants = index.getAll();
        restaurants.onsuccess = () => {
          if(restaurants.result.length){
            callback(null,restaurants.result);
          } else {
            fetch('http://localhost:1337/restaurants', { method: 'GET', headers: { 'Content-Type': 'application/json; charset=utf-8', } })
            .then((response) => { 
              return response.json();
            }).then((data) => {
              callback(null, data);
              let tx = db.transaction("restaurants", "readwrite");
              let store = tx.objectStore("restaurants");
              data.forEach(function(dt){
                  store.put(dt);
              });
            }).catch((err) => { 
              console.log('Request failed', err); 
            });
          }
        }
    };
  
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    var db;
    open.onsuccess = function(event) {
        db = event.target.result; 
        let tx = db.transaction("restaurants", "readwrite");
        let store = tx.objectStore("restaurants");
        let index = store.index("restaurant_id");
        let restaurant = index.get(id);
        restaurants.onsuccess = () => {
          if(restaurants.result.length){
            callback(null,restaurants.result);
          } else {
            fetch(`http://localhost:1337/restaurants/${id}`, { method: 'GET', headers: { 'Content-Type': 'application/json; charset=utf-8', } })
            .then((response) => { 
              return response.json();
            }).then((data) => {
              callback(null, data);
              let tx = db.transaction("restaurants", "readwrite");
              let store = tx.objectStore("restaurants");
              data.forEach(function(dt){
                  let put = store.put(dt);
              });
            }).catch((err) => { 
              console.log('Request failed', err); 
            });
          }
        }
    };
    
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
      console.log(restaurant);
    return (`/img/${restaurant.photograph}.jpg`);
  }

  static imageUrlForRestaurant2(restaurant) {
    let parts = restaurant.photograph.split(".");
    return parts[0];
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}

