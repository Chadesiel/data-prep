/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

describe('Inventory Search component', () => {
    let scope;
    let createElement;
    let element;
    let $httpBackend;

    beforeEach(angular.mock.module('data-prep.inventory-search'));

    beforeEach(inject(($injector) => {
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.whenGET('assets/images/header/search.svg').respond(200, '');
    }));

    beforeEach(inject(($rootScope, $compile) => {
        scope = $rootScope.$new();

        createElement = () => {
            const template = `<inventory-search></inventory-search>`;
            element = $compile(template)(scope);
            scope.$digest();

            const typeahead = element.find('input').controller('typeahead');
            typeahead.searchString = 'aze';
            typeahead.visible = true;
        };
    }));

    afterEach(() => {
        scope.$destroy();
        element.remove();
    });

    it('should render search-bar', () => {
        //when
        createElement();

        //then
        expect(element.find('search-bar').length).toBe(1);
    });
});
