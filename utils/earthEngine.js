const ee = require('@google/earthengine');
const { Buffer } = require('buffer');

// Load the service account key either from an environment variable or from the local file.
// New platform policies require keeping keys out of source control, so we
// favour an env var named GEE_PRIVATE_KEY which should contain the JSON text.
function getPrivateKey() {
    if (process.env.GEE_PRIVATE_KEY) {
        try {
            return JSON.parse(process.env.GEE_PRIVATE_KEY);
        } catch (err) {
            console.error('Unable to parse GEE_PRIVATE_KEY environment variable', err);
            throw err;
        }
    }
    // fallback for backwards compatibility
    return require('../clavePrivada/clave.json');
}

let initialized = false;

/**
 * Initialize the Earth Engine client exactly once. Returns a promise that
 * resolves when the library is ready to be used. Subsequent calls simply
 * return the same promise.
 */
function initializeEarthEngine() {
    if (initialized) {
        return Promise.resolve();
    }
    initialized = true;
    const privateKey = getPrivateKey();
    return new Promise((resolve, reject) => {
        ee.data.authenticateViaPrivateKey(privateKey, () => {
            ee.initialize(null, null, () => {
                console.log('Earth Engine successfully initialized');
                resolve();
            }, (err) => {
                console.error('Earth Engine initialization error:', err);
                reject(err);
            });
        }, (err) => {
            console.error('Earth Engine authentication error:', err);
            reject(err);
        });
    });
}

module.exports = {
    ee,
    Buffer,
    initializeEarthEngine,
};
