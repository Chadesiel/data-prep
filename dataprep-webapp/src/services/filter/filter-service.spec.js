describe('Filter service', function() {
    'use strict';

    beforeEach(module('data-prep.services.filter'));
    beforeEach(inject(function(DatagridService) {
        spyOn(DatagridService, 'resetFilters').and.callFake(function() {});
        spyOn(DatagridService, 'addFilter').and.callFake(function() {});
        spyOn(DatagridService, 'removeFilter').and.callFake(function() {});
        spyOn(DatagridService, 'updateFilter').and.callFake(function() {});
    }));

    describe('utils', function() {

    });

    describe('add filter', function() {
        it('should add "contains" filter and add datagrid filter', inject(function(FilterService, DatagridService) {
            //given
            var removeFnCallback = function() {};
            expect(FilterService.filters.length).toBe(0);

            //when
            FilterService.addFilter('contains', 'col1', 'column name', {phrase: 'toto'}, removeFnCallback);

            //then
            expect(FilterService.filters.length).toBe(1);

            var filterInfo = FilterService.filters[0];
            expect(filterInfo.type).toBe('contains');
            expect(filterInfo.colId).toBe('col1');
            expect(filterInfo.colName).toBe('column name');
            expect(filterInfo.editable).toBe(true);
            expect(filterInfo.args).toEqual({phrase: 'toto'});
            expect(filterInfo.filterFn()({col1: ' toto est ici'})).toBeTruthy();
            expect(filterInfo.filterFn()({col1: ' tata est ici'})).toBeFalsy();
            expect(filterInfo.removeFilterFn).toBe(removeFnCallback);

            expect(DatagridService.addFilter).toHaveBeenCalledWith(filterInfo.filterFn);
        }));

        it('should add "contains" filter with wildcard', inject(function(FilterService) {
            //given
            expect(FilterService.filters.length).toBe(0);

            //when
            FilterService.addFilter('contains', 'col1', 'column name', {phrase: 'to*ici'});

            //then
            expect(FilterService.filters.length).toBe(1);

            var filterInfo = FilterService.filters[0];
            expect(filterInfo.filterFn()({col1: ' toto est ici'})).toBeTruthy();
            expect(filterInfo.filterFn()({col1: ' tata est ici'})).toBeFalsy();
        }));

        it('should add "exact" filter with caseSensitive', inject(function(FilterService) {
            //given
            expect(FilterService.filters.length).toBe(0);

            //when
            FilterService.addFilter('exact', 'col1', 'column name', {phrase: 'toici', caseSensitive: true});

            //then
            expect(FilterService.filters.length).toBe(1);

            var filterInfo = FilterService.filters[0];
            expect(filterInfo.filterFn()({col1: 'toici'})).toBeTruthy();
            expect(filterInfo.filterFn()({col1: 'Toici'})).toBeFalsy();
            expect(filterInfo.filterFn()({col1: ' toici'})).toBeFalsy();
            expect(filterInfo.filterFn()({col1: 'toici '})).toBeFalsy();
        }));

        it('should add "exact" filter without caseSensitive', inject(function(FilterService) {
            //given
            expect(FilterService.filters.length).toBe(0);

            //when
            FilterService.addFilter('exact', 'col1', 'column name', {phrase: 'toici', caseSensitive: false});

            //then
            expect(FilterService.filters.length).toBe(1);

            var filterInfo = FilterService.filters[0];
            expect(filterInfo.filterFn()({col1: 'Toici'})).toBeTruthy();
            expect(filterInfo.filterFn()({col1: ' toici'})).toBeFalsy();
            expect(filterInfo.filterFn()({col1: 'toici '})).toBeFalsy();
        }));

        it('should add "invalid records" filter and add datagrid filter', inject(function(FilterService, DatagridService) {
            //given
            expect(FilterService.filters.length).toBe(0);
            var invalidValues = ['NA', 'N/A', 'N.A'];
            var data = {
                columns: [
                    {id: 'col0', quality: {invalidValues: []}},
                    {id: 'col1', quality: {invalidValues: invalidValues}}
                ]
            };

            //when
            FilterService.addFilter('invalid_records', 'col1', 'column name');

            //then
            expect(FilterService.filters.length).toBe(1);

            var filterInfo = FilterService.filters[0];
            expect(filterInfo.type).toBe('invalid_records');
            expect(filterInfo.colId).toBe('col1');
            expect(filterInfo.colName).toBe('column name');
            expect(filterInfo.value).toBe('invalid records');
            expect(filterInfo.editable).toBe(false);
            expect(filterInfo.args).toBeFalsy();
            expect(filterInfo.filterFn(data)({col1: 'NA'})).toBeTruthy();
            expect(filterInfo.filterFn(data)({col1: ' tata est ici'})).toBeFalsy();

            expect(DatagridService.addFilter).toHaveBeenCalledWith(filterInfo.filterFn);
        }));

        it('should add "empty records" filter and add datagrid filter', inject(function(FilterService, DatagridService) {
            //given
            expect(FilterService.filters.length).toBe(0);

            //when
            FilterService.addFilter('empty_records', 'col1', 'column name');

            //then
            expect(FilterService.filters.length).toBe(1);

            var filterInfo = FilterService.filters[0];
            expect(filterInfo.type).toBe('empty_records');
            expect(filterInfo.colId).toBe('col1');
            expect(filterInfo.colName).toBe('column name');
            expect(filterInfo.value).toBe('empty records');
            expect(filterInfo.editable).toBe(false);
            expect(filterInfo.args).toBeFalsy();
            expect(filterInfo.filterFn()({col1: ''})).toBeTruthy();
            expect(filterInfo.filterFn()({col1: ' tata est ici'})).toBeFalsy();

            expect(DatagridService.addFilter).toHaveBeenCalledWith(filterInfo.filterFn);
        }));

        it('should add "valid records" filter and add datagrid filter', inject(function(FilterService, DatagridService) {
            //given
            var invalidValues = ['m', 'p'];
            var data = {
                columns: [
                    {id: 'col0', quality: {invalidValues: []}},
                    {id: 'col1', quality: {invalidValues: invalidValues}}
                ]
            };

            //when
            FilterService.addFilter('valid_records', 'col1', 'column name');

            //then
            expect(FilterService.filters.length).toBe(1);

            var filterInfo = FilterService.filters[0];
            expect(filterInfo.type).toBe('valid_records');
            expect(filterInfo.colId).toBe('col1');
            expect(filterInfo.colName).toBe('column name');
            expect(filterInfo.value).toBe('valid records');
            expect(filterInfo.editable).toBe(false);
            expect(filterInfo.args).toBeFalsy();
            expect(filterInfo.filterFn(data)({col1: 'a'})).toBeTruthy();
            expect(filterInfo.filterFn(data)({col1: 'm'})).toBeFalsy();
            expect(filterInfo.filterFn(data)({col1: ''})).toBeFalsy();

            expect(DatagridService.addFilter).toHaveBeenCalledWith(filterInfo.filterFn);
        }));

        it('should add "inside range" filter and add datagrid filter', inject(function(FilterService, DatagridService) {
            //given
            expect(FilterService.filters.length).toBe(0);

            //when
            FilterService.addFilter('inside_range', 'col1', 'column name', {interval: [0, 22]});
            FilterService.addFilter('inside_range', 'col2', 'column name2', {interval: [0, 1000000]});

            //then
            expect(FilterService.filters.length).toBe(2);

            var filterInfo = FilterService.filters[0];
            expect(filterInfo.type).toBe('inside_range');
            expect(filterInfo.colId).toBe('col1');
            expect(filterInfo.colName).toBe('column name');
            expect(filterInfo.value).toBe('[0 .. 22]');
            expect(filterInfo.editable).toBe(false);
            expect(filterInfo.args).toEqual({interval: [0, 22]});
            expect(filterInfo.filterFn()({col1:'5'})).toBeTruthy();
            expect(filterInfo.filterFn()({col1:'-5'})).toBeFalsy();

            expect(DatagridService.addFilter).toHaveBeenCalledWith(filterInfo.filterFn);

            var filterInfo2 = FilterService.filters[1];
            expect(filterInfo2.type).toBe('inside_range');
            expect(filterInfo2.colId).toBe('col2');
            expect(filterInfo2.colName).toBe('column name2');
            expect(filterInfo2.value).toBe('[0 .. 1,000,000]');
            expect(filterInfo2.editable).toBe(false);
            expect(filterInfo2.args).toEqual({interval:  [0, 1000000]});
            expect(filterInfo2.filterFn()({col2: '1000'})).toBeTruthy();
            expect(filterInfo2.filterFn()({col2: '-5'})).toBeFalsy();

            expect(DatagridService.addFilter).toHaveBeenCalledWith(filterInfo2.filterFn);
        }));

        it('should not throw exception on non existing column (that could be removed by a step) in contains filter', inject(function(FilterService) {
            //given
            expect(FilterService.filters.length).toBe(0);

            //when
            FilterService.addFilter('contains', 'col_that_does_not_exist', 'column name', {phrase: 'toto'});

            //then
            expect(FilterService.filters.length).toBe(1);

            var filterInfo = FilterService.filters[0];
            expect(filterInfo.type).toBe('contains');
            expect(filterInfo.filterFn()({col1: ' toto est ici'})).toBeFalsy();
        }));

        it('should not throw exception on non existing column (that could be removed by a step) in exact filter', inject(function(FilterService) {
            //given
            expect(FilterService.filters.length).toBe(0);

            //when
            FilterService.addFilter('exact', 'col_that_does_not_exist', 'column name', {phrase: 'toto'});

            //then
            expect(FilterService.filters.length).toBe(1);

            var filterInfo = FilterService.filters[0];
            expect(filterInfo.type).toBe('exact');
            expect(filterInfo.filterFn()({col1: ' toto est ici'})).toBeFalsy();
        }));

        it('should return filter value info for "contains" filter', inject(function(FilterService) {
            //given
            FilterService.addFilter('contains', 'col1', 'column 1', {phrase: 'Toto'});
            var filter = FilterService.filters[0];

            //when
            var value = filter.value;

            //then
            expect(value).toBe('Toto');
        }));
    });

    describe('add filter and digest', function() {
        it('should add a filter wrapped in $timeout to trigger a digest', inject(function($timeout, FilterService, DatagridService) {
            //given
            var removeFnCallback = function() {};
            expect(FilterService.filters.length).toBe(0);

            //when
            FilterService.addFilterAndDigest('contains', 'col1', 'column name', {phrase: 'toto'}, removeFnCallback);
            expect(FilterService.filters.length).toBe(0);
            $timeout.flush();

            //then
            expect(FilterService.filters.length).toBe(1);

            var filterInfo = FilterService.filters[0];
            expect(filterInfo.type).toBe('contains');
            expect(filterInfo.colId).toBe('col1');
            expect(filterInfo.colName).toBe('column name');
            expect(filterInfo.editable).toBe(true);
            expect(filterInfo.args).toEqual({phrase: 'toto'});
            expect(filterInfo.filterFn()({col1: ' toto est ici'})).toBeTruthy();
            expect(filterInfo.filterFn()({col1: ' tata est ici'})).toBeFalsy();
            expect(filterInfo.removeFilterFn).toBe(removeFnCallback);

            expect(DatagridService.addFilter).toHaveBeenCalledWith(filterInfo.filterFn);
        }));
    });

    describe('remove filter', function() {
        it('should remove all filters', inject(function(FilterService) {
            //given
            FilterService.filters.push({});

            //when
            FilterService.removeAllFilters();

            //then
            expect(FilterService.filters.length).toBe(0);
        }));

        it('should remove all datagrid filters', inject(function(FilterService, DatagridService) {
            //when
            FilterService.removeAllFilters();

            //then
            expect(DatagridService.resetFilters).toHaveBeenCalled();
        }));

        it('should remove filter', inject(function(FilterService) {
            //given
            FilterService.addFilter('contains', 'col1', 'column 1', {phrase: 'Toto'});
            FilterService.addFilter('contains', 'col2', 'column 1', {phrase: 'Toto'});
            var filter1 = FilterService.filters[0];
            var filter2 = FilterService.filters[1];

            //when
            FilterService.removeFilter(filter1);

            //then
            expect(FilterService.filters.length).toBe(1);
            expect(FilterService.filters[0]).toBe(filter2);
        }));

        it('should remove datagrid filter', inject(function(FilterService, DatagridService) {
            //given
            FilterService.addFilter('contains', 'col1', 'column 1', {phrase: 'Toto'});
            var filter = FilterService.filters[0];

            //when
            FilterService.removeFilter(filter);

            //then
            expect(DatagridService.removeFilter).toHaveBeenCalledWith(filter.filterFn);
        }));

        it('should call filter remove callback', inject(function(FilterService) {
            //given
            var removeFn = jasmine.createSpy('removeFilterCallback');
            FilterService.addFilter('contains', 'col1', 'column 1', {phrase: 'Toto'}, removeFn);
            var filter = FilterService.filters[0];

            //when
            FilterService.removeFilter(filter);

            //then
            expect(removeFn).toHaveBeenCalled();
        }));

        it('should do nothing on remove if filter is unknown', inject(function(FilterService, DatagridService) {
            //given
            FilterService.addFilter('contains', 'col1', 'column 1', {phrase: 'Toto'});
            FilterService.addFilter('contains', 'col2', 'column 2', {phrase: 'Toto'});

            var filter1 = FilterService.filters[0];
            FilterService.removeFilter(filter1);
            expect(FilterService.filters.length).toBe(1);
            expect(DatagridService.removeFilter.calls.count()).toBe(1);

            //when
            FilterService.removeFilter(filter1);

            //then
            expect(FilterService.filters.length).toBe(1);
            expect(DatagridService.removeFilter.calls.count()).toBe(1);
        }));
    });

    describe('update filter', function() {
        it('should update "contains" filter and update datagrid filter', inject(function(FilterService, DatagridService) {
            //given
            FilterService.addFilter('contains', 'col1', 'column 1', {phrase: 'Toto'});
            FilterService.addFilter('contains', 'col2', 'column 2', {phrase: 'Toto'});
            var filter1 = FilterService.filters[0];
            var filter2 = FilterService.filters[1];

            //when
            FilterService.updateFilter(filter2, 'Tata');

            //then
            var newFilter2 = FilterService.filters[1];
            expect(FilterService.filters.length).toBe(2);
            expect(FilterService.filters[0]).toBe(filter1);
            expect(newFilter2).not.toBe(filter2);
            expect(newFilter2.type).toBe('contains');
            expect(newFilter2.colId).toBe('col2');
            expect(newFilter2.colName).toBe('column 2');
            expect(newFilter2.args.phrase).toBe('Tata');
            expect(newFilter2.value).toBe('Tata');
            expect(DatagridService.updateFilter).toHaveBeenCalledWith(filter2.filterFn, newFilter2.filterFn);
        }));

        it('should update "exact" filter and update datagrid filter', inject(function(FilterService, DatagridService) {
            //given
            FilterService.addFilter('exact', 'col1', 'column 1', {phrase: 'Toto'});
            FilterService.addFilter('exact', 'col2', 'column 2', {phrase: 'Toto'});
            var filter1 = FilterService.filters[0];
            var filter2 = FilterService.filters[1];

            //when
            FilterService.updateFilter(filter2, 'Tata');

            //then
            var newFilter2 = FilterService.filters[1];
            expect(FilterService.filters.length).toBe(2);
            expect(FilterService.filters[0]).toBe(filter1);
            expect(newFilter2).not.toBe(filter2);
            expect(newFilter2.type).toBe('exact');
            expect(newFilter2.colId).toBe('col2');
            expect(newFilter2.colName).toBe('column 2');
            expect(newFilter2.args.phrase).toBe('Tata');
            expect(newFilter2.value).toBe('Tata');
            expect(DatagridService.updateFilter).toHaveBeenCalledWith(filter2.filterFn, newFilter2.filterFn);
        }));

        it('should update "inside_range" filter after a brush and update datagrid filter', inject(function(FilterService, DatagridService) {
            //given
            FilterService.addFilter('inside_range', 'col1', 'column 1', {interval: [5,10]});
            var filter = FilterService.filters[0];

            //when
            FilterService.updateFilter(filter, [0,22]);

            //then
            var newFilter = FilterService.filters[0];
            expect(FilterService.filters.length).toBe(1);
            expect(newFilter).not.toBe(filter);
            expect(newFilter.type).toBe('inside_range');
            expect(newFilter.colId).toBe('col1');
            expect(newFilter.colName).toBe('column 1');
            expect(newFilter.args.interval).toEqual([0,22]);
            expect(newFilter.value).toBe('[0 .. 22]');
            expect(DatagridService.updateFilter).toHaveBeenCalledWith(filter.filterFn, newFilter.filterFn);
        }));

        it('should update "inside range" filter', inject(function(FilterService) {
            //given
            var removeCallback = function() {};
            FilterService.addFilter('inside_range', 'col1', 'column name', {interval: [0, 22]}, removeCallback);
            var filterInfo = FilterService.filters[0];

            expect(FilterService.filters.length).toBe(1);
            expect(filterInfo.filterFn({col1: '4'})).toBeTruthy();

            //when
            FilterService.addFilter('inside_range', 'col1', 'column name', {interval: [5, 10]});

            //then
            expect(FilterService.filters.length).toBe(1);

            var filterInfo2 = FilterService.filters[0];
            expect(filterInfo2.type).toBe('inside_range');
            expect(filterInfo2.colId).toBe('col1');
            expect(filterInfo2.colName).toBe('column name');
            expect(filterInfo2.value).toBe('[5 .. 10]');
            expect(filterInfo2.editable).toBe(false);
            expect(filterInfo2.args).toEqual({interval:  [5, 10]});
            expect(filterInfo2.filterFn()({col1: '8'})).toBeTruthy();
            //the 4 is no more inside the brush range
            expect(filterInfo2.filterFn()({col1: '4'})).toBeFalsy();
            expect(filterInfo2.removeFilterFn).toBe(removeCallback);
        }));
    });
});