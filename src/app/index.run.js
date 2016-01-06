(function() {
  'use strict';

  angular
    .module('axinom')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, $rootScope) {
    $log.debug('runBlock end');
  }

})();
