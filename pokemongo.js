/* This code is from https://github.com/davidwood/node-geopoint */
/**
 * Represents a point on the surface of the Earth.
 *
 * This library is derived from the Java code originally published at
 * http://JanMatuschek.de/LatitudeLongitudeBoundingCoordinates
 *
 * @author Jan Philip Matuschek
 * @version 22 September 2010
 */
var DEG2RAD = Math.PI / 180, // degrees to radian conversion
    RAD2DEG = 180 / Math.PI, // radians to degrees conversion
    MI2KM = 1.6093439999999999, // miles to kilometers conversion
    KM2MI = 0.621371192237334, // kilometers to miles conversion
    EARTH_RADIUS_KM = 6371.01, // Earth's radius in km
    EARTH_RADIUS_MI = 3958.762079, // Earth's radius in miles
    MAX_LAT = Math.PI / 2, // 90 degrees
    MIN_LAT = -MAX_LAT, // -90 degrees
    MAX_LON = Math.PI, // 180 degrees
    MIN_LON = -MAX_LON, // -180 degrees
    FULL_CIRCLE_RAD = Math.PI * 2; // Full cirle (360 degrees) in radians

/**
 * Check if an object is a valid number
 *
 * @param   {Number}    value   Value to check
 * @return  {Boolean}   true if a number and not NaN
 */
function isNumber(value) {
    return toString.call(value) === '[object Number]' && value === +value;
}

/**
 * Constructor
 *
 * @param   {Number}    lat         Latitude
 * @param   {Number}    long        Longitude
 * @param   {Boolean}   inRadians   true if latitude and longitude are in radians
 */
function GeoPoint(lat, lon, inRadians) {
    if (!isNumber(lat)) {
        throw new Error('Invalid latitude');
    }
    if (!isNumber(lon)) {
        throw new Error('Invalid longitude');
    }
    if (inRadians === true) {
        this._degLat = GeoPoint.radiansToDegrees(lat);
        this._degLon = GeoPoint.radiansToDegrees(lon);
        this._radLat = lat;
        this._radLon = lon;
    } else {
        this._degLat = lat;
        this._degLon = lon;
        this._radLat = GeoPoint.degreesToRadians(lat);
        this._radLon = GeoPoint.degreesToRadians(lon);
    }
    if (this._radLat < MIN_LAT || this._radLat > MAX_LAT) {
        throw new Error('Latitude out of bounds');
    } else if (this._radLon < MIN_LON || this._radLon > MAX_LON) {
        throw new Error('Longitude out of bounds');
    }
}

/**
 * Return the latitude
 *
 * @param   {Boolean}   inRadians   true to return the latitude in radians
 * @param   {Number}    latitude
 */
GeoPoint.prototype.latitude = function(inRadians) {
    if (inRadians === true) {
        return this._radLat;
    }
    return this._degLat;
};

/**
 * Return the longitude
 *
 * @param   {Boolean}   inRadians   true to return the longitude in radians
 * @param   {Number}    longitude
 */
GeoPoint.prototype.longitude = function(inRadians) {
    if (inRadians === true) {
        return this._radLon;
    }
    return this._degLon;
};

/**
 * Calculates the distance between two points
 *
 * @param   {Object}    point         GeoPoint instance
 * @param   {Boolean}   inKilometers  true to return the distance in kilometers
 * @return  {Number}    distance between points
 */
GeoPoint.prototype.distanceTo = function(point, inKilometers) {
    if (!(point instanceof GeoPoint)) {
        throw new Error('Invalid GeoPoint');
    }
    var radius = inKilometers === true ? EARTH_RADIUS_KM : EARTH_RADIUS_MI,
        lat1 = this.latitude(true),
        lat2 = point.latitude(true),
        lon1 = this.longitude(true),
        lon2 = point.longitude(true);
    return Math.acos(
        Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.cos(lon1 - lon2)) * radius;
};

/**
 * Calculate the bouding coordinates
 *
 * @param   {Number}    distance      distance from the point
 * @param   {Number}    radius        optional sphere radius to use
 * @param   {Boolean}   inKilometers  true to return the distance in kilometers
 * @return  {Array}     array containing SW and NE points of bounding box
 */
GeoPoint.prototype.boundingCoordinates = function(distance, radius, inKilometers) {
    if (!isNumber(distance) || distance <= 0) {
        throw new Error('Invalid distance');
    }
    if (radius === true || radius === false) {
        inKilometers = radius;
        radius = null;
    }
    if (!isNumber(radius) || radius <= 0) {
        radius = inKilometers === true ? EARTH_RADIUS_KM : EARTH_RADIUS_MI;
    }
    var lat = this.latitude(true),
        lon = this.longitude(true),
        radDist = distance / radius,
        minLat = lat - radDist,
        maxLat = lat + radDist,
        minLon,
        maxLon,
        deltaLon;
    if (minLat > MIN_LAT && maxLat < MAX_LAT) {
        deltaLon = Math.asin(Math.sin(radDist) / Math.cos(lat));
        minLon = lon - deltaLon;
        if (minLon < MIN_LON) {
            minLon += FULL_CIRCLE_RAD;
        }
        maxLon = lon + deltaLon;
        if (maxLon > MAX_LON) {
            maxLon -= FULL_CIRCLE_RAD;
        }
    } else {
        minLat = Math.max(minLat, MIN_LAT);
        maxLat = Math.min(maxLat, MAX_LAT);
        minLon = MIN_LON;
        maxLon = MAX_LON;
    }
    return [new GeoPoint(minLat, minLon, true), new GeoPoint(maxLat, maxLon, true)];
};

/**
 * Convert degrees to radians
 *
 * @param   {Number}    value   degree value
 * @return  {Number}    radian value
 */
GeoPoint.degreesToRadians = function(value) {
    if (!isNumber(value)) {
        throw new Error('Invalid degree value');
    }
    return value * DEG2RAD;
};

/**
 * Convert radians to degrees
 *
 * @param   {Number}    value   radian value
 * @return  {Number}    degree value
 */
GeoPoint.radiansToDegrees = function(value) {
    if (!isNumber(value)) {
        throw new Error('Invalid radian value');
    }
    return value * RAD2DEG;
};

/**
 * Cnvert miles to kilometers
 *
 * @param   {Number}    value   miles value
 * @return  {Number}    kilometers value
 */
GeoPoint.milesToKilometers = function(value) {
    if (!isNumber(value)) {
        throw new Error('Invalid mile value');
    }
    return value * MI2KM;
};

/**
 * Convert kilometers to miles
 *
 * @param   {Number}    value   kilometer value
 * @return  {Number}    miles value
 */
GeoPoint.kilometersToMiles = function(value) {
    if (!isNumber(value)) {
        throw new Error('Invalid kilometer value');
    }
    return value * KM2MI;
};

// Export
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = GeoPoint;
} else {
    this.GeoPoint = GeoPoint;
}

/* end of Geopoint code */

var parallel = require('async').parallel;
var mongoCli = require('mongodb').MongoClient;
var request = require('request');

function save_user_pkmn(pkmn, db, cb) {
    var increment = {
        $inc: {
            count: 1
        }
    };
    var opts = {
        upsert: true
    };
    db.collection('pkmn')
        .updateOne(pkmn, increment, opts, function(err) {
            if (err) return cb(err);
            cb(null);
        });
}
module.exports = function(ctx, done) {
    // var ctx = {
    //     data: {
    //         MONGO_URL: "mongodb://<REDACTED>"
    //     }
    // };
    // ctx.body_raw = '{"username": "cmelgarejo","distkm": 1,"gmaps": "https://maps.google.com/?ll=-34.574,-58.459&z=21"}';

    var lat, lon, distance;
    var body = JSON.parse(ctx.body_raw);
    var username = ctx.data.username !== undefined ? ctx.data.username : body.username;
    var latlonRegex = /(\-?[\d]{1,2}.[\d]{1,}),(\-?[\d]{1,3}.[\d]{1,})/;
    distance = ctx.data.distkm !== undefined ? ctx.data.distkm : parseInt(body.distkm);
    distance = distance !== undefined ? distance : 1;
    if (ctx.data.lat !== undefined)
        lat = ctx.data.lat;
    else
        lat = parseFloat(body.gmaps.match(latlonRegex)[1]);
    if (ctx.data.lon !== undefined)
        lon = ctx.data.lon;
    else
        lon = parseFloat(body.gmaps.match(latlonRegex)[2]);

    var centerBounds = new GeoPoint(lat, lon).boundingCoordinates(distance);
    bounds = `${centerBounds[0]._degLat},${centerBounds[0]._degLon},${centerBounds[1]._degLat},${centerBounds[1]._degLon}`
    var apiURL = `https://skiplagged.com/api/pokemon.php?bounds=${bounds}`
    var options = {
        url: apiURL,
        headers: {
            "User-Agent": 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 41.0 .2228 .0 Safari / 537.36 ',
            "Accept": 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            "Accept-Encoding": 'gzip, deflate, sdch, br',
            "Cache-Control": 'max-age=1',
            "Vary": "Accept"
        }
    };

    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var pkmns = JSON.parse(body).pokemons;
            pkmns = pkmns.reduceRight(function(r, a) {
                a.username = username;
                r.some(function(b) {
                    return a.name === b.name;
                }) || r.push(a);
                return r;
            }, []);
            mongoCli.connect(ctx.data.MONGO_URL, function(err, db) {
                if (err) return done(err);
                var job_list = pkmns.map(function(pkmn) {
                    return function(cb) {
                        save_user_pkmn(pkmn, db, function(err) {
                            if (err) return cb(err);
                            cb(null);
                        });
                    };
                });
                parallel(job_list, function(err) {
                    if (err) return done(err);
                    done(null, 'Catched some Pokemon!');
                });
            });
        }
    });
};
