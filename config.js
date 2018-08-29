'use strict'

module.exports = {
    name: 'adminRestau',
    version: '0.0.2',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    db: {
        uri: 'mongodb://adminRestau:azerty@172.17.0.2/restau',
    },
    tokenSecret:'raieiffelfootcuisine'


}
