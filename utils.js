const { format } = require("date-fns");
const { enUS } = require("date-fns/locale");

exports.frmtDate = (date, short, precise, frmt) => {
    try {
        if (!date) return null;
        const dateLang = enUS;
        date = new Date(date);
        if (frmt === "MMM") return format(date, "MMM", { locale: dateLang });
        if (frmt === "d-m-dom") {
            return format(date, "iii dd MMM", { locale: dateLang });
        }
        if (short) return format(date, "MMM yyyy", { locale: dateLang });
        if (precise) {
            let hour = date.getHours();
            let minutes = date.getMinutes();
            return `${format(date, "dd MMM yyyy", { locale: dateLang })} at ${hour}:${minutes < 10 ? "0" + minutes : minutes}`;
        }
        return format(date, "PP", { locale: dateLang });
    } catch (error) {
        return "";
    }
}