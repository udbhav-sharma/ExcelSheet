/**
 * Created by UDBHAV on 1/23/2015.
 */
var newalert = angular.module('alert_module',[])
    .factory('alert',function(){

        var initializeAlert = function (){
            return {show:false, status:-1, message:''};
        }

        var successAlert = function ( message ){
            return {show:true, status:1, message:message};
        }

        var errorAlert = function ( message ){
            return {show:true, status:0, message:message};
        }

        return{
            initializeAlert: initializeAlert,
            successAlert:successAlert,
            errorAlert:errorAlert
        };
    });