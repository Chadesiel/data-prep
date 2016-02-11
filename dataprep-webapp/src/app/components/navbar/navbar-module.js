import NavbarCtrl from './navbar-controller';
import Navbar from './navbar-directive';

(() => {
    'use strict';

    angular.module('data-prep.navbar',
        [
            'ui.router',
            'data-prep.services.dataset',
            'data-prep.services.easter-eggs',
            'data-prep.services.feedback',
            'data-prep.services.onboarding',
            'data-prep.services.utils'
        ])
        .controller('NavbarCtrl', NavbarCtrl)
        .directive('navbar', Navbar);
})();
