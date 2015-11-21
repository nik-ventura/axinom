(function() {
  'use strict';

  angular
    .module('axinom')
    .controller('OfficeController', OfficeController);

  /** @ngInject */
  function OfficeController( toastr, $scope) {
    var vm = this;
      $scope.selectDate = false;
      $scope.sickDateSet = false;
      $scope.openControls = false;

      $scope.openControls = function(){
          return true;
      };
      $scope.date = {
          '2015': [{
              'month': 'November',
              'day': 31
          }]
      };
      $scope.employees = [
          {"name": "Bruce Willis"},
          {"name": "Sylvester Stallone"},
          {"name": "Arnold Schwarzenegger"},
          {"name": "Deni De Vito"},
          {"name": "Morgan Freeman"},
          {"name": "Tom Hanks"},
          {"name": "Jet Low"},
          {"name": "Jackie Chan"}
      ]

      //Calendar settings and data
      $scope.today = function() {
          $scope.dt = new Date();
      };
      $scope.today();

      $scope.clear = function () {
          $scope.dt = null;
      };

      // Disable weekend selection
      $scope.disabled = function(date, mode) {
          return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
      };

      $scope.toggleMin = function() {
          $scope.minDate = $scope.minDate ? null : new Date();
      };
      $scope.toggleMin();
      $scope.maxDate = new Date(2020, 5, 22);

      $scope.open = function($event) {
          $scope.status.opened = true;
      };

      $scope.setDate = function(year, month, day) {
          $scope.dt = new Date(year, month, day);
      };

      $scope.dateOptions = {
          formatYear: 'yy',
          startingDay: 2
      };

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];

      $scope.status = {
          opened: false
      };

      var day = new Date();
//        var yesterday = new Date();
//        yesterday.setDate(yesterday.getDate() - 1);
      $scope.events =
          [
              {
                  date: day.setDate(day.getDate() - 1),
                  status: 'logged'
              },
              {
                  date: day.setDate(day.getDate() - 2),
                  status: 'logged'
              },
              {
                  date: day.setDate(day.getDate() - 4),
                  status: 'missed'
              } ,
              {
                  date: day.setDate(day.getDate() - 1),
                  status: 'missed'
              },
              {
                  date: day.setDate(day.getDate() - 7),
                  status: 'missed'
              }
          ];

      $scope.getDayClass = function(date, mode) {
          if (mode === 'day') {
              var dayToCheck = new Date(date).setHours(0,0,0,0);

              for (var i=0;i<$scope.events.length;i++){
                  var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

                  if (dayToCheck === currentDay) {
                      return $scope.events[i].status;
                  }
              }
          }

          return '';
      }

    }

})();
