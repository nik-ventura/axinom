(function() {
    'use strict';

    angular
        .module('axinom')
        .directive('toggleClass', toggleClass);

    /** @ngInject */
    function toggleClass() {
        var directive = {
            restrict: 'E',
//            templateUrl: 'app/components/navbar/navbar.html',
//            scope: {
//                creationDate: '='
//            },
            controller: ToggleCtrl,
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;

        /** @ngInject */
        function ToggleCtrl($scope) {
            var vm = this;
            return function(scope, element, attrs) {
                element.bind('click', function() {
                    element.toggleClass(attrs.toggleClass);
                });
            }
        }
    }

})();
