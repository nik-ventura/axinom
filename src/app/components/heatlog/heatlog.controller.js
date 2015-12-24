(function() {
  'use strict';

  angular
    .module('axinom')
    .controller('HeatlogController', HeatlogController);

  /** @ngInject */
  function HeatlogController($timeout, toastr, $scope) {
    var vm = this;
    $scope.date = new Date();

  }
})();
