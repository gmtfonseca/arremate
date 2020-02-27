const moment = require("moment");
export default {
  countdown(futureDate, currentDate) {
    const ms = moment(futureDate, "DD/MM/YYYY HH:mm:ss").diff(
      moment(currentDate, "DD/MM/YYYY HH:mm:ss")
    );
    const d = moment.duration(ms);
    const s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
    return s;
  }
};
