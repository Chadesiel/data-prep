(function() {
    'use strict';

    function ExportCtrl($window,PlaygroundService, PreparationService, RecipeService, RestURLs, ExportService,$translate) {
        var vm = this;
        vm.exportUrl = RestURLs.exportUrl;
        vm.preparationService = PreparationService;
        vm.recipeService = RecipeService;
        vm.playgroundService = PlaygroundService;
        vm.exportService = ExportService;
        vm.translateService = $translate;
        vm.exportTypes = [];
        vm.exportParameters = {};

        vm.exportParamKey = "datarep.export.param";
        vm.exportIdKey = 'dataprep.export.id';

        vm.currentExportType = {};

        vm.launchExport = function(exportType){

            vm.currentExportType=exportType;
            var exportId;
            if (exportType){
                exportId = exportType.id;
            } else {
                var lastExportId = $window.localStorage.getItem(vm.exportIdKey);
                exportId = lastExportId;
            }

            if(!exportId){
                // use default one from rest api!!
                exportId = _.result(_.find(vm.exportTypes, function(exportType) {
                    return exportType.defaultExport === 'true';
                }), 'id');
            }

            var needParameters = _.result(_.find(vm.exportTypes, function(exportType) {
                return exportType.id === exportId;
            }), 'needParameters');


            $window.localStorage.setItem(vm.exportIdKey,exportId);

            if (needParameters==='true'){

                var needToShowForm = true;
                _.each(exportType.parameters,function(val){
                    if (val.type==='radio'){
                        vm.exportParameters[val.name]=val.defaultValue.value;
                    }
                    var paramValue = $window.localStorage.getItem(vm.exportParamKey+"."+val.name);
                    if (paramValue){
                        needToShowForm=false;
                    }
                });

                vm.showExport=needToShowForm;
                return;
            }

            vm.export(exportId);
        };

        vm.export = function (type) {
            var type = vm.currentExportType.id;

            var form = document.getElementById('exportForm');
            form.action = vm.exportUrl;
            form.exportType.value = type;

            _.each(Object.keys(vm.exportParameters),function(val){
                form[val]= vm.exportParameters[val];
                $window.localStorage.setItem(vm.exportParamKey+"."+val,vm.exportParameters[val]);
            });


            form.submit();

        };

        ExportService.exportTypes()
            .then(function(response){
                vm.exportTypes = response.data;
        });

    }

    /**
     * @ngdoc property
     * @name preparationId
     * @propertyOf data-prep.export.controller:ExportCtrl
     * @description The current preparationId
     * It is bound to {@link data-prep.services.preparation.service:PreparationService PreparationService} property
     */
    Object.defineProperty(ExportCtrl.prototype,
        'preparationId', {
            enumerable: true,
            configurable: false,
            get: function () {
                return this.preparationService.currentPreparationId;
            }
        });

    /**
     * @ngdoc property
     * @name stepId
     * @propertyOf data-prep.export.controller:ExportCtrl
     * @description The current stepId
     * It is bound to {@link data-prep.services.recipe.service:RecipeService RecipeService}.getLastActiveStep()
     */
    Object.defineProperty(ExportCtrl.prototype,
        'stepId', {
            enumerable: true,
            configurable: false,
            get: function () {
                var step = this.recipeService.getLastActiveStep();
                return step ? step.transformation.stepId : '';
            }
        });

    /**
     * @ngdoc property
     * @name datasetId
     * @propertyOf data-prep.export.controller:ExportCtrl
     * @description The current dataset id
     * It is bound to {@link data-prep.services.playground.service:PlaygroundService PlaygroundService} property
     */
    Object.defineProperty(ExportCtrl.prototype,
        'datasetId', {
            enumerable: true,
            configurable: false,
            get: function () {
                var metadata = this.playgroundService.currentMetadata;
                return metadata ? metadata.id : '';
            }
        });

    angular.module('data-prep.export')
        .controller('ExportCtrl', ExportCtrl);
})();