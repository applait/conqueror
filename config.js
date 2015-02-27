var config = {
    APP_IP : "0.0.0.0",
    APP_PORT: "8080",
    KURENTO_HOST: "ws://conq-kurento.kaustavdm.in",
    KURENTO_PORT: "8888"
};

config.KURENTO_URL = config.KURENTO_HOST + ":" + config.KURENTO_PORT + "/kurento";

module.exports = config;
