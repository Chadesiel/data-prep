describe('Preparation list directive', function() {
    'use strict';

    var scope, createElement, element;
    var allDatasets = [
        {
            'id': 'de3cc32a-b624-484e-b8e7-dab9061a009c',
            'name': 'customers_jso_light',
            'author': 'anonymousUser',
            'records': 15,
            'nbLinesHeader': 1,
            'nbLinesFooter': 0,
            'created': '03-30-2015 08:06'
        },
        {
            'id': '3b21388c-f54a-4334-9bef-748912d0806f',
            'name': 'customers_jso',
            'author': 'anonymousUser',
            'records': 1000,
            'nbLinesHeader': 1,
            'nbLinesFooter': 0,
            'created': '03-30-2015 07:35'
        },
        {
            'id': '4d0a2718-bec6-4614-ad6c-8b3b326ff6c7',
            'name': 'first_interactions',
            'author': 'anonymousUser',
            'records': 29379,
            'nbLinesHeader': 1,
            'nbLinesFooter': 0,
            'created': '03-30-2015 08:05'
        },
        {
            'id': '5e95be9e-88cd-4765-9ecc-ee48cc28b6d5',
            'name': 'first_interactions_400',
            'author': 'anonymousUser',
            'records': 400,
            'nbLinesHeader': 1,
            'nbLinesFooter': 0,
            'created': '03-30-2015 08:06'
        }
    ];

    var allPreparations = [
        {
            'id': 'ab136cbf0923a7f11bea713adb74ecf919e05cfa',
            'dataSetId': 'de3cc32a-b624-484e-b8e7-dab9061a009c',
            'author': 'anonymousUser',
            'creationDate': 1427447300000,
            'lastModificationDate': 1427447300300,
            'steps': [
                '35890aabcf9115e4309d4ce93367bf5e4e77b82a',
                '4ff5d9a6ca2e75ebe3579740a4297fbdb9b7894f',
                '8a1c49d1b64270482e8db8232357c6815615b7cf',
                '599725f0e1331d5f8aae24f22cd1ec768b10348d'
            ],
            'actions': [
                {
                    'action': 'lowercase',
                    'parameters': {
                        'column_name': 'birth'
                    }
                },
                {
                    'action': 'uppercase',
                    'parameters': {
                        'column_name': 'country'
                    }
                },
                {
                    'action': 'cut',
                    'parameters': {
                        'pattern': '.',
                        'column_name': 'first_item'
                    }
                }
            ]
        },
        {
            'id': 'fbaa18e82e913e97e5f0e9d40f04413412be1126',
            'dataSetId': '4d0a2718-bec6-4614-ad6c-8b3b326ff6c7',
            'author': 'anonymousUser',
            'creationDate': 1427447330000,
            'lastModificationDate': 1427447330693,
            'steps': [
                '47e2444dd1301120b539804507fd307072294048',
                'ae1aebf4b3fa9b983c895486612c02c766305410',
                '24dcd68f2117b9f93662cb58cc31bf36d6e2867a',
                '599725f0e1331d5f8aae24f22cd1ec768b10348d'
            ],
            'actions': [
                {
                    'action': 'cut',
                    'parameters': {
                        'pattern': '-',
                        'column_name': 'birth'
                    }
                },
                {
                    'action': 'fillemptywithdefault',
                    'parameters': {
                        'default_value': 'N/A',
                        'column_name': 'state'
                    }
                },
                {
                    'action': 'uppercase',
                    'parameters': {
                        'column_name': 'lastname'
                    }
                }
            ]
        }
    ];

    beforeEach(module('data-prep.preparation-list'));
    beforeEach(module('htmlTemplates'));

    beforeEach(inject(function($rootScope, $compile, $q, PreparationRestService, DatasetListService) {
        scope = $rootScope.$new();
        createElement = function() {
            element = angular.element('<preparation-list></preparation-list>');
            $compile(element)(scope);
            scope.$digest();
        };

        spyOn(PreparationRestService, 'getPreparations').and.returnValue($q.when({data: allPreparations}));
        spyOn(DatasetListService, 'getDatasetsPromise').and.returnValue($q.when(allDatasets));
        spyOn(DatasetListService, 'refreshDatasets').and.returnValue($q.when(allDatasets));
    }));

    afterEach(function() {
        scope.$destroy();
        element.remove();
    });

    it('should render preparations tiles', function() {
        //given

        //when
        createElement();

        //then
        var preparationTiles = element.find('.preparation');
        expect(preparationTiles.length).toBe(2);

        var description = preparationTiles.eq(0).find('.description').eq(0).text();
        var details = preparationTiles.eq(0).find('.details').eq(0).text();
        expect(description).toContain('anonymousUser'); //owner
        expect(description).toContain('27'); //creation date day
        expect(description).toContain('2015'); //creation date year
        expect(details).toContain('customers_jso_light'); //dataset name
        expect(details).toContain('15'); //dataset nb records
        expect(details).toContain('3'); //steps

        description = preparationTiles.eq(1).find('.description').eq(0).text();
        details = preparationTiles.eq(1).find('.details').eq(0).text();
        expect(description).toContain('anonymousUser'); //owner
        expect(description).toContain('27'); //creation date day
        expect(description).toContain('2015'); //creation date year
        expect(details).toContain('first_interactions'); //dataset name
        expect(details).toContain('29379'); //dataset nb records
        expect(details).toContain('3'); //steps
    });
});