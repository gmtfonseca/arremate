const fs = require("fs");

class Config {
  constructor(daylightSavingTime) {
    this.daylightSavingTime = daylightSavingTime;
  }

  static empty() {
    return new Config(false);
  }
}

export class ConfigModel {
  constructor(path) {
    this._path = path;
    this._config = this.load();
  }
  save(newConfig) {
    this._config = Object.assign(this._config, newConfig);
    const configString = JSON.stringify(this._config);
    fs.writeFileSync(this._path, configString);
  }
  load() {
    if (!this.exists()) return Config.empty();

    const configString = fs.readFileSync(this._path, "utf8");
    const config = Object.assign(new Config(), JSON.parse(configString));
    return config;
  }
  exists() {
    return fs.existsSync(this._path);
  }
  get path() {
    return this._path;
  }
  get config() {
    return this._config;
  }
}
