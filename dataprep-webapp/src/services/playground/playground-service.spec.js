/*jshint camelcase: false */
describe('Playground Service', function () {
    'use strict';

    var datasetContent = {columns: [{id: '0001'}], records: []};
    var createdPreparation;
    var stateMock = {};

    beforeEach(module('data-prep.services.playground', function ($provide) {
        $provide.constant('state', stateMock);
    }));

    beforeEach(inject(function ($injector, $q, StateService, DatasetService, FilterService, RecipeService, DatagridService,
                                PreparationService, TransformationCacheService, SuggestionService,
                                HistoryService, StatisticsService, PreviewService) {
        stateMock.playground = {};
        createdPreparation = {id: '32cd7869f8426465e164ab85'};

        spyOn(DatagridService, 'setDataset').and.returnValue();
        spyOn(DatagridService, 'updateData').and.returnValue();
        spyOn(DatasetService, 'getContent').and.returnValue($q.when(datasetContent));
        spyOn(FilterService, 'removeAllFilters').and.returnValue();
        spyOn(HistoryService, 'clear').and.returnValue();
        spyOn(PreparationService, 'create').and.returnValue($q.when(createdPreparation));
        spyOn(PreparationService, 'setHead').and.returnValue($q.when());
        spyOn(PreparationService, 'setName').and.returnValue($q.when(true));
        spyOn(PreviewService, 'reset').and.returnValue();
        spyOn(RecipeService, 'refresh').and.returnValue($q.when(true));
        spyOn(StateService, 'resetPlayground').and.returnValue();
        spyOn(StateService, 'setCurrentDataset').and.returnValue();
        spyOn(StatisticsService, 'resetCharts').and.returnValue();
        spyOn(SuggestionService, 'reset').and.returnValue();
        spyOn(TransformationCacheService, 'invalidateCache').and.returnValue();
    }));

    it('should set new name to the preparation', inject(function ($rootScope, PlaygroundService, PreparationService) {
        //given
        var name = 'My preparation';
        var newName = 'My new preparation name';

        PlaygroundService.preparationName = name;
        PlaygroundService.originalPreparationName = name;
        stateMock.playground.dataset = {id: '123d120394ab0c53'};
        stateMock.playground.preparation = {id: 'e85afAa78556d5425bc2'};

        //when
        PlaygroundService.preparationName = newName;
        PlaygroundService.createOrUpdatePreparation(newName);
        $rootScope.$digest();

        //then
        expect(PreparationService.create).not.toHaveBeenCalled();
        expect(PreparationService.setName).toHaveBeenCalledWith('e85afAa78556d5425bc2', newName);
        expect(PlaygroundService.preparationName).toBe(newName);
        expect(PlaygroundService.originalPreparationName).toBe(newName);
    }));

    it('should reject when provided name is the original name', inject(function ($rootScope, PlaygroundService, PreparationService) {
        //given
        var name = 'My preparation';
        var newName = name;
        var rejected = false;

        PlaygroundService.originalPreparationName = name;
        PlaygroundService.preparationName = newName;

        //when
        PlaygroundService.createOrUpdatePreparation(newName)
            .catch(function () {
                rejected = true;
            });
        $rootScope.$digest();

        //then
        expect(rejected).toBe(true);
        expect(PreparationService.create).not.toHaveBeenCalled();
        expect(PreparationService.setName).not.toHaveBeenCalled();
        expect(PlaygroundService.preparationName).toBe(name);
        expect(PlaygroundService.originalPreparationName).toBe(name);
    }));

    describe('init new preparation', function () {
        var dataset = {id: 'e85afAa78556d5425bc2'};
        var assertNewPreparationInitialization, assertNewPreparationNotInitialized;

        beforeEach(inject(function (PlaygroundService, DatasetService, FilterService, RecipeService, DatagridService, TransformationCacheService, SuggestionService, HistoryService, StatisticsService, PreviewService, StateService) {
            assertNewPreparationInitialization = function () {
                expect(StateService.resetPlayground).toHaveBeenCalled();
                expect(StateService.setCurrentDataset).toHaveBeenCalledWith(dataset);
                expect(FilterService.removeAllFilters).toHaveBeenCalled();
                expect(RecipeService.refresh).toHaveBeenCalled();
                expect(DatagridService.setDataset).toHaveBeenCalledWith(dataset, datasetContent);
                expect(TransformationCacheService.invalidateCache).toHaveBeenCalled();
                expect(SuggestionService.reset).toHaveBeenCalled();
                expect(HistoryService.clear).toHaveBeenCalled();
                expect(StatisticsService.resetCharts).toHaveBeenCalled();
                expect(PreviewService.reset).toHaveBeenCalledWith(false);
            };
            assertNewPreparationNotInitialized = function () {
                expect(StateService.resetPlayground).not.toHaveBeenCalled();
                expect(StateService.setCurrentDataset).not.toHaveBeenCalled();
                expect(FilterService.removeAllFilters).not.toHaveBeenCalled();
                expect(RecipeService.refresh).not.toHaveBeenCalled();
                expect(DatagridService.setDataset).not.toHaveBeenCalled();
                expect(TransformationCacheService.invalidateCache).not.toHaveBeenCalled();
                expect(SuggestionService.reset).not.toHaveBeenCalled();
                expect(HistoryService.clear).not.toHaveBeenCalled();
                expect(StatisticsService.resetCharts).not.toHaveBeenCalled();
                expect(PreviewService.reset).not.toHaveBeenCalled();
            };

            jasmine.clock().install();
        }));

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('should init playground when there is no loaded data yet', inject(function ($rootScope, PlaygroundService, PreparationService) {
            //given
            expect(PreparationService.preparationName).toBeFalsy();
            expect(PreparationService.originalPreparationName).toBeFalsy();

            //when
            PlaygroundService.initPlayground(dataset);
            $rootScope.$digest();

            //then
            assertNewPreparationInitialization();
        }));

        it('should init playground when there is already a created preparation loaded', inject(function ($rootScope, PlaygroundService) {
            //given
            stateMock.playground.preparation = {id: '12342305304543'};

            //when
            PlaygroundService.initPlayground(dataset);
            $rootScope.$digest();

            //then
            assertNewPreparationInitialization();
        }));

        it('should init playground when the loaded dataset is not the wanted dataset', inject(function ($rootScope, PlaygroundService) {
            //given
            stateMock.playground.dataset = {id: 'ab45420c09bf98d9a90'};
            stateMock.playground.preparation = null;

            //when
            PlaygroundService.initPlayground(dataset);
            $rootScope.$digest();

            //then
            assertNewPreparationInitialization();
        }));

        it('should reset preparation name', inject(function ($rootScope, PlaygroundService) {
            //given
            PlaygroundService.preparationName = 'preparation name';
            PlaygroundService.originalPreparationName = 'preparation name';

            //when
            PlaygroundService.initPlayground(dataset);
            $rootScope.$digest();

            //then
            expect(PlaygroundService.preparationName).toBeFalsy();
            expect(PlaygroundService.originalPreparationName).toBeFalsy();
        }));

        it('should start playground unboarding tour', inject(function ($rootScope, PlaygroundService, OnboardingService, StateService) {
            //given
            spyOn(OnboardingService, 'shouldStartTour').and.returnValue(true);
            spyOn(OnboardingService, 'startTour').and.returnValue();
            spyOn(StateService, 'setGridSelection').and.returnValue();
            PlaygroundService.preparationName = 'preparation name';
            PlaygroundService.originalPreparationName = 'preparation name';

            //when
            PlaygroundService.initPlayground(dataset);
            $rootScope.$digest();
            jasmine.clock().tick(200);

            //then
            expect(StateService.setGridSelection).toHaveBeenCalledWith(datasetContent.columns[0]);
            expect(OnboardingService.shouldStartTour).toHaveBeenCalledWith('playground');
            expect(OnboardingService.startTour).toHaveBeenCalledWith('playground');
        }));

        it('should NOT start playground unboarding tour', inject(function ($rootScope, PlaygroundService, OnboardingService, StateService) {
            //given
            spyOn(OnboardingService, 'shouldStartTour').and.returnValue(false);
            spyOn(OnboardingService, 'startTour').and.returnValue();
            spyOn(StateService, 'setGridSelection').and.returnValue();
            PlaygroundService.preparationName = 'preparation name';
            PlaygroundService.originalPreparationName = 'preparation name';

            //when
            PlaygroundService.initPlayground(dataset);
            $rootScope.$digest();
            jasmine.clock().tick(200);

            //then
            expect(StateService.setGridSelection).not.toHaveBeenCalled();
            expect(OnboardingService.shouldStartTour).toHaveBeenCalledWith('playground');
            expect(OnboardingService.startTour).not.toHaveBeenCalled();
        }));

        it('should NOT init playground when the wanted dataset is loaded and no preparation was created yet', inject(function ($rootScope, PlaygroundService) {
            //given
            var dataset = {id: 'e85afAa78556d5425bc2'};
            stateMock.playground.dataset = dataset;

            //when
            PlaygroundService.initPlayground(dataset);
            $rootScope.$digest();

            //then
            assertNewPreparationNotInitialized();
        }));
    });

    describe('load existing preparation', function () {
        var data = {
            records: [{id: '0', firstname: 'toto'}, {id: '1', firstname: 'tata'}, {id: '2', firstname: 'titi'}]
        };
        var assertDatasetLoadInitialized, assertDatasetLoadNotInitialized;

        beforeEach(inject(function ($rootScope, $q, StateService, PreparationService, RecipeService, PlaygroundService, FilterService, DatagridService, TransformationCacheService, SuggestionService, HistoryService, StatisticsService, PreviewService) {
            spyOn($rootScope, '$emit').and.returnValue();
            spyOn(PreparationService, 'getContent').and.returnValue($q.when({data: data}));
            spyOn(RecipeService, 'disableStepsAfter').and.returnValue();

            assertDatasetLoadInitialized = function (metadata, data) {
                expect(StateService.resetPlayground).toHaveBeenCalled();
                expect(StateService.setCurrentDataset).toHaveBeenCalledWith(metadata);
                expect(FilterService.removeAllFilters).toHaveBeenCalled();
                expect(RecipeService.refresh).toHaveBeenCalled();
                expect(DatagridService.setDataset).toHaveBeenCalledWith(metadata, data);
                expect(TransformationCacheService.invalidateCache).toHaveBeenCalled();
                expect(SuggestionService.reset).toHaveBeenCalled();
                expect(HistoryService.clear).toHaveBeenCalled();
                expect(StatisticsService.resetCharts).toHaveBeenCalled();
                expect(PreviewService.reset).toHaveBeenCalledWith(false);
            };

            assertDatasetLoadNotInitialized = function () {
                expect(StateService.resetPlayground).not.toHaveBeenCalled();
                expect(StateService.setCurrentDataset).not.toHaveBeenCalled();
                expect(FilterService.removeAllFilters).not.toHaveBeenCalled();
                expect(RecipeService.refresh).not.toHaveBeenCalled();
                expect(DatagridService.setDataset).not.toHaveBeenCalled();
                expect(TransformationCacheService.invalidateCache).not.toHaveBeenCalled();
                expect(SuggestionService.reset).not.toHaveBeenCalled();
                expect(HistoryService.clear).not.toHaveBeenCalled();
                expect(StatisticsService.resetCharts).not.toHaveBeenCalled();
                expect(PreviewService.reset).not.toHaveBeenCalled();
            };
        }));

        it('should load existing preparation when it is not already loaded', inject(function ($rootScope, PlaygroundService) {
            //given
            var preparation = {
                id: '6845521254541',
                dataset: {id: '1'}
            };
            stateMock.playground.preparation = {id: '5746518486846'};

            //when
            PlaygroundService.load(preparation);
            $rootScope.$apply();

            //then
            assertDatasetLoadInitialized(preparation.dataset, data);
        }));

        it('should manage loading spinner on preparation load', inject(function ($rootScope, PlaygroundService) {
            //given
            var preparation = {
                id: '6845521254541',
                dataset: {id: '1'}
            };
            stateMock.playground.preparation = {id: '5746518486846'};

            //when
            PlaygroundService.load(preparation);
            expect($rootScope.$emit).toHaveBeenCalledWith('talend.loading.start');
            $rootScope.$apply();

            //then
            expect($rootScope.$emit).toHaveBeenCalledWith('talend.loading.stop');
        }));

        it('should load existing preparation with simulated dataset metadata when its metadata is not set yet', inject(function ($rootScope, PlaygroundService) {
            //given
            var preparation = {
                id: '6845521254541',
                dataSetId: '1'
            };
            stateMock.playground.preparation = {id: '5746518486846'};

            //when
            PlaygroundService.load(preparation);
            $rootScope.$apply();

            //then
            assertDatasetLoadInitialized({id: '1'}, data);
        }));

        it('should NOT change playground if the preparation to load is already loaded',
            inject(function ($rootScope, PlaygroundService) {
                //given
                var preparation = {
                    id: '6845521254541',
                    dataset: {id: '1', name: 'my dataset'}
                };
                var oldMetadata = {};

                stateMock.playground.dataset = oldMetadata;
                stateMock.playground.preparation = preparation;

                //when
                PlaygroundService.load(preparation);
                $rootScope.$apply();

                //then
                assertDatasetLoadNotInitialized();
                expect($rootScope.$emit).not.toHaveBeenCalled();
            }));

        it('should load preparation content at a specific step', inject(function ($rootScope, StateService, PlaygroundService, FilterService, RecipeService, DatagridService, PreviewService) {
            //given
            var step = {
                column: {id: '0000'},
                transformation: {stepId: 'a4353089cb0e039ac2'}
            };
            var metadata = {id: '1', name: 'my dataset'};
            var preparation = {id: '2542154454'};
            stateMock.playground.dataset = metadata;
            stateMock.playground.preparation = preparation;

            //when
            PlaygroundService.loadStep(step);
            expect($rootScope.$emit).toHaveBeenCalledWith('talend.loading.start');
            $rootScope.$apply();

            //then
            expect(StateService.resetPlayground).not.toHaveBeenCalled();
            expect(StateService.setCurrentDataset).not.toHaveBeenCalled();
            expect(FilterService.removeAllFilters).not.toHaveBeenCalled();
            expect(RecipeService.refresh).not.toHaveBeenCalled();
            expect(RecipeService.disableStepsAfter).toHaveBeenCalledWith(step);
            expect(PreviewService.reset).toHaveBeenCalledWith(false);
            expect(DatagridService.updateData).toHaveBeenCalledWith(data);
            expect($rootScope.$emit).toHaveBeenCalledWith('talend.loading.stop');
        }));

        it('should do nothing if current step (threshold between active and inactive) is already selected', inject(function ($rootScope, PlaygroundService, RecipeService, PreparationService) {
            //given
            var step = {
                column: {id: '0000'},
                transformation: {stepId: 'a4353089cb0e039ac2'}
            };
            spyOn(RecipeService, 'getActiveThresholdStep').and.returnValue(step);

            //when
            PlaygroundService.loadStep(step);

            //then
            expect($rootScope.$emit).not.toHaveBeenCalledWith('talend.loading.start');
            expect(PreparationService.getContent).not.toHaveBeenCalled();
        }));

        it('should load preparation sample when sample size is changed', inject(function (PlaygroundService, PreparationService, RecipeService) {
            //given
            stateMock.playground.preparation = {id: '5746518486846'};

            var lastActiveStep = {transformation: {stepId: '53df45d3s8425'}};
            spyOn(RecipeService, 'getActiveThresholdStepIndex').and.returnValue(2);
            spyOn(RecipeService, 'getStep').and.returnValue(lastActiveStep);

            //when
            PlaygroundService.selectedSampleSize = {name: '50', value: 50};
            PlaygroundService.changeSampleSize();

            //then
            expect(PreparationService.getContent).toHaveBeenCalledWith('5746518486846', '53df45d3s8425', 50);
        }));

        it('should load the full preparation sample when sample size is changed to full dataset', inject(function (PlaygroundService, PreparationService, RecipeService) {
            //given
            stateMock.playground.preparation = {id: '79a8746bc546874'};

            var lastActiveStep = {transformation: {stepId: '53df45d3s8425'}};
            spyOn(RecipeService, 'getActiveThresholdStepIndex').and.returnValue(2);
            spyOn(RecipeService, 'getStep').and.returnValue(lastActiveStep);

            //when
            PlaygroundService.selectedSampleSize = {name: 'full dataset', value: 'full'};
            PlaygroundService.changeSampleSize();

            //then
            expect(PreparationService.getContent).toHaveBeenCalledWith('79a8746bc546874', '53df45d3s8425', 'full');
        }));
    });

    describe('transformation steps', function () {
        var preparationHeadContent, metadata;
        var lastStepId = 'a151e543456413ef51';
        var previousLastStepId = '3248fa65e45f588cb464';
        var lastStep = {transformation: {stepId: lastStepId}};
        var previousLastStep = {transformation: {stepId: previousLastStepId}};
        beforeEach(inject(function ($rootScope, $q, PlaygroundService, PreparationService, DatagridService, RecipeService, HistoryService) {
            preparationHeadContent = {
                'records': [{
                    'firstname': 'Grover',
                    'avgAmount': '82.4',
                    'city': 'BOSTON',
                    'birth': '01-09-1973',
                    'registration': '17-02-2008',
                    'id': '1',
                    'state': 'AR',
                    'nbCommands': '41',
                    'lastname': 'Quincy'
                }, {
                    'firstname': 'Warren',
                    'avgAmount': '87.6',
                    'city': 'NASHVILLE',
                    'birth': '11-02-1960',
                    'registration': '18-08-2007',
                    'id': '2',
                    'state': 'WA',
                    'nbCommands': '17',
                    'lastname': 'Johnson'
                }]
            };

            metadata = {id: 'e85afAa78556d5425bc2'};
            stateMock.playground.dataset = metadata;

            spyOn($rootScope, '$emit').and.returnValue();
            spyOn(PreparationService, 'appendStep').and.returnValue($q.when(true));
            spyOn(PreparationService, 'updateStep').and.returnValue($q.when(true));
            spyOn(PreparationService, 'removeStep').and.returnValue($q.when(true));
            spyOn(PreparationService, 'getContent').and.returnValue($q.when({data: preparationHeadContent}));
            spyOn(RecipeService, 'getLastStep').and.returnValue(lastStep);
            spyOn(RecipeService, 'getPreviousStep').and.callFake(function (step) {
                return step === lastStep ? previousLastStep : null;
            });
            spyOn(HistoryService, 'addAction').and.returnValue();
        }));

        describe('append', function () {
            it('should create a preparation when there is no preparation yet', inject(function ($rootScope, PlaygroundService, PreparationService) {
                //given
                stateMock.playground.dataset = {id: '76a415cf854d8654'};
                stateMock.playground.preparation = null;
                var action = 'uppercase';
                var parameters = {
                    param1: 'param1Value',
                    param2: 4,
                    scope: 'column',
                    column_id: '0001',
                    column_name: 'firstname'
                };

                expect(createdPreparation.draft).toBeFalsy();

                //when
                PlaygroundService.appendStep(action, parameters);
                stateMock.playground.preparation = createdPreparation; //emulate created preparation set in state
                $rootScope.$digest();

                //then
                expect(createdPreparation.draft).toBe(true);
                expect(PreparationService.create).toHaveBeenCalledWith('76a415cf854d8654', 'Preparation draft');
            }));

            it('should append step to the new created preparation', inject(function ($rootScope, PlaygroundService, PreparationService) {
                //given
                stateMock.playground.dataset = {id: '76a415cf854d8654'};
                stateMock.playground.preparation = null;
                var action = 'uppercase';
                var parameters = {
                    param1: 'param1Value',
                    param2: 4,
                    scope: 'column',
                    column_id: '0001',
                    column_name: 'firstname'
                };
                var actionParameters = {
                    action: action,
                    parameters: parameters
                };

                expect(createdPreparation.draft).toBeFalsy();

                //when
                PlaygroundService.appendStep(action, parameters);
                stateMock.playground.preparation = createdPreparation; //emulate created preparation set in state
                $rootScope.$digest();

                //then
                expect(PreparationService.appendStep).toHaveBeenCalledWith(createdPreparation.id, actionParameters);
            }));

            it('should append step to an existing preparation', inject(function ($rootScope, PlaygroundService, PreparationService) {
                //given
                stateMock.playground.preparation = {id: '15de46846f8a46'};
                var action = 'uppercase';
                var parameters = {
                    param1: 'param1Value',
                    param2: 4,
                    scope: 'column',
                    column_id: '0001',
                    column_name: 'firstname'
                };
                var actionParameters = {
                    action: action,
                    parameters: parameters
                };

                //when
                PlaygroundService.appendStep(action, parameters);
                $rootScope.$digest();

                //then
                expect(PreparationService.appendStep).toHaveBeenCalledWith('15de46846f8a46', actionParameters);
            }));

            it('should show/hide loading', inject(function ($rootScope, PlaygroundService) {
                //given
                stateMock.playground.preparation = {id: '15de46846f8a46'};
                var action = 'uppercase';
                var parameters = {
                    param1: 'param1Value',
                    param2: 4,
                    scope: 'column',
                    column_id: '0001',
                    column_name: 'firstname'
                };

                //when
                PlaygroundService.appendStep(action, parameters);
                expect($rootScope.$emit).toHaveBeenCalledWith('talend.loading.start');
                $rootScope.$digest();

                //then
                expect($rootScope.$emit).toHaveBeenCalledWith('talend.loading.stop');
            }));

            it('should refresh recipe', inject(function ($rootScope, PlaygroundService, RecipeService) {
                //given
                stateMock.playground.preparation = {id: '15de46846f8a46'};
                var action = 'uppercase';
                var parameters = {
                    param1: 'param1Value',
                    param2: 4,
                    scope: 'column',
                    column_id: '0001',
                    column_name: 'firstname'
                };

                //when
                PlaygroundService.appendStep(action, parameters);
                $rootScope.$digest();

                //then
                expect(RecipeService.refresh).toHaveBeenCalled();
            }));

            it('should refresh datagrid with head content', inject(function ($rootScope, PlaygroundService, PreparationService, DatagridService, PreviewService) {
                //given
                stateMock.playground.preparation = {id: '15de46846f8a46'};
                var action = 'uppercase';
                var parameters = {
                    param1: 'param1Value',
                    param2: 4,
                    scope: 'column',
                    column_id: '0001',
                    column_name: 'firstname'
                };
                PlaygroundService.selectedSampleSize = {value: 'full'};

                //when
                PlaygroundService.appendStep(action, parameters);
                $rootScope.$digest();

                //then
                expect(PreparationService.getContent).toHaveBeenCalledWith('15de46846f8a46', 'head', 'full');
                expect(DatagridService.updateData).toHaveBeenCalledWith(preparationHeadContent);
                expect(PreviewService.reset).toHaveBeenCalledWith(false);
            }));

            describe('history', function () {
                var undo;
                var preparationId = '15de46846f8a46';

                beforeEach(inject(function (RecipeService) {
                    spyOn(RecipeService, 'getLastActiveStep').and.returnValue(lastStep); //loaded step is the last step
                }));

                beforeEach(inject(function ($rootScope, PlaygroundService, HistoryService) {
                    //given
                    stateMock.playground.preparation = {id: preparationId};
                    var action = 'uppercase';
                    var parameters = {
                        param1: 'param1Value',
                        param2: 4,
                        scope: 'column',
                        column_id: '0001',
                        column_name: 'firstname'
                    };
                    expect(HistoryService.addAction).not.toHaveBeenCalled();

                    //when
                    PlaygroundService.appendStep(action, parameters);
                    $rootScope.$digest();

                    //then
                    undo = HistoryService.addAction.calls.argsFor(0)[0];
                }));

                it('should add undo/redo actions after append transformation', inject(function (HistoryService) {
                    //then
                    expect(HistoryService.addAction).toHaveBeenCalled();
                }));

                it('should set preparation head to previous head on UNDO', inject(function ($rootScope, PreparationService) {
                    //given
                    expect(PreparationService.setHead).not.toHaveBeenCalled();

                    //when
                    undo();

                    //then
                    expect(PreparationService.setHead).toHaveBeenCalledWith(preparationId, previousLastStepId);
                }));

                it('should refresh recipe on UNDO', inject(function ($rootScope, DatagridService, RecipeService) {
                    //given
                    expect(RecipeService.refresh.calls.count()).toBe(1);

                    //when
                    undo();
                    $rootScope.$digest();

                    //then
                    expect(RecipeService.refresh.calls.count()).toBe(2);
                }));

                it('should refresh datagrid content on UNDO', inject(function ($rootScope, PreparationService, DatagridService) {
                    //given
                    expect(PreparationService.getContent.calls.count()).toBe(1);
                    expect(DatagridService.updateData.calls.count()).toBe(1);

                    //when
                    undo();
                    $rootScope.$digest();

                    //then
                    expect(PreparationService.getContent.calls.count()).toBe(2);
                    expect(PreparationService.getContent.calls.argsFor(1)[0]).toBe('15de46846f8a46');
                    expect(PreparationService.getContent.calls.argsFor(1)[1]).toBe('head');
                    expect(DatagridService.focusedColumn).toBeFalsy();
                    expect(DatagridService.updateData.calls.count()).toBe(2);
                    expect(DatagridService.updateData.calls.argsFor(1)[0]).toBe(preparationHeadContent);
                }));
            });
        });

        describe('update', function () {
            var lastActiveIndex = 5;
            var lastActiveStep = {
                column: {id: '0000'},
                transformation: {stepId: '24a457bc464e645'},
                actionParameters: {
                    action: 'touppercase'
                }
            };
            var oldParameters = {value: 'toto', column_id: '0001'};
            var stepToUpdate = {
                column: {id: '0001'},
                transformation: {stepId: '98a7565e4231fc2c7'},
                actionParameters: {
                    action: 'delete_on_value',
                    parameters: oldParameters
                }
            };

            beforeEach(inject(function (RecipeService) {
                spyOn(RecipeService, 'getActiveThresholdStepIndex').and.returnValue(lastActiveIndex);
                spyOn(RecipeService, 'getStep').and.callFake(function (index) {
                    if (index === lastActiveIndex) {
                        return lastActiveStep;
                    }
                    return stepToUpdate;
                });
            }));

            it('should update preparation step', inject(function ($rootScope, PlaygroundService, PreparationService) {
                //given
                stateMock.playground.preparation = {id: '456415ae348e6046dc'};
                var parameters = {value: 'toto', column_id: '0001'};

                //when
                PlaygroundService.updateStep(stepToUpdate, parameters);

                //then
                expect(PreparationService.updateStep).toHaveBeenCalledWith('456415ae348e6046dc', stepToUpdate, parameters);
            }));

            it('should show/hide loading', inject(function ($rootScope, PlaygroundService) {
                //given
                stateMock.playground.preparation = {id: '456415ae348e6046dc'};
                var parameters = {value: 'toto', column_id: '0001'};

                //when
                PlaygroundService.updateStep(stepToUpdate, parameters);
                expect($rootScope.$emit).toHaveBeenCalledWith('talend.loading.start');
                $rootScope.$digest();

                //then
                expect($rootScope.$emit).toHaveBeenCalledWith('talend.loading.stop');
            }));

            it('should refresh recipe', inject(function ($rootScope, PlaygroundService, RecipeService) {
                //given
                stateMock.playground.preparation = {id: '456415ae348e6046dc'};
                var parameters = {value: 'toto', column_id: '0001'};

                //when
                PlaygroundService.updateStep(stepToUpdate, parameters);
                $rootScope.$digest();

                //then
                expect(RecipeService.refresh).toHaveBeenCalled();
            }));

            it('should load previous last active step', inject(function ($rootScope, PlaygroundService, PreparationService, DatagridService, PreviewService) {
                //given
                stateMock.playground.preparation = {id: '456415ae348e6046dc'};
                var parameters = {value: 'toto', column_id: '0001'};
                PlaygroundService.selectedSampleSize = {value: 'full'};

                //when
                PlaygroundService.updateStep(stepToUpdate, parameters);
                $rootScope.$digest();

                //then
                expect(PreparationService.getContent).toHaveBeenCalledWith('456415ae348e6046dc', lastActiveStep.transformation.stepId, 'full');
                expect(DatagridService.updateData).toHaveBeenCalledWith(preparationHeadContent);
                expect(PreviewService.reset).toHaveBeenCalledWith(false);
            }));

            describe('history', function () {
                var undo;
                var preparationId = '456415ae348e6046dc';

                beforeEach(inject(function (RecipeService) {
                    spyOn(RecipeService, 'getLastActiveStep').and.returnValue(lastActiveStep); //loaded step is not the last step
                }));

                beforeEach(inject(function ($rootScope, PlaygroundService, HistoryService) {
                    //given
                    stateMock.playground.preparation = {id: preparationId};
                    var parameters = {value: 'toto', column_id: '0001'};

                    //when
                    PlaygroundService.updateStep(stepToUpdate, parameters);
                    $rootScope.$digest();

                    //then
                    undo = HistoryService.addAction.calls.argsFor(0)[0];
                }));

                it('should add undo/redo actions after update transformation', inject(function (HistoryService) {
                    //then
                    expect(HistoryService.addAction).toHaveBeenCalled();
                }));

                it('should set preparation head to previous head on UNDO', inject(function ($rootScope, PreparationService) {
                    //given
                    expect(PreparationService.setHead).not.toHaveBeenCalled();

                    //when
                    undo();

                    //then
                    expect(PreparationService.setHead).toHaveBeenCalledWith(preparationId, lastStepId);
                }));

                it('should refresh recipe on UNDO', inject(function ($rootScope, RecipeService) {
                    //given
                    expect(RecipeService.refresh.calls.count()).toBe(1);

                    //when
                    undo();
                    $rootScope.$digest();

                    //then
                    expect(RecipeService.refresh.calls.count()).toBe(2);
                }));

                it('should refresh datagrid content at the last active step on UNDO', inject(function ($rootScope, PreparationService, DatagridService, RecipeService) {
                    //given
                    expect(PreparationService.getContent.calls.count()).toBe(1);
                    expect(DatagridService.updateData.calls.count()).toBe(1);

                    //when
                    undo();
                    spyOn(RecipeService, 'getActiveThresholdStep').and.returnValue(); //emulate last active step different to the step to load
                    $rootScope.$digest();

                    //then
                    expect(PreparationService.getContent.calls.count()).toBe(2);
                    expect(PreparationService.getContent.calls.argsFor(1)[0]).toBe(preparationId);
                    expect(PreparationService.getContent.calls.argsFor(1)[1]).toBe(lastActiveStep.transformation.stepId);
                    expect(DatagridService.updateData.calls.count()).toBe(2);
                    expect(DatagridService.updateData.calls.argsFor(1)[0]).toBe(preparationHeadContent);
                }));
            });
        });

        describe('remove', function () {
            var stepToDeleteId = '98a7565e4231fc2c7';
            var stepToDelete = {
                column: {id: '0001'},
                transformation: {stepId: stepToDeleteId},
                actionParameters: {
                    action: 'delete_on_value',
                    parameters: {value: 'toto', column_id: '0001'}
                }
            };
            var preparationId = '43ab15436f12e3456';

            var allActionsFromStepToDelete = [
                {action: 'tolowercase', parameters: {column_id: '0003'}},
                {action: 'deleteempty', parameters: {column_id: '0003'}},
                {action: 'touppercase', parameters: {column_id: '0004'}}
            ];

            beforeEach(inject(function (RecipeService) {
                spyOn(RecipeService, 'getAllActionsFrom').and.returnValue(allActionsFromStepToDelete);
            }));

            it('should remove preparation step', inject(function ($rootScope, PlaygroundService, PreparationService) {
                //given
                stateMock.playground.preparation = {id: preparationId};

                //when
                PlaygroundService.removeStep(stepToDelete);

                //then
                expect(PreparationService.removeStep).toHaveBeenCalledWith(preparationId, stepToDeleteId);
            }));

            it('should show/hide loading', inject(function ($rootScope, PlaygroundService) {
                //given
                stateMock.playground.preparation = {id: preparationId};

                //when
                PlaygroundService.removeStep(stepToDelete);
                expect($rootScope.$emit).toHaveBeenCalledWith('talend.loading.start');
                $rootScope.$digest();

                //then
                expect($rootScope.$emit).toHaveBeenCalledWith('talend.loading.stop');
            }));

            it('should refresh recipe', inject(function ($rootScope, PlaygroundService, RecipeService) {
                //given
                stateMock.playground.preparation = {id: preparationId};

                //when
                PlaygroundService.removeStep(stepToDelete);
                $rootScope.$digest();

                //then
                expect(RecipeService.refresh).toHaveBeenCalled();
            }));

            it('should update datagrid', inject(function ($rootScope, PlaygroundService, PreparationService, DatagridService, PreviewService) {
                //given
                stateMock.playground.preparation = {id: preparationId};
                PlaygroundService.selectedSampleSize = {value: 'full'};

                //when
                PlaygroundService.removeStep(stepToDelete);
                $rootScope.$digest();

                //then
                expect(PreparationService.getContent).toHaveBeenCalledWith(preparationId, 'head', 'full');
                expect(DatagridService.focusedColumn).toBeFalsy();
                expect(DatagridService.updateData).toHaveBeenCalledWith(preparationHeadContent);
                expect(PreviewService.reset).toHaveBeenCalledWith(false);
            }));

            describe('history', function () {
                var undo;

                beforeEach(inject(function (RecipeService) {
                    spyOn(RecipeService, 'getLastActiveStep').and.returnValue(lastStep); //loaded step is the last step
                }));

                beforeEach(inject(function ($rootScope, HistoryService, PlaygroundService) {
                    //given
                    stateMock.playground.preparation = {id: preparationId};
                    expect(HistoryService.addAction).not.toHaveBeenCalled();

                    //when
                    PlaygroundService.removeStep(stepToDelete);
                    $rootScope.$digest();

                    //then
                    undo = HistoryService.addAction.calls.argsFor(0)[0];
                }));

                it('should add undo/redo actions after remove transformation', inject(function (HistoryService) {
                    //then
                    expect(HistoryService.addAction).toHaveBeenCalled();
                }));

                it('should set preparation head to previous head on UNDO', inject(function (PreparationService) {
                    //given
                    expect(PreparationService.setHead).not.toHaveBeenCalled();

                    //when
                    undo();

                    //then
                    expect(PreparationService.setHead).toHaveBeenCalledWith(preparationId, lastStepId);
                }));

                it('should refresh recipe on UNDO', inject(function ($rootScope, RecipeService) {
                    //given
                    expect(RecipeService.refresh.calls.count()).toBe(1);

                    //when
                    undo();
                    $rootScope.$digest();

                    //then
                    expect(RecipeService.refresh.calls.count()).toBe(2);
                }));

                it('should refresh datagrid content on UNDO', inject(function ($rootScope, PlaygroundService, PreparationService, DatagridService, PreviewService) {
                    //given
                    PlaygroundService.selectedSampleSize = {value: 'full'};

                    //when
                    undo();
                    $rootScope.$digest();

                    //then
                    expect(PreparationService.getContent).toHaveBeenCalledWith(preparationId, 'head', 'full');
                    expect(DatagridService.updateData).toHaveBeenCalledWith(preparationHeadContent);
                    expect(PreviewService.reset).toHaveBeenCalledWith(false);
                }));
            });
        });

        describe('edit cell', function () {
            it('should append cell edition step', inject(function ($rootScope, PlaygroundService, PreparationService) {
                //given
                var preparationId = '64f3543cd466f545';
                stateMock.playground.preparation = {id: preparationId};

                var rowItem = {tdpId: 58, '0000': 'McDonald', '0001': 'Ronald'};
                var column = {id: '0001', name: 'firstname'};
                var newValue = 'Donald';
                var updateAllCellWithValue = false;

                //when
                PlaygroundService.editCell(rowItem, column, newValue, updateAllCellWithValue);
                $rootScope.$digest();

                //then
                var expectedParams = {
                    scope: 'cell',
                    column_id: '0001',
                    column_name: 'firstname',
                    row_id: 58,
                    cell_value: 'Ronald',
                    replace_value: 'Donald'
                };
                expect(PreparationService.appendStep).toHaveBeenCalledWith(
                    preparationId,
                    {action: 'replace_on_value', parameters: expectedParams}
                );
            }));

            it('should append column replace value step', inject(function ($rootScope, PlaygroundService, PreparationService) {
                //given
                var preparationId = '64f3543cd466f545';
                stateMock.playground.preparation = {id: preparationId};

                var rowItem = {tdpId: 58, '0000': 'McDonald', '0001': 'Ronald'};
                var column = {id: '0001', name: 'firstname'};
                var newValue = 'Donald';
                var updateAllCellWithValue = true;

                //when
                PlaygroundService.editCell(rowItem, column, newValue, updateAllCellWithValue);
                $rootScope.$digest();

                //then
                var expectedParams = {
                    scope: 'column',
                    column_id: '0001',
                    column_name: 'firstname',
                    row_id: 58,
                    cell_value: 'Ronald',
                    replace_value: 'Donald'
                };
                expect(PreparationService.appendStep).toHaveBeenCalledWith(
                    preparationId,
                    {action: 'replace_on_value', parameters: expectedParams}
                );
            }));

            describe('append history', function () {
                it('should add undo/redo actions after append transformation', inject(function ($rootScope, PlaygroundService, HistoryService) {
                    //given
                    var preparationId = '64f3543cd466f545';
                    stateMock.playground.preparation = {id: preparationId};

                    var rowItem = {tdpId: 58, '0000': 'McDonald', '0001': 'Ronald'};
                    var column = {id: '0001', name: 'firstname'};
                    var newValue = 'Donald';
                    var updateAllCellWithValue = true;

                    //when
                    PlaygroundService.editCell(rowItem, column, newValue, updateAllCellWithValue);
                    $rootScope.$digest();

                    //then
                    expect(HistoryService.addAction).toHaveBeenCalled();
                }));
            });
        });
    });

    describe('recipe panel display management', function () {

        beforeEach(inject(function ($q, PreparationService, DatagridService, RecipeService, StateService) {
            spyOn(PreparationService, 'getContent').and.returnValue($q.when({data: {}}));
            spyOn(PreparationService, 'appendStep').and.callFake(function () {
                RecipeService.getRecipe().push({});
                return $q.when(true);
            });
            spyOn(RecipeService, 'getLastStep').and.returnValue({
                transformation: {stepId: 'a151e543456413ef51'}
            });
            spyOn(RecipeService, 'getPreviousStep').and.returnValue({
                transformation: {stepId: '84f654a8e64fc5'}
            });
            spyOn(StateService, 'showRecipe').and.returnValue();
            spyOn(StateService, 'hideRecipe').and.returnValue();
        }));

        it('should hide recipe on dataset playground init', inject(function ($rootScope, PlaygroundService, StateService) {
            //given
            var dataset = {id: '1'};
            expect(StateService.hideRecipe).not.toHaveBeenCalled();

            //when
            PlaygroundService.initPlayground(dataset);
            $rootScope.$digest();

            //then
            expect(StateService.hideRecipe).toHaveBeenCalled();
        }));

        it('should show recipe on preparation playground init', inject(function ($rootScope, PlaygroundService, StateService) {
            //given
            expect(StateService.showRecipe).not.toHaveBeenCalled();
            var preparation = {
                id: '6845521254541',
                dataset: {id: '1'}
            };

            //when
            PlaygroundService.load(preparation);
            $rootScope.$digest();

            //then
            expect(StateService.showRecipe).toHaveBeenCalled();
        }));

        it('should show recipe on first step append', inject(function ($rootScope, PlaygroundService, StateService) {
            //given
            expect(StateService.showRecipe).not.toHaveBeenCalled();
            stateMock.playground.dataset = {id: '123456'};

            var action = 'uppercase';
            var column = {id: 'firstname'};
            var parameters = {param1: 'param1Value', param2: 4};

            //when
            PlaygroundService.appendStep(action, column, parameters);
            stateMock.playground.preparation = createdPreparation;
            $rootScope.$digest();

            //then
            expect(StateService.showRecipe).toHaveBeenCalled();
        }));

        it('should NOT force recipe display on second step append', inject(function ($rootScope, PlaygroundService, RecipeService, StateService) {
            //given
            stateMock.playground.preparation = {id: '123456'};
            expect(StateService.showRecipe).not.toHaveBeenCalled();
            RecipeService.getRecipe().push({});

            var action = 'uppercase';
            var column = {id: 'firstname'};
            var parameters = {param1: 'param1Value', param2: 4};

            //when
            PlaygroundService.appendStep(action, column, parameters);
            $rootScope.$digest();

            //then
            expect(StateService.showRecipe).not.toHaveBeenCalled();
        }));
    });

    describe('preparation name edition mode', function () {

        beforeEach(inject(function ($q, PreparationService, DatagridService, RecipeService, StateService) {
            spyOn(PreparationService, 'getContent').and.returnValue($q.when({data: {}}));
            spyOn(PreparationService, 'appendStep').and.callFake(function () {
                RecipeService.getRecipe().push({});
                return $q.when(true);
            });
            spyOn(StateService, 'setNameEditionMode').and.returnValue();
        }));

        it('should turn on edition mode on dataset playground init', inject(function ($rootScope, PlaygroundService, StateService) {
            //given
            expect(StateService.setNameEditionMode).not.toHaveBeenCalled();
            var dataset = {id: '1'};

            //when
            PlaygroundService.initPlayground(dataset);
            $rootScope.$digest();

            //then
            expect(StateService.setNameEditionMode).toHaveBeenCalledWith(true);
        }));

        it('should turn off edition mode playground init', inject(function ($rootScope, PlaygroundService, StateService) {
            //given
            expect(StateService.setNameEditionMode).not.toHaveBeenCalled();
            var preparation = {
                id: '6845521254541',
                dataset: {id: '1'}
            };

            //when
            PlaygroundService.load(preparation);
            $rootScope.$digest();

            //then
            expect(StateService.setNameEditionMode).toHaveBeenCalledWith(false);
        }));
    });

    describe('dataset management when no preparation is done yet', function () {

        it('should load dataset sample when sample size is changed', inject(function (PlaygroundService, PreparationService, DatasetService) {
            //given
            stateMock.playground.preparation = null;
            stateMock.playground.dataset = {id: '123d120394ab0c53'};

            //when
            PlaygroundService.selectedSampleSize = {value: 50};
            PlaygroundService.changeSampleSize();

            //then
            expect(DatasetService.getContent).toHaveBeenCalledWith('123d120394ab0c53', true, 50);
        }));

        it('should load dataset sample when sample size is changed', inject(function (PlaygroundService, PreparationService, DatasetService) {
            //given
            stateMock.playground.preparation = null;
            stateMock.playground.dataset = {id: '123d120394ab0c53'};

            //when
            PlaygroundService.selectedSampleSize = {value: 'full'};
            PlaygroundService.changeSampleSize();

            //then
            expect(DatasetService.getContent).toHaveBeenCalledWith('123d120394ab0c53', true, 'full');
        }));
    });

    describe('change column type', function () {

        beforeEach(inject(function ($q, DatasetService, PreparationService) {
            spyOn(DatasetService, 'updateColumn').and.returnValue($q.when({}));
            spyOn(PreparationService, 'getContent').and.returnValue($q.when({data: {}}));
        }));

        it('should get preparation content', inject(function ($rootScope, PlaygroundService, PreparationService, DatasetService, PreviewService) {
            //given
            stateMock.playground.dataset = {id: 'gfkjqghflqsdgf'};
            stateMock.playground.preparation = {id: '1324'};
            PlaygroundService.selectedSampleSize = {value: 500};

            var columnId = '0001';
            var type = 'date';
            var domain = '';

            //when
            PlaygroundService.updateColumn(columnId, type, domain);
            $rootScope.$digest();

            //then
            expect(DatasetService.updateColumn).toHaveBeenCalledWith('gfkjqghflqsdgf', columnId, {
                type: type,
                domain: domain
            });
            expect(PreparationService.getContent).toHaveBeenCalledWith('1324', 'head', PlaygroundService.selectedSampleSize.value);
            expect(PreviewService.reset).toHaveBeenCalledWith(false);
        }));

        it('should get dataset content', inject(function ($rootScope, PlaygroundService, PreparationService, DatasetService) {
            //given
            stateMock.playground.dataset = {id: 'gfkjqghflqsdgf'};
            stateMock.playground.preparation = null;
            PlaygroundService.selectedSampleSize = {value: 500};

            var columnId = '0001';
            var type = 'date';
            var domain = '';

            //when
            PlaygroundService.updateColumn(columnId, type, domain);
            $rootScope.$digest();

            //then
            expect(DatasetService.updateColumn).toHaveBeenCalledWith('gfkjqghflqsdgf', columnId, {
                type: type,
                domain: domain
            });
            expect(DatasetService.getContent).toHaveBeenCalledWith('gfkjqghflqsdgf', false, PlaygroundService.selectedSampleSize.value);
        }));
    });
});
