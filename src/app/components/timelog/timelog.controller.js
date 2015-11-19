(function() {
  'use strict';

  angular
    .module('axinom')
    .controller('TimelogController', TimelogController);

  /** @ngInject */
  function TimelogController( toastr, $scope) {

    var vm = this;
    activate($scope);

    function activate($scope) {

        //Slider settings
        $scope.projectLog = {
            floor: 0,
            ceil: 100, //defaults to rz-slider-model
            step: 1,
            precision: 0,
//            translate:  $scope.translate,
            id: null,
            stepsArray: null,
            draggableRange: false,
            showSelectionBar: false,
            hideLimitLabels: false,
            readOnly: false,
            disabled: false,
            interval: 350,
            showTicks: false,
            showTicksValues: false,
            scale: 1,
            onStart: null,
            onChange: null,
            onEnd: null
        };
        $scope.translate = function(value) {
            return value + '%';
        };
        $scope.timeLog = 15;
        $scope.timeLog2 = 5;
        $scope.timeLog3 = 15;
        $scope.timeLog4 = $scope.timeLog - $scope.timeLog2;
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
                    date: day.setDate(day.getDate() - 3),
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
  }
})();
