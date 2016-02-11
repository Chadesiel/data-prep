import TypeTransformMenuCtrl from './type-transformation-menu-controller';
import TypeTransformMenu from './type-transformation-menu-directive';

(() => {
    'use strict';

    /**
     * @ngdoc object
     * @name data-prep.type-transformation-menu
     * @description This module contains the controller and directives to manage the type transformation menu items
     * @requires data-prep.services.dataset
     * @requires data-prep.services.playground
     * @requires data-prep.services.state
     * @requires data-prep.services.utils
     */
    angular.module('data-prep.type-transformation-menu',
        [
            'data-prep.services.dataset',
            'data-prep.services.playground',
            'data-prep.services.utils'
        ])
        .controller('TypeTransformMenuCtrl', TypeTransformMenuCtrl)
        .directive('typeTransformMenu', TypeTransformMenu);
})();