var app = angular.module('exam',[]).
    constant(
        "CONSTANTS",{
            SUCCESS_CODE: 1,
            ERROR_CODE: 0,
            NETWORK_ERROR: 'Some Error occurred! Please reload/refresh the page and try again.',
            DELETE_CONFIRMATION: 'Do you really want to delete this registration?',
            LOADING: 'Loading...'
        }
    );

app.controller('sheet', function($scope, CONSTANTS, $http) {

    //Variables

    //Constants
    $scope.marksPattern = new RegExp("^[0-9]+$|^[0-9]*[.][0-9]+$");
    $scope.gradePattern = new RegExp("^[ABCDPF]$|^[E][X]$");
    $scope.gradeType = [
        {grade:'EX', minMarks:85},
        {grade:'A', minMarks:70},
        {grade:'B', minMarks:60},
        {grade:'C', minMarks:50},
        {grade:'D', minMarks:40},
        {grade:'P', minMarks:33},
        {grade:'F', minMarks:0}
    ];

    //Pre Initialized
    var exams= [
        {examId:1, examName:'Minor 1', maxMarks:10},
        {examId:2, examName:'Mid', maxMarks:30},
        {examId:3, examName:'Minor 2', maxMarks:10},
        {examId:4, examName:'End', maxMarks:50}
    ];

    var students = generateStudents( exams );
    var avg = {};
    var contribution = initializeContribution( exams );

    $scope.grid={
        exams        : exams,
        students     : students,
        avg          : avg,
        contribution : contribution
    };

    $scope.orderByField = 'rollNumber';
    $scope.reverseSort = false;

    //Functions

    //Initialization Functions
    function initializeContribution(exams){
        var contribution={};
        for (var i in exams)
            contribution[exams[i].examId] = 1;
        return contribution;
    }

    function generateStudents( exams ){
        var min = 117101;
        var max =  117125;
        var last = Math.floor(Math.random() * (max - min)) + min;

        var students = [];
        var rollNumber;
        var grade = defaultValue;
        var totalMarks = defaultValue;

        for(var i=min; i<=last; i++){
            rollNumber = i;
            students.push(
                {
                    rollNumber:rollNumber,
                    name:'test',
                    marks:{},
                    totalMarks:totalMarks,
                    grade:grade
                }
            );
        }

        return students;
    }

    //Scope functions
    $scope.fillGrid = function fillGrid(){
        var min, max, value;
        for (var i in $scope.grid.students){
            for(var j in $scope.grid.exams){
                max=$scope.grid.exams[j].maxMarks;
                min=0;
                value = Math.floor(Math.random() * (max - min)) + min;
                $scope.grid.students[i].marks[ $scope.grid.exams[j].examId ] = value;
            }
        }
    }

    $scope.calculateAverageMarks = function calculateAverageMarks( examId ){
        var list = [];
        for(var i in $scope.grid.students)
            list.push($scope.grid.students[i].marks[examId]);

        $scope.grid.avg[examId] = average(list);
        return $scope.grid.avg[examId];
    }

    $scope.calculateStudentTotalMarks = function calculateStudentTotalMarks( roll ) {
        var i = getStudent( roll );
        if(i === -1)
            return;

        var list = [];
        var value;

        for( var examId in $scope.grid.students[i].marks ) {
            if ( isFormatValid($scope.grid.students[i].marks[examId]) &&
                isFormatValid($scope.grid.contribution[examId])) {
                value = $scope.grid.students[i].marks[examId] * $scope.grid.contribution[examId];
            }
            else
                value=defaultValue;
            list.push(value);
        }

        $scope.grid.students[i].totalMarks = sum(list);
        return $scope.grid.students[i].totalMarks;
    }

    $scope.calculateTotalMaxMarks = function calculateTotalMarks(){
        var value;
        var list = [];
        for( var i in $scope.grid.exams ) {
            if ( isFormatValid($scope.grid.exams[i].maxMarks) &&
                isFormatValid($scope.grid.contribution[$scope.grid.exams[i].examId])) {
                value = $scope.grid.exams[i].maxMarks * $scope.grid.contribution[$scope.grid.exams[i].examId];
            }
            else
                value=defaultValue;
            list.push(value);
        }

        return sum(list);
    }

    $scope.calculateTotalAverageMarks = function calculateTotalAverageMarks(){
        var list = [];
        for(var i in $scope.grid.students)
            list.push($scope.grid.students[i].totalMarks);

        return average(list);
    }

    $scope.calculateGrade = function calculateGrade(){
        var finalGrade;

        for(var j in $scope.grid.students){
            finalGrade=defaultValue;
            for( var i in $scope.gradeType ){
                if(!isFormatValid($scope.grid.students[j].totalMarks))
                    break;
                if(isFormatValid($scope.gradeType[i].minMarks) &&
                    parseFloat($scope.grid.students[j].totalMarks) >= parseFloat($scope.gradeType[i].minMarks)){
                    finalGrade = $scope.gradeType[i].grade;
                    break;
                }
            }
            $scope.grid.students[j].grade=finalGrade;
        }
        $scope.drawGraph();
    }

    $scope.bellCurveGrades = function bellCurveGrades(){

    }

    $scope.drawGraph = function drawGraph(){
        var gradeCount = getGradesCount();
        draw( gradeCount );
    }

    //Helper functions
    function getStudent( rollNumber ){
        var j=-1;
        for( var i in $scope.grid.students ){
            if( $scope.grid.students[i].rollNumber == rollNumber ){
                j=i;
                break;
            }
        }
        return j;
    }

    function getGradesCount(){
        var gradeCount = [];
        var i;
        for( i in $scope.gradeType ) {
            gradeCount.push({'grade':$scope.gradeType[i].grade, 'count':0 });
        }

        for( i in $scope.grid.students ){
            for( var j in gradeCount ){
                if(gradeCount[j].grade==$scope.grid.students[i].grade)
                    gradeCount[j].count++;
            }
        }
        return gradeCount;
    }

    function sum( list ){
        var tempSum = defaultValue;
        for( var i in list)
            if( isFormatValid(list[i]) )
            {
                if(!isFormatValid(tempSum))
                    tempSum=0;
                tempSum += parseFloat(list[i]);
            }
        return tempSum;
    }

    function average( list ){
        var tempSum = sum( list );
        if(isFormatValid(tempSum))
            tempSum = parseFloat(tempSum/list.length);
        return tempSum;
    }

    var defaultValue="";

    function isFormatValid( value ){
        if(value===defaultValue || angular.isUndefined( value ))
            return false;
        return true;
    }

});

//Draws graph using Morris js
function draw( graphData ){
    $('#graph').html('');
    Morris.Bar({
        element: 'graph',
        data:graphData,
        xkey: 'grade',
        ykeys: ['count'],
        labels: ['Grade Count']
    });
}