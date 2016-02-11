import SuggestionsStats from './suggestions-stats-directive';

(() => {
    'use strict';

    angular.module('data-prep.suggestions-stats',
        [
            'talend.widget',
            'data-prep.actions-list',
            'data-prep.actions-suggestions',
            'data-prep.stats-details',
            'data-prep.column-profile'
        ])
        .directive('suggestionsStats', SuggestionsStats);
})();