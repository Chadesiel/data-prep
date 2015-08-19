describe('Datagrid directive', function() {
    'use strict';

    var scope, createElement, element, grid, createdColumns = [{id: '0001'}, {id: '0002'}];

    beforeEach(module('data-prep.datagrid'));
    beforeEach(module('htmlTemplates'));

    beforeEach(inject(function($rootScope, $compile, DatagridGridService, DatagridColumnService, DatagridSizeService, DatagridStyleService, DatagridExternalService) {
        scope = $rootScope.$new();
        createElement = function() {
            element = angular.element('<datagrid></datagrid>');
            $compile(element)(scope);
            scope.$digest();

            angular.element('body').append(element);
            return element;
        };

        // decorate grid creation to keep the resulting grid ref and attach spy on its functions
        var realInitGrid = DatagridGridService.initGrid;
        DatagridGridService.initGrid = function(parentId) {
            grid = realInitGrid(parentId);
            spyOn(grid, 'invalidate').and.callThrough();
            spyOn(grid, 'scrollRowToTop').and.callThrough();

            return grid;
        };

        spyOn(DatagridGridService, 'initGrid').and.callThrough();
        spyOn(DatagridGridService, 'navigateToFocusedColumn').and.returnValue();
        spyOn(DatagridColumnService, 'createColumns').and.returnValue(createdColumns);
        spyOn(DatagridColumnService, 'renewAllColumns').and.returnValue();
        spyOn(DatagridSizeService, 'autosizeColumns').and.returnValue();
        spyOn(DatagridStyleService, 'manageColumnStyle').and.returnValue();
        spyOn(DatagridStyleService, 'resetCellStyles').and.returnValue();
        spyOn(DatagridStyleService, 'resetColumnStyles').and.returnValue();
        spyOn(DatagridExternalService, 'updateSuggestionPanel').and.returnValue();
    }));

    beforeEach(function() {
        jasmine.clock().install();
    });

    afterEach(function() {
        jasmine.clock().uninstall();

        scope.$destroy();
        element.remove();
    });

    describe('on data change', function() {
        var data;

        beforeEach(inject(function(DatagridService) {
            //given
            createElement();
            data = {columns: [{id: '0000'}, {id: '0001'}], preview: false};

            //when
            DatagridService.data = data;
            scope.$digest();
            jasmine.clock().tick(1);
        }));

        it('should init grid', inject(function(DatagridGridService) {
            //then
            expect(DatagridGridService.initGrid).toHaveBeenCalledWith('#datagrid');
        }));

        it('should init grid only once', inject(function(DatagridService, DatagridGridService) {
            //given
            expect(DatagridGridService.initGrid.calls.count()).toBe(1);

            //when
            DatagridService.data = {};
            scope.$digest();

            //then
            expect(DatagridGridService.initGrid.calls.count()).toBe(1);
        }));

        it('should tooltip ruler', inject(function(DatagridTooltipService) {
            //then
            expect(DatagridTooltipService.tooltipRuler).toBeDefined();
        }));

        it('should update columns', inject(function(DatagridColumnService) {
            //then
            expect(DatagridColumnService.createColumns).toHaveBeenCalledWith(data.columns, data.preview);
        }));

        it('should update created columns style', inject(function(DatagridStyleService) {
            //then
            expect(DatagridStyleService.manageColumnStyle).toHaveBeenCalledWith(createdColumns, data.preview);
        }));

        it('should auto size created columns (and set them in grid, done by autosize() function)', inject(function(DatagridSizeService) {
            //then
            expect(DatagridSizeService.autosizeColumns).toHaveBeenCalledWith(createdColumns);
        }));

        it('should reset renew all columns flag', inject(function(DatagridColumnService) {
            //then
            expect(DatagridColumnService.renewAllColumns).toHaveBeenCalledWith(false);
        }));

        it('should navigate in the grid to show the interesting column after a 300ms delay', inject(function(DatagridGridService) {
            //given
            expect(DatagridGridService.navigateToFocusedColumn).not.toHaveBeenCalled();

            //when
            jasmine.clock().tick(300);

            //then
            expect(DatagridGridService.navigateToFocusedColumn).toHaveBeenCalled();
        }));

        it('should update suggestion panel when a column is selected', inject(function(DatagridService, DatagridStyleService, DatagridExternalService) {
            //given
            var selectedColumn = {id: '0001'};
            spyOn(DatagridStyleService, 'selectedColumn').and.returnValue(selectedColumn);

            //when
            DatagridService.data = {};
            scope.$digest();
            jasmine.clock().tick(1);

            //then
            expect(DatagridExternalService.updateSuggestionPanel).toHaveBeenCalledWith(selectedColumn);
        }));

        it('should NOT update suggestion panel when data is preview data', inject(function(DatagridService, DatagridStyleService, DatagridExternalService) {
            //given
            var selectedColumn = {id: '0001'};
            spyOn(DatagridStyleService, 'selectedColumn').and.returnValue(selectedColumn);

            //when
            DatagridService.data = {preview: true};
            scope.$digest();

            //then
            expect(DatagridExternalService.updateSuggestionPanel).not.toHaveBeenCalled();
        }));

        it('should execute the grid update only once when the second call is triggered before the first timeout', inject(function(DatagridService, DatagridGridService, DatagridColumnService, DatagridExternalService, DatagridStyleService) {
            //given
            expect(DatagridColumnService.createColumns.calls.count()).toBe(1);
            expect(DatagridExternalService.updateSuggestionPanel.calls.count()).toBe(0);
            expect(DatagridGridService.navigateToFocusedColumn.calls.count()).toBe(0);

            spyOn(DatagridStyleService, 'selectedColumn').and.returnValue({id: '0001'});

            //when
            DatagridService.data = {};
            scope.$digest();

            expect(DatagridColumnService.createColumns.calls.count()).toBe(1);
            expect(DatagridExternalService.updateSuggestionPanel.calls.count()).toBe(0);
            expect(DatagridGridService.navigateToFocusedColumn.calls.count()).toBe(0);

            DatagridService.data = {};
            scope.$digest();
            jasmine.clock().tick(300);

            //then
            expect(DatagridColumnService.createColumns.calls.count()).toBe(2);
            expect(DatagridExternalService.updateSuggestionPanel.calls.count()).toBe(1);
            expect(DatagridGridService.navigateToFocusedColumn.calls.count()).toBe(1);
        }));
    });

    describe('on metadata change', function() {
        beforeEach(inject(function(DatagridService) {
            //given
            createElement();
            DatagridService.data = {columns: [{id: '0000'}, {id: '0001'}], preview: false};
            scope.$digest();

            //when
            DatagridService.metadata = {};
            scope.$digest();
        }));

        it('should reset cell styles', inject(function(DatagridStyleService) {
            //then
            expect(DatagridStyleService.resetCellStyles).toHaveBeenCalled();
        }));

        it('should reset columns styles', inject(function(DatagridStyleService) {
            //then
            expect(DatagridStyleService.resetColumnStyles).toHaveBeenCalled();
        }));

        it('should scroll to top', function() {
            //then
            expect(grid.scrollRowToTop).toHaveBeenCalledWith(0);
        });

        it('should force column recreation (no reuse)', inject(function(DatagridColumnService) {
            //then
            expect(DatagridColumnService.renewAllColumns).toHaveBeenCalledWith(true);
        }));
    });

    describe('on filter change', function() {
        beforeEach(inject(function(DatagridService, FilterService) {
            //given
            createElement();
            DatagridService.data = {columns: [{id: '0000'}, {id: '0001'}], preview: false};
            scope.$digest();

            //when
            FilterService.filters = [{}];
            scope.$digest();
        }));

        it('should reset cell styles', inject(function(DatagridStyleService) {
            //then
            expect(DatagridStyleService.resetCellStyles).toHaveBeenCalled();
        }));

        it('should scroll to top', function() {
            //then
            expect(grid.scrollRowToTop).toHaveBeenCalledWith(0);
        });
    });
});
