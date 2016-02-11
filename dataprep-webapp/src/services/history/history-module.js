import HistoryService from './history-service';

(() => {
    'use strict';

    /**
     * @ngdoc object
     * @name data-prep.services.history
     * @description This module contains the services to manage actions history
     */
    angular.module('data-prep.services.history', [])
        .service('HistoryService', HistoryService);
})();