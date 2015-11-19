(function() {
  'use strict';

  angular
    .module('axinom')
    .controller('SettingsController', SettingsController);

  /** @ngInject */
  function SettingsController($scope) {
    var vm = this;
    $scope.projects = [
        {"name": "Lufthanza"},
        {"name": "Microsoft"},
        {"name": "Skype"},
        {"name": "ZMS"},
        {"name": "Marketing Unit"},
        {"name": "PRSO"},
        {"name": "Time"}
    ];
      $scope.translate = function(value) {
          return value + ':' + '00';
      };
    $scope.emailTime = 16;

  }
})();
