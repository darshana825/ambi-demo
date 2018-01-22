/**
 * Clusters file willbe use to define all Third party server clustors configurations and initilaizations
 */

var Clusters = {
    init: function () {
        // Initialize Cache Engine
        GLOBAL.CacheEngine = require('../middleware/CacheEngine');
        CacheEngine.init();

        GLOBAL.EmailEngine = require('../middleware/EmailEngine');
        EmailEngine.init();

        GLOBAL.ES = require('../middleware/ES');
        ES.init();
    }
};

module.exports = Clusters;