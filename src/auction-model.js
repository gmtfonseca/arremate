const fs = require("fs");

export class AuctionModel {
  constructor(path) {
    this._path = path;
  }
  save(auctions) {
    const auctionsString = JSON.stringify(auctions);
    fs.writeFileSync(this._path, auctionsString);
  }
  unlink() {
    if (this.exists()) return;

    fs.unlinkSync(this._path);
  }
  find() {
    if (!this.exists()) return [];

    const auctionsString = fs.readFileSync(this._path, "utf8");
    const auctions = JSON.parse(auctionsString);

    return auctions;
  }
  exists() {
    return fs.existsSync(this._path);
  }
  get path() {
    return this._path;
  }
}
