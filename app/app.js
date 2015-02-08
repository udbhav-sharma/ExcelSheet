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
    $scope.exams= [
        {examId:1, examName:'Minor 1', maxMarks:10},
        {examId:2, examName:'Mid', maxMarks:30},
        {examId:3, examName:'Minor 2', maxMarks:10},
        {examId:4, examName:'End', maxMarks:50}
    ];
    $scope.rollNumbers = generateRandomRollNumbers();

    //Default Assignment
    $scope.cells = initializeCells();
    $scope.contribution = initializeContribution();
    $scope.grades={};
    $scope.avg = {};
    $scope.total = {};

    //Functions

    //Initialization Functions
    function initializeCells(){
        var cells={};
        for(var i in $scope.rollNumbers) {
            cells[$scope.rollNumbers[i]] = {};
            for (var j in $scope.exams)
                cells[$scope.rollNumbers[i]][$scope.exams[j].examId] = defaultValue;
        }
        return cells;
    }

    function initializeContribution(){
        var contribution={};
        for (var i in $scope.exams)
            contribution[$scope.exams[i].examId] = 1;
        return contribution;
    }

    function generateRandomRollNumbers(){
        var min = 117101;
        var max =  117170;
        var last = Math.floor(Math.random() * (max - min)) + min;
        var roll=[];
        for(var i=min; i<=last; i++){
            roll.push(i);
        }
        return roll;
    }

    $scope.fillCell = function fillCell(){
        var min, max, value;
        for (var i in $scope.rollNumbers){
            for(var j in $scope.exams){
                max=$scope.exams[j].maxMarks;
                min=0;
                value = Math.floor(Math.random() * (max - min)) + min;
                $scope.cells[$scope.rollNumbers[i]][$scope.exams[j].examId] = value;
                //console.log(value);
            }
        }
    }

    $scope.calculateAverageMarks = function calculateAverageMarks( column ){
        var list = [];
        for(var i in $scope.rollNumbers)
            list.push($scope.cells[$scope.rollNumbers[i]][column]);

        $scope.avg[column] = average(list);
        return $scope.avg[column];
    }

    $scope.calculateColumnTotal = function calculateColumnTotal( arrayList ){
        var list = [];
        for(var i in arrayList)
            list.push(arrayList[i]);

        return sum(list);
    }

    $scope.calculateColumnContributionTotal = function calculateColumnContributionTotal( arrayList ){
        var list = [];
        var value;
        for(var i in arrayList){
            if(isFormatValid($scope.contribution[i]) && isFormatValid(arrayList[i]))
                value=arrayList[i]*$scope.contribution[i];
            else
                value=defaultValue;

            list.push(value);
        }
        return sum(list);
    }

    $scope.calculateTotalMarks = function calculateTotalMarks( roll, arrayList ) {
        var totalMarks = $scope.calculateColumnContributionTotal(arrayList);
        $scope.total[roll] = totalMarks;
        return totalMarks;
    }

    $scope.calculateGrade = function calculateGrade(){
        var finalGrade;
        for(var j in $scope.total){
            finalGrade=defaultValue;
            for( var i in $scope.gradeType ){
                if(!isFormatValid($scope.total[j]))
                    break;
                if(isFormatValid($scope.gradeType[i].minMarks) &&
                    parseFloat($scope.total[j]) >= parseFloat($scope.gradeType[i].minMarks)){
                    finalGrade = $scope.gradeType[i].grade;
                    break;
                }
            }
            $scope.grades[j]=finalGrade;
        }
        $scope.drawGraph();
    }

    $scope.drawGraph = function drawGraph(){
        var gradeCount = getGradesCount();
        console.log(gradeCount);
        draw( gradeCount );
    }

    function getGradesCount(){
        var gradeCount = [];
        var i;
        for( i in $scope.gradeType ) {
            gradeCount.push({'grade':$scope.gradeType[i].grade, 'count':0 });
        }

        for( i in $scope.grades ){
            for( var j in gradeCount ){
                if(gradeCount[j].grade==$scope.grades[i])
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