var app = angular.module('exam',['alert_module']).
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
        var max =  117190;
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
        var K = $scope.gradeType.length;
        var lambda = K/2+1/3;
        var u = 2;
        var N = $scope.grid.students.length;
        var bellCurveGradeOb = [];
        var gradeCount=0;

        for(var k= 1,j=0; k<=K; k++,j++) {
            var count = pmf(lambda,N,k);
            gradeCount+=count;
            bellCurveGradeOb.push({'grade':$scope.gradeType[j].grade, 'count':count});
        }

        bellCurveGradeOb[Math.floor(lambda)].count+=N-gradeCount;

        var students = $scope.grid.students;
        students.sort(function(s1,s2){
            if(s1.totalMarks < s2.totalMarks)
                return 1;
            if(s1.totalMarks > s2.totalMarks)
                return -1;
            return 0;
        });

        var i= 0,t;
        for(var j in bellCurveGradeOb){
            for(var k=0;k<bellCurveGradeOb[j].count;k++,i++){
                t = getStudent(students[i].rollNumber);
                if(t==-1)
                    continue;
                $scope.grid.students[t].grade=bellCurveGradeOb[j].grade;
            }
        }

        $scope.drawGraph();
        //console.log(students);
        //console.log(bellCurveGradeOb);

    }

    $scope.drawGraph = function drawGraph(){
        var gradeCount = getGradesCount();
        var graphData = {grades:[],count:[]};
        for(var j in gradeCount){
            graphData.grades.push(gradeCount[j].grade);
            graphData.count.push(gradeCount[j].count);
        }
        drawChart( graphData );
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

    function pmf( lambda, N, k ){
        return Math.floor((((Math.pow(lambda,k)*Math.exp(-lambda))/factorial(k))*N));
    }

    function factorial(k){
        var val=1;
        for(var i=1;i<=k;i++)
            val*=i;
        return val;
    }

});

//Draws graph using Morris js
function drawChart(graphData){
    var data = {
        labels: graphData.grades,
        datasets: [
            {
                label: "My First dataset",
                fillColor: "rgba(151,187,205,0.2)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)",
                data: graphData.count
            }
        ]
    };

    var ctx = document.getElementById("grades_chart").getContext("2d");
    var myLineChart = new Chart(ctx).Line(data);
}