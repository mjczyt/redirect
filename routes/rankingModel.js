var mongoose=require("mongoose");


var Ranking = mongoose.Schema({
    studentId: String,
    datesOfAttendance: String,
    studentName: String,
    college: String,
    major: String,
    class: String,
    persentOfMajor: String,
    english: String,
    makeupExamination: String,
    physical: String,
    GPA: String,
    rankingInCollage: String,
    numberOfCollage: String,
    highestGPAInCollage: String,
    lowestGPAInCollage: String,
    rankingInMajor: String,
    numberOfMajor: String,
    highestGPAInMajor: String,
    lowestGPAInMajor: String,
    rankingInClass: String,
    numberOfClass: String,
    highestGPAInClass: String,
    lowestGPAInClass: String
});

/* global db */
module.exports=db.model('ranking', Ranking);