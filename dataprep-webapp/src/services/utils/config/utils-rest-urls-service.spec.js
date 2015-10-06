describe('REST urls service', function() {
    'use strict';

    beforeEach(module('data-prep.services.utils'));
    beforeEach(inject(function (RestURLs) {
        RestURLs.setServerUrl('');
    }));
    
    it('should init api urls with empty server url (same url by default)', inject(function(RestURLs) {
        //then
        expect(RestURLs.datasetUrl).toBe('/api/datasets');
        expect(RestURLs.transformUrl).toBe('/api/transform');
        expect(RestURLs.preparationUrl).toBe('/api/preparations');
        expect(RestURLs.previewUrl).toBe('/api/preparations/preview');
        expect(RestURLs.exportUrl).toBe('/api/export');
        expect(RestURLs.aggregationUrl).toBe('/api/aggregate');
    }));

    it('should change api url with provided server url', inject(function(RestURLs) {
        //when
        RestURLs.setServerUrl('http://10.10.10.10:8888');

        //then
        expect(RestURLs.datasetUrl).toBe('http://10.10.10.10:8888/api/datasets');
        expect(RestURLs.transformUrl).toBe('http://10.10.10.10:8888/api/transform');
        expect(RestURLs.preparationUrl).toBe('http://10.10.10.10:8888/api/preparations');
        expect(RestURLs.previewUrl).toBe('http://10.10.10.10:8888/api/preparations/preview');
        expect(RestURLs.exportUrl).toBe('http://10.10.10.10:8888/api/export');
        expect(RestURLs.aggregationUrl).toBe('http://10.10.10.10:8888/api/aggregate');
    }));
});