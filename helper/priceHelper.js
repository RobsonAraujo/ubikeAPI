exports.calculatePrice = function (dateStart, dateFinished) {
    // Define 0,05 centavos by minute
    const diferenceBySeconds = (new Date(dateStart).getTime() - new Date(dateFinished).getTime()) / 1000;
    const diferenceByMinutes = diferenceBySeconds / 60;

    return Math.abs(diferenceByMinutes * 0.016).toFixed(3)

}

exports.runTime = function (dateStart, dateFinished) {

    const diferenceBySeconds = (new Date(dateStart).getTime() - new Date(dateFinished).getTime()) / 1000;
    const diferenceByMinutes = diferenceBySeconds / 60;

    return Math.abs(Math.round(diferenceByMinutes)) + " minutes"
}