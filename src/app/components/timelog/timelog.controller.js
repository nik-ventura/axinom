(function() {
    'use strict';

    angular
        .module('axinom')
        .controller('TimelogController', TimelogController);

    /** @ngInject */
    function TimelogController(toastr, $scope) {

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
                onEnd: $scope.change
            };
            $scope.translate = function(value) {
                return value + '%';
            };
            $scope.timeLog = 10;
            $scope.timeLog2 = 5;
            $scope.timeLog3 = 60;
            var previousLog = $scope.timeLog;
            var previousLog2 = $scope.timeLog2;
            var previousLog3 = $scope.timeLog3;
            $scope.timeLog4 = 100 - $scope.timeLog - $scope.timeLog2 - $scope.timeLog3;
            if ($scope.timeLog4 == 100) {
                $scope.timeLog4 = 0;
            }
            //Calendar settings and data
            $scope.today = function() {
                $scope.dt = new Date();
            };
            $scope.today();

            $scope.clear = function() {
                $scope.dt = null;
            };

            $scope.change = function(d) {
                if ((previousLog + previousLog2 + previousLog3) < 100 || ($scope.timeLog +
                    $scope.timeLog2 + $scope.timeLog3) < 100) {
                    previousLog = d.timeLog;
                    previousLog2 = d.timeLog2;
                    previousLog3 = d.timeLog3;
                } else {
                    $scope.timeLog = previousLog;
                    $scope.timeLog2 = previousLog2;
                    $scope.timeLog3 = previousLog3;
                }
                $scope.timeLog4 = 100 - $scope.timeLog - $scope.timeLog2 - $scope.timeLog3;
                if ($scope.timeLog4 < 0) {
                    $scope.timeLog4 = 0;
                }
            };

            // Disable weekend selection
            $scope.disabled = function(date, mode) {
                return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
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
                [{
                date: day.setDate(day.getDate() - 1),
                status: 'logged'
            }, {
                date: day.setDate(day.getDate() - 2),
                status: 'logged'
            }, {
                date: day.setDate(day.getDate() - 3),
                status: 'missed'
            }];

            $scope.getDayClass = function(date, mode) {
                if (mode === 'day') {
                    var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                    for (var i = 0; i < $scope.events.length; i++) {
                        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

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